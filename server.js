process.title = 'qowala';

var express = require('express');
var routes = require('./routes');
var expressLayouts = require('express-ejs-layouts');
var session = require('express-session');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passportAuthentication = require('./lib/passport');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 8080;

// Add some logging
["log", "warn", "error"].forEach(function(method) {
    var oldMethod = console[method].bind(console);
    console[method] = function() {
        oldMethod.apply(
            console,
            [new Date().toISOString()].concat(arguments[0])
        );
    };
});

// Configuration file for the DB
var dbconfig = require('./config/db');

var mongoUri = process.env.MONGODB_ADDON_URI ||
  process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  dbconfig.url;

mongoose.connect(mongoUri, function(err, dbconfig) {
  if(!err) {
    console.log("We are connected to mongoDB");
  }
}); // Connect to our mongoDB database (commented out after you enter in your own credentials)

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

// Setup sessions
app.use(session({
	secret: 'this1337is42a1337super42secret1337keyword'
}));

// Configuration of body parser
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

// Configuration of public directory
app.use(express.static(__dirname + '/public'));

// Declare the engine to render the html files
app.engine('html', require('ejs').__express);
// Set Express render engine
app.set('view engine', 'html');
app.set('layout', 'layout');
// Views location
app.set('views', __dirname + '/views');

app.use(expressLayouts);

// Initalize the passport authentication
passportAuthentication(app);

// Setup the routes
routes(app);

// Give io to the socket
require('./lib/socket')(io);

// Launch server
http.listen(port, function(){
  console.log('Listening on *:' + port);
});

// Launch the twitter app
require('./lib/twitter');
