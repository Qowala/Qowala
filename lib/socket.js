var users = require('./users');

module.exports = function(io) {
	io.sockets.on('connection', function(socket){

		socket.on('auth', function(userId){
			console.log('got the auth: ' + userId);
			users.setSocket(userId, socket);
			users.startStream(userId);
		});

		socket.on('remove tag', function(tagObject){
			console.log('got removing tag demand');
			users.removeTag(tagObject);
		});

		socket.on('toggle pause', function(userId){
			console.log('got toggle pause request');
			users.togglePause(userId);
		});
	});	
};