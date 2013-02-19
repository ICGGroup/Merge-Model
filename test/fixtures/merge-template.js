(function() {

  define([], function() {
    var template;
    return template = {
      WORK_ID: "T00000003582",
      BLD_PKG: "WI.OCR",
      RULE_GROUP: "MDN_INV",
      WI_TYPE: "INVOICE",
      DOC_TYPE: "MAD",
      DOC_SUB_TYPE: "YYY",
      QUEUE: "HUDE",
      QUEUE_ENTRY_DT: "2013-01-09T11:26:29-06:00",
      ROUTE_HOPS: "2",
      PROCESS_STATE: "0",
      ROUTING_STATE: "IDLE",
      LOCKED_USER: "_ULCK",
      LOCK_DT: "2013-01-09T11:26:28-06:00",
      USER_ACTION: "COMPLETE",
      ITEM_SOURCE: "SCN",
      CREATE_DT: "2011-10-18T11:24:12-05:00",
      CREATE_USER: "DMIMPORT",
      LAST_READ_DT: "2013-02-15T10:48:37-06:00",
      LAST_READ_USER: "sysadmin",
      LAST_WRITE_DT: "2013-01-09T11:26:24.527-06:00",
      LAST_WRITE_USER: "ICG\\SSOMMERS",
      SOURCE_QUEUE: "NPO_RD",
      ROUTE_INSTANCE: "11",
      PRIORITY: "5",
      STATUS_CODE: "99",
      SCAN_BATCH: "20111018,100617",
      RECEIVE_DT: "2011-10-17T00:00:00-05:00",
      LOC_ID: "1000",
      SCAN_DT: "2011-10-18T00:00:00-05:00",
      SCAN_OP_ID: "LOVES\\kurrayw",
      RPM_ROW_STATE: "MODIFIED",
      APD_INVOICE: {
        VENDOR_NBR: "41523",
        VENDOR_NAME: "YOKOHAMA TIRE CORPORATION",
        VENDOR_ADDR_1: "PO BOX 100406",
        VENDOR_CITY: "PASADENA",
        VENDOR_STATE: "CA",
        VENDOR_POSTAL_CODE: "91189-0406",
        VENDOR_TERMS: "NET01",
        INV_NBR: "RP80092.01A",
        INV_DATE: "2011-10-17T02:00:00-05:00",
        INV_AMT: "700.26",
        INV_SALES_TAX_AMT: "0.00",
        DISC_AMT: "0.00",
        SEPARATE_CHECK: "N",
        SP_HANDLE_SW: "SM",
        SENSITIVE: "N",
        STORE_NBR: "333",
        APPROVAL_EXCEPT: "N",
        FA_EXCEPT: "N",
        SPREAD_EXCEPT: "N",
        ROUTING_CODE: "ACH LOVES",
        REMIT_ADDR_TYPE: "MAIN",
        RPM_ROW_STATE: "UNCHANGED"
      },
      APD_ACCT_DISTRIB: [
        {
          GL_BUS_UNIT: "001",
          GL_DIV: "0001",
          GL_CHRG_DEPT: "0319",
          GL_APPR_DEPT: "0MUS",
          GL_ACCT_CODE: "004360",
          GL_DESC: "TIRE CARE - REBATES",
          GL_AMT: "700.26",
          GL_VALID_FLG: "Y",
          RPM_ROW_STATE: "UNCHANGED"
        }, {
          GL_BUS_UNIT: "002",
          GL_DIV: "0002",
          GL_CHRG_DEPT: "0319",
          GL_APPR_DEPT: "0MUS",
          GL_ACCT_CODE: "004360",
          GL_DESC: "TIRE CARE - REBATES",
          GL_AMT: "222.22",
          GL_VALID_FLG: "Y",
          RPM_ROW_STATE: "UNCHANGED"
        }
      ],
      SYD_ATTACHMENTS: [
        {
          RPM_R_ID: "2060",
          WORK_ID: "T00000003582",
          OBJECT_NAME: "INVOICE",
          ORIGINAL_NAME: "0901cc288005da20",
          OBJECT_DESC: "Primary Document",
          OBJECT_FILE_TYPE: "TIF",
          OBJECT_LOCATION: "0901cc2880064554X",
          ATTACHMENT_TYPE: "DOCUMENTUM",
          ATTACH_DT: "2011-10-18T11:24:12.677-05:00",
          UPDATEABLE: "-1",
          PRIMARY_DOC: "-1",
          RPM_ROW_STATE: "UNCHANGED"
        }
      ],
      SYD_EVENTS: [
        {
          EVENT_CODE: "1018",
          EVENT_DT: "2013-01-09T11:13:15.377-06:00",
          EVENT_MSG: "The document type has been modified from Gemini Generals to Maddenco DataItems",
          EVENT_SOURCE: "HUDE",
          EVENT_HISTORICAL: "0",
          EVENT_USER: "ICG\\SSOMMERS",
          RESOLVE_DT: "2013-01-09T11:20:43.883-06:00",
          RESOLVE_USER: "ICG\\SSOMMERS",
          ROUTE_INSTANCE: "3",
          RESOLVED: "Y",
          RPM_ROW_STATE: "UNCHANGED"
        }
      ],
      SYD_HISTORY: [
        {
          ACTION_DT: "2011-10-18T11:24:12-05:00",
          ACTION_DESC: "ROUTE REQUEST",
          USER_ID: "DMIMPORT",
          THREAD_ID: "5",
          COMMENTS: "Workitem Sent To Router",
          QUEUE: "WORK_INTRO",
          ROUTE_INSTANCE: "1",
          RPM_ROW_STATE: "UNCHANGED"
        }, {
          ACTION_DT: "2011-10-18T11:24:12-05:00",
          ACTION_DESC: "SAVE",
          USER_ID: "DMIMPORT",
          THREAD_ID: "5",
          COMMENTS: "Workitem Saved",
          QUEUE: "WORK_INTRO",
          ROUTE_INSTANCE: "1",
          RPM_ROW_STATE: "UNCHANGED"
        }
      ]
    };
  });

}).call(this);
