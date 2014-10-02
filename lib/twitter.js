// var configTv = require('../config/tv');
var tagsModel = require('../model/tagsModel');

// var tags = [];
// for (var i = 0; i < configTv.length; i++){
// 	tags.push('#' + configTv[i].tag);
// }

// Met bout-à-bout les élements du tableau et les sépare par ', '
//tags = tags.join(', ');

var configTwitter = require('../config/twitter');
var Twit = require('twit');

tagsModel.getAllTags(function(tags){
	var tagsToTrack = [];
	for (var i = 0; i < tags.length; i++) {
		tagsToTrack.push('#' + tags[i].text);
	};

	var T = new Twit({
		consumer_key: configTwitter.consumerKey,
		consumer_secret: configTwitter.consumerSecret,
		access_token: configTwitter.accessToken,
		access_token_secret: configTwitter.accessTokenSecret
	});

	var stream = T.stream('statuses/filter', { track: tagsToTrack, language: 'fr' });

	var users = require('./users');

	stream.on('tweet', function (tweet) {
		console.log('Received tweet: ' + tweet);
		users.broadcast(tweet);
	});
});


