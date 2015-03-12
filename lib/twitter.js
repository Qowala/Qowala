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

		// console.log('Searching the tags');
		tagsModel.getUserTags(userId, function(tags){
			var tagsToTrack = [];
			for (var i = 0; i < tags.length; i++) {
				tagsToTrack.push('#' + tags[i].text);
			};

			if(streamUser){
				streamUser.stop();
			}
			if(streamSearch){
				streamSearch.stop();
			}

			var usersSite = [];
			T.get('lists/list', {}, function (err, data, response) {
				if(err){
					console.error('Error: ', err);
				}
				console.log('data.length: ', data.length);
				console.log('data: ', data);
				setInterval(function(){
					for(var i = 0; i < data.length; i++){
						T.get('lists/statuses', {list_id: data[i].id, count: 10}, function(err, allUsers, response){

							for(var i = allUsers.length-1; i >= 0; i--){
								calculateFrequency(allUsers[i], function(updatedTags, tagsStats){
									users.broadcast(userId, 'tweet', {tweet:allUsers[i], streamSource:'list-'+i, updatedTags:updatedTags, tagsStats:tagsStats});
								});
							};
						});
					};
				}, 20000);
			});
			// If there is not at least one tag to follow, do not start the stream
			if(!tagsToTrack[0]){
				console.log('Log: Cannot start stream without tags to follow');
			}
			else{
				console.log('Log: Start stream with : ', tagsToTrack);
				streamUser = T.stream('user', {});
				streamSearch = T.stream('statuses/filter', { track: tagsToTrack });

				var users = require('./users');
				var nbUserTweet = 0;
				// streamUser.on('tweet', function (tweet) {
				// 	nbUserTweet++;
				// 	console.log('Log: user tweet number ', nbUserTweet);
				// 	// console.log('Listening stream');
				// 	calculateFrequency(tweet, function(updatedTags, tagsStats){
				// 		users.broadcast(userId, 'tweet', {tweet:tweet, streamSource:'user', updatedTags:updatedTags, tagsStats:tagsStats});
				// 	});
				// });
				streamUser.on('disconnect', function (disconnectMessage) {
					console.log('Log: Connection got closed by Twitter');
				});
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

// Push default tag for start then init the stream
//tagsModel.pushTag(0, "twitter", function(){
	// twitterAgent.initStream();
//})


