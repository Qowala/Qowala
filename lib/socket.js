var users = require('./users');

module.exports = function(io) {

	var numberConnectedUsers = 0;
	io.sockets.on('connection', function(socket){

		console.log('Connected');

		numberConnectedUsers++;

		var localUserId = null;

		socket.on('auth', function(userId){
			localUserId = userId;
			console.log('got the auth: ' + localUserId);
			console.log('There are currenly ', numberConnectedUsers, ' users connected');
			users.setSocket(localUserId, socket);
			users.getColumnsLayout(localUserId, function(columnsLayout){
				socket.emit('columnsLayout', columnsLayout);
			});
			users.getUserLists(localUserId, function(){
				users.getListsTweetsCache(localUserId, function(listsTweetsCache){
					console.log('Log: sending cached tweets ');
					users.broadcast(localUserId, 'tweet', {tweet:listsTweetsCache, streamSource:'lists', updatedTags: null, tagsStats:null});	
					users.startStream(localUserId);
					users.startListStream(localUserId);
				});
				users.getUserHomeTimeline(localUserId, function(){});
			});
			io.emit('numberConnectedUsers', numberConnectedUsers);
		});

		socket.on('update lists request', function(lists){
			users.setEnabledLists(localUserId, lists, function(){
				users.startListStream(localUserId);
			});
			console.log('Received update lists request : ', lists);
		});

		socket.on('update tags request', function(tagsToRequest){
			users.setEnabledTags(localUserId, tagsToRequest, function(){
				users.startStream(localUserId);
			});
			console.log('Received update tags request : ', tagsToRequest);
		});

		socket.on('update columns layout', function(columnsLayout){
			users.setColumnsLayout(localUserId, columnsLayout);
			console.log('Received update columns layout : ', columnsLayout);
		});

		socket.on('retweet', function(tweetId){
			console.log('Log: Got retweet request with id ', localUserId);
			users.sendRetweet(localUserId, tweetId, function(retweetedId){
				if(retweetedId){
					// socket.emit('retweetedId', retweetedId);
					console.log('Log: Retweet sent!');
				}
			});
		});

		socket.on('delete retweet', function(tweetId){
			console.log('Log: Got delete tweet request with id ', localUserId);
			users.showTweet(localUserId, tweetId, function(tweet){
				if( tweet.current_user_retweet){
					var tweetToBeDeleted = tweet.current_user_retweet.id_str;
					console.log('tweetToBeDeleted: ', tweetToBeDeleted);
					if(tweetToBeDeleted) {
						users.deleteTweet(localUserId, tweetToBeDeleted, function(){
						});
					}
				}

			});
		});

		socket.on('sendMessage', function(message){
			console.log('Log: Got retweet request with id ', localUserId);
			users.sendMessage(localUserId, message, function(){
				console.log('Log: Message sent!');
			});
		});

		socket.on('disconnect', function(){
			console.log('Log: The client disconnected with id ', localUserId);
			numberConnectedUsers--;
			console.log('There is currenly ', numberConnectedUsers, ' users connected');
			io.emit('numberConnectedUsers', numberConnectedUsers);
			users.stopStream(localUserId);
		});
	});	
};