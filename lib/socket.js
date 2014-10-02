var users = require('./users');

module.exports = function(io) {
	// Connexion d'un nouvel utilisateur, le paramètre socket représente la connexion de cet utilisateur
	io.sockets.on('connection', function(socket){

		socket.on('auth', function(userId){
			console.log('got the auth: ' + userId);
			users.setSocket(userId, socket);
		});

		socket.on('remove tag', function(tag){
			console.log('got removing tag demand');
			users.removeTag(tag);
		})
	});	
};