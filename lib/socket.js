var users = require('./users');

module.exports = function(io) {

	var numberConnectedUsers = 0;
	io.sockets.on('connection', function(socket){

		console.log('Connected');

		numberConnectedUsers++;

		var localUserId = null;

		socket.on('auth', function(userId){
			console.log('got the auth: ' + userId);
			console.log('There is currenly ', numberConnectedUsers, ' users connected');
			users.setSocket(userId, socket);
			localUserId = userId;
			// If the tag is empty, it sends the tag list
			users.addTag(userId, "");
			users.getUserLists(userId, function(){
				users.getListsTweetsCache(userId, function(listsTweetsCache){
					console.log('Log: sending cached tweets ');
					users.broadcast(userId, 'tweet', {tweet:listsTweetsCache, streamSource:'lists', updatedTags: null, tagsStats:null});	
					users.startStream(userId);
				});
				users.getUserHomeTimeline(userId, function(){});
			});
		});

		socket.on('add tag', function(tagObject){
			console.log('Log: Got adding tag request');
			users.addTag(tagObject.userId, tagObject.tag, function(){
				users.startStream(tagObject.userId);
			});
		});

		socket.on('remove tag', function(tagObject){
			console.log('Log: Got removing tag demand');
			users.removeTag(tagObject, function(){
				users.startStream(tagObject.userId);
			});
			socket.broadcast.emit('remove tag', tagObject);
		});

		socket.on('toggle pause', function(userId){
			console.log('Log: Got toggle pause request');
			users.togglePause(userId);
		});

		socket.on('retweet', function(tweetId){
			console.log('Log: Got retweet request with id ', localUserId);
			users.sendRetweet(localUserId, tweetId, function(retweetedId){
				if(retweetedId){
					console.log('Log: Retweet sent!');
				}
			});
		});

		socket.on('disconnect', function(){
			console.log('Log: The client disconnected with id ', localUserId);
			numberConnectedUsers--;
			users.stopStream(localUserId);
		});
	});	
};