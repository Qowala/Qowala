var app = require('express')();
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);
const fs = require('fs');

var login = require("facebook-chat-api");
var facebookMessengerService = require('./facebookMessengerService');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/', function(req, res){
  fs.exists('appstate.json', function(exists) {
    if (exists) {
      res.sendFile(__dirname + '/index.html');
    }
    else {
      res.sendFile(__dirname + '/login.html');
    }
  });
});

app.post('/login', function(req, res){
  loginFacebookCredentials(req.body.username, req.body.password).then(
    function(data) {
      console.log('Finished login in with credentials');
      res.sendFile(__dirname + '/index.html')
    }
  );
});

var lastThreadID = '';
var currentUserID = 0;
var fbApi = {};
var chatHistory = {};

function loginFacebookCredentials (email, password) {
  return new Promise(function (resolve, reject) {
    console.log('Login from user credentials');
    login({email: email, password: password}, function callback (err, api) {
      if(err) return reject(err);
      fbApi = api;
      resolve(fbApi);
    });
  });
}

function displayCurrentUser () {
  return new Promise(function (resolve, reject) {
    currentUserID = fbApi.getCurrentUserID();
    facebookMessengerService.getUserInfo(fbApi, currentUserID).then(
    function(data) {
      console.log(data);
      io.emit('chat message', 'Logged in as ' + data);
      resolve(data);
    });
  });
}

io.on('connection', function(socket){
  displayCurrentUser().then(
    function() {
      console.log('Restoring history');
      if (Array.isArray(chatHistory[currentUserID])) {
        for (var index in chatHistory[currentUserID]) {
          io.emit('chat message', chatHistory[currentUserID][index]);
        }
      }
    }).then(
    function() {
      console.log('Listening for messages...');
      fbApi.listen(function callback(err, message) {
        if (err) return console.error(err);
        console.log(message);
        lastThreadID = message.threadID;
        var allInfos = [];
        console.log(Object.keys(facebookMessengerService));
        allInfos.push(facebookMessengerService.getUserInfo(fbApi, message.senderID));
        allInfos.push(facebookMessengerService.getThreadInfo(fbApi, message.threadID));
        Promise.all(allInfos).then(function(data) {
          console.log(data);
          messageToSend = '[thread: ' + data[1] + '] ' + data[0] + ': ' +  message.body;
          io.emit('chat message', messageToSend);
          if (Array.isArray(chatHistory[currentUserID])) {
            chatHistory[currentUserID].push(messageToSend);
          }
          else {
            chatHistory[currentUserID] = [];
            chatHistory[currentUserID].push(messageToSend);
          }
        });
      });
    }
  );

  socket.on('chat message', function(msg){
    if (lastThreadID != '') {
      console.log('Sending to FB: ', msg);
      fbApi.sendMessage(msg, lastThreadID);
    }
    io.emit('chat message', msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
