(function() {
  var jobs, kue;

  kue = require("kue");

  jobs = kue.createQueue();

  module.exports = function(db, app) {
    app.get("/signup", function(req, res) {
      return console.log("signup");
    });
    app.post("/signup", function(req, res) {
      var user;
      user = req.params;
      return db.collection('kineticusers', function(err, collection) {
        if (err) {
          console.log(err);
          return res.send(err, 500);
        } else {
          return collection.insert(req.body, function(err, docs) {
            var job, mail;
            if (err) {
              console.log(err);
              return res.send(err, 500);
            } else {
              mail = {
                template: "kinetic.verification",
                title: "Verification Email to " + docs[0].email,
                subject: 'KinticPay Verification Email',
                fromEmail: "kineticpay@usfood.com",
                fromName: "KineticPay",
                recipientEmail: docs[0].email,
                recipientName: "" + docs[0].firstName + " " + docs[0].lastName,
                data: docs[0]
              };
              job = jobs.create('email', mail).attempts(3).save();
              return res.render("auth/signup_success", {
                layout: "layout",
                kinecticuser: docs[0]
              });
            }
          });
        }
      });
    });
    app.post("/refer", function(req, res) {
      var user;
      user = req.params;
      return db.collection('referrals', function(err, collection) {
        if (err) {
          console.log(err);
          return res.send(err, 500);
        } else {
          return collection.insert(req.body, function(err, docs) {
            var job, mail, template;
            if (err) {
              console.log(err);
              return res.send(err, 500);
            } else {
              template = docs[0].campaign + ".referral";
              mail = {
                template: template,
                title: "Referral Email to " + docs[0].recipientEmail,
                subject: 'Invitation',
                fromEmail: "kineticpay@usfood.com",
                fromName: "KineticPay",
                recipientEmail: docs[0].recipientEmail,
                recipientName: docs[0].recipientName,
                data: docs[0]
              };
              job = jobs.create('email', mail).attempts(3).save();
              return res.render("auth/referral_success", {
                layout: "layout",
                referral: docs[0]
              });
            }
          });
        }
      });
    });
    app.get("/login", function(req, res) {
      return console.log("login");
    });
    app.post("/login", function(req, res) {
      return console.log("login");
    });
    return app.post("/logout", function(req, res) {
      return console.log("logout");
    });
  };

}).call(this);
