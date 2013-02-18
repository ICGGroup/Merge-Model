(function() {
  var getCellValue, parseExcel, parseHeaders;

  getCellValue = function(stringValues, cell) {
    var id, newDate;
    if (cell && cell["@"] && cell["@"].t === "s") {
      id = new Number(cell.v);
      return stringValues.si[id].t;
    } else if (cell) {
      if (cell["@"] && (cell["@"].s === "1" || cell["@"].s === "2")) {
        newDate = new Date(-2209161600000 + (parseInt(cell.v) * 24 * 3600 * 1000));
        return newDate;
      } else {
        return parseFloat(cell.v);
      }
    }
  };

  parseHeaders = function(stringValues, sheetData) {
    var a, altHeader, col, colLetter, column, headerName, headerRow, hrow, map, prop;
    map = {
      date: ['date', 'invoice_date'],
      amount: ['amount', 'invoice_date'],
      description: ['description', 'vendor_name_description']
    };
    headerRow = {};
    column = void 0;
    column = 0;
    if (sheetData.row[0].c.length < 3) {
      hrow = 5;
    } else {
      hrow = 0;
    }
    while (column < sheetData.row[hrow].c.length) {
      col = sheetData.row[0].c[column];
      colLetter = col["@"].r.match(/([A-Z]+)/g);
      if (colLetter) {
        headerName = getCellValue(stringValues, col);
        if (headerName) {
          headerName = headerName.toLowerCase().replace(/\W/g, "_").replace(/_+/g, "_").replace(/^_*/, "").replace(/_*$/, "");
          for (prop in map) {
            if (((function() {
              var _i, _len, _ref, _results;
              _ref = map[prop];
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                a = _ref[_i];
                if (a === headerName) {
                  _results.push(a);
                }
              }
              return _results;
            })()).length > 0) {
              altHeader = prop;
            }
          }
          if (altHeader) {
            headerName = altHeader;
          }
          console.log(headerName);
          headerRow[colLetter] = headerName;
        }
      }
      column++;
    }
    return headerRow;
  };

  parseExcel = function(file) {
    var gridResults, sharedString, zf;
    gridResults = [];
    zf = new zipfile.ZipFile(file);
    sharedString = zf.readFileSync("xl/sharedStrings.xml").toString();
    parser(sharedString, function(err, result) {
      var sheet1, strings;
      strings = result;
      sheet1 = zf.readFileSync("xl/worksheets/sheet1.xml").toString();
      return parser(sheet1, function(err, result) {
        var colLetter, column, headers, newRow, row, sourceRow, _results;
        if (err) {
          res.send(err);
          return console.log(err);
        } else {
          headers = parseHeaders(strings, result.sheetData);
          row = 1;
          _results = [];
          while (row < result.sheetData.row.length) {
            sourceRow = result.sheetData.row[row];
            if (sourceRow.c) {
              newRow = {};
              column = 0;
              while (column < sourceRow.c.length) {
                colLetter = sourceRow.c[column]["@"].r.match(/([A-Z]+)/g);
                if (headers[colLetter]) {
                  newRow[headers[colLetter]] = getCellValue(strings, sourceRow.c[column]);
                }
                column++;
              }
              gridResults.push(newRow);
            }
            _results.push(row++);
          }
          return _results;
        }
      });
    });
    return gridResults;
  };

  module.exports = parseExcel;

}).call(this);
