// Important: You must install `temporary`: `npm install`
/*
 * grunt
 * https://github.com/cowboy/grunt
 *
 * Copyright (c) 2012 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 * http://benalman.com/about/license/
 *
 * Mocha task
 * Copyright (c) 2012 Kelly Miyashiro
 * Licensed under the MIT license.
 * http://benalman.com/about/license/
 */

module.exports = function(grunt) {
  // Grunt utilities.
  var task = grunt.task;
  var file = grunt.file;
  var utils = grunt.utils;
  var log = grunt.log;
  var verbose = grunt.verbose;
  var fail = grunt.fail;
  var option = grunt.option;
  var config = grunt.config;
  var template = grunt.template;
  
  // Nodejs libs.
  var fs = require('fs')
  , path = require('path')
  , phantom = require('node-phantom');
  // External libs.
  var growl
  , startTimeout = null
  , errors = [];
  
  // Growl is optional
  try {
    growl = require('growl');
  } catch(e) {
    growl = function(){};
    verbose.write('Growl not found, npm install growl for Growl support');
  }

  // Keep track of the last-started module, test and status.
  var currentModule, currentTest, status;
  // Keep track of the last-started test(s).
  var unfinished = {};

  // Allow an error message to retain its color when split across multiple lines.
  function formatMessage(str) {
    return String(str).split('\n').map(function(s) { return s.magenta; }).join('\n');
  }

  // Keep track of failed assertions for pretty-printing.
  var failedAssertions = [];
  function logFailedAssertions() {
    var assertion;
    // Print each assertion error.
    while (assertion = failedAssertions.shift()) {
      verbose.or.error(assertion.testName);
      log.error('Message: ' + formatMessage(assertion.message));
      if (assertion.actual !== assertion.expected) {
        log.error('Actual: ' + formatMessage(assertion.actual));
        log.error('Expected: ' + formatMessage(assertion.expected));
      }
      if (assertion.source) {
        log.error(assertion.source.replace(/ {4}(at)/g, '  $1'));
      }
      log.writeln();
    }
  }

  // Handle methods passed from PhantomJS, including Mocha hooks.
  var phantomHandlers = {
    // Mocha hooks.
    suiteStart: function(name) {
      unfinished[name] = true;
      currentModule = name;
    },
    suiteDone: function(name, failed, passed, total) {
      delete unfinished[name];
    },
    testStart: function(name) {
      currentTest = (currentModule ? currentModule + ' - ' : '') + name;
      verbose.write(currentTest + '...');
    },
    testFail: function(name, result) {
        result.testName = currentTest;
        failedAssertions.push(result);
    },
    testDone: function(title, state) {
      // Log errors if necessary, otherwise success.
      if (state == 'failed') {
        // list assertions
        if (option('verbose')) {
          log.error();
          logFailedAssertions();
        } else {
          log.write('F'.red);
        }
      } else {
        verbose.ok().or.write('.');
      }
    },
    done: function(failed, passed, total, duration) {
      var nDuration = parseFloat(duration) || 0;
      status.failed += failed;
      status.passed += passed;
      status.total += total;
      status.duration += Math.round(nDuration*100)/100;
      // Print assertion errors here, if verbose mode is disabled.
      if (!option('verbose')) {
        if (failed > 0) {
          log.writeln();
          logFailedAssertions();
        } else {
          log.ok();
        }
      }
    },
    // Error handlers.
    done_fail: function(url) {
      verbose.write('Running PhantomJS...').or.write('...');
      log.error();
      grunt.warn('PhantomJS unable to load "' + url + '" URI.', 90);
    },
    done_timeout: function() {
      log.writeln();
      grunt.warn('PhantomJS timed out, possibly due to a missing Mocha run() call.', 90);
    },
    coverage: function(coverage) {
      log.writeln();
      grunt.warn('coverage provided', 90);
    },
    
    // console.log pass-through.
    // console: console.log.bind(console),
    // Debugging messages.
    debug: log.debug.bind(log, 'phantomjs')
  };

  // ==========================================================================
  // TASKS
  // ==========================================================================

  grunt.registerTask('socket-mocha', 'Run Mocha unit tests in a headless PhantomJS instance, communicating through socket.io.', function() {
    //Lame way to avoid fatal collisons with tests being run in the browser.
    
    taskRunning = true
    // Get files as URLs.
    // Get additional configuration
    var io = require('socket.io').listen(3080, {'log level': 1})
    var config = grunt.config();
    
    if (utils.kindOf(this.data) === 'object') {
      config = utils._.clone(this.data);
      delete config.src;
    }

    var configStr = JSON.stringify(config);
    verbose.writeln('Additional configuration: ' + configStr);
    
    // This task is asynchronous.
    var done = this.async();

    var startDt = new Date();
    // Reset status.
    status = {failed: 0, passed: 0, total: 0, duration: 0};


    log.write('Preparing Test Execution Environment\n')
    phantom.create(function(err,ph) {
      return ph.createPage(function(err,page) {
        startTimeout = setTimeout(function(){
          killTests("Have not received any messages from tests.  This usually means there is an error on the page.");
        }, 10000);

        failureTimeout = setTimeout(function(){
          killTests("The tests did not complete in the specified time.");
        }, 120000);

        //socket.io server to support both the test messageing and the ICG standard messaging, so that we do not have to stub out for tests.

        var channels, createChannel, supportedChannels;
        supportedChannels = ["", "news", "invoices", "invoices/gllines", "transaction", "transaction/gllines"];
        channels = [];
        createChannel = function(channel, events) {
          var newChannel;
          newChannel = io.of("/" + channel).on("connection", function(socket) {
            return events.forEach(function(e) {
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

        supportedChannels.forEach(function(channel) {
          return channels.push(createChannel(channel, ["message", "create", "update", "delete", "dispatch"]));
        });

        io.sockets.on("connection", function(socket) {
          var ignoreNext = false

          socket.emit("id", socket.id);
          socket.on("join", function(channel, callback) {
            var supported;
            supported = _.find(channels, function(c) {
              return c.keys === channel;
            });
            if (callback) {
              return callback(supported !== void 0);
            }
          });

          socket.on('testStart', function (data) {
          });

          socket.on('log', function (data) {
            if(config.mocha.logShipping){
              console.log(data)  
            }
          });


          socket.on('testDone', function (data) {
            if(ignoreNext){
              ignoreNext = false;
            } else if(taskRunning) {
              log.write("\033[32m.\033[m")  
            }
            
          });

          socket.on('testPending', function (data) {
            ignoreNext = true;
            if(taskRunning) {
              log.write("\033[33mP\033[m")
            }
            
          });

          socket.on('suiteStart', function (data) {
            clearTimeout(startTimeout);
          });

          socket.on('suiteEnd', function (data) {
          });

          socket.on('testFail', function (data) {
            ignoreNext = true;
            errors.push(data)
            if(taskRunning) {
              log.write("\033[31mF\033[m")
            }
          });

          socket.on('done', function (data) {
            socket = null
            if(taskRunning) {
              data.duration = (new Date() - startDt)/1000
              testsComplete(data)            
            }
  
          });

          socket.on('coverage', function (data) {
            if(taskRunning) {
              output = path.resolve(config.istanbul)   
              fs.writeFile(output + "/coverage.json", JSON.stringify(data, null, 2), function(err) {
                if(err){console.log(err)}
              });
            }
          });
        });
        return page.open("./test/index.html", function(err,status) {

        });
      });
    });


    var hasFailures = function(suite){
      if(suite.failures.length > 0){ return true }
      for (var i = suite.suites.length - 1; i >= 0; i--) {
        if(hasFailures(suite.suites[i])){ return true }          
      }
      return false;
    }

    var printFailures = function(suite, padding){
      if(!padding) padding = "";
      if(hasFailures(suite)){
        if(suite.title==undefined) suite.title = "Failed Tests"
        log.write("\n" + padding + suite.title + "\n")
        for (var i = 0; i < suite.failures.length; i++) {
          var s = suite.failures[i]
          log.write(padding + " it \"\033[33m" + s.title + "\033[m\"\n")
          log.write(padding + "   \033[31m" + s.error + "\033[m\n\n")
        };

        for (var i = 0; i < suite.suites.length; i++) {
          printFailures(suite.suites[i], padding + "  ")
        }

      }
    }

    var killTests = function(message){
      if(taskRunning){
        taskRunning = false
        io.server.close();
        clearTimeout(startTimeout);
        clearTimeout(failureTimeout);
        grunt.warn(message, 93)
      }
      done();
    }

    var testsComplete = function(status){      
      if(taskRunning){
        io.server.close();

        log.write("\n");
        clearTimeout(startTimeout);
        clearTimeout(failureTimeout);
        if (status.failed > 0) {
          growl(status.failed + ' of ' + status.total + ' tests failed!', {
            image: __dirname + '/mocha/error.png',
            title: 'Tests Failed',
            priority: 3
          });

          printFailures(status.root);

          grunt.warn(status.failed + '/' + status.total + ' assertions failed (' +
            status.duration + 's)', Math.min(99, 90 + status.failed));
        } else {
          growl('All Clear: ' + status.total + ' tests passed', {
            title: 'Tests Passed',
            image: __dirname + '/mocha/ok.png'
          });
          verbose.writeln();
          log.ok(status.total + ' assertions passed (' + status.duration + 's)');
        }

        // All done!
        taskRunning = false        
      }

      done();
    }

  
  });



};
