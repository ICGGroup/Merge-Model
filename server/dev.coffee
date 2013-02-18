path = require("path")
express = require("express")
app = express()
http = require('http')
server = http.createServer(app)

url = require("url")
fs = require("fs")
coffee = require("coffee-script")

_ = require("underscore")
dateFormat = require("dateformat")

Db = require("mongodb").Db
GridStore = require("mongodb").GridStore
ObjectID = require("mongodb").ObjectID
Connection = require("mongodb").Connection
Server = require("mongodb").Server
BSON = require("mongodb").BSONPure

format = require("util").format
zipfile = {} #require("zipfile")
parser = require("libxml-to-js")
path = require('path');


dbName = "barista"

module.exports = (publicDir, port, cb) ->

  serverPort = port || 8808

  host = (if process.env["MONGO_NODE_DRIVER_HOST"]? then process.env["MONGO_NODE_DRIVER_HOST"] else "localhost")
  port = (if process.env["MONGO_NODE_DRIVER_PORT"]? then process.env["MONGO_NODE_DRIVER_PORT"] else Connection.DEFAULT_PORT)
  parseExcel = require("./parse-excel")


  app.configure ->
    app.use express.methodOverride()
    app.use express.bodyParser()
    app.use express.cookieParser()
    app.use express.session {secret: 'icgrules'}
    app.use app.router

    app.use express.static(path.resolve(__dirname, publicDir))

  app.set('views', path.resolve(__dirname, "../views"))
  app.set('view engine', 'ejs')

  db = new Db(dbName, new Server(host, port, {}),
    native_parser: true,
    safe:false
  )

  views = []
  fs.readdir path.resolve(__dirname, "../views"), (err, files) ->
    if err
      console.log err
    else
      views = (v for v in files when v isnt ".DS_Store")

  db.open (err, database) ->

    app.get "/", (req, res) ->
      res.render "default", {}

    ###

    Generic Demo functionality

    ###

    ###

      authentication functionality

    ### 
    # require('./auth')(database, app);


    app.get "/api/:collection/:id?", (req, res) ->
      query = (if req.query.query then JSON.parse(req.query.query) else {})
      query = _id: new BSON.ObjectID(req.params.id)  if req.params.id
      options = req.params.options or {}
      console.log query
      revisedQuery = {}
      test = [ "limit", "sort", "fields", "skip", "hint", "explain", "snapshot", "timeout" ]
      for o of query
        if test.indexOf(o) >= 0
          options[o] = query[o]
        else
          revisedQuery[o] = query[o]  


      collectionName = req.params.collection
      database.collection collectionName, (err, collection) ->
        if err
          res.send err, 500
        else
          collection.find revisedQuery, options, (err, cursor) ->
            if err
              res.send err, 500
            else
              cursor.toArray (err, docs) ->
                if err
                  res.send err, 500
                else
                  if req.params.id and docs.length > 0
                    res.send docs[0], 200
                  else
                    res.send docs, 200

    app.post "/api/:collection", (req, res) ->
      collectionName = req.params.collection
      database.collection collectionName, (err, collection) ->
        if err
          console.log err
          res.send err, 500
        else
          collection.insert req.body, (err, docs) ->
            if err
              console.log err
              res.send err, 500
            else
              res.send docs[0], 201
              

    app.put "/api/:collection/:id", (req, res) ->
      collectionName = req.params.collection
      spec = _id: new BSON.ObjectID(req.params.id)
      database.collection collectionName, (err, collection) ->
        if err
          console.log err
          res.send err, 500
        else
          setSpec = {}
          for prop of req.body
            setSpec[prop] = req.body[prop]  if prop isnt "_id"
          
          collection.update spec,
            $set: setSpec
          ,
            safe: true
          , (err, docs) ->
            if err
              console.log err
              res.send err, 500
            else
              res.send req.body, 200


    console.log "Dev Server Started on port #{serverPort}"
    console.log "Using MongoDB '#{dbName}'"
    app.listen serverPort

    # Basic Socket Support
    console.log "Go, Go Gadget Sockets"
    io = require('socket.io').listen(server);
    supportedChannels = ["", "news", "invoices", "invoices/gllines", "transaction", "transaction/gllines"]
    channels = []

    createChannel = (channel, events) ->
      newChannel = io.of("/#{channel}").on("connection", (socket) ->
        _.each events, (e)->
          socket.on e, (data, callback) ->
            data.socketClientId = socket.id
            newChannel.emit e, data
            if callback
              callback(true)
      )
      newChannel.key = channel
      newChannel

    _.each supportedChannels, (channel)->
      channels.push createChannel(channel, ["message", "create", "update", "delete", "dispatch"])

    io.sockets.on "connection", (socket) ->
      socket.emit "id", socket.id
      socket.on "join", (channel, callback) ->
        supported = _.find channels, (c)-> c.keys is channel
        if callback
          callback(supported isnt undefined)


    if cb
      cb.apply(this)
