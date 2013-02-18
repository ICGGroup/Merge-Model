(function() {
  var server, serverArgs, serverPort;

  server = require('./dev');

  serverArgs = process.argv.slice(2);

  serverPort = serverArgs[0] || 3501;

  server("../public", serverPort);

}).call(this);
