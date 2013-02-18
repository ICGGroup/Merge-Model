# Barista:  The ICG Front-end Development Workflow

Based on the awesome [Yeoman](http://yeoman.io/), Barista is the front end development framework used at ICG.  This development workflow is opinionated.  It uses several open source tools and technologies to accomplish the following primary objectives.

* Minimize individual developer setup time
* Provide an efficient development workflow
* Encourage test driven development 
* Provide tools to evaluate test coverage
* Allow front end development with no dependencies on specific back-end components


This document assumes you are using a Mac with OS X Mountain Lion.  It should be possible however to get the components required for front end development installed on Windows 7, as well.


## Setting Up Your Environment

As we said, this framework is opinionated.  As such, there are several components that will need to be installed.  Depending on the speed of your internet connection, downloading and installing all of the necessary components should take you ~ 45 minutes.

### [XCode](https://itunes.apple.com/us/app/xcode/id497799835) (Mac Only)

While you will not need to use XCode, except when developing iOS or Mac applications.  XCode contains compilers and utilities that will be used by some of the tools below.  If you don't think you will need XCode and want to save yourself some time and disk space, you can skip this step and *only* grab the OS X Command Line tools below.

Download and install

Once XCode is installed, now install the command line tools.  To do this:

* Open XCode
* Go to Preferences
* Click Downloads Tab 
* Find Command Line Tools in the list and click install
* Install the GCC compiler below.

### [OS X Command Line Tools with GCC](https://github.com/kennethreitz/osx-gcc-installer/) (Mac Only)

Some of the components will be built locally using GCC.  XCode now only ships with LLVM, so download and install it.


### [Git](http://git-scm.com/)

We use the awesome git and Github.com to manage our source code.  You will need to install it to even get started.

Download and Install


### [HomeBrew](http://mxcl.github.com/homebrew/) (Mac Only)

Homebrew is dubbed _The missing package manager for OS X_ and for good reason.  Installing some of the software that you will need is made very easy with Homebrew.  The easiest way to install it is using the following command in the terminal

```
ruby -e "$(curl -fsSL https://raw.github.com/mxcl/homebrew/go)"
```

**Note:** If you choose not to or cannot install Homebrew, then follow the links provided rahter than using the ```brew``` commands below.

### [NodeJS](http://nodejs.org)

While ICG does not use Node JS in most of the back end components, many of the development tools and the local development server use Node JS.  In the terminal

Download and install


### [MongoDb](http://www.mongodb.org/)

MongoDB is a document driven database that pairs well with the local development server.  With only a few lines of code, MondoDB can serve up a rich Rest API that behaves in a very similar fashion to ICG production APIs

Download and install or use homebrew

```
brew update
brew install mongodb
```

Follow the Homebrew instructions to have mongo db start automatically.

To make sure MongoDB is running:

```
mongo
```

If MongoDB is running and all is well you will see somthing like this

```
MongoDB shell version: 2.2.3
connecting to: test
Welcome to the MongoDB shell.
For interactive help, type "help".
For more comprehensive documentation, see
  http://docs.mongodb.org/
Questions? Try the support group
  http://groups.google.com/group/mongodb-user
> 
```

```Ctrl-C``` to quit.


### [Yeoman](http://yeoman.io/)

Yeoman 1.0 is more than just a tool. It's a workflow; a collection of tools and best practices working in harmony to make developing for the web even better.

In the terminal (may require ```su``` privileges):

```
sudo npm install -g yeoman
```

**Note:** Recent releases of Node and NPM have introduced some issues with the yeoman install.  if you have trouble installing yeoman you may see something like this

```
npm ERR! 
npm ERR! Additional logging details can be found in:
npm ERR!     /Users/jdouglas/npm-debug.log
npm ERR! not ok code 0
```

If you do, try the following

```
sudo rm -r -f /usr/local/lib/node_modules/yeoman/  
sudo npm install -g npm@1.2.0 
sudo npm install -g yeoman  
```

Test your install by typing ```yeoman```.  You should see something like this

```
yeoman v0.9.6
Usage: yeoman [command] [task [task ...]]

Available commands supported by yeoman:

      init  Initialize and scaffold a new project using generator templates
     build  Build an optimized version of your app, ready to deploy
    server  Launch a preview server which will begin watching for changes
      test  Run a Mocha test harness in a headless PhantomJS

   install  Install a package from the clientside package registry
 uninstall  Uninstall the package
    update  Update a package to the latest version
      list  List the packages currently installed
    search  Query the registry for matching package names
    lookup  Look up info on a particular package

Certain commands such as init also provide further help via a --help flag
```

### [Compass](http://compass-style.org/)

Compass is an open-source CSS Authoring Framework.  

Compass requires Ruby.  On the Mac, this is installed by default.  On windows, you may need to use [Ruby Installer](http://rubyinstaller.org/)

In the terminal (may require ```su``` privileges):

```
sudo gem update --system
sudo gem install compass
```


### [Istanbul](http://gotwarlost.github.com/istanbul/)

A Javascript code coverage tool written in JS.

```
sudo npm install -g istanbul
```


## Creating Your Repository

If you are going to modify or make contribution to Barista itself, you can simply fork the Barista Repository and you are up and running.

If you are going to use Barista as the basis for a new project, you will probably not want to fork the repository, rather you will want to add Barista as a remote and pull the contents into your project.  Since this is likely the most common pattern, let's walk through those steps.  Follow along with your own repo.

First, go to Github and create your own repo.  Now you can clone this new repository.  In the terminal, navigate to the directory into which you want the repository cloned:

```
git clone [Your Github Repo URL]
```

This will create a new directory containing the github repository.  Navigate to the newly create directory.

```
cd [Your Repo Directory]
```

Now you can add Barista as a remote and pull the contents for your new repository from there.

```
git remote add barista git@github.com:ICGGroup/Barista.git
```

Now pull from Barista.  

```
git pull -X ours barista master
```

If you think you may, someday, possibly, ever, in a blue moon might want to contrubte base to the repo from which you just forked (or even if you don't since it wont hurt anything) create a ```contrib``` branch.

```
git branch contrib
```


That's it, now you are ready to use NPM to install the necessary components.  

## Completing and Verifying Installation

Installing the required node modules is very easy and can be accomplished with a single command

```
npm install
```

If you are interested in what the dependencies are, have a peek at ```package.json```.

Now you are ready to fire up Yeoman!

```
yeoman server
```

### Installing Pre-commit Hooks

We encourage all developers to use the standard pre-committ hook.  Since pre-commit hooks are not pushed with your commits nore are included when the repository is cloned, we have made the standard commit hook available in the root of the repo.  Wire this up with your local report using the following command:

```
ln -s ../../pre-commit.sh .git/hooks/pre-commit
```

The pre commit hook is basically intended to prevent you from submitting code which causes tests to fail.  ** Note: **  When the pre-commit hook runs, it runs using only the files that have been previously committed or are part of the current commit.  This means that you may get different testing results if you are selectively committing files and some of your uncommitted files affect the test outcomes.

#### For emergencies **ONLY**

Occasionally, you may need to commit and push without having passed all of the tests.  While this is frowned upon and will most likely get you additional, likely negative, attention, if you've got to do it, you can bypass the precommit hook by adding ```--no-verify``` to your commit command.



## What's Included (or What Do I Need to Know?)

This framework assumes that you have a basic understanding of the tools above, as well as a few additional tools that you will use during actual development.  Below are a few links to help bring you up to speed

* [Coffeescript](http://coffeescript.org/): CoffeeScript is a little language that compiles into JavaScript. Underneath all those awkward braces and semicolons, JavaScript has always had a gorgeous object model at its heart. CoffeeScript is an attempt to expose the good parts of JavaScript in a simple way.
* [Underscore](http://underscorejs.org/): Underscore is a utility-belt library for JavaScript that provides a lot of the functional programming support that you would expect in Prototype.js (or Ruby), but without extending any of the built-in JavaScript objects.
* [Backbone](http://backbonejs.org/): Backbone.js gives structure to web applications by providing models with key-value binding and custom events, collections with a rich API of enumerable functions, views with declarative event handling, and connects it all to your existing API over a RESTful JSON interface.
* [Twitter Bootstrap](http://twitter.github.com/bootstrap/):  Built at Twitter by @mdo and @fat, Bootstrap utilizes LESS CSS, is compiled via Node, and is managed through GitHub to help nerds do awesome stuff on the web.
* [Mocha Test Framework](http://visionmedia.github.com/mocha/): Mocha is a feature-rich JavaScript test framework running on node and the browser, making asynchronous testing simple and fun. Mocha tests run serially, allowing for flexible and accurate reporting, while mapping uncaught exceptions to the correct test cases.
* [Async Library](https://github.com/caolan/async): Async is a utility module which provides straight-forward, powerful functions for working with asynchronous JavaScript. Although originally designed for use with node.js, it can also be used directly in the browser.


### Getting Started


#### What Is Barista Doing For Me?


OK, so you have fired up ```yeoman server``` and suddenly stuff starts happening.  While, in the normal course of development, you may not take advantage of what Yeoman and Barista are doing for you, we will walk through it.  If nothing else, this will be helpful to you if you run into errors.  So here we go.


```
Running "appserver" task
Dev Server Started on port 3501
Using MongoDB 'dev'
Go, Go Gadget Sockets
   info  - socket.io started
...
```

This indicates that the development server has started.  This server provides the ability to render static content from the ```app``` directory, dynamic views from the ```views``` directory and a simple rest API.



```
...
Running "clean" task
...
```

When the server is launched the ```public``` directory is cleaned.  The application being served will be published to this directory by the following steps.  Note that even though the source for the static content is the ```app``` directory, ultimately, it is the ```public``` directory that the local server is serving the files from.

```
...
Running "coffee:compile" (coffee) task
File public/scripts/main.js created.
File public/scripts/sample.js created.
File server/auth.js created.
File server/dev.js created.
File server/gridstore.js created.
File server/parse-excel.js created.
File server/parsexlsx-routes.js created.
File server/server.js created.
File tasks/build.js created.
File tasks/istanbul.js created.
File tasks/server.js created.
File test/spec/sample.spec.js created.
...
```

Since Barista assumes that you are going to be working in coffeescript, or at very least would like the option, any ```*.coffee``` files contained anywhere in the ```app/scripts``` will be compiled to javascript.  You will see the resulting files listed.

```
...
Running "compass:dist" (compass) task
directory public/styles/ 
   create public/styles/main.css 
...
```

Barista also encourage the use of Compass in the compilation of style sheets, the compass task will compile the source files from the ```app/styles``` directory.  

```
...
Running "tempcopy" task
...............................................................................................
>> .../app -> .../public
...
```

Any other files from ```app```, such as ```index.html```, the contents of the ```images``` folder, etc. will be copied to the public folder.

```
...
Running "open-browser" task
...
```

Duh...opens your default browser to ```index.html```

```
...
Running "watch" task
Waiting...
```

The watch task will look for changes as you make them and recompile and publish the files.  This means you never have to perform this process manually.

Let's see what happens when we make changes to a file.  With ```yeoman server``` running, open ```app/scripts/sample.coffee``` and change the contents to 

```
define [], ()->
  
  window.something = "TOTALLY AWESOME"
```

Now save the file.  Let's review what just happened.

```
Running "coffee:compile" (coffee) task
File public/scripts/main.js created.
File public/scripts/sample.js created.
File server/auth.js created.
File server/dev.js created.
File server/gridstore.js created.
File server/parse-excel.js created.
File server/parsexlsx-routes.js created.
File server/server.js created.
File tasks/build.js created.
File tasks/istanbul.js created.
File tasks/server.js created.
File test/spec/sample.spec.js created.
```

The ```watch``` task noticed that a coffeescript file had been changed, which trigger a compilation of all of the coffeescript files


```
...
Running "istanbul" task
.
Processed [30] files in 3 secs
>> Complete
...
```

Istanbul is a code instrumentation tool.  This instrumented code is then used when the tests are executed.  This generated code coverage data.  We can use this information to determine which code is not adequately tested.  We will discuss this is a little bit.

```
...
Running "socket-mocha" task
Preparing Test Execution Environment
F

Failed Tests

  module
   it "is awesome"
     expected 'TOTALLY AWESOME' to equal 'AWESOME'

<WARN> 1/1 assertions failed (1.79s) Use --force to continue. </WARN>
...
```

Each time a watched files is changed, the entire test suite is run.  Since one of our tests, actually our _only_ test, expects ```window.something``` to equal ```AWESOME```, the test fails.  Let's fix that.

#### Modifying A Test

To correct this, open ```test/spec/sample.spec.coffee``` and modify it as follows

```
define ["icg/sample"], (module) ->  #  loads the sample module into a local variable `module`
  "use strict"
  describe "module", -> # Describes a test suite

    it "is awesome", -> # defines a test
      expect(window.something).to.be "TOTALLY AWESOME" # evaluates an `expectation` that will pass or fail when the test is executed

```

When you save this file, the watch task will fire off the coffeescript compilation, instanbul instrumentation and execute tests.  This, time the test will pass.


```
...
Running "socket-mocha" task
Preparing Test Execution Environment
.
>> 1 assertions passed (1.175s)
...
```

#### Looking at Coverage Data

Let take a look at that coverage data.  In the terminal, type the following command.  If you have been following along, yeoman server will be running.  You could stop it with ```Ctrl-C```, but let's keep that running and open a new terminal window.  Navigate to our repo path and execute the following:


```
istanbul report
```

This will create a report.  To open it, you can navigate to it or, since we are already in the terminal, type:

```
open coverage/lcov-report/index.html
```

At this point, you should have 100% coverage, very cool!  As your project grows, 100% coverage might not be realistic, but check your coverage periodically and look for areas where you may need to bolster you tests.

#### Your First New Test

As we have discussed, one of the primary objectives of Barista is to encourage test driven development.  So when we want to create a new module, we start with the test.  Lets say we want to create a class ```Greeter``` with a single method ```greet``` that accepts a name and return a greeting.  Let's add the test.  Create a new file ```test/spec/greeter.spec.coffee``` with the following contents

```
define ["icg/greeter"], (Greeter) ->  #  loads the sample module into a local variable `module`
  describe "Greeter", -> # Describes a test suite

    it "is returns a greeting when provided a name", -> # defines a test
      g = new Greeter()
      expect(g.greet("Bob")).to.be "Greetings, Bob" # evaluates an `expectation` that will pass or fail when the test is executed

 
```

When you save the file, the watch task will do its thing and you will see that our one assertion passed.  But wait, we just added a test, why is it not running.  That is because we need to tell the Mocha runner to include the file.  Open ```test/runner/mocha.js``` and add a test

```
}, [

// Load specs
'test/sample.spec',
'test/greeter.spec' // Add your test here
], function() {
  'use strict';
  
```

The watch task does not watch this file, so to trigger the test, just save on of your coffeescript files.

Now you will see that the tests are not passing successfully

```
Running "socket-mocha" task
Preparing Test Execution Environment
<WARN> Have not received any messages from tests.  This usually means there is an error on the page. Use --force to continue. </WARN>
```

As the message indicates, there is an error on the test page.  Sometimes, it is helpful to review the test manually to determine what is going on.  You can ```open test/index.html``` to see the test page and then use the console to see what has gone wrong.

In this case we know that the issue is that the module that the test is atttempting to load ```greeter``` does not exist.


#### Your First New Module

OK, we are ready to create our module.  Create a new file ```app/scripts/greeter.coffee``` with the following contents

```
define [], ()->
  
  class Greeter
    greet: (name)->
      "Greetings, #{name}"

  Greeter
```

When we save, if ```yeoman server``` is running, we will see our tests pass again.

```
Running "socket-mocha" task
Preparing Test Execution Environment
..
>> 2 assertions passed (1.588s)
```

Excellent!

#### Using Local Pages

Local HTML pages are located in the ```app``` directory.  Index.html is openned automatically when ```yeoman server``` is started.  You can modify this page or add html pages as necessary.  **Remember** these local HTML pages are for local experimentation only or to communicate DOM requirements to back-end page developers.

#### The Local API

One of the objectives of Barista is to allow developers to quickly develop front end applications without relying upon a specific back-end environment.  In order to allow for quick experimentation, Barista includes a simple REST API, backed by MongoDB.  This allows developers to stash documents into collections within the database through a simple API.

First, make sure the Mongo Daemon is running.  In a new terminal tab or window:

```
MongoDB shell version: 2.2.3
connecting to: test
> 
```

Leave this terminal window open, we will be coming back to it. 

Now fire up yeoman server.

```
yeoman server
```


##### Retrieving Data

With ```yeoman server``` running, REST API resources are located at ```http://localhost:3501/api/[resource]```.  For now, simply navigate to [http://localhost:3501/api/people](http://localhost:3501/api/people).  You should get this back:

```
[]
```

Not too interesting, huh?  But a lot actually happened.  The dev server opened the Mongo DB, looked into the ```people``` collection.  Not finding a ```people``` collection, the database will create one, and return all of the objects matching the query criteria.  Since there were no criteria, this will return all of the people objects.  Since there are none, we get an empty array.

Now let's add a person using curl.  In a new terminal window add a new person, using curl:

```
curl  -X POST -H "Content-Type:application/json" http://localhost:3501/api/people --data '{"name":"Joe Baggadonuts", "phone":"555-867-9309"}'
```

Now look for people again.  Go to  [http://localhost:3501/api/people](http://localhost:3501/api/people).  You should see something like this:

```
[
  {
    "name": "Joe Baggadonuts",
    "phone": "555-867-9309",
    "_id": "51215d32130f15b707000007"
  }
]
```

Go ahead and add a few more.

To query for a specific resource, the API accepts a query parameter.  This paramter uses MongoDB query syntax.  [http://localhost:3501/api/people?query={"name":"Joe Baggadonuts"}](http://localhost:3501/api/people?query={%22name%22:%22Joe%20Baggadonuts%22})  will return only the first record that we added above.

Now, let's get at that same data using the mongo shell.  Barista's API puts data into a databse called ```barista``` So back in the terminal window where you opened ```mongo```, type the following command to use the Barista database.

```
use barista
```

first, let's find all people in the database.

```
db.people.find()
```

If you went crazy and added a bunch of people, you will see that the Mongo shell will page for you, showing only a few rows at a time.  

Now let's look specifically for Joe

```
db.people.find({name:"Joe Baggadonuts"})
```

That will just return records where the person is named Joe Baggadonuts.

You can create resources of any shape or type on the fly, but **beware** the dev server offers **absolutely no security** for your data, so only use it for development purposes!


## Contributing

If you are writing code that will be committed to the repository, There are a few things you will need to be aware of.  

First, you should use the ```contrib``` branch that we created earlier to makes changes that you with to push back.  This will keep us from having to cherry pick the commit.

Second, while we are still working to outfit Barista with a full set of tests, please make sure that you include tests in your commit.



TODO:  Brief discussion on contributing back to Barista
