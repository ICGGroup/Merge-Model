# Merge Model

A Backbone Model that is initialed with partial data and a template.  This was originally conceived to facilitate tight, declarative data construction for test cases, hence the somewhat non-idiomatic data below and in the examples.  It should work, however, regardless of the shape of your data.

## Merging Logic

The model and template will both use the following rules with respect to structure

* Data at the root will map to SYD_WIP 
* The primary data node, such as APD_INVOICE will be represented as an object node named for the matching data table
* Relational Data will be represented by arrays name for the matching data table
* WORK_ID, if provided, need only be present at the root level.
* In order to avoid collision with _normal_ work items.  Workitems created using this methodology should be prefixed with ```T```
* RPM_R_ID should not be included and should **not** be relied upon in the execution of tests.

When a model is merged with a template, the following logic will be applied:

* When the model includes properties in the root (SYD_WIP), or the primary data table node (APD_INVOICE), these will be replaced directly.
* When the template includes arrays for relational data and the model does not contain ANY data, the template data will be used directly.
* When the model includes arrays for relational data, the following rules will be applied:
  * If the model contains an empty array, the tempalte data will NOT be applied for that entity.
  * If the model data contains rows, each row will be mapped against the rows present in the template, using the template data to provide default values.
  * If the model contains more rows than the source template, the information presented in the prior rows will be used in a repeating fashion to construct the required rows.
  * If the model contains relational data not present in the template, the model data is used directly and is not augmented.
* As a convenience, model properties may be expressed as a function.  This might be particularly useful if dates or relative ageas are important


## Examples

The following examples illustrated the points above.  See the tests for the actual implementations.  Here are a few things to remember:

1. These examples use coffeescript notation.  This is not to suggest that coffeescript is required.  It simply provides a readable structure that more readily illustrated the concepts. 
1. In to keep the examples readable, I have used ellipses extensively.  Where you see ```...```, you should assume that the data not specifically shown is derived directly fromt he template and is simply not relevant to the discussion. 


The following model template is used for all of the examples.  


```coffee-script
template = 
  WORK_ID: "T00000003582"
  BLD_PKG: "WI.OCR"
  RULE_GROUP: "MDN_INV"
  WI_TYPE: "INVOICE"
  DOC_TYPE: "MAD"
  DOC_SUB_TYPE: "YYY"
  QUEUE: "HUDE"
  QUEUE_ENTRY_DT: "2013-01-09T11:26:29-06:00"
  ROUTE_HOPS: "2"
  PROCESS_STATE: "0"
  ROUTING_STATE: "IDLE"
  LOCKED_USER: "_ULCK"
  LOCK_DT: "2013-01-09T11:26:28-06:00"
  USER_ACTION: "COMPLETE"
  ITEM_SOURCE: "SCN"
  CREATE_DT: "2011-10-18T11:24:12-05:00"
  CREATE_USER: "DMIMPORT"
  LAST_READ_DT: "2013-02-15T10:48:37-06:00"
  LAST_READ_USER: "sysadmin"
  LAST_WRITE_DT: "2013-01-09T11:26:24.527-06:00"
  LAST_WRITE_USER: "ICG\\SSOMMERS"
  SOURCE_QUEUE: "NPO_RD"
  ROUTE_INSTANCE: "11"
  PRIORITY: "5"
  STATUS_CODE: "99"
  SCAN_BATCH: "20111018,100617"
  RECEIVE_DT: "2011-10-17T00:00:00-05:00"
  LOC_ID: "1000"
  SCAN_DT: "2011-10-18T00:00:00-05:00"
  SCAN_OP_ID: "LOVES\\kurrayw"
  RPM_ROW_STATE: "MODIFIED"

  APD_INVOICE:
    VENDOR_NBR: "41523"
    VENDOR_NAME: "YOKOHAMA TIRE CORPORATION"
    VENDOR_ADDR_1: "PO BOX 100406"
    VENDOR_CITY: "PASADENA"
    VENDOR_STATE: "CA"
    VENDOR_POSTAL_CODE: "91189-0406"
    VENDOR_TERMS: "NET01"
    INV_NBR: "RP80092.01A"
    INV_DATE: "2011-10-17T02:00:00-05:00"
    INV_AMT: "700.26"
    INV_SALES_TAX_AMT: "0.00"
    DISC_AMT: "0.00"
    SEPARATE_CHECK: "N"
    SP_HANDLE_SW: "SM"
    SENSITIVE: "N"
    STORE_NBR: "333"
    APPROVAL_EXCEPT: "N"
    FA_EXCEPT: "N"
    SPREAD_EXCEPT: "N"
    ROUTING_CODE: "ACH LOVES"
    REMIT_ADDR_TYPE: "MAIN"
    RPM_ROW_STATE: "UNCHANGED"

  APD_ACCT_DISTRIB: [
    GL_BUS_UNIT: "001"
    GL_DIV: "0001"
    GL_CHRG_DEPT: "0319"
    GL_APPR_DEPT: "0MUS"
    GL_ACCT_CODE: "004360"
    GL_DESC: "TIRE CARE - REBATES"
    GL_AMT: "700.26"
    GL_VALID_FLG: "Y"
    RPM_ROW_STATE: "UNCHANGED"
  ]

  SYD_ATTACHMENTS: [
    RPM_R_ID: "2060"
    WORK_ID: "T00000003582"
    OBJECT_NAME: "INVOICE"
    ORIGINAL_NAME: "0901cc288005da20"
    OBJECT_DESC: "Primary Document"
    OBJECT_FILE_TYPE: "TIF"
    OBJECT_LOCATION: "0901cc2880064554X"
    ATTACHMENT_TYPE: "DOCUMENTUM"
    ATTACH_DT: "2011-10-18T11:24:12.677-05:00"
    UPDATEABLE: "-1"
    PRIMARY_DOC: "-1"
    RPM_ROW_STATE: "UNCHANGED"
  ]

  SYD_EVENTS: [
    EVENT_CODE: "1018"
    EVENT_DT: "2013-01-09T11:13:15.377-06:00"
    EVENT_MSG: "The document type has been modified from Gemini Generals to Maddenco DataItems"
    EVENT_SOURCE: "HUDE"
    EVENT_HISTORICAL: "0"
    EVENT_USER: "ICG\\SSOMMERS"
    RESOLVE_DT: "2013-01-09T11:20:43.883-06:00"
    RESOLVE_USER: "ICG\\SSOMMERS"
    ROUTE_INSTANCE: "3"
    RESOLVED: "Y"
    RPM_ROW_STATE: "UNCHANGED"
  ]  

  SYD_HISTORY: [
    ACTION_DT: "2011-10-18T11:24:12-05:00"
    ACTION_DESC: "ROUTE REQUEST"
    USER_ID: "DMIMPORT"
    THREAD_ID: "5"
    COMMENTS: "Workitem Sent To Router"
    QUEUE: "WORK_INTRO"
    ROUTE_INSTANCE: "1"
    RPM_ROW_STATE: "UNCHANGED"
  ,
    ACTION_DT: "2011-10-18T11:24:12-05:00"
    ACTION_DESC: "SAVE"
    USER_ID: "DMIMPORT"
    THREAD_ID: "5"
    COMMENTS: "Workitem Saved"
    QUEUE: "WORK_INTRO"
    ROUTE_INSTANCE: "1"
    RPM_ROW_STATE: "UNCHANGED"
  ]  
```

##### When the model includes properties in the root (SYD_WIP), or the primary data table node (APD_INVOICE), these will be replaced directly.

A model with the following properties

```coffeesscript
model = 
  WORK_ID: "T0000292039"
  QUEUE: "APPROVAL"
  APD_INVOICE:
    INV_AMT: "500.26"  
```

results in the following object, when applied against the template

```coffee-script
  WORK_ID: "T0000292039"
  BLD_PKG: "WI.OCR"
  RULE_GROUP: "MDN_INV"
  WI_TYPE: "INVOICE"
  DOC_TYPE: "MAD"
  DOC_SUB_TYPE: "YYY"
  QUEUE: "APPROVAL"
  QUEUE_ENTRY_DT: "2013-01-09T11:26:29-06:00"
  ROUTE_HOPS: "2"
  PROCESS_STATE: "0"
  ROUTING_STATE: "IDLE"
  LOCKED_USER: "_ULCK"
  LOCK_DT: "2013-01-09T11:26:28-06:00"
  USER_ACTION: "COMPLETE"
  ...
  APD_INVOICE:
    VENDOR_NBR: "41523"
    VENDOR_NAME: "YOKOHAMA TIRE CORPORATION"
    VENDOR_ADDR_1: "PO BOX 100406"
    VENDOR_CITY: "PASADENA"
    VENDOR_STATE: "CA"
    VENDOR_POSTAL_CODE: "91189-0406"
    VENDOR_TERMS: "NET01"
    INV_NBR: "RP80092.01A"
    INV_DATE: "2011-10-17T02:00:00-05:00"
    INV_AMT: "500.26"  
  ...
```


##### When the template includes arrays for relational data and the model doe not contain ANY data, the template data will be used directly.

A model with the following properties

```coffeesscript
model = 
  WORK_ID: "T0000292039"
  QUEUE: "APPROVAL"
```

results in the following object, when applied against the template

```coffee-script
  WORK_ID: "T0000292039"
  BLD_PKG: "WI.OCR"
  RULE_GROUP: "MDN_INV"
  WI_TYPE: "INVOICE"
  DOC_TYPE: "MAD"
  DOC_SUB_TYPE: "YYY"
  QUEUE: "APPROVAL"
  ...
  APD_ACCT_DISTRIB: [
    GL_BUS_UNIT: "001"
    GL_DIV: "0001"
    GL_CHRG_DEPT: "0319"
    GL_APPR_DEPT: "0MUS"
    GL_ACCT_CODE: "004360"
    GL_DESC: "TIRE CARE - REBATES"
    GL_AMT: "700.26"
    GL_VALID_FLG: "Y"
    RPM_ROW_STATE: "UNCHANGED"
  ]
  ...
```

##### If the model contains an empty array, the tempalte data will NOT be applied for that entity.

A model with the following properties

```coffeesscript
model = 
  WORK_ID: "T0000292039"
  QUEUE: "APPROVAL"
  SYD_ATTACHMENTS: []
```

results in the following object, when applied against the template

```coffee-script
  WORK_ID: "T0000292039"
  BLD_PKG: "WI.OCR"
  RULE_GROUP: "MDN_INV"
  WI_TYPE: "INVOICE"
  DOC_TYPE: "MAD"
  DOC_SUB_TYPE: "YYY"
  QUEUE: "APPROVAL"
  ...
  SYD_ATTACHMENTS: [
  ]

```

##### If the model data contains rows, each row will be mapped against the rows present in the template, using the template data to provide default values.

A model with the following properties

```coffeesscript
model = 
  WORK_ID: "T0000292039"
  QUEUE: "APPROVAL"
  APD_ACCT_DISTRIB: [
    GL_AMT: "123.45"
  ]
```

results in the following object, when applied against the template

```coffee-script
  WORK_ID: "T0000292039"
  BLD_PKG: "WI.OCR"
  RULE_GROUP: "MDN_INV"
  WI_TYPE: "INVOICE"
  DOC_TYPE: "MAD"
  DOC_SUB_TYPE: "YYY"
  QUEUE: "APPROVAL"
  ...
  APD_ACCT_DISTRIB: [
    GL_BUS_UNIT: "001"
    GL_DIV: "0001"
    GL_CHRG_DEPT: "0319"
    GL_APPR_DEPT: "0MUS"
    GL_ACCT_CODE: "004360"
    GL_DESC: "TIRE CARE - REBATES"
    GL_AMT: "123.45"
    GL_VALID_FLG: "Y"
    RPM_ROW_STATE: "UNCHANGED"
  ]
  ...
```

##### If the model contains more rows than the source template, the information presented in the prior rows will be used in a repeating fashion to construct the required rows.

A model with the following properties

```coffeesscript
model = 
  WORK_ID: "T0000292039"
  QUEUE: "APPROVAL"
  APD_ACCT_DISTRIB: [
    GL_AMT: "123.45",
  ,
    GL_AMT: "234.56",
  ]
```

results in the following object, when applied against the template

```coffee-script
  WORK_ID: "T0000292039"
  BLD_PKG: "WI.OCR"
  RULE_GROUP: "MDN_INV"
  WI_TYPE: "INVOICE"
  DOC_TYPE: "MAD"
  DOC_SUB_TYPE: "YYY"
  QUEUE: "APPROVAL"
  ...
  APD_ACCT_DISTRIB: [
    GL_BUS_UNIT: "001"
    GL_DIV: "0001"
    GL_CHRG_DEPT: "0319"
    GL_APPR_DEPT: "0MUS"
    GL_ACCT_CODE: "004360"
    GL_DESC: "TIRE CARE - REBATES"
    GL_AMT: "123.45"
    GL_VALID_FLG: "Y"
    RPM_ROW_STATE: "UNCHANGED"
  ,
    GL_BUS_UNIT: "001"
    GL_DIV: "0001"
    GL_CHRG_DEPT: "0319"
    GL_APPR_DEPT: "0MUS"
    GL_ACCT_CODE: "004360"
    GL_DESC: "TIRE CARE - REBATES"
    GL_AMT: "234.56"
    GL_VALID_FLG: "Y"
    RPM_ROW_STATE: "UNCHANGED"  
  ]
  ...
```

##### If the model contains relational data not present in the template, the model data is used directly and is not augmented.

A model with the following properties

```coffeesscript
model = 
  WORK_ID: "T0000292039"
  QUEUE: "APPROVAL"
  APD_INVOICE:
    INV_AMT: "500.26"  
  APD_SOME_OTHER_DATA: [
    KEY: "test"
    VALUE: "Value for Test"
  ,
    KEY: "test2"
    VALUE: "Value for Test 2"
  ]

```

results in the following object, when applied against the template

```coffee-script
  WORK_ID: "T0000292039"
  BLD_PKG: "WI.OCR"
  RULE_GROUP: "MDN_INV"
  WI_TYPE: "INVOICE"
  DOC_TYPE: "MAD"
  DOC_SUB_TYPE: "YYY"
  QUEUE: "APPROVAL"
  QUEUE_ENTRY_DT: "2013-01-09T11:26:29-06:00"
  ROUTE_HOPS: "2"
  PROCESS_STATE: "0"
  ROUTING_STATE: "IDLE"
  LOCKED_USER: "_ULCK"
  LOCK_DT: "2013-01-09T11:26:28-06:00"
  USER_ACTION: "COMPLETE"
  ...
  APD_INVOICE:
    VENDOR_NBR: "41523"
    VENDOR_NAME: "YOKOHAMA TIRE CORPORATION"
    VENDOR_ADDR_1: "PO BOX 100406"
    VENDOR_CITY: "PASADENA"
    VENDOR_STATE: "CA"
    VENDOR_POSTAL_CODE: "91189-0406"
    VENDOR_TERMS: "NET01"
    INV_NBR: "RP80092.01A"
    INV_DATE: "2011-10-17T02:00:00-05:00"
    INV_AMT: "500.26"  
  ...
  APD_SOME_OTHER_DATA: [
    KEY: "test"
    VALUE: "Value for Test"
  ,
    KEY: "test2"
    VALUE: "Value for Test 2"
  ]

```



##### As a convenience, model properties may be expressed as a function.  This might be particularly useful if dates or relative ageas are important

A model with the following properties

```coffeesscript
model = 
  WORK_ID: "T0000292039"
  QUEUE: "APPROVAL"
  QUEUE_ENTRY_DATE: ()->
    90daysAgo = new Date(new Date() - 90*24*60*60*1000)
    return 90daysAgo.ISODate()
```

results in the following object, when applied against the template

```coffee-script
  WORK_ID: "T0000292039"
  BLD_PKG: "WI.OCR"
  RULE_GROUP: "MDN_INV"
  WI_TYPE: "INVOICE"
  DOC_TYPE: "MAD"
  DOC_SUB_TYPE: "YYY"
  QUEUE: "APPROVAL"
  QUEUE_ENTRY_DT: "2012-11-17T11:26:29-06:00"  # this is not dynamic, so use your imagination and pretend this was evaluated on Feb 15, 2013
  ...
```

