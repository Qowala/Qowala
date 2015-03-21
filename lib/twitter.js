var tagsModel = require('../model/tagsModel');
var configTwitter = require('../config/twitter');
var Twit = require('twit');

// Declare here the stream to be used as global variable
var streamUser;
var streamSearch;
var streamSite;

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
							
			var allTweetsFromAllLists = [];

			function getAllTweetsFromAllLists(i) {
				if(lists){
					if( i < lists.length ) {
						T.get('lists/statuses', {list_id: lists[i].id, count: 50}, function(err, listTweets, response){
							allTweetsFromAllLists.push(listTweets);
							if(response.headers){
								console.log('the response header is: ', response.headers);
							}
							
							if( err ) {
						    	console.error('Error when requesting lists tweets: ', err);
						    	// If the API limit has been reached, delay the requests
						    	if(err.statusCode == 429){
						    		console.log('Beginning to delay the requests due to limitation');
						    		time += 10000;
						    	}
							}
							else {
								if(time > 61000){
									time -= 10000;
									console.log('Log: Reduce the delay between lists tweets requests');
								}
								getAllTweetsFromAllLists(i+1);
							}
						});	
					}
				 	else{
				 		users.setListsTweetsCache(userId, allTweetsFromAllLists);
				 		console.log('There is', allTweetsFromAllLists.length, ' elements in allTweetsFromAllLists');
						users.broadcast(userId, 'tweet', {tweet:allTweetsFromAllLists, streamSource:'lists', updatedTags: null, tagsStats:null});	
						// Reset the variable for next turn
						allTweetsFromAllLists = [];
					}
				}
			}

			setTimeout(repeatGetAllTweetsFromAllLists, time);
			
			// Repeat call with time able to change	
			function repeatGetAllTweetsFromAllLists(){
				getAllTweetsFromAllLists(0);
				var timer = setTimeout(repeatGetAllTweetsFromAllLists, time);
			}
		});
		
		// Stop User stream before starting it again
		if(streamUser){
			console.log('Stopping user stream');
			streamUser.stop();
		}
		streamUser = T.stream('user', {});	
		streamUser.on('tweet', function (tweet) {
			users.broadcast(userId, 'tweet', {tweet:tweet, streamSource:'user', updatedTags:null, tagsStats:null});
		});
		streamUser.on('disconnect', function (disconnectMessage) {
			console.log('Log: Connection got closed by Twitter');
		});
			
		tagsModel.getUserTags(userId, function(tags){
			// Stop Search stream before starting it again
			if(streamSearch){
				streamSearch.stop();
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
				streamSearch = T.stream('statuses/filter', { track: tagsToTrack });

				streamSearch.on('tweet', function (tweet) {
					// console.log('Listening stream');
					calculateFrequency(tweet, function(updatedTags, tagsStats){
						users.broadcast(userId, 'tweet', {tweet:tweet, streamSource:'search', updatedTags:updatedTags, tagsStats:tagsStats});
					});
				});
				streamSearch.on('disconnect', function (disconnectMessage) {
					console.log('Log: Connection got closed by Twitter');
				});
			}
		});
	}
};

module.exports = twitterAgent;