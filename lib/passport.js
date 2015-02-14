var passport = require('passport')
  , TwitterStrategy = require('passport-twitter').Strategy;

var configTwitter = require('../config/twitter');

var users = require('./users');


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
        users.setTokens(profile.id, token, tokenSecret);
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