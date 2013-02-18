fs = require("fs")
Db = require("mongodb").Db
GridStore = require("mongodb").GridStore
ObjectID = require("mongodb").ObjectID
Connection = require("mongodb").Connection
Server = require("mongodb").Server
BSON = require("mongodb").BSONPure


module.exports = (db, app) ->


  getGridFSFile = (callback,id) ->
    gs = new GridStore db, new ObjectID(id), 'r'
    gs.open (err,gs) -> 
      gs.read(callback)

  writeGridFSFile = (file, callback) ->
    objID = new ObjectID()
    gs = new GridStore db, objID, "w"
    gs.open (err, gridStore) ->
      if err
        callback(err, gridStore)
      else
        readStream = fs.createReadStream file.path
        readStream.on 'data', (data) -> 
          gs.write data, 
             "content_type": file.type
          , (err) ->

        readStream.on 'end', ->
          gs.close (err, result) ->
            if err
              console.log err
              callback(err, result)
            else 
              db.collection "fs.files", (err, collection) ->
                collection.update {_id:result._id}, {$set:{contentType:file.type, orig_filename: file.name}}

              result.contentType = file.type
              result.filename = file.name
              callback(err, result)

  app.get "/gridstore", (req, res) ->
    fn = jade.compile("""
      !!!
      html
        head
        body
          script(data-main = "javascripts/gridstore", src = "javascripts/require-jquery.js")
    """);
    res.send fn(), 200

  app.post "/api/gridstore", (req, res) ->
    fileData = []
    if req.files
      for reqFile of req.files
        file = req.files[reqFile]
        writeGridFSFile file, (err, data) ->
          if err
            res.send err, 500
          else
            res.send data, 200

    else
      res.send 'No files uploaded', 500

  

  app.get "/api/gridstore/:id", (req, res) ->
    spec = _id: new BSON.ObjectID(req.params.id)    
    db.collection "fs.files", (err, collection) ->
      if err
        res.send err, 500
      else
        collection.find spec, {}, (err, cursor) ->
          if err
            res.send err, 500    
          else
            cursor.toArray (err, docs) ->
              if err
                res.send err, 500    
              else
                if docs
                  fileRef = docs[0]
                  res.contentType("application/json")
                  fileRef.filename = fileRef.orig_filename
                  res.send fileRef


  app.get "/api/gridstore/:id/download", (req, res) ->
    spec = _id: new BSON.ObjectID(req.params.id)    
    db.collection "fs.files", (err, collection) ->
      if err
        res.send err, 500
      else
        collection.find spec, {}, (err, cursor) ->
          if err
            res.send err, 500    
          else
            cursor.toArray (err, docs) ->
              if err
                res.send err, 500    
              else
                if docs
                  fileRef = docs[0]
                  getGridFSFile (error,data) -> 
                    res.contentType(fileRef.contentType)
                    res.header "Content-Disposition", "inline; filename=\"#{fileRef.orig_filename}\""
                    res.end data
                  , req.params.id
                else
                  res.send "Invlaid File Reference", 500    
