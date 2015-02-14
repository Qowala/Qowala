var passport = require('passport')
  , TwitterStrategy = require('passport-twitter').Strategy;

var configTwitter = require('../config/twitter');


function passportAuthentication (app){

  app.use(passport.initialize()); 
  app.use(passport.session());

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {

  	done(null, id);
    // User.findById(id, function (err, user) {
    //   done(err, user);
    // });
  });

  passport.use(new TwitterStrategy({
      consumerKey: configTwitter.consumerKey,
      consumerSecret: configTwitter.consumerSecret,
      callbackURL: configTwitter.callbackURL
    },
    function(token, tokenSecret, profile, done) {
      // User.findOrCreate({ username: username }, function(err, user) {
      //   if (err) { return done(err); }
      //   done(null, user);
      // });

      done(null, profile);
      // console.log('Autenticated with : ', token, tokenSecret, profile, done);
    }
  ));

}

module.exports = passportAuthentication; 