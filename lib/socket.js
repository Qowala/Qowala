var users = require('./users');

module.exports = function(io) {
	io.sockets.on('connection', function(socket){

		socket.on('auth', function(userId){
			console.log('got the auth: ' + userId);
			users.setSocket(userId, socket);
			// If the tag is empty, it sends the tag list
			users.addTag(userId, "");
			users.startStream(userId);
		});

		socket.on('add tag', function(tagObject){
			console.log('Log: Got adding tag request');
			users.addTag(tagObject.userId, tagObject.tag);
			users.startStream(tagObject.userId);
		});

		socket.on('remove tag', function(tagObject){
			console.log('Log: Got removing tag demand');
			users.removeTag(tagObject);
			users.startStream(tagObject.userId);
		});

		socket.on('toggle pause', function(userId){
			console.log('Log: Got toggle pause request');
			users.togglePause(userId);
		});
	});	
};