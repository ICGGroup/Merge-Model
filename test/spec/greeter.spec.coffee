define ["icg/greeter"], (Greeter) ->  #  loads the sample module into a local variable `module`
  describe "Greeter", -> # Describes a test suite

    it "is returns a greeting when provided a name", -> # defines a test
      g = new Greeter()
      expect(g.greet("Bob")).to.be "Greetings, Bob" # evaluates an `expectation` that will pass or fail when the test is executed

 
  