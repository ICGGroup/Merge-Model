parseExcel = require("./parse-excel")

module.exports = (db, app) ->

  app.get "/parsexlsx", (req, res) ->
    fn = jade.compile("""
      !!!
      html
        head
        body
          script(data-main = "javascripts/upload", src = "javascripts/require-jquery.js")
    """);
    res.send fn(), 200

  app.post "/api/parsexlsx", (req, res) ->
    gridResults = parseExcel(req.files.file.path)
    res.send gridResults, 200


  app.post "/api/:collection/import", (req, res) ->
    gridResults = parseExcel(req.files.spreadsheet.path)
    collectionName = req.params.collection
    db.collection collectionName, (err, collection) ->
      if err
        res.send err, 500
      else
        _.each gridResults, (item) ->
          collection.insert item

    res.send gridResults, 200

