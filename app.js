var express = require('express');
var routes = require('./routes');
var expressLayouts = require('express-ejs-layouts');
var session = require('express-session');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var app = express();

var passport = require('passport')
  , TwitterStrategy = require('passport-twitter').Strategy;

// Fichiers de configuration de la BDD
var dbconfig = require('./config/db');

var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  dbconfig.url;

mongoose.connect(mongoUri, function(err, dbconfig) {
  if(!err) {
    console.log("We are connected to mongoDB");
  }
}); // connect to our mongoDB database (commented out after you enter in your own credentials)

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

// Definit des sessions
app.use(session({
	secret: 'this is a super secret keyword'
}));

// Configuration du body parser
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

// Configuration du public
app.use(express.static(__dirname + '/public'));

// On définit le moteur de template pour les fichiers .html
app.engine('html', require('ejs').__express);
// On dit à express d'utiliser le moteur défini précédemment
app.set('view engine', 'html');
app.set('layout', 'layout');
// On lui indique où se trouve les vues
app.set('views', __dirname + '/views');

app.use(passport.initialize());
app.use(passport.session());
app.use(expressLayouts);

routes(app);


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
    consumerKey: 'msm0fDeVdFzgR1uucQksA3uJz',
    consumerSecret: 'AvWFjmQI3IyiiZL2IpmsCcZqZUPycUwdrE3fNTlJIE6ntJfz67',
    callbackURL: "http://192.168.12.34:8080/auth/twitter/callback"
  },
  function(token, tokenSecret, profile, done) {
    // User.findOrCreate({ username: username }, function(err, user) {
    //   if (err) { return done(err); }
    //   done(null, user);
    // });
    console.log('Autenticated with : ', done);

    done(null, profile);
    // console.log('Autenticated with : ', token, tokenSecret, profile, done);
  }
));


// Express écoute le port 8080
var server = app.listen(8080);
console.log('Listening at 8080');

// Socket.io écoute le port 8080
var io = require('socket.io').listen(server);
// Utilise socket en lui donnant io
require('./lib/socket')(io);

require('./lib/twitter');