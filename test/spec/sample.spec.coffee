define ["icg/sample"], (module) ->  #  loads the sample module into a local variable `module`
  "use strict"
  describe "module", -> # Describes a test suite

    it "is awesome", -> # defines a test
      expect(window.something).to.be "TOTALLY AWESOME" # evaluates an `expectation` that will pass or fail when the test is executed

 
  