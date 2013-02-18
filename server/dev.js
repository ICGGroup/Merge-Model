(function() {
  var BSON, Connection, Db, GridStore, ObjectID, Server, app, coffee, dateFormat, dbName, express, format, fs, http, parser, path, server, url, zipfile, _;

  path = require("path");

  express = require("express");

  app = express();

  http = require('http');

  server = http.createServer(app);

  url = require("url");

  fs = require("fs");

  coffee = require("coffee-script");

  _ = require("underscore");

  dateFormat = require("dateformat");

  Db = require("mongodb").Db;

  GridStore = require("mongodb").GridStore;

  ObjectID = require("mongodb").ObjectID;

  Connection = require("mongodb").Connection;

  Server = require("mongodb").Server;

  BSON = require("mongodb").BSONPure;

  format = require("util").format;

  zipfile = {};

  parser = require("libxml-to-js");

  path = require('path');

  dbName = "dev";

  module.exports = function(publicDir, port, cb) {
    var db, host, parseExcel, serverPort, views;
    serverPort = port || 8808;
    host = (process.env["MONGO_NODE_DRIVER_HOST"] != null ? process.env["MONGO_NODE_DRIVER_HOST"] : "localhost");
    port = (process.env["MONGO_NODE_DRIVER_PORT"] != null ? process.env["MONGO_NODE_DRIVER_PORT"] : Connection.DEFAULT_PORT);
    parseExcel = require("./parse-excel");
    app.configure(function() {
      app.use(express.methodOverride());
      app.use(express.bodyParser());
      app.use(express.cookieParser());
      app.use(express.session({
        secret: 'icgrules'
      }));
      app.use(app.router);
      return app.use(express["static"](path.resolve(__dirname, publicDir)));
    });
    app.set('views', path.resolve(__dirname, "../views"));
    app.set('view engine', 'ejs');
    db = new Db(dbName, new Server(host, port, {}), {
      native_parser: true,
      safe: false
    });
    views = [];
    fs.readdir(path.resolve(__dirname, "../views"), function(err, files) {
      var v;
      if (err) {
        return console.log(err);
      } else {
        return views = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = files.length; _i < _len; _i++) {
            v = files[_i];
            if (v !== ".DS_Store") {
              _results.push(v);
            }
          }
          return _results;
        })();
      }
    });
    return db.open(function(err, database) {
      var channels, createChannel, io, supportedChannels;
      app.get("/", function(req, res) {
        return res.render("default", {});
      });
      /*
      
          Generic Demo functionality
      */

      /*
      
            authentication functionality
      */

      app.get("/api/:collection/:id?", function(req, res) {
        var collectionName, o, options, query, revisedQuery, test;
        query = (req.query.query ? JSON.parse(req.query.query) : {});
        if (req.params.id) {
          query = {
            _id: new BSON.ObjectID(req.params.id)
          };
        }
        options = req.params.options || {};
        console.log(query);
        revisedQuery = {};
        test = ["limit", "sort", "fields", "skip", "hint", "explain", "snapshot", "timeout"];
        for (o in query) {
          if (test.indexOf(o) >= 0) {
            options[o] = query[o];
          } else {
            revisedQuery[o] = query[o];
          }
        }
        collectionName = req.params.collection;
        return database.collection(collectionName, function(err, collection) {
          if (err) {
            return res.send(err, 500);
          } else {
            return collection.find(revisedQuery, options, function(err, cursor) {
              if (err) {
                return res.send(err, 500);
              } else {
                return cursor.toArray(function(err, docs) {
                  if (err) {
                    return res.send(err, 500);
                  } else {
                    if (req.params.id && docs.length > 0) {
                      return res.send(docs[0], 200);
                    } else {
                      return res.send(docs, 200);
                    }
                  }
                });
              }
            });
          }
        });
      });
      app.post("/api/:collection", function(req, res) {
        var collectionName;
        collectionName = req.params.collection;
        return database.collection(collectionName, function(err, collection) {
          if (err) {
            console.log(err);
            return res.send(err, 500);
          } else {
            return collection.insert(req.body, function(err, docs) {
              if (err) {
                console.log(err);
                return res.send(err, 500);
              } else {
                return res.send(docs[0], 201);
              }
            });
          }
        });
      });
      app.put("/api/:collection/:id", function(req, res) {
        var collectionName, spec;
        collectionName = req.params.collection;
        spec = {
          _id: new BSON.ObjectID(req.params.id)
        };
        return database.collection(collectionName, function(err, collection) {
          var prop, setSpec;
          if (err) {
            console.log(err);
            return res.send(err, 500);
          } else {
            setSpec = {};
            for (prop in req.body) {
              if (prop !== "_id") {
                setSpec[prop] = req.body[prop];
              }
            }
            return collection.update(spec, {
              $set: setSpec
            }, {
              safe: true
            }, function(err, docs) {
              if (err) {
                console.log(err);
                return res.send(err, 500);
              } else {
                return res.send(req.body, 200);
              }
            });
          }
        });
      });
      console.log("Dev Server Started on port " + serverPort);
      console.log("Using MongoDB '" + dbName + "'");
      app.listen(serverPort);
      console.log("Go, Go Gadget Sockets");
      io = require('socket.io').listen(server);
      supportedChannels = ["", "news", "invoices", "invoices/gllines", "transaction", "transaction/gllines"];
      channels = [];
      createChannel = function(channel, events) {
        var newChannel;
        newChannel = io.of("/" + channel).on("connection", function(socket) {
          return _.each(events, function(e) {
            return socket.on(e, function(data, callback) {
              data.socketClientId = socket.id;
              newChannel.emit(e, data);
              if (callback) {
                return callback(true);
              }
            });
          });
        });
        newChannel.key = channel;
        return newChannel;
      };
      _.each(supportedChannels, function(channel) {
        return channels.push(createChannel(channel, ["message", "create", "update", "delete", "dispatch"]));
      });
      io.sockets.on("connection", function(socket) {
        socket.emit("id", socket.id);
        return socket.on("join", function(channel, callback) {
          var supported;
          supported = _.find(channels, function(c) {
            return c.keys === channel;
          });
          if (callback) {
            return callback(supported !== void 0);
          }
        });
      });
      if (cb) {
        return cb.apply(this);
      }
    });
  };

}).call(this);
