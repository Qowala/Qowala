var users = require('./users');

module.exports = function(io) {

	var numberConnectedUsers = 0;
	io.sockets.on('connection', function(socket){

		console.log('Connected');


		var localUserId = null;

		socket.on('auth', function(userId){
			numberConnectedUsers++;
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
					users.startListStream(localUserId, listsTweetsCache);
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

		socket.on('get list cache', function(listId){
			users.getListsTweetsCache(localUserId, function(listsTweetsCache){
				for (var list in listsTweetsCache) {
					if(list == listId) {
						var cachedList = {};
						cachedList[listId] = listsTweetsCache[list];
						users.broadcast(localUserId, 'tweet', {
							tweet: cachedList,
							streamSource: 'lists',
							updatedTags: null,
							tagsStats: null
						});	
					}
				};
			});
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

		socket.on('searchTweet', function(keyword){
			console.log('Log: Got search request with keyword ', keyword);
			users.searchTweet(localUserId, keyword, function(tweets){
				console.log('gonna search with ', keyword);
				users.broadcast(localUserId, 'tweet', {
					tweet: tweets,
					streamSource:'search-timeline',
					keyword: keyword,
				});
			});
		});

		socket.on('disconnect', function(){
			console.log('Log: The client disconnected with id ', localUserId);
			if(localUserId != null){
				numberConnectedUsers--;
			}
			console.log('There are currenly ', numberConnectedUsers,
				' users signed in');
			io.emit('numberConnectedUsers', numberConnectedUsers);
			users.stopStream(localUserId);
		});
	});	
};
