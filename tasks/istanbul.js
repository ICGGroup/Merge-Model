(function() {
  var fs, path;

  path = require('path');

  fs = require('fs');

  module.exports = function(grunt) {
    grunt.registerTask("istanbul", "compiles code into public/instanbul directory", function() {
      var cb, config, input, options, output;
      this.requiresConfig("staging");
      this.requiresConfig("istanbul");
      config = grunt.config();
      cb = this.async();
      output = path.resolve("" + config.istanbul);
      grunt.helper('clean-dir', output);
      input = path.resolve("" + config.staging);
      options = {
        cmd: "istanbul",
        args: ['instrument', input, '-o', output]
      };
      return grunt.util.spawn(options, function(error, result, code) {
        console.log(result.stdout);
        if (code !== 0) {
          grunt.log.warn(error);
        } else {
          grunt.log.ok("Complete");
        }
        return cb();
      });
    });
    grunt.registerTask("coverage-report", "checks the coverage after running tests", function() {
      var cb, options;
      cb = this.async();
      options = {
        cmd: "istanbul",
        args: ['report']
      };
      return grunt.util.spawn(options, function(error, result, code) {
        if (code !== 0) {
          grunt.log.warn("Error generating report");
        } else {
          grunt.log.ok("Coverage Report Complete:  See ./coverage/lcov-report/index.html");
        }
        return cb();
      });
    });
    return grunt.registerHelper('clean-dir', function(d) {
      var s;
      try {
        s = fs.lstatSync(d);
      } catch (er) {
        if (er.code === "ENOENT") {
          return true;
        }
        throw er;
      }
      if (!s.isDirectory()) {
        return fs.unlinkSync(d);
      }
      fs.readdirSync(d).forEach(function(f) {
        return grunt.helper('clean-dir', path.join(d, f));
      });
      return fs.rmdirSync(d);
    });
  };

}).call(this);
