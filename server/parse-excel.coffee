getCellValue = (stringValues, cell) ->
  if cell and cell["@"] and cell["@"].t is "s"
    id = new Number(cell.v)
    stringValues.si[id].t
  else if cell
    if cell["@"] and (cell["@"].s is "1" or cell["@"].s is "2")
      newDate = new Date(-2209161600000 + (parseInt(cell.v) * 24 * 3600 * 1000))
      newDate
    else
      parseFloat cell.v

parseHeaders = (stringValues, sheetData) ->
  map = 
    date: ['date', 'invoice_date']
    amount: ['amount', 'invoice_date']
    description: ['description', 'vendor_name_description']
  headerRow = {}
  column = undefined
  column = 0
  if sheetData.row[0].c.length < 3
    hrow = 5
  else 
    hrow = 0
  while column < sheetData.row[hrow].c.length
    col = sheetData.row[0].c[column]
    colLetter = col["@"].r.match(/([A-Z]+)/g)
    if colLetter
      headerName = getCellValue(stringValues, col)
      if headerName
        headerName = headerName.toLowerCase().replace(/\W/g, "_").replace(/_+/g, "_").replace(/^_*/, "").replace(/_*$/, "")
        altHeader = prop for prop of map when (a for a in map[prop] when a is headerName).length>0
        if(altHeader)
          headerName = altHeader

        console.log headerName
        headerRow[colLetter] = headerName
    column++
  headerRow

parseExcel = (file) ->
  gridResults = []
  zf = new zipfile.ZipFile(file)
  sharedString = zf.readFileSync("xl/sharedStrings.xml").toString()
  parser sharedString, (err, result) ->
    strings = result
    sheet1 = zf.readFileSync("xl/worksheets/sheet1.xml").toString()
    parser sheet1, (err, result) ->
      if err
        res.send err
        console.log err
      else
        headers = parseHeaders(strings, result.sheetData)
        row = 1

        while row < result.sheetData.row.length
          sourceRow = result.sheetData.row[row]
          if sourceRow.c
            newRow = {}
            column = 0
            while column < sourceRow.c.length
              colLetter = sourceRow.c[column]["@"].r.match(/([A-Z]+)/g)
              newRow[headers[colLetter]] = getCellValue(strings, sourceRow.c[column])  if headers[colLetter]
              column++
            gridResults.push newRow
          row++

  gridResults

module.exports = parseExcel
