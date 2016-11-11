var app = require('express')();
var bodyParser = require('body-parser');
var sessions = require("client-sessions");
var http = require('http').Server(app);
var io = require('socket.io')(http);
const fs = require('fs');

var login = require("facebook-chat-api");
var facebookMessengerService = require('./facebookMessengerService');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

var cookieOptions = {
  cookieName: 'userSession', // cookie name dictates the key name added to the request object
  secret: 'reaaaalsecretblargadeeblargblarg', // should be a large unguessable string
  duration: 24 * 60 * 60 * 1000, // how long the session will stay valid in ms
  activeDuration: 1000 * 60 * 5 // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
};

app.use(sessions(cookieOptions));

app.get('/', function(req, res){
  if (req.userSession.email) {
    loginFacebookAppstate(req.userSession.email).then(
      function() {
        res.sendFile(__dirname + '/index.html');
      }
    ).catch(function(err) {
      console.log('Error while login with appstate: ', err);
      // If no appstate has been saved before
      if (err === 'appstate_not_found') {
        res.redirect('/login');
      }
    });
  }
  else {
    res.redirect('/login');
  }
});

app.get('/login', function(req, res){
  res.sendFile(__dirname + '/login.html');
});

app.post('/login', function(req, res){
  loginFacebookCredentials(req.body.email, req.body.password).then(
    function(data) {
      console.log('Finished login in with credentials');
      req.userSession.email = req.body.email;
      res.redirect('/');
    }
  ).catch(function(err) {
    console.log('Error while login with credentials: ', err);
    // If no appstate has been saved before
    res.sendFile(__dirname + '/login.html');
  });
});

var chatHistory = {};
var users = {};

function loginFacebookAppstate (email) {
  return new Promise(function (resolve, reject) {
    console.log('Login from appstate ', email);
    fs.exists(getAppstateName(email), function(exists) {
      if (exists) {
        login({appState: JSON.parse(fs.readFileSync(getAppstateName(email), 'utf8'))}, function callback (err, api) {
          if(err) return reject(err);
          users[email] = {
            ID: 0,
            fbID: 0,
            fbApi: api,
            lastThreadID: 0
          };
          resolve(users[email]);
        });
      }
      else {
        console.log('User appstate not found');
        reject('appstate_not_found');
      }
    });
  });
}

function loginFacebookCredentials (email, password) {
  return new Promise(function (resolve, reject) {
    console.log('Login from user credentials');
    login({email: email, password: password}, function callback (err, api) {
      if(err) return reject(err);
      fs.writeFileSync(getAppstateName(email), JSON.stringify(api.getAppState()));
      users[email] = {
        ID:0,
        fbID: 0,
        fbApi: api,
        lastThreadID: 0
      };
      resolve(users[email]);
    });
  });
}

function getAppstateName(email) {
  return 'appstate-' + email + '.json'
}

function displayCurrentUser() {
  console.log('tutu');
  return new Promise(function (resolve, reject) {
    console.log('tata');
    console.log('current user :', currentUser);
    reject(currentUser);
    currentUser.ID = currentUser.fbApi.getCurrentUserID();
    facebookMessengerService.getUserInfo(currentUser.fbApi, currentUser.ID).then(
    function(data) {
      console.log(data);
      io.emit('chat message', 'Logged in as ' + data);
      resolve(data);
    });
  });
}

io.on('connection', function(socket){
  var cookieArray = socket.request.headers.cookie.split('=');
  var email = sessions.util.decode(cookieOptions, cookieArray[ cookieArray.length - 1 ]).content.email;
  console.log('Socket email: ', email);
  var currentUser = users[email];

  (function() {
    return new Promise(function (resolve, reject) {
      if (currentUser === undefined) {
        reject('currentUser is undefined');
      }
      currentUser.ID = currentUser.fbApi.getCurrentUserID();
      facebookMessengerService.getUserInfo(currentUser.fbApi, currentUser.ID).then(
      function(data) {
        console.log(data);
        io.emit('chat message', 'Logged in as ' + data);
        resolve(data);
      });
    });
  })().then(
    function() {
      console.log('Restoring history');
      if (Array.isArray(chatHistory[currentUser.ID])) {
        for (var index in chatHistory[currentUser.ID]) {
          io.emit('chat message', chatHistory[currentUser.ID][index]);
        }
      }
    }).then(
    function() {
      console.log('Listening for messages...');
      currentUser.fbApi.listen(function callback(err, message) {
        if (err) return console.error(err);
        console.log(message);
        currentUser.lastThreadID = message.threadID;
        var allInfos = [];
        console.log(Object.keys(facebookMessengerService));
        allInfos.push(facebookMessengerService.getUserInfo(currentUser.fbApi, message.senderID));
        allInfos.push(facebookMessengerService.getThreadInfo(currentUser.fbApi, message.threadID));
        Promise.all(allInfos).then(function(data) {
          console.log(data);
          messageToSend = '[thread: ' + data[1] + '] ' + data[0] + ': ' +  message.body;
          io.emit('chat message', messageToSend);
          if (Array.isArray(chatHistory[currentUser.ID])) {
            chatHistory[currentUser.ID].push(messageToSend);
          }
          else {
            chatHistory[currentUser.ID] = [];
            chatHistory[currentUser.ID].push(messageToSend);
          }
        });
      });
    }
  ).catch(function(err) {
    console.log('An error occured: ', err);
  });

  socket.on('chat message', function(msg){
    if (currentUser.lastThreadID != 0) {
      console.log('Sending to FB: ', msg);
      currentUser.fbApi.sendMessage(msg, currentUser.lastThreadID);
    }
    io.emit('chat message', msg);
  });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
