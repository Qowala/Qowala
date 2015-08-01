var usersModel = require('../model/usersModel');
var configTwitter = require('../config/twitter');
var Twit = require('twit');

// Declare here the stream to be used as global variable
var streamUser = [];
var streamTracking = [];
var streamLists = [];

function tagsToLowerCase(tags, cb){
	lowerCaseTags = [];
	for (var i = tags.length - 1; i >= 0; i--) {
		lowerCaseTags.push(tags[i].text.toLowerCase());
	};
	cb(lowerCaseTags);
}

var twitterAgent = {
	
	/**
	 * Get user's lists on Twitter
	 */
	getUserLists: function(userId, token, tokenSecret, cb){
		var users = require('./users');
		var T = new Twit({
				consumer_key: configTwitter.consumerKey,
				consumer_secret: configTwitter.consumerSecret,
				access_token: token,
				access_token_secret: tokenSecret
		});
		T.get('lists/list', {}, function (err, data, response) {
				if(err){
					console.error('Error: ', err);
				}
				users.setUserListsCache(userId, data);
				users.broadcast(userId, 'lists-list', data);
				cb();
		});
		console.log('Finished getting users lists from API');
	},

	/**
	 * Get user's home timeline on Twitter
	 */
	getUserHomeTimeline: function(userId, token, tokenSecret, cb){
		var users = require('./users');
		var T = new Twit({
				consumer_key: configTwitter.consumerKey,
				consumer_secret: configTwitter.consumerSecret,
				access_token: token,
				access_token_secret: tokenSecret
		});
		T.get('statuses/home_timeline', {count: 50}, function (err, data, response) {
				if(err){
					console.error('Error: ', err);
				}
				users.setUserHomeTimelineCache(userId, data);
				users.broadcast(userId, 'home-timeline', data);
				cb();
		});
		console.log('Finished getting user\'s home timeline from API');
	},

	/**
	 * Sends a Retweet request to Twitter
	 * @param  {String}   token        User's Twitter token
	 * @param  {String}   tokenSecret  User's Twitter token secret
	 * @param  {String}   tweetID      ID of the tweet to be retweeted
	 * @param  {Function} cb 		   callback function
	 */
	sendRetweet: function(token, tokenSecret, tweetId, cb){
		var T = new Twit({
				consumer_key: configTwitter.consumerKey,
				consumer_secret: configTwitter.consumerSecret,
				access_token: token,
				access_token_secret: tokenSecret
		});
		console.log('Before sending, the id was: ', tweetId);

		T.post('statuses/retweet/:id', { id: tweetId }, function (err, data, response) {
			console.log('Err: ', err);
			console.log('data: ', data);
			cb(data.id_str);
		})
	},

	/**
	 * Sends a tweet
	 * @param  {String}   token        User's Twitter token
	 * @param  {String}   tokenSecret  User's Twitter token secret
	 * @param  {String}   message      message to be tweeted
	 * @param  {Function} cb 		   callback function
	 */
	sendTweet: function(token, tokenSecret, message, cb){
		var T = new Twit({
				consumer_key: configTwitter.consumerKey,
				consumer_secret: configTwitter.consumerSecret,
				access_token: token,
				access_token_secret: tokenSecret
		});
		T.post('statuses/update', { status: message }, function(err, data, response) {
			// console.log('After tweet: ', data)
		});
	},

	/**
	 * Delete a tweet
	 * @param  {String}   token        User's Twitter token
	 * @param  {String}   tokenSecret  User's Twitter token secret
	 * @param  {String}   tweetID      ID of the tweet to be retweeted
	 * @param  {Function} cb 		   callback function
	 */
	deleteTweet: function(token, tokenSecret, tweetId, cb){
		var T = new Twit({
				consumer_key: configTwitter.consumerKey,
				consumer_secret: configTwitter.consumerSecret,
				access_token: token,
				access_token_secret: tokenSecret
		});
		T.post('statuses/destroy/:id', { id:tweetId}, function (err, data, response) {
			console.log(data)
		});
	},

	/**
	 * Show a specific tweet
	 * @param  {String}   token        User's Twitter token
	 * @param  {String}   tokenSecret  User's Twitter token secret
	 * @param  {String}   tweetID      ID of the tweet to be retweeted
	 * @param  {Function} cb 		   callback function
	 */
	showTweet: function(token, tokenSecret, tweetId, cb){
		var T = new Twit({
				consumer_key: configTwitter.consumerKey,
				consumer_secret: configTwitter.consumerSecret,
				access_token: token,
				access_token_secret: tokenSecret
		});
		T.get('statuses/show/:id', { id: tweetId, include_my_retweet:true}, function (err, data, response) {
			// console.log(data)
			cb(data);
		});
	},

	/**
	 * Search for tweets according to the keyword
	 * @param  {String}   token        User's Twitter token
	 * @param  {String}   tokenSecret  User's Twitter token secret
	 * @param  {String}   keyword      Keyword to search
	 * @param  {Function} cb 		   callback function
	 */
	searchTweet: function(token, tokenSecret, keyword, cb){
		var T = new Twit({
				consumer_key: configTwitter.consumerKey,
				consumer_secret: configTwitter.consumerSecret,
				access_token: token,
				access_token_secret: tokenSecret
		});
		T.get('search/tweets', { q: keyword, count: 10}, function (err, data, response) {
			// console.log(data)
			cb(data);
		});
	},

	initListsStream: function(userId, token, tokenSecret, lists){
		var users = require('./users');
		var T = new Twit({
				consumer_key: configTwitter.consumerKey,
				consumer_secret: configTwitter.consumerSecret,
				access_token: token,
				access_token_secret: tokenSecret
		});

		// Time interval for each REST API request
		var time = 61000;
		console.log('Beginning the API Lists stream with lists: ', lists);
		
		var newTweets = {};

		function getAllTweetsFromAllLists(index, allListsIndexes, allTweetsFromAllLists) {
			if(lists){
				if (index < lists.length) {
					if (allListsIndexes[lists[index].id]){
						var since_id = allListsIndexes[lists[index].id];
					}
					else{
						var since_id = "623205711426781184";
					}
					T.get('lists/statuses', {
							list_id: lists[index].id,
							count: 50,
							since_id: since_id,
						},
						function(err, listTweets, response){
							if (lists[index].id in allTweetsFromAllLists){
								if(listTweets != undefined){
									for (var i = listTweets.length - 1; i >= 0; i--) {
										allTweetsFromAllLists[lists[index].id].unshift(listTweets[i]);
										// Limit number of messages
										if(allTweetsFromAllLists[lists[index].id].length > 50){
											allTweetsFromAllLists[lists[index].id].pop();
										}
									};
								}
							}
							else {
								allTweetsFromAllLists[lists[index].id] = listTweets;
							}
							newTweets[lists[index].id] = listTweets
							if (listTweets != undefined){
								if (listTweets[0] != undefined){
									allListsIndexes[lists[index].id] = listTweets[0].id_str;
								}
							}

							if (response){
								if(response.headers){
									// console.log('the response header limit reset is: ', response.headers);
								}
							}
							
							if (err) {
								console.error('Error when requesting lists tweets: ', err);
								// If the API limit has been reached, delay the requests
								if(err.statusCode == 429){
									var epochSeconds = Math.floor((new Date).getTime()/1000);
									var windowEpochTime = parseInt(response.headers['x-rate-limit-reset']);
									var delayTime = windowEpochTime - epochSeconds;
									console.log('Delay the requests of ', delayTime,' seconds due to limitation');
									time += delayTime;
								}
							}
							else {
								if(time != 61000){
									time = 61000;
									console.log('Log: Reduce the delay between lists tweets requests');
								}
								getAllTweetsFromAllLists(index+1, allListsIndexes,
														 allTweetsFromAllLists);
							}
						}
					);	
				}
				else {
					users.setListsTweetsCache(userId, allTweetsFromAllLists);
					users.setListsIndex(userId, allListsIndexes);
					users.broadcast(userId, 'tweet', {tweet:newTweets, streamSource:'lists', updatedTags: null, tagsStats:null});	
					newTweets = {};
				}
			}
		}

		setTimeout(repeatGetAllTweetsFromAllLists, 10);
		
		// Repeat call with time able to change	
		function repeatGetAllTweetsFromAllLists(){
			clearTimeout(streamLists[userId]);
			users.getListsTweetsCache(userId, function(allTweetsFromAllLists){
				var allTweetsFromAllLists = allTweetsFromAllLists || {};
				users.getListsIndex(userId, function(allListsIndexes){
					var allListsIndexes = allListsIndexes || {};
					getAllTweetsFromAllLists(0, allListsIndexes,
											 allTweetsFromAllLists);
				});
			});
			streamLists[userId] = setTimeout(repeatGetAllTweetsFromAllLists, time);
		}
	},

	/**
	 * Start Twitter listening stream and restart if previously existing
	 */
	initStream: function(userId, token, tokenSecret){
		var users = require('./users');
		var T = new Twit({
				consumer_key: configTwitter.consumerKey,
				consumer_secret: configTwitter.consumerSecret,
				access_token: token,
				access_token_secret: tokenSecret
		});

		
		// Stop User stream before starting it again
		if(streamUser[userId]){
			console.log('Stopping user stream');
			streamUser[userId].stop();
		}
		streamUser[userId] = T.stream('user', {});	
		console.log('Starting user stream');
		streamUser[userId].on('tweet', function (tweet) {
			console.log('Got a tweet for user');
			users.broadcast(userId, 'tweet', {tweet:tweet, streamSource:'user', updatedTags:null, tagsStats:null});
		});
		streamUser[userId].on('delete', function (tweet) {
			console.log('Got a deletion request for user');
			users.broadcast(userId, 'delete tweet', {tweet:tweet, streamSource:'home'});
		});
		streamUser[userId].on('disconnect', function (disconnectMessage) {
			console.log('Log: Connection got closed by Twitter');
		});
			
		usersModel.getEnabledTags(userId, function(tags){
			console.log('tags to stream: ', tags);
			// Stop Tracking stream before starting it again
			if(streamTracking[userId]){
				streamTracking[userId].stop();
			}

			var tagsToTrack = [];
			for (var i = 0; i < tags.length; i++) {
				tagsToTrack.push('#' + tags[i]);
			};

			// If there is not at least one tag to follow, do not start the stream
			if(!tagsToTrack[0]){
				console.log('Log: Cannot start stream without tags to follow');
			}
			else{
				console.log('Log: Start stream with : ', tagsToTrack);
				streamTracking[userId] = T.stream('statuses/filter', { track: tagsToTrack });

				streamTracking[userId].on('tweet', function (tweet) {
					// console.log('Listening stream');
					tagsToLowerCase(tweet.entities.hashtags, function(updatedTags){
						users.broadcast(userId, 'tweet', {tweet:tweet, streamSource:'tracking', updatedTags: updatedTags});
					});
				});
				streamTracking[userId].on('delete', function (tweet) {
					console.log('Got a deletion request for tracking');
					users.broadcast(userId, 'delete tweet', {tweet:tweet, streamSource:'tracking'});
				});
				streamTracking[userId].on('disconnect', function (disconnectMessage) {
					console.log('Log: Connection got closed by Twitter');
				});

				streamTracking[userId].on('error', function(err){
					console.error('Error when streaming hashtags: ', err);
				});
			}
		});
	},

	stopStream: function(userId){
		if(streamUser[userId]){
			console.log('Stopping user stream');
			streamUser[userId].stop();
		}
		if(streamTracking[userId]){
			console.log('Stopping tracking stream');
			streamTracking[userId].stop();
		}
		if(streamLists[userId]){
			clearTimeout(streamLists[userId]);
			console.log('Stopping streamLists');
		}
	}
};

module.exports = twitterAgent;
