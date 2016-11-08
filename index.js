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

io.on('connection', function(socket){
  fs.exists('appstate.json', function(exists) {
    if (exists) {
      console.log('Login from saved appstate');
      login({appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))}, function callback (err, api) {
        if(err) return console.error(err);
        console.log('Listening for messages...');
        fbApi = api;
        api.listen(function callback(err, message) {
          lastThreadID = message.threadID;
          console.log(message);
          var allInfos = [];
          console.log(Object.keys(facebookMessengerService));
          allInfos.push(facebookMessengerService.getUserInfo(api, message.senderID));
          allInfos.push(facebookMessengerService.getThreadInfo(api, message.threadID));
          Promise.all(allInfos).then(function(data) {
            console.log(data);
            io.emit('chat message', data[0] + ' [thread: ' + data[1] + ']: ' + message.body);
          });
        // Here you can use the api
        });
      });
    }
    else {
      console.log('Login from user credentials');
      login({email: "FB_EMAIL", password: "FB_PASSWORD"}, function callback (err, api) {
          if(err) return console.error(err);

          fs.writeFileSync('appstate.json', JSON.stringify(api.getAppState()));
      });
    }
  });

  socket.on('chat message', function(msg){
    if (lastThreadID != '') {
      fbApi.sendMessage(msg, lastThreadID);
    }
    io.emit('chat message', msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
