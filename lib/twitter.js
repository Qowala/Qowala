var tagsModel = require('../model/tagsModel');
var configTwitter = require('../config/twitter');
var Twit = require('twit');


var T = new Twit({
		consumer_key: configTwitter.consumerKey,
		consumer_secret: configTwitter.consumerSecret,
		access_token: configTwitter.accessToken,
		access_token_secret: configTwitter.accessTokenSecret
});

var twitterAgent = {
	refreshStream: function(T, stream){
		tagsModel.getAllTags(
			function(tags){
				var tagsToTrack = [];
				for (var i = 0; i < tags.length; i++) {
					tagsToTrack.push('#' + tags[i].text);
				};

				stream.stop();

				T.stream('statuses/filter', { track: tagsToTrack });

				var users = require('./users');

				stream.on('tweet', function (tweet) {
					users.broadcast(tweet);
				});
			}
		);
	},
	initStream: function(){
		tagsModel.getAllTags(function(tags){
			var tagsToTrack = [];
			for (var i = 0; i < tags.length; i++) {
				tagsToTrack.push('#' + tags[i].text);
			};

			if(stream){
				stream.stop();
			}

			console.log('Beginning stream with tags: ', tagsToTrack);
			var stream = T.stream('statuses/filter', { track: tagsToTrack });

			var users = require('./users');
			
			stream.on('tweet', function (tweet) {
				users.broadcast(tweet);
			});
		});
	}
}

module.exports = twitterAgent;

twitterAgent.initStream();