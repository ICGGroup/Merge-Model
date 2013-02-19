(function() {

  define(["icg/merge-model", "fixtures/merge-template"], function(MergeModel, template) {
    return describe("MergeModel", function() {
      describe("Template Merges", function() {
        it("accepts a model without a template", function(done) {
          var model;
          model = new MergeModel({
            WORK_ID: "T0000292039",
            QUEUE: "APPROVAL"
          });
          expect(model.get("WORK_ID")).to.be("T0000292039");
          return done();
        });
        it("merges model root level properties with template root level properties", function(done) {
          var model;
          model = new MergeModel({
            WORK_ID: "T0000292039",
            QUEUE: "APPROVAL"
          }, template);
          expect(model.get("WORK_ID")).to.be("T0000292039");
          expect(model.get("QUEUE")).to.be("APPROVAL");
          expect(model.get("DOC_TYPE")).to.be("MAD");
          return done();
        });
        it("inherits template array child nodes when the model does not include the node", function(done) {
          var model;
          model = new MergeModel({
            WORK_ID: "T0000292039",
            QUEUE: "APPROVAL"
          }, template);
          expect(model.get("APD_ACCT_DISTRIB").length).to.be(2);
          return done();
        });
        it("inherits template object nodes when the model does not include the node", function(done) {
          var model;
          model = new MergeModel({
            WORK_ID: "T0000292039",
            QUEUE: "APPROVAL"
          }, template);
          expect(model.get("APD_INVOICE")["VENDOR_NBR"]).to.be("41523");
          return done();
        });
        it("overwrites the template array node when the model contains an empty array", function(done) {
          var model;
          model = new MergeModel({
            WORK_ID: "T0000292039",
            QUEUE: "APPROVAL",
            SYD_ATTACHMENTS: []
          }, template);
          expect(model.get("SYD_ATTACHMENTS").length).to.be(0);
          expect(model.get("APD_ACCT_DISTRIB").length).to.be(2);
          return done();
        });
        it("maps the model rows over the template data, using the data from the model", function(done) {
          var model;
          model = new MergeModel({
            WORK_ID: "T0000292039",
            QUEUE: "APPROVAL",
            APD_ACCT_DISTRIB: [
              {
                GL_AMT: 123.45
              }
            ]
          }, template);
          expect(model.get("APD_ACCT_DISTRIB").length).to.be(1);
          expect(model.get("APD_ACCT_DISTRIB")[0]["GL_AMT"]).to.be(123.45);
          expect(model.get("APD_ACCT_DISTRIB")[0]["GL_CHRG_DEPT"]).to.be("0319");
          return done();
        });
        it("maps the model rows over the template rows, reusing the template rows, as necessary", function(done) {
          var model;
          model = new MergeModel({
            WORK_ID: "T0000292039",
            QUEUE: "APPROVAL",
            APD_ACCT_DISTRIB: [
              {
                GL_AMT: 123.45
              }, {
                GL_AMT: 234.56,
                GL_CHRG_DEPT: "1234"
              }, {
                GL_AMT: 345.67
              }
            ]
          }, template);
          expect(model.get("APD_ACCT_DISTRIB").length).to.be(3);
          expect(model.get("APD_ACCT_DISTRIB")[0]["GL_AMT"]).to.be(123.45);
          expect(model.get("APD_ACCT_DISTRIB")[0]["GL_CHRG_DEPT"]).to.be("0319");
          expect(model.get("APD_ACCT_DISTRIB")[1]["GL_AMT"]).to.be(234.56);
          expect(model.get("APD_ACCT_DISTRIB")[1]["GL_CHRG_DEPT"]).to.be("1234");
          expect(model.get("APD_ACCT_DISTRIB")[1]["GL_ACCT_CODE"]).to.be("004360");
          expect(model.get("APD_ACCT_DISTRIB")[2]["GL_AMT"]).to.be(345.67);
          expect(model.get("APD_ACCT_DISTRIB")[2]["GL_CHRG_DEPT"]).to.be("0319");
          return done();
        });
        it("uses model relational data directly, if corresponding template data is not present", function(done) {
          var model;
          model = new MergeModel({
            WORK_ID: "T0000292039",
            QUEUE: "APPROVAL",
            APD_SOME_OTHER_DATA: [
              {
                KEY: "test",
                VALUE: "Value for Test"
              }, {
                KEY: "test2",
                VALUE: "Value for Test 2"
              }
            ]
          }, template);
          expect(model.get("APD_ACCT_DISTRIB").length).to.be(2);
          expect(model.get("APD_SOME_OTHER_DATA").length).to.be(2);
          return done();
        });
        return it("accepts a function for model properties", function(done) {
          var model;
          model = new MergeModel({
            WORK_ID: "T0000292039",
            QUEUE: function() {
              return "FUNCTIONAL";
            }
          }, template);
          expect(model.get("WORK_ID")).to.be("T0000292039");
          expect(model.get("QUEUE")).to.be("FUNCTIONAL");
          expect(model.get("DOC_TYPE")).to.be("MAD");
          return done();
        });
      });
      return describe("REST Interation", function() {
        return it("calls the rest interface when the model is saved and a URL is provided", function(done) {
          var callback, errback, model, server;
          callback = sinon.spy();
          errback = sinon.spy();
          server = sinon.fakeServer.create();
          server.respondWith("POST", "/workitems", [
            200, {
              "Content-Type": "application/json"
            }, "[]"
          ]);
          model = new MergeModel({
            WORK_ID: "T0000292039",
            QUEUE: function() {
              return "FUNCTIONAL";
            }
          }, template, {
            url: "/workitems"
          });
          console.log(model);
          model.save(null, {
            success: callback,
            error: errback
          });
          server.respond();
          return setTimeout(function() {
            expect(callback.called).to.be(true);
            expect(errback.called).to.be(false);
            return done();
          }, 10);
        });
      });
    });
  });

}).call(this);
