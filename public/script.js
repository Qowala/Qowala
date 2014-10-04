(function() {
	var socket = io();

	var FollowedTags = [];
	var statistics = {};
	var table = document.getElementById('statistics');

	function writeStatistics(){
		table.innerHTML = "";
		for(tag in statistics){
			table.innerHTML += statistics[tag];
		}
	}

	socket.emit('auth', userId);
	socket.on('tweet', function(tweetObject){
		var tweetsDisplay = document.getElementById('tweets');
		tweetsDisplay.innerHTML += '<li>' + tweetObject.tweet.user.name + ' : ' + tweetObject.tweet.text + '</li>'; 
		for (var i = 0; i < tweetObject.updatedTags.length; i++) {
			for (var j = 0; j < FollowedTags.length; j++) {
				tweetObject.updatedTags[i] = tweetObject.updatedTags[i].toLowerCase();
				if(FollowedTags[j] === tweetObject.updatedTags[i]){
					statistics[tweetObject.updatedTags[i]] = '<tr><td>' + tweetObject.updatedTags[i] + '</td><td>'+ tweetObject.tagsStats[tweetObject.updatedTags[i]].frequency + ' tweets/min </td></tr>';
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