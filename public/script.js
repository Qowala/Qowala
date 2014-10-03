(function() {
	var socket = io();

	socket.emit('auth', userId);
	socket.on('tweet', function(tweet){
		console.log(tweet);
		var tweetsDisplay = document.getElementById('tweets');
		tweets.innerHTML += '<li>' + tweet.user.name + ' : ' + tweet.text + '</li>'; 
	});

	function removeTag(userId, tag){
		socket.emit('remove tag', {tag:tag, userId:userId});
	}

	var tagElements = document.getElementsByClassName('tag');

	for (var i = 0; i < tagElements.length; i++) {
		console.log('tagElements: ', tagElements);
		var element = tagElements[i];
		console.log('element: ', element);

		element.addEventListener('click', function(event){
			console.log('this.innerHTML', this.innerHTML);
			var tag = this.innerHTML;
			// Remove the # from the tag name
			tag = tag.slice(1,tag.length);
			socket.emit('remove tag', {tag:tag, userId:userId});
			// Remove the li containing the tag
			console.log('event: ', event);
			event.target.parentNode.parentNode.removeChild(event.target.parentNode);
			
		});
	};
	

	// });
})();