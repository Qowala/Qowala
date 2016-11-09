var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const fs = require('fs');

var login = require("facebook-chat-api");
var facebookMessengerService = require('./facebookMessengerService');

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

var lastThreadID = '';
var currentUserID = 0;
var fbApi = {};
var chatHistory = {};

function loginFacebook () {
  return new Promise(function (resolve, reject) {
    fs.exists('appstate.json', function(exists) {
      if (exists) {
        console.log('Login from saved appstate');
        login({appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))}, function callback (err, api) {
          if(err) reject(err);
          fbApi = api;
          resolve(fbApi);
        });
      }
      else {
        console.log('Login from user credentials');
        login({email: "FB_EMAIL", password: "FB_PASSWORD"}, function callback (err, api) {
          if(err) reject(err);
          fs.writeFileSync('appstate.json', JSON.stringify(api.getAppState()));
          fbApi = api;
          resolve(fbApi);
        });
      }
    });
  });
}

io.on('connection', function(socket){
  loginFacebook().then(
    function() {
      return new Promise(function (resolve, reject) {
        currentUserID = fbApi.getCurrentUserID();
        facebookMessengerService.getUserInfo(fbApi, currentUserID).then(
        function(data) {
          console.log(data);
          io.emit('chat message', 'Logged in as ' + data);
          resolve(data);
        });
      });
    }).then(
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
