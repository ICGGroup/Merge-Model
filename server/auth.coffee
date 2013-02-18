kue = require("kue")
jobs = kue.createQueue();

module.exports = (db, app) ->

  app.get "/signup", (req, res) ->
    console.log "signup"

  app.post "/signup", (req, res) ->
    user = 
      req.params
    
    db.collection 'kineticusers', (err, collection) ->
      if err
        console.log err
        res.send err, 500
      else
        collection.insert req.body, (err, docs) ->
          if err
            console.log err
            res.send err, 500
          else
            mail = 
              template: "kinetic.verification"
              title: "Verification Email to #{docs[0].email}"
              subject: 'KinticPay Verification Email',
              fromEmail: "kineticpay@usfood.com"
              fromName: "KineticPay"
              recipientEmail: docs[0].email
              recipientName: "#{docs[0].firstName} #{docs[0].lastName}",
              data: docs[0] 

            job = jobs.create('email', mail).attempts(3).save();
            res.render "auth/signup_success", { layout: "layout", kinecticuser: docs[0] }
   

  app.post "/refer", (req, res) ->
    user = 
      req.params
    
    db.collection 'referrals', (err, collection) ->
      if err
        console.log err
        res.send err, 500
      else
        collection.insert req.body, (err, docs) ->
          if err
            console.log err
            res.send err, 500
          else
            template = docs[0].campaign + ".referral"
            mail = 
              template: template
              title: "Referral Email to #{docs[0].recipientEmail}"
              subject: 'Invitation',
              fromEmail: "kineticpay@usfood.com"
              fromName: "KineticPay"
              recipientEmail: docs[0].recipientEmail
              recipientName: docs[0].recipientName,

              data: docs[0] 
            job = jobs.create('email', mail).attempts(3).save();

            res.render "auth/referral_success", { layout: "layout", referral: docs[0] }




  app.get "/login", (req, res) ->
    console.log "login"

  app.post "/login", (req, res) ->
    console.log "login"



  app.post "/logout", (req, res) ->
    console.log "logout"
