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
var fbApi = {};

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
  console.log('Listening for messages...');
  loginFacebook().then(
    function(api) {
      fbApi.listen(function callback(err, message) {
        if (err) return console.error(err);
        console.log(message);
        lastThreadID = message.threadID;
        var allInfos = [];
        console.log(Object.keys(facebookMessengerService));
        allInfos.push(facebookMessengerService.getUserInfo(api, message.senderID));
        allInfos.push(facebookMessengerService.getThreadInfo(api, message.threadID));
        Promise.all(allInfos).then(function(data) {
          console.log(data);
          io.emit('chat message', '[thread: ' + data[1] + '] ' + data[0] + ': ' +  message.body);
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
