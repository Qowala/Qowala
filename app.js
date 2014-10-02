var express = require('express');
var routes = require('./routes');
var expressLayouts = require('express-ejs-layouts');
var session = require('express-session');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var app = express();

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

app.use(expressLayouts);

routes(app);

// Express écoute le port 8080
var server = app.listen(8080);
console.log('Listening at 8080');

// Socket.io écoute le port 8080
var io = require('socket.io').listen(server);
// Utilise socket en lui donnant io
require('./lib/socket')(io);

require('./lib/twitter');