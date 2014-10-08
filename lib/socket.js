var users = require('./users');

module.exports = function(io) {
	io.sockets.on('connection', function(socket){

		socket.on('auth', function(userId){
			console.log('got the auth: ' + userId);
			users.setSocket(userId, socket);
		});

		socket.on('remove tag', function(tagObject){
			console.log('got removing tag demand');
			users.removeTag(tagObject);
		});
	});	
};