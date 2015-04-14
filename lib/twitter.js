var tagsModel = require('../model/tagsModel');
var configTwitter = require('../config/twitter');
var Twit = require('twit');

// Declare here the stream to be used as global variable
var streamUser = [];
var streamTracking = [];
var streamLists = [];

// Declare the object to store the tags statistics
var tagsStats = {};

/**
 * Calculate the frequency of the tweets from the same hashtag
 * @param  {Objecy}   tweet A received tweet
 * @param  {Function} cb    Callback returning the updated hashtags and the frequencies of each hashtag
 */
function calculateFrequency(tweet, cb){
		var updatedTags = [];
		for (var i = 0; i < tweet.entities.hashtags.length; i++) {
			tweet.entities.hashtags[i].text = tweet.entities.hashtags[i].text.toLowerCase();
			updatedTags.push(tweet.entities.hashtags[i].text);
			if(!tagsStats[tweet.entities.hashtags[i].text]){
				language = tweet.lang;
				tagsStats[tweet.entities.hashtags[i].text] = {
					timestamp: tweet.timestamp_ms,
					counter: 1,
					frequency: 0,
					lang: {}
				};
				tagsStats[tweet.entities.hashtags[i].text].lang[tweet.lang] = 1;
			}
			else {
				var delta = tweet.timestamp_ms	- tagsStats[tweet.entities.hashtags[i].text].timestamp;
				delta = delta / 1000; // Convert milliseconds in seconds
				var count = tagsStats[tweet.entities.hashtags[i].text].counter++;
				tagsStats[tweet.entities.hashtags[i].text].frequency = Math.round(60 * count / delta);
				if(tagsStats[tweet.entities.hashtags[i].text].lang[tweet.lang]){
					tagsStats[tweet.entities.hashtags[i].text].lang[tweet.lang] += 1; 
				}
				else{
					tagsStats[tweet.entities.hashtags[i].text].lang[tweet.lang] = 1;
				}
			}
			// console.log(tweet.entities.hashtags[i].text + ' : ', tagsStats[tweet.entities.hashtags[i].text]);
		}
		return cb(updatedTags, tagsStats);
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

	sendRetweet: function(userId, token, tokenSecret, tweetId, cb){
		var users = require('./users');
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

		users.getUserListsCache(userId, function(lists){
			// Time interval for each REST API request
			var time = 61000;
			console.log('Log: Got cached users list and now going to get their tweets');
			// console.log('Beginning the API Lists stream with lists: ', lists);
							
			var allTweetsFromAllLists = {};

			function getAllTweetsFromAllLists(i) {
				if(lists){
					if( i < lists.length ) {
						T.get('lists/statuses', {list_id: lists[i].id, count: 50}, function(err, listTweets, response){
							allTweetsFromAllLists[lists[i].slug] = listTweets;
							if(response){
								if(response.headers){
									// console.log('the response header limit reset is: ', response.headers);
						    		
								}
							}
							
							if( err ) {
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
								getAllTweetsFromAllLists(i+1);
							}
						});	
					}
				 	else{
				 		users.setListsTweetsCache(userId, allTweetsFromAllLists);
				 		// console.log('There is', allTweetsFromAllLists.length, ' elements in allTweetsFromAllLists');
						users.broadcast(userId, 'tweet', {tweet:allTweetsFromAllLists, streamSource:'lists', updatedTags: null, tagsStats:null});	
						// Reset the variable for next turn
						allTweetsFromAllLists = {};
					}
				}
			}

			setTimeout(repeatGetAllTweetsFromAllLists, time);
			
			// Repeat call with time able to change	
			function repeatGetAllTweetsFromAllLists(){
				getAllTweetsFromAllLists(0);
				streamLists[userId] = setTimeout(repeatGetAllTweetsFromAllLists, time);
			}
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
			console.log('streamUser: ', streamUser.filter(function(value) { return value !== undefined }).length);
			users.broadcast(userId, 'tweet', {tweet:tweet, streamSource:'user', updatedTags:null, tagsStats:null});
		});
		streamUser[userId].on('disconnect', function (disconnectMessage) {
			console.log('Log: Connection got closed by Twitter');
		});
			
		tagsModel.getUserTags(userId, function(tags){
			// Stop Tracking stream before starting it again
			if(streamTracking[userId]){
				streamTracking[userId].stop();
			}

			var tagsToTrack = [];
			for (var i = 0; i < tags.length; i++) {
				tagsToTrack.push('#' + tags[i].text);
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
					calculateFrequency(tweet, function(updatedTags, tagsStats){
						users.broadcast(userId, 'tweet', {tweet:tweet, streamSource:'tracking', updatedTags:updatedTags, tagsStats:tagsStats});
					});
				});
				streamTracking[userId].on('disconnect', function (disconnectMessage) {
					console.log('Log: Connection got closed by Twitter');
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