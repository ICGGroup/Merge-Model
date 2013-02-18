(function() {
  var BSON, Connection, Db, GridStore, ObjectID, Server, fs;

  fs = require("fs");

  Db = require("mongodb").Db;

  GridStore = require("mongodb").GridStore;

  ObjectID = require("mongodb").ObjectID;

  Connection = require("mongodb").Connection;

  Server = require("mongodb").Server;

  BSON = require("mongodb").BSONPure;

  module.exports = function(db, app) {
    var getGridFSFile, writeGridFSFile;
    getGridFSFile = function(callback, id) {
      var gs;
      gs = new GridStore(db, new ObjectID(id), 'r');
      return gs.open(function(err, gs) {
        return gs.read(callback);
      });
    };
    writeGridFSFile = function(file, callback) {
      var gs, objID;
      objID = new ObjectID();
      gs = new GridStore(db, objID, "w");
      return gs.open(function(err, gridStore) {
        var readStream;
        if (err) {
          return callback(err, gridStore);
        } else {
          readStream = fs.createReadStream(file.path);
          readStream.on('data', function(data) {
            return gs.write(data, {
              "content_type": file.type
            }, function(err) {});
          });
          return readStream.on('end', function() {
            return gs.close(function(err, result) {
              if (err) {
                console.log(err);
                return callback(err, result);
              } else {
                db.collection("fs.files", function(err, collection) {
                  return collection.update({
                    _id: result._id
                  }, {
                    $set: {
                      contentType: file.type,
                      orig_filename: file.name
                    }
                  });
                });
                result.contentType = file.type;
                result.filename = file.name;
                return callback(err, result);
              }
            });
          });
        }
      });
    };
    app.get("/gridstore", function(req, res) {
      var fn;
      fn = jade.compile("!!!\nhtml\n  head\n  body\n    script(data-main = \"javascripts/gridstore\", src = \"javascripts/require-jquery.js\")");
      return res.send(fn(), 200);
    });
    app.post("/api/gridstore", function(req, res) {
      var file, fileData, reqFile, _results;
      fileData = [];
      if (req.files) {
        _results = [];
        for (reqFile in req.files) {
          file = req.files[reqFile];
          _results.push(writeGridFSFile(file, function(err, data) {
            if (err) {
              return res.send(err, 500);
            } else {
              return res.send(data, 200);
            }
          }));
        }
        return _results;
      } else {
        return res.send('No files uploaded', 500);
      }
    });
    app.get("/api/gridstore/:id", function(req, res) {
      var spec;
      spec = {
        _id: new BSON.ObjectID(req.params.id)
      };
      return db.collection("fs.files", function(err, collection) {
        if (err) {
          return res.send(err, 500);
        } else {
          return collection.find(spec, {}, function(err, cursor) {
            if (err) {
              return res.send(err, 500);
            } else {
              return cursor.toArray(function(err, docs) {
                var fileRef;
                if (err) {
                  return res.send(err, 500);
                } else {
                  if (docs) {
                    fileRef = docs[0];
                    res.contentType("application/json");
                    fileRef.filename = fileRef.orig_filename;
                    return res.send(fileRef);
                  }
                }
              });
            }
          });
        }
      });
    });
    return app.get("/api/gridstore/:id/download", function(req, res) {
      var spec;
      spec = {
        _id: new BSON.ObjectID(req.params.id)
      };
      return db.collection("fs.files", function(err, collection) {
        if (err) {
          return res.send(err, 500);
        } else {
          return collection.find(spec, {}, function(err, cursor) {
            if (err) {
              return res.send(err, 500);
            } else {
              return cursor.toArray(function(err, docs) {
                var fileRef;
                if (err) {
                  return res.send(err, 500);
                } else {
                  if (docs) {
                    fileRef = docs[0];
                    return getGridFSFile(function(error, data) {
                      res.contentType(fileRef.contentType);
                      res.header("Content-Disposition", "inline; filename=\"" + fileRef.orig_filename + "\"");
                      return res.end(data);
                    }, req.params.id);
                  } else {
                    return res.send("Invlaid File Reference", 500);
                  }
                }
              });
            }
          });
        }
      });
    });
  };

}).call(this);
