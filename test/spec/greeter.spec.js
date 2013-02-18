(function() {

  define(["icg/greeter"], function(Greeter) {
    return describe("Greeter", function() {
      return it("is returns a greeting when provided a name", function() {
        var g;
        g = new Greeter();
        return expect(g.greet("Bob")).to.be("Greetings, Bob");
      });
    });
  });

}).call(this);
