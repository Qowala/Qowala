(function() {
	var socket = io();

	var FollowedTags = [];
	var statistics = {};
	var table = document.getElementById('statistics');

	/**
	 * Rewrites the statistics table in HTML
	 */
	function writeStatistics(){
		table.innerHTML = "";
		for(tag in statistics){
			table.innerHTML += statistics[tag];
		}
	}

	/**
	 * Calculate percentage for each language from a tweet
	 * @param  {Objecy} tagLanguages Languages from the tweet and their count
	 * @return {String}              DOM with the languages statistics
	 */
	function calculateLangStats(tagLanguages){
		var total = 0;
		var dom = '<ul>';
		for(lang in tagLanguages){
			total += tagLanguages[lang];
			console.log('lang: ', lang);
			console.log('total: ', total);
		}
		for(lang in tagLanguages){
			dom += "<li>" + lang + ": " + Math.round(tagLanguages[lang] / total * 100) + "% </li>";
		}
		dom += "</ul>";
		return dom;
	}

	socket.emit('auth', userId);
	socket.on('tweet', function(tweetObject){
		var tweetsDisplay = document.getElementById('tweets');
		tweetsDisplay.innerHTML += '<li>' + tweetObject.tweet.user.name + ' : ' + tweetObject.tweet.text + '</li>'; 
		for (var i = 0; i < tweetObject.updatedTags.length; i++) {
			for (var j = 0; j < FollowedTags.length; j++) {
				tweetObject.updatedTags[i] = tweetObject.updatedTags[i].toLowerCase();
				if(FollowedTags[j] === tweetObject.updatedTags[i]){
					var languages = calculateLangStats(tweetObject.tagsStats[tweetObject.updatedTags[i]].lang);
					statistics[tweetObject.updatedTags[i]] = '<tr><td>' + tweetObject.updatedTags[i] + '</td><td>'+ tweetObject.tagsStats[tweetObject.updatedTags[i]].frequency + ' tweets/min </td><td>' + languages + '</td></tr>';
				}
			};
		};
		writeStatistics();
	});

	var tagElements = document.getElementsByClassName('tag');

	for (var i = 0; i < tagElements.length; i++) {
		var element = tagElements[i];
		FollowedTags.push(element.innerHTML.slice(1, element.length));

		element.addEventListener('click', function(event){
			var tag = this.innerHTML;
			// Remove the # from the tag name
			tag = tag.slice(1,tag.length);

			// Remove the tag from the statistics table
			delete statistics[tag];
			writeStatistics();

			socket.emit('remove tag', {tag:tag, userId:userId});
			// Remove the li containing the tag
			console.log('event: ', event);
			event.target.parentNode.parentNode.removeChild(event.target.parentNode);
			
		});
	};
	

	// });
})();