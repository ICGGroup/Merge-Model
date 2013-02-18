(function() {

  define(["icg/sample"], function(module) {
    "use strict";
    return describe("module", function() {
      return it("is awesome", function() {
        return expect(window.something).to.be("TOTALLY AWESOME");
      });
    });
  });

}).call(this);
