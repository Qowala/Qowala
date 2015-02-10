(function() {
	var socket = io();

	var FollowedTags = [];
	var statistics = {};
	var table = document.getElementById('statistics');
	var tweetsDisplay = document.getElementById('tweets');
	// var tweetCount = 0;
	var tweets = [];
	var tweetsToPrint = "";

	// Restores the content
	if (localStorage.getItem('data_statistics')){
		table.innerHTML = localStorage.getItem('data_statistics');
	}
	if (localStorage.getItem('data_tweets')){
		tweets = localStorage.getItem('data_tweets');
		tweets = JSON.parse(tweets || "null");
	}

	writeTweets();

	/**
	 * Rewrites the statistics table in HTML. Saves the data in localStorage.
	 */
	function writeStatistics(){
		table.innerHTML = "";
		for(tag in statistics){
			table.innerHTML += statistics[tag];
		}
		localStorage.setItem('data_statistics', table.innerHTML);		
	}

	/**
	 * Displays the tweets in a limited number and saves them into localStorage
	 * @param  {Object} tweetObject An object containing the tweet object
	 */
	function writeTweets(tweetObject){
		var i = 50;
		while(i--) { 
			if(tweets[i]){
				tweets[i+1] = tweets[i];
			}
		 }

		if(tweetObject){
			var date = tweetObject.tweet.created_at.slice(0, -11);

			var tweetText = urlify(tweetObject.tweet);

			tweets[0] ='<li><span class="tweetdate">' + date + '</span><span class="tweetauthorname"> ' + tweetObject.tweet.user.name + '</span> : <span class="tweettext">' + tweetText  + '</span></li>'; 
		}

		tweetsToPrint = "";
		for (var i = 0; i < tweets.length; i++) {
		 	tweetsToPrint += tweets[i];
		}; 
		tweetsDisplay.innerHTML = tweetsToPrint;
		localStorage.setItem('data_tweets', JSON.stringify(tweets));
	}

	/**
	 * Calculate percentage for each language from a tweet
	 * @param  {Object} tagLanguages Languages from the tweet and their count
	 * @return {String}              DOM with the languages statistics
	 */
	function calculateLangStats(tagLanguages){
		var total = 0;
		var dom = '<ul>';
		for(lang in tagLanguages){
			total += tagLanguages[lang];
		}
		for(lang in tagLanguages){
			dom += "<li>" + lang + ": " + Math.round(tagLanguages[lang] / total * 100) + "% </li>";
		}
		dom += "</ul>";
		return dom;
	}

	/**
	 * Displays the tweets stats
	 * @param  {Object} tweetObject Object containing the stats with the tweets
	 */
	function displayStats(tweetObject){
		for (var i = 0; i < tweetObject.updatedTags.length; i++) {
			for (var j = 0; j < FollowedTags.length; j++) {
				tweetObject.updatedTags[i] = tweetObject.updatedTags[i].toLowerCase();
				if(FollowedTags[j] === tweetObject.updatedTags[i]){
					var languages = calculateLangStats(tweetObject.tagsStats[tweetObject.updatedTags[i]].lang);
					statistics[tweetObject.updatedTags[i]] = '<tr><td class="tagname">' + tweetObject.updatedTags[i] + '</td><td class="tagfrequency">'+ tweetObject.tagsStats[tweetObject.updatedTags[i]].frequency + ' tweets/min </td><td class="taglang">' + languages + '</td></tr>';
				}
			};
		};
	}

	socket.emit('auth', userId);
	socket.on('tweet', function(tweetObject){
		writeTweets(tweetObject);
		displayStats(tweetObject);
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
			event.target.parentNode.parentNode.removeChild(event.target.parentNode);
			
		});
	};

	function urlify(tweet) {

		var urls_indices = [];

		var tweetText = tweet.text;

		if(tweet.entities.urls) {
			for (var i = 0; i < tweet.entities.urls.length; i++) {
				console.log('url: ', tweet.entities.urls[i].url, 'expanded url: ', tweet.entities.urls[i].expanded_url, 'display_url : ', tweet.entities.urls[i].display_url);
				console.log('tweetObject: ', tweet);
				urlIndice = {
					expanded_url: tweet.entities.urls[i].expanded_url, 
					url: tweet.entities.urls[i].url, 
					indices: tweet.entities.urls[i].indices
				};
				urls_indices.push(urlIndice);
			}
		}
		if(tweet.entities.media) {
			for (var i = 0; i < tweet.entities.media.length; i++) {
				console.log('media: ', tweet.entities.media[i]);
				urlIndice = {
					expanded_url: tweet.entities.media[i].expanded_url, 
					url: tweet.entities.media[i].url, 
					indices: tweet.entities.media[i].indices
				};
				urls_indices.push(urlIndice);
			}; 
		}

		function compareIndicesInversed(a, b){
			return  b.indices[0] - a.indices[0];
		}

		urls_indices.sort(compareIndicesInversed);

		console.log(urls_indices);
		var originText = tweetText;
		var workingText = [];
		for(var i = 0; i < urls_indices.length; i++){
			if(originText != ""){
				originText = linkify(originText, urls_indices[i]);
				console.log('workingText : ', workingText);
				console.log('originText: ', originText);
			}
		}
		workingText.push(originText);

		// Search the strings and replace them by links
		function linkify(text, urlObject){
			// Special condition because Twitter media tells it uses only one character when they are more
			if(urlObject.indices[0] == 139){
			 	beginningText = text.substring(0, text.lastIndexOf(' ') + 1);
			 	finishingText = text.substring(urlObject.indices[1]); 
			 	workingText.push('<a href="' + urlObject.expanded_url + '">' + urlObject.url + '</a>' + finishingText) ;
			 	return beginningText ;	
			}
			else{
			 	beginningText = text.substring(0, urlObject.indices[0]);
			 	finishingText = text.substring(urlObject.indices[1]); 
			 	workingText.push('<a href="' + urlObject.expanded_url + '">' + urlObject.url + '</a>' + finishingText) ;
			 	return beginningText ;
			}
		}

		// Reverse the text stack if they were links
	 	var newTweetText = "";
	 	if(workingText != []){
		 	for (var i = workingText.length - 1; i >= 0; i--) {
		 		newTweetText += workingText[i];
		 	};
	 	}
	 	else{
	 		newTweetText = tweetText;
	 	}

	 	return newTweetText;
	}

})();