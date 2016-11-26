var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var sessions = require("client-sessions");
var http = require('http').Server(app);
var io = require('socket.io')(http);
const fs = require('fs');
const path = require('path');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

var config = require('./config-vars'); // get our config file

var login = require("facebook-chat-api");
var facebookMessengerService = require('./facebookMessengerService');

app.set('superSecret', config.secret); // secret variable

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Set web client directory
var client_dir = __dirname + '/dist';

// serve the static assets from the client/ directory
app.use(express.static(path.join(client_dir)));

var cookieOptions = {
  cookieName: 'userSession', // cookie name dictates the key name added to the request object
  secret: 'reaaaalsecretblargadeeblargblarg', // should be a large unguessable string
  duration: 24 * 60 * 60 * 1000, // how long the session will stay valid in ms
  activeDuration: 1000 * 60 * 5 // if expiresIn < activeDuration, the session will be extended by activeDuration milliseconds
};

app.use(sessions(cookieOptions));

app.get('/', function(req, res){
  res.sendFile(client_dir + '/index.html');
});

var chatHistory = {};
var users = {};

// XXX Currently dead code
function loginFacebookAppstate (email) {
  return new Promise(function (resolve, reject) {
    console.log('Login from appstate ', email);
    fs.exists(getAppstateName(email), function(exists) {
      if (exists) {
        login({appState: JSON.parse(fs.readFileSync(getAppstateName(email), 'utf8'))}, function callback (err, api) {
          if(err) return reject(err);
          api.setOptions({selfListen: true});
          users[email] = {
            ID: 0,
            fbID: 0,
            fbApi: api
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
      api.setOptions({selfListen: true});
      users[email] = {
        ID:0,
        fbID: 0,
        fbApi: api
      };
      resolve(users[email]);
    });
  });
}

function getAppstateName(email) {
  return 'appstate-' + email + '.json'
}

function startFacebook(decoded, users, socket) {
  var currentUser = users[decoded.email];

  if (currentUser) {
    (function() {
      return new Promise(function (resolve, reject) {
        currentUser.ID = currentUser.fbApi.getCurrentUserID();
        facebookMessengerService.getUserInfo(currentUser.fbApi, currentUser.ID).then(
          function(data) {
            console.log(data);
            socket.emit('chat message', 'Logged in as ' + data.name);
            resolve(data);
          });
      });
    })().then(
    function() {
      console.log('Restoring history');
      if (Array.isArray(chatHistory[currentUser.ID])) {
        for (var index in chatHistory[currentUser.ID]) {
          socket.emit('chat message', chatHistory[currentUser.ID][index]);
        }
      }
    }).then(
    function() {
      console.log('Listening for messages...');
      currentUser.fbApi.listen(function callback(err, message) {
        if (err) return console.error(err);
        console.log(message);
        var allInfos = [];
        console.log(Object.keys(facebookMessengerService));
        allInfos.push(facebookMessengerService.getUserInfo(currentUser.fbApi, message.senderID));
        allInfos.push(facebookMessengerService.getThreadInfo(currentUser.ID, currentUser.fbApi, message.threadID));
        Promise.all(allInfos).then(function(data) {
          console.log(data);
          msgToSend = {
            body: message.body,
            conversationID: message.threadID,
            timestampDatetime: tsToTsDatetime(data.timestamp),
            attachments: data.attachments,
            isSenderUser: data.senderID === 'fbid:' + currentUser.ID
          }
          socket.emit('chat message', msgToSend);
          if (Array.isArray(chatHistory[currentUser.ID])) {
            chatHistory[currentUser.ID].push(msgToSend);
          }
          else {
            chatHistory[currentUser.ID] = [];
            chatHistory[currentUser.ID].push(msgToSend);
          }
        });
      });
    }
    ).catch(function(err) {
      console.log('An error occured: ', err);
      socket.emit('err', err);
    });
  }
  else {
    socket.emit('need auth');
  }
}

function getFBThreadList(decoded, users, socket) {
  var currentUser = users[decoded.email];

  if (currentUser) {
    (function() {
      return new Promise(function (resolve, reject) {
        currentUser.ID = currentUser.fbApi.getCurrentUserID();
        facebookMessengerService.getThreadList(currentUser.ID, currentUser.fbApi, 10).then(
          function(data) {
            socket.emit('return/threadlist', data);
            resolve(data);
          });
      });
    })().catch(function(err) {
      console.log('An error occured: ', err);
      socket.emit('err', err);
    });
  }
  else {
    socket.emit('need auth');
  }
}

function getFBThreadHistory(decoded, users, socket, threadID) {
  var currentUser = users[decoded.email];

  if (currentUser) {
    (function() {
      return new Promise(function (resolve, reject) {
        currentUser.fbApi.getThreadHistory(threadID, 0, 10, '', function (err, data) {
          if(err) return console.error(err);
          // XXX Temporary fix to remove events from messages
          // Permament fix is related to this issue: https://github.com/Schmavery/facebook-chat-api/issues/313
          const filtered_data = data.filter(function(msg) {
            return msg.body || msg.attachments.length > 0;
          });
          // Add custom property
          const enhanced_data = filtered_data.map(function(msg) {
            msg.isSenderUser = msg.senderID === 'fbid:' + currentUser.ID;
            return msg;
          });
          socket.emit('return/threadHistory', enhanced_data);
          resolve(enhanced_data);
        });
      });
    })().catch(function(err) {
      console.log('An error occured: ', err);
      socket.emit('err', err);
    });
  }
  else {
    socket.emit('need auth');
  }
}

// Util function to convert timestamp to timestampDatetime
function tsToTsDatetime (timestamp) {
  var date = new Date(timestamp);
  function toDoubleDigit(time) {
    if (time < 10) {
      return '0' + time;
    }
    else {
      return time;
    }
  }
  return toDoubleDigit(date.getHours()) + toDoubleDigit(date.getMinutes());
}


io.on('connection', function(socket){
  socket.on('login', function(credentials){
    loginFacebookCredentials(credentials.email, credentials.password).then(
      function(data) {
        console.log('Finished login in with credentials');
        var user = {
          email: credentials.email
        };
        var token = jwt.sign(user, app.get('superSecret'), {
          expiresIn: 86400 // expires in 24 hours
        });
        startFacebook(user, users, socket);
        socket.emit('login ok', token);
      }
    ).catch(function(err) {
      console.log('Error while login with credentials: ', err);
      // If no appstate has been saved before
      socket.emit('login failed', err);
    });
  });

  // XXX Currently dead code
  socket.on('start facebook', function(payload){
    jwt.verify(payload.token, app.get('superSecret'), function(err, decoded) {
      if (err) {
        const message = 'Failed to authenticate token.';
        socket.emit('auth failed', message);
        console.log('auth failed', message);
      } else {
        console.log('Starting Facebook');
        startFacebook(decoded, users, socket);
      }
    });
  });

  socket.on('get/conversations', function(payload){
    jwt.verify(payload.token, app.get('superSecret'), function(err, decoded) {
      if (err) {
        const message = 'Failed to authenticate token.';
        socket.emit('auth failed', message);
        console.log('auth failed', message);
      } else {
        console.log('Getting last conversations..');
        getFBThreadList(decoded, users, socket);
      }
    });
  });

  socket.on('get/conversationHistory', function(payload){
    jwt.verify(payload.token, app.get('superSecret'), function(err, decoded) {
      if (err) {
        const message = 'Failed to authenticate token.';
        socket.emit('auth failed', message);
        console.log('auth failed', message);
      } else {
        console.log('Getting conversation history..');
        getFBThreadHistory(decoded, users, socket, payload.conversationID);
      }
    });
  });

  socket.on('chat message', function(payload){
    const token = payload.token;
    const msg = payload.msg;
    const threadID = payload.conversationID;
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {
      if (err) {
        const message = 'Failed to authenticate token.';
        socket.emit('auth failed', message);
      } else {
        var currentUser = users[decoded.email];

        if (currentUser) {
          currentUser.fbApi.sendMessage(msg, threadID, function(err, messageInfo){
            if (err) return console.error(err);
          });
        }
        else {
          socket.emit('need auth');
        }
      }
    });
  });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
