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
})();