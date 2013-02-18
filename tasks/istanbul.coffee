path = require 'path'
fs = require('fs')

module.exports = (grunt) ->
  
  grunt.registerTask "istanbul", "compiles code into public/instanbul directory", ->
    @requiresConfig "staging"
    @requiresConfig "istanbul"
    config = grunt.config()
    cb = @async()

    output = path.resolve("#{config.istanbul}")    
    
    grunt.helper('clean-dir', output);

    input = path.resolve("#{config.staging}")    
    options = 
      cmd: "istanbul"
      args:['instrument', input, '-o', output]



    grunt.util.spawn options, (error, result, code)->
      console.log(result.stdout)
      if code isnt 0
        grunt.log.warn error
      else
        grunt.log.ok "Complete"
      cb()

  grunt.registerTask "coverage-report", "checks the coverage after running tests", ->
    cb = @async()
    
    options = 
      cmd: "istanbul"
      args:['report']

    grunt.util.spawn options, (error, result, code)->
      if code isnt 0
        grunt.log.warn "Error generating report"
      else
        grunt.log.ok "Coverage Report Complete:  See ./coverage/lcov-report/index.html"
      cb()


  grunt.registerHelper 'clean-dir', (d) ->

    try 
      s = fs.lstatSync(d)
    catch er
      if er.code is "ENOENT"
        return true
      throw er

    if not s.isDirectory()
      return fs.unlinkSync(d)

    fs.readdirSync(d).forEach (f)->
      grunt.helper('clean-dir', path.join(d, f))
    

    fs.rmdirSync(d)
