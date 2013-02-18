(function() {

  module.exports = function(grunt) {
    return grunt.registerTask("build", "intro clean coffee compass mkdirs usemin-handler rjs concat css min img copy time");
  };

}).call(this);
