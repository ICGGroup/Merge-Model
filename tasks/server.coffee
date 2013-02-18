fs = require("fs")
path = require("path")
util = require("util")
http = require("http")
open = require("open")
fs = require("fs")
coffee = require("coffee-script")
express = require("express")
devserver = require("../server/dev")
http = require("http")

module.exports = (grunt) ->
  
  
  # Tasks & Helpers
  # ===============
  
  # Retain grunt's built-in server task.
  grunt.renameTask "server", "grunt-server"
  
  # The server task always run with the watch task, this is done by
  # aliasing the server task to the relevant set of task to run.
  grunt.registerTask "server", "appserver watch"
  
  # Temporary directory copy
  # ---------------
  grunt.registerTask "tempcopy", "Copies the whole staging(temp/) folder to output (dist/) one", ->
    @requiresConfig "staging"
    config = grunt.config()
    cb = @async()
    
    # prior to run the last copy step, switch back the cwd to the original one
    # todo: far from ideal, would most likely go into other problem here
    grunt.file.setBase config.base
    
    # todo a way to configure this from Gruntfile
    ignores = [".gitignore", ".ignore", ".buildignore", "./scripts"]

    grunt.task.helper "copy", "app", "#{config.staging}", ignores, (e) ->
    # grunt.task.helper "copy", config.staging, config.output, ignores, (e) ->
      if e
        grunt.log.error e.stack or e.message
      else
        grunt.log.ok path.resolve("app") + " -> " + path.resolve("#{config.staging}")
        cb not e

    # grunt.task.helper "copy", "app/stylesheets", "#{config.staging}/stylesheets", ignores, (e) ->
    # # grunt.task.helper "copy", config.staging, config.output, ignores, (e) ->
    #   if e
    #     grunt.log.error e.stack or e.message
    #   else
    #     grunt.log.ok path.resolve("app/stylesheets") + " -> " + path.resolve("#{config.staging}/stylesheets")
    #     grunt.task.helper "copy", "app/images", "#{config.staging}/images", ignores, (e) ->
    #       if e
    #         grunt.log.error e.stack or e.message
    #       else
    #         grunt.log.ok path.resolve("app/images") + " -> " + path.resolve("#{config.staging}/images")
    #         grunt.task.helper "copy", "app/components", "#{config.staging}/components", ignores, (e) ->
    #           if e
    #             grunt.log.error e.stack or e.message
    #           else
    #             grunt.log.ok path.resolve("app/components") + " -> " + path.resolve("#{config.staging}/components")
    #             grunt.task.helper "copy", "app/*.html", "#{config.staging}/*.html", ignores, (e) ->
    #               if e
    #                 grunt.log.error e.stack or e.message
    #               else
    #                 grunt.log.ok path.resolve("app") + " -> " + path.resolve("#{config.staging}")

    #               cb not e

  
  # triggered by a watch handler to emit a reload event on all livereload
  # established connection
  grunt.registerTask "reload", ->
    console.log "Reload not enabled for devserver...sorry...try Command-R"
  
  # Server
  # ------
  
  # Note: yeoman-server alone will exit prematurly unless `this.async()` is
  # called. The task is designed to work alongside the `watch` task.
  grunt.registerTask "appserver", "Launch a new dev server", (target) ->
    opts = undefined
    
    # Get values from config, or use defaults.
    port = grunt.config("server.port") or 0xDAD
    # async task, call it (or not if you wish to use this task standalone)
    cb = @async()
    
    # valid target are app (default), prod and test
    targets =
      
      # these paths once config and paths resolved will need to pull in the
      # correct paths from config
      app: path.resolve("app")
      dist: path.resolve("public")
      test: path.resolve("test")
      
      # phantom target is a special one: it is triggered
      # before launching the headless tests, and gives
      # to phantomjs visibility on the same paths a
      # server:test have.
      phantom: path.resolve("test")
      
      # reload is a special one, acting like `app` but not opening the HTTP
      # server in default browser and forcing the port to LiveReload standard
      # port.
      reload: path.resolve("app")

    target = target or "app"
    
    # yell on invalid target argument
    unless targets[target]
      grunt.log.error("Not a valid target: " + target).writeln "Valid ones are: " + grunt.log.wordlist(Object.keys(targets))
      return false
    tasks =
      
      # We do want our coffee, and compass recompiled on change
      # and our browser opened and refreshed both when developping
      # (app) and when writing tests (test)
      app: "clean coffee compass tempcopy open-browser watch"
      test: "clean coffee compass tempcopy open-browser watch"
      
      # Before our headless tests are run, ensure our coffee
      # and compass are recompiled
      phantom: "clean coffee compass"
      dist: "watch"
      # reload: "watch"

    opts =
      
      # prevent browser opening on `reload` target
      open: target isnt "reload"
      
      # and force 35729 port no matter what when on `reload` target
      port: (if target is "reload" then 35729 else port)
      base: targets[target]
      inject: true
      target: target
      hostname: grunt.config("server.hostname") or "localhost"
      passthroughServer: grunt.config("server.passthroughServer") or "localhost"
      contentRootPath: grunt.config("server.contentRootPath")
      apiRootPath: grunt.config("server.apiRootPath")

    grunt.helper "server", opts, cb
    grunt.registerTask "open-browser", ->
      open "http://" + opts.hostname + ":" + opts.port  if opts.open

    grunt.task.run tasks[target]

  grunt.registerHelper "server", (opts, cb) ->
    cb = cb or ->

    devserver "../public", opts.port, ()->
      cb null, opts.port  

    


  
  # Error handlers
  # --------------
  
  # Grunt helper providing a connect middleware focused on dealing with
  # errors. Assuming this middleware is at the bottom of your stack, deals
  # with incoming request as 404 errors. It then tries to add a more
  # meaningful message, based on provided `options`.
  #
  # - opts       - Hash of options where
  #    - base    - is the base directory and helps to determine a more
  #                specific message
  #    - target  - The base target name (app, dist, test) to act upon
  #
  #
  # If a grunt helper with a `server:error:<target>` name is registered,
  # invoke it, passing in the original error and associated pathname.
  #
  # It changes the exports.title property used internally by
  # connect.errorHandler (to update the Page title to be Yeoman instead of
  # Connect).
  #
  # In a next step, we might want to craft our own custom errorHandler, based
  # on http://www.senchalabs.org/connect/errorHandler.html to customize a bit
  # more.
  grunt.registerHelper "server:errorHandler", (opts) ->
    opts = opts or {}
    opts.target = opts.target or "app"
    connect.errorHandler.title = "Yeoman"
    errorHandler = (req, res, next) ->
      
      # Figure out the requested path
      pathname = req.url
      
      # asume 404 all the way.
      err = connect.utils.error(404)
      err.message = pathname + " " + err.message
      
      # Using events would be better here, but the `res.socket.server`
      # instance doesn't seem to be same than the one returned by connect()
      grunt.helper "server:error:" + opts.target, err, pathname  if grunt.task._helpers["server:error:" + opts.target]
      
      # go next, and pass in the crafted error object
      next err

  
  # Target specific error handlers. Alter the error object as you see fit.
  grunt.registerHelper "server:error:dist", (err, pathname) ->
    
    # handle specific pathname here, `/` on dist target as special meaning.
    # Most likely missing a build run.
    if pathname is "/"
      err.message = "Missing /dist folder."
      
      # connect middleware slice at position 1, append an Empty String (usually Error: err.message)
      err.stack = ["", "You need to run yeoman build first.", "", "<code>yeoman build</code>"].join("\n")

  
