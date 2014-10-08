var tagsModel = require('../model/tagsModel');
var configTwitter = require('../config/twitter');
var Twit = require('twit');


var T = new Twit({
		consumer_key: configTwitter.consumerKey,
		consumer_secret: configTwitter.consumerSecret,
		access_token: configTwitter.accessToken,
		access_token_secret: configTwitter.accessTokenSecret
});

// Declare here the stream to be used as global variable
var stream;

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
	initStream: function(){
		console.log('Searching the tags');
		tagsModel.getAllTags(function(tags){
			var tagsToTrack = [];
			for (var i = 0; i < tags.length; i++) {
				tagsToTrack.push('#' + tags[i].text);
			};

			if(stream){
				stream.stop();
				console.log('stream stopped');
			}

			console.log('Beginning stream with tags: ', tagsToTrack);
			stream = T.stream('statuses/filter', { track: tagsToTrack });

			var users = require('./users');
			
			stream.on('tweet', function (tweet) {
				console.log('Listening stream');
				calculateFrequency(tweet, function(updatedTags, tagsStats){
					users.broadcast(tweet, updatedTags, tagsStats);
				});
			});
		});
	}
};

module.exports = twitterAgent;

twitterAgent.initStream();

