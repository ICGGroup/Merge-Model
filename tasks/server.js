(function() {
  var coffee, devserver, express, fs, http, open, path, util;

  fs = require("fs");

  path = require("path");

  util = require("util");

  http = require("http");

  open = require("open");

  fs = require("fs");

  coffee = require("coffee-script");

  express = require("express");

  devserver = require("../server/dev");

  http = require("http");

  module.exports = function(grunt) {
    grunt.renameTask("server", "grunt-server");
    grunt.registerTask("server", "appserver watch");
    grunt.registerTask("tempcopy", "Copies the whole staging(temp/) folder to output (dist/) one", function() {
      var cb, config, ignores;
      this.requiresConfig("staging");
      config = grunt.config();
      cb = this.async();
      grunt.file.setBase(config.base);
      ignores = [".gitignore", ".ignore", ".buildignore", "./scripts"];
      return grunt.task.helper("copy", "app", "" + config.staging, ignores, function(e) {
        if (e) {
          return grunt.log.error(e.stack || e.message);
        } else {
          grunt.log.ok(path.resolve("app") + " -> " + path.resolve("" + config.staging));
          return cb(!e);
        }
      });
    });
    grunt.registerTask("reload", function() {
      return console.log("Reload not enabled for devserver...sorry...try Command-R");
    });
    grunt.registerTask("appserver", "Launch a new dev server", function(target) {
      var cb, opts, port, targets, tasks;
      opts = void 0;
      port = grunt.config("server.port") || 0xDAD;
      cb = this.async();
      targets = {
        app: path.resolve("app"),
        dist: path.resolve("public"),
        test: path.resolve("test"),
        phantom: path.resolve("test"),
        reload: path.resolve("app")
      };
      target = target || "app";
      if (!targets[target]) {
        grunt.log.error("Not a valid target: " + target).writeln("Valid ones are: " + grunt.log.wordlist(Object.keys(targets)));
        return false;
      }
      tasks = {
        app: "clean coffee compass tempcopy open-browser watch",
        test: "clean coffee compass tempcopy open-browser watch",
        phantom: "clean coffee compass",
        dist: "watch"
      };
      opts = {
        open: target !== "reload",
        port: (target === "reload" ? 35729 : port),
        base: targets[target],
        inject: true,
        target: target,
        hostname: grunt.config("server.hostname") || "localhost",
        passthroughServer: grunt.config("server.passthroughServer") || "localhost",
        contentRootPath: grunt.config("server.contentRootPath"),
        apiRootPath: grunt.config("server.apiRootPath")
      };
      grunt.helper("server", opts, cb);
      grunt.registerTask("open-browser", function() {
        if (opts.open) {
          return open("http://" + opts.hostname + ":" + opts.port);
        }
      });
      return grunt.task.run(tasks[target]);
    });
    grunt.registerHelper("server", function(opts, cb) {
      cb = cb || function() {};
      return devserver("../public", opts.port, function() {
        return cb(null, opts.port);
      });
    });
    grunt.registerHelper("server:errorHandler", function(opts) {
      var errorHandler;
      opts = opts || {};
      opts.target = opts.target || "app";
      connect.errorHandler.title = "Yeoman";
      return errorHandler = function(req, res, next) {
        var err, pathname;
        pathname = req.url;
        err = connect.utils.error(404);
        err.message = pathname + " " + err.message;
        if (grunt.task._helpers["server:error:" + opts.target]) {
          grunt.helper("server:error:" + opts.target, err, pathname);
        }
        return next(err);
      };
    });
    return grunt.registerHelper("server:error:dist", function(err, pathname) {
      if (pathname === "/") {
        err.message = "Missing /dist folder.";
        return err.stack = ["", "You need to run yeoman build first.", "", "<code>yeoman build</code>"].join("\n");
      }
    });
  };

}).call(this);
