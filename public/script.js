(function() {
	var socket = io();

	var FollowedTags = [];
	var statistics = {};
	var table = document.getElementById('statistics');
	var tweetsColumnsList = document.getElementById('tweets-columns-list');
	var userTweets = document.getElementById('tweets-user');
	var searchTweets = document.getElementById('tweets-search');
	var toggleButton = document.getElementById('toggleButton');
	var listsRow = document.getElementById('lists-row');
	// var tweets = [];
	var tweetsFromUser = [];
	var tweetsFromSearch = [];
	var tweetsToPrint = "";
	var sendTagButton = document.getElementById('sendTagButton');
	var tagInput = document.getElementById('tagInput');
	var tagElements = document.getElementsByClassName('tag');
	var tagList = document.getElementById('tag-list');
	var listsList = [];

	// Restores the content
	if (localStorage.getItem('data_statistics')){
		statistics = localStorage.getItem('data_statistics');
		statistics = JSON.parse(statistics || "null");
	}
	if (localStorage.getItem('tweetsFromSearch')){
		tweetsFromSearch = localStorage.getItem('tweetsFromSearch');
		tweetsFromSearch = JSON.parse(tweetsFromSearch || "null");
	}
	if (localStorage.getItem('tweetsFromUser')){
		tweetsFromUser = localStorage.getItem('tweetsFromUser');
		tweetsFromUser = JSON.parse(tweetsFromUser || "null");
	}

	// Default actions at page loading
	writeTweets();
	writeStatistics();

	// Emit a message to connect to the server
	socket.emit('auth', userId);

	// Receive tweet and process it
	socket.on('tweet', function(tweetObject){
		if(tweetObject.streamSource == 'user') {
			console.log('Got a tweet for user ! ');
		}
		writeTweets(tweetObject);
		displayStatsBuilder(tweetObject);
		writeStatistics();
	});

	socket.on('lists-list', function(listsObject){
		for (var i = 0; i < listsObject.length; i++) {
			var newTweetColumn = document.createElement('li');
			newTweetColumn.setAttribute('class', 'tweets-column');
			newTweetColumn.setAttribute('id', 'tweets-column-' + listsObject[i].slug);

			var newTweetColumnHeader = document.createElement('h3');
			newTweetColumnHeader.setAttribute('class', 'tweets-column-header');
			newTweetColumnHeader.setAttribute('id', 'tweets-column-header-' + listsObject[i].slug);
			newTweetColumnHeader.textContent = listsObject[i].name;
			
			var newTweetColumnTweets = document.createElement('ul');
			newTweetColumnTweets.setAttribute('class', 'tweets');
			newTweetColumnTweets.setAttribute('id', 'tweets-' + listsObject[i].slug);

			newTweetColumn.appendChild(newTweetColumnHeader);
			newTweetColumn.appendChild(newTweetColumnTweets);

			// Store the list name in an array 
			listsList.push({slug: listsObject[i].slug, name: listsObject[i].name});

			tweetsColumnsList.appendChild(newTweetColumn);
		};
	});

	// Monitor the tracked tags list if user wants to remove one of them
	function removeTagMonitor(tags){
		for (var i = 0; i < tags.length; i++) {
			FollowedTags.push(tags[i].text);
		}

		for (var i = 0; i < tagElements.length; i++) {
			var element = tagElements[i];

			element.addEventListener('click', function(event){
				var tag = this.innerHTML;

				// Remove the tag from the statistics table
				delete statistics[tag];
				writeStatistics();

				socket.emit('remove tag', {tag:tag, userId:userId});
				// Remove the li containing the tag
				event.target.parentNode.parentNode.removeChild(event.target.parentNode);
				
			});
		};
	}

	// Sends the pause request when button clicked
	var toggleBool = false;
	toggleButton.addEventListener('click', function(){
		socket.emit('toggle pause', userId);
		toggleBool ? toggleButton.innerHTML = "Stop" : toggleButton.innerHTML = "Play";
		toggleBool = !toggleBool;
	});

	// Triggers the Enter button for adding tags
	tagInput.addEventListener('keypress', function(e){
		if (e.keyCode == 13) {
			sendingTag();
	    }
	});

	// Sends tag to add
	sendTagButton.addEventListener('click', function(){
		sendingTag();
	});


	function sendingTag(){
		var tagObject = {};
		tagObject.tag = tagInput.value;
		tagInput.value = "";
		tagObject.userId = userId;
		socket.emit('add tag', tagObject);
	}

	// Receive the tag list and process it
	socket.on('tag list', function(tags){
		writeTagList(tags);
	});

	/**
	 * Rewrites the tags list in HTML and updates the removeTagMonitor
	 * @param  {Array} tags The tags list
	 */
	function writeTagList(tags){
		tagList.innerHTML = "";
		for(var i=0; i<tags.length; i++) {
			tagList.innerHTML  += '<li><button class="tag">' + tags[i].text + '</button></li>';
		}
		var tagElements = document.getElementsByClassName('tag');
		removeTagMonitor(tags);
	}

	/**
	 * Rewrites the statistics table in HTML. Saves the data in localStorage.
	 */
	function writeStatistics(){
		table.innerHTML = "";
		for(tag in statistics){
			table.innerHTML += statistics[tag];
		}
		localStorage.setItem('data_statistics', JSON.stringify(statistics));		
	}

	/**
	 * Displays the tweets in a limited number and saves them into localStorage
	 * @param  {Object} tweetObject An object containing the tweet object
	 */
	function writeTweets(tweetObject){

		if(tweetObject){
			 

			
			if(tweetObject.streamSource == 'user') {
				var date = tweetObject.tweet.created_at.slice(0, -5);

				// Replace all URLs of the tweet by clickable links
				var tweetText = urlify(tweetObject.tweet);
				
				var i = 50;
				while(i--) { 
					if(tweetsFromUser[i]){
						tweetsFromUser[i+1] = tweetsFromUser[i];
					}
				 }
				tweetsFromUser[0] ='<li><a href="http://twitter.com/' + tweetObject.tweet.user.screen_name + '" target="_blank"><img src="' + tweetObject.tweet.user.profile_image_url + '" class="tweet-profile" /></a><span class="tweet-date">' + date + '</span><span class="tweet-authorname"><a href="http://twitter.com/' + tweetObject.tweet.user.screen_name + '" target="_blank">' + tweetObject.tweet.user.name + '</a></span> : <span class="tweet-text">' + tweetText  + '</span></li>'; 
			}
			else if (tweetObject.streamSource == 'search') {
				var date = tweetObject.tweet.created_at.slice(0, -5);

				// Replace all URLs of the tweet by clickable links
				var tweetText = urlify(tweetObject.tweet);
				var i = 50;
				while(i--) { 
					if(tweetsFromSearch[i]){
						tweetsFromSearch[i+1] = tweetsFromSearch[i];
					}
				 }
				tweetsFromSearch[0] ='<li><a href="http://twitter.com/' + tweetObject.tweet.user.screen_name + '" target="_blank"><img src="' + tweetObject.tweet.user.profile_image_url + '" class="tweet-profile" /></a><span class="tweet-date">' + date + '</span><span class="tweet-authorname"><a href="http://twitter.com/' + tweetObject.tweet.user.screen_name + '" target="_blank">' + tweetObject.tweet.user.name + '</a></span> : <span class="tweet-text">' + tweetText  + '</span></li>'; 
			}
			else if (tweetObject.streamSource == 'lists') {
				for (var i = 0; i < tweetObject.tweet.length; i++) {
					if(listsList[i]){
						var currentColumnTweets = document.getElementById('tweets-' + listsList[i].slug);
						currentColumnTweets.innerHTML = "";
						var tweetsList = "";
						for (var j = 0; j < tweetObject.tweet[i].length; j++) {
							var date = tweetObject.tweet[i][j].created_at.slice(0, -5);
							var tweetText = urlify(tweetObject.tweet[i][j]);
			
							tweetsList += '<li><a href="http://twitter.com/' + tweetObject.tweet[i][j].user.screen_name + '" target="_blank"><img src="' + tweetObject.tweet[i][j].user.profile_image_url + '" class="tweet-profile" /></a><span class="tweet-date">' + date + '</span><span class="tweet-authorname"><a href="http://twitter.com/' + tweetObject.tweet[i][j].user.screen_name + '" target="_blank">' + tweetObject.tweet[i][j].user.name + '</a></span> : <span class="tweet-text">' + tweetText  + '</span></li>'; 
						};
						currentColumnTweets.innerHTML = tweetsList;
					}
				}; 
			}
			else {
				sendTo = 'default';
			}
		}

		// Update content of HTML elements
		tweetsToPrint = "";
		for (var i = 0; i < tweetsFromUser.length; i++) {
		 	tweetsToPrint += tweetsFromUser[i];
		}; 
		userTweets.innerHTML = tweetsToPrint;

		tweetsToPrint = "";
		for (var i = 0; i < tweetsFromSearch.length; i++) {
		 	tweetsToPrint += tweetsFromSearch[i];
		}; 
		searchTweets.innerHTML = tweetsToPrint;

		localStorage.setItem('tweetsFromSearch', JSON.stringify(tweetsFromSearch));
		localStorage.setItem('tweetsFromUser', JSON.stringify(tweetsFromUser));
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
	 * Build the tweets stats to be displayed
	 * @param  {Object} tweetObject Object containing the stats with the tweets
	 */
	function displayStatsBuilder(tweetObject){
		if(tweetObject.updatedTags != null){
			for (var i = 0; i < tweetObject.updatedTags.length; i++) {
				for (var j = 0; j < FollowedTags.length; j++) {
					tweetObject.updatedTags[i] = tweetObject.updatedTags[i].toLowerCase();
					if(FollowedTags[j] === tweetObject.updatedTags[i]){
						var languages = calculateLangStats(tweetObject.tagsStats[tweetObject.updatedTags[i]].lang);
						statistics[tweetObject.updatedTags[i]] = '<tr><td class="tag-name">' + tweetObject.updatedTags[i] + '</td><td class="tag-frequency">'+ tweetObject.tagsStats[tweetObject.updatedTags[i]].frequency + ' tweets/min </td><td class="tag-lang">' + languages + '</td></tr>';
					}
				};
			};
		}
	}

	/**
	 * Replace all URLs in the tweets by clickable links
	 * @param  {Object} tweet [Tweet to be processed]
	 * @return {String}       [Text of the tweet with clickable links]
	 */
	function urlify(tweet) {

		// Array where to store all URLs of the tweet
		var urls_indices = [];

		// Copy of the original text
		var tweetText = tweet.text;

		// Parse all URLs from the Tweet object to be sort in a array
		if(tweet.entities.urls) {
			for (var i = 0; i < tweet.entities.urls.length; i++) {
				urlIndice = {
					expanded_url: tweet.entities.urls[i].expanded_url, 
					url: tweet.entities.urls[i].url, 
					indices: tweet.entities.urls[i].indices
				};
				urls_indices.push(urlIndice);
			}
		}
		// Parse all media URLs from the Tweet object to be sort in a array
		if(tweet.entities.media) {
			for (var i = 0; i < tweet.entities.media.length; i++) {
				urlIndice = {
					expanded_url: tweet.entities.media[i].expanded_url, 
					url: tweet.entities.media[i].url, 
					indices: tweet.entities.media[i].indices
				};
				urls_indices.push(urlIndice);
			}; 
		}

		/**
		 * Compare the indices from bigger to smaller
		 * @param  {Array} a [Indices of first element]
		 * @param  {Array} b [Indices of first element]
		 * @return {Integer}   [Comparison result]
		 */
		function compareIndicesInversed(a, b){
			return  b.indices[0] - a.indices[0];
		}

		// Sort the indices from bigger to smaller
		urls_indices.sort(compareIndicesInversed);

		// Copy of the orignal text to be then modified
		var originText = tweetText;
		// Array that will store parts of the tweet text being processed
		var workingText = [];
		// For every URL of the tweet, linkify it
		for(var i = 0; i < urls_indices.length; i++){
			if(originText != ""){
				originText = linkify(originText, urls_indices[i]);
			}
		}
		// If no more URL, push the rest of the tweet text at the end of the processed text
		workingText.push(originText);

		// Search the strings and replace them by links
		function linkify(text, urlObject){
			if(urlObject.expanded_url.length > 35){
				displayUrl = urlObject.expanded_url.slice(0, 32);
				displayUrl += '...';
			}
			else {
				displayUrl = urlObject.expanded_url;
			}

			// Special condition to fix because Twitter media tells it uses only one character when they are more
			if(urlObject.indices[0] == 139){
			 	beginningText = text.substring(0, text.lastIndexOf(' ') + 1);
			 	finishingText = text.substring(urlObject.indices[1]); 
			 	workingText.push('<a href="' + urlObject.expanded_url + '" class="tweet-url" target="_blank">' + displayUrl + '</a>' + finishingText) ;
			 	return beginningText ;	
			}
			// Replaces the URL by a clickable link and returns the rest of the text to be transformed
			else{
			 	beginningText = text.substring(0, urlObject.indices[0]);
			 	finishingText = text.substring(urlObject.indices[1]); 
			 	workingText.push('<a href="' + urlObject.expanded_url + '" class="tweet-url" target="_blank">' + displayUrl + '</a>' + finishingText) ;
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
	 	// If they were no links, just a copy
	 	else{
	 		newTweetText = tweetText;
	 	}

	 	return newTweetText;
	}
})();