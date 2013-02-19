require({

  paths: {
    // Libraries.
    "icg": "../../istanbul/scripts",
    "test": "../spec",
    "fixtures": "../fixtures"

  }

}, [

// Load specs
'test/merge-model.spec'
], function() {
  'use strict';
  
  var runner = mocha.run();
  // window.__coverage__;
  
  var rootSuite  = {suites:[], tests:[], failures:[], pending:[]}
  var currentSuite = null
  var currentParent = null

  var socket;

  console.origLog = console.log
  console.log = function(message){
    emitMessage('log', message);
    console.origLog.apply(this, arguments);
  };

  if(window["io"]){
    socket = io.connect('http://localhost:3080');
  } 

  runner.on('test', function(test) {
    currentSuite.tests.push({title:test.title})
    emitMessage('testStart', {title:test.title})
  });

  runner.on('test end', function(test) {
    emitMessage('testDone', {title:test.title})
  });

  runner.on('pending', function(test) {
    currentSuite.pending.push({title:test.title})        
    emitMessage('testPending', {title:test.title})
  });

  runner.on('suite', function(suite) {
    if (suite.root) return;
    var s = {
      title: suite.title,
      suites:[], 
      tests:[],
      failures:[],
      pending:[]
    }
    if(suite.parent.root){
      currentParent = rootSuite
      rootSuite.suites.push(s)
      currentSuite = s
    } else {
      currentParent = currentSuite
      currentSuite.suites.push(s)
      currentSuite = s
    }

    emitMessage('suiteStart', {title:suite.title})
  });

  runner.on('suite end', function(suite) {
    if (suite.root) return;
    if(currentSuite){
      currentSuite = currentParent
    }
    emitMessage('suiteDone', {title:suite.title})
  });

  runner.on('fail', function(test, err) {
    var failure = {title:test.title, error:err.message}
    currentSuite.failures.push(failure)        
    emitMessage('testFail', {test:failure})
  });

  runner.on('end', function() {
    var output = {
      root: rootSuite,
      pending : this.pending,
      failed  : this.failures,
      passed  : this.total - this.failures,
      total   : this.total
    };
    if(window.__coverage__){
      emitMessage('coverage', __coverage__)
    }
    setTimeout(function(){emitMessage('done', output)}, 20)
    
  });

  function emitMessage(event, data){
    if(socket){
      socket.emit(event, data);
    }
  }

});

