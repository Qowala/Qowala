var passport = require('passport')
  , TwitterStrategy = require('passport-twitter').Strategy;

try {
  var configTwitter = require('../config/twitter');
} catch (error) {
  console.log('Warning: There is no configuration file for twitter!');
}

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
      consumerKey: configTwitter ? configTwitter.consumerKey : process.env.QOWALA_TWITTER_KEY,
      consumerSecret: configTwitter ? configTwitter.consumerSecret : process.env.QOWALA_TWITTER_SECRET,
      callbackURL: configTwitter ? configTwitter.callbackURL : process.env.QOWALA_TWITTER_CALLBACK
    },
    function(token, tokenSecret, profile, done) {
      users.setInformations(profile.id, token, tokenSecret, profile.displayName, profile.username, profile._json.profile_image_url, function(){
        done(null, profile);
      });
    }
  ));

}

module.exports = passportAuthentication;
