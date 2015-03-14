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
	 * Start Twitter listening stream and restart if previously existing
	 */
	initStream: function(userId, token, tokenSecret){
		var T = new Twit({
				consumer_key: configTwitter.consumerKey,
				consumer_secret: configTwitter.consumerSecret,
				access_token: token,
				access_token_secret: tokenSecret
		});

		tagsModel.getUserTags(userId, function(tags){

			// Retrieve tweets from all lists
			T.get('lists/list', {}, function (err, data, response) {
				if(err){
					console.error('Error: ', err);
				}
				setInterval(function(){
					var allTweetsFromAllLists = [];
	
					function getAllTweetsFromAllLists(i) {
						if( i < data.length ) {
							T.get('lists/statuses', {list_id: data[i].id, count: 50}, function(err, listTweets, response){
								allTweetsFromAllLists.push(listTweets);
								if( err ) {
							    	console.log('error: ', err);
								}
								else {
									getAllTweetsFromAllLists(i+1);
								}
							});	
						}
					 	else{
							users.broadcast(userId, 'tweet', {tweet:allTweetsFromAllLists, streamSource:'lists', updatedTags: null, tagsStats:null});	
						}
					}

					getAllTweetsFromAllLists(0);
						
				}, 61000);
			});

			// Stop User stream before starting it again
			if(streamUser){
				streamUser.stop();
			}
			var users = require('./users');
			streamUser = T.stream('user', {});	
			streamUser.on('tweet', function (tweet) {
				users.broadcast(userId, 'tweet', {tweet:tweet, streamSource:'user', updatedTags:null, tagsStats:null});
			});
			streamUser.on('disconnect', function (disconnectMessage) {
				console.log('Log: Connection got closed by Twitter');
			});
			
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