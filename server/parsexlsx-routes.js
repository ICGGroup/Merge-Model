(function() {
  var parseExcel;

  parseExcel = require("./parse-excel");

  module.exports = function(db, app) {
    app.get("/parsexlsx", function(req, res) {
      var fn;
      fn = jade.compile("!!!\nhtml\n  head\n  body\n    script(data-main = \"javascripts/upload\", src = \"javascripts/require-jquery.js\")");
      return res.send(fn(), 200);
    });
    app.post("/api/parsexlsx", function(req, res) {
      var gridResults;
      gridResults = parseExcel(req.files.file.path);
      return res.send(gridResults, 200);
    });
    return app.post("/api/:collection/import", function(req, res) {
      var collectionName, gridResults;
      gridResults = parseExcel(req.files.spreadsheet.path);
      collectionName = req.params.collection;
      db.collection(collectionName, function(err, collection) {
        if (err) {
          return res.send(err, 500);
        } else {
          return _.each(gridResults, function(item) {
            return collection.insert(item);
          });
        }
      });
      return res.send(gridResults, 200);
    });
  };

}).call(this);
