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
        users.setInformations(profile.id, token, tokenSecret, profile._json.name, profile._json.profile_image_url, function(){
          done(null, profile);
        });
    }
  ));

}

module.exports = passportAuthentication; 