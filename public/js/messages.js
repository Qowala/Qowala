/**************************************************************************/
/**                             Messages                                ***/
/**************************************************************************/

/**
 * Message's class
 * @param {String} id              Message ID from social network
 * @param {String} authorUsername  User's login username
 * @param {String} authorPseudonym User's displayed name
 * @param {String} date            Message date
 * @param {String} text            Message text content
 * @param {String} profilePicture  URL to user's profile picture
 */
function Message(message, streamSource, areImagesEnabled){
	this.id = message.retweeted_status ? message.retweeted_status.id_str : message.id_str;
	this.retweeterAuthorUsername = message.user.name;
	this.authorUsername = message.retweeted_status ? message.retweeted_status.user.screen_name : message.user.screen_name;
	this.authorPseudonym = message.retweeted_status ? message.retweeted_status.user.name : message.user.name;
	this.date = message.retweeted_status ? message.retweeted_status.created_at : message.created_at;
	this.displayedDate = '0 min';
	this.friendlyDate = message.retweeted_status ? message.retweeted_status.created_at : message.created_at;
	this.dateHTML = null;
	this.text = document.createTextNode('p');
	this.text.textContent = message.retweeted_status ? message.retweeted_status.text : message.text;
	this.profilePicture = message.retweeted_status ? message.retweeted_status.user.profile_image_url_https : message.user.profile_image_url_https;
	this.streamSource = streamSource
	this.retweeted = message.retweeted_status ? message.retweeted_status.retweeted : message.retweeted;
	this.areImagesEnabled = areImagesEnabled;
	this.image = null;

	this.isRetweet = message.retweeted_status ? true : false;

	this.urls = message.retweeted_status ? message.retweeted_status.entities.urls : message.entities.urls;
	this.medias = message.retweeted_status ? message.retweeted_status.entities.media : message.entities.media;
	this.hashtags = message.retweeted_status ? message.retweeted_status.entities.hashtags : message.entities.hashtags;
	this.user_mentions = message.retweeted_status ? message.retweeted_status.entities.user_mentions : message.entities.user_mentions;

	setTimeout(function(){
		this.timeUpdater = setInterval(function(){
				this.updateTime()
			}.bind(this)
		, 90000);
	}.bind(this), 1000);
}

/**
 * Create the HTML elements for the message
 * @return {Object}         Generated message in HTML
 */
Message.prototype.generateMessage = function(){

	this.processText();

	var newTweet = document.createElement('li');
	// Be careful to change it to id_str when it will be updated
	newTweet.setAttribute('name', 'tweet-' + this.id);

	if(this.isRetweet){
		var newUserRetweeter = document.createElement('p');
		newUserRetweeter.className = "tweet-retweeter";
		newUserRetweeter.textContent = this.retweeterAuthorUsername + ' has retweeted';
		var newRetweeterFont = document.createElement('i');
		newRetweeterFont.setAttribute('class', 'fa fa-retweet');
		newUserRetweeter.insertBefore(newRetweeterFont, newUserRetweeter.firstChild);
		newTweet.appendChild(newUserRetweeter);
	}

	var newLinkAuthorImg = document.createElement('a');
	newLinkAuthorImg.setAttribute('href', 'https://twitter.com/' + this.authorUsername);
	newLinkAuthorImg.setAttribute('target', '_blank');

	var newImg = document.createElement('img');
	newImg.setAttribute('src', this.profilePicture);
	newImg.setAttribute('class', 'tweet-profile');

	var newDate = document.createElement('span');
	newDate.setAttribute('class', 'tweet-date');
	newDate.setAttribute('title', this.friendlyDate);
	newDate.textContent = this.displayedDate;
	this.dateHTML = newDate;
	
	var newLinkAuthor = document.createElement('a');
	newLinkAuthor.setAttribute('class', 'tweet-authorname');
	newLinkAuthor.setAttribute('href', 'https://twitter.com/' + this.authorUsername);
	newLinkAuthor.setAttribute('target', '_blank');
	newLinkAuthor.textContent = this.authorPseudonym;

	var newAuthorScreenName = document.createElement('span');
	newAuthorScreenName.setAttribute('class', 'tweet-authorScreenName');
	newAuthorScreenName.textContent = '@' + this.authorUsername;

	var newContent = document.createElement('p');
	newContent = this.text;
	newContent.setAttribute('class', 'tweet-text');

	var newRetweetButton = document.createElement('button');
	newRetweetButton.setAttribute('name', 'retweet-' + this.id);
	newRetweetButton.setAttribute('class', 'tweet-retweet-button');

	var newRetweetFont = document.createElement('i');
	newRetweetFont.setAttribute('class', 'fa fa-retweet');

	// Put event listener on elements
	this.addEvent(newRetweetButton);

	newLinkAuthorImg.appendChild(newImg);
	newRetweetButton.appendChild(newRetweetFont);
	newTweet.appendChild(newLinkAuthorImg);
	newTweet.appendChild(newLinkAuthor);
	newTweet.appendChild(newAuthorScreenName);
	newTweet.appendChild(newContent);
	newTweet.appendChild(newDate);
	newTweet.appendChild(newRetweetButton);

	return newTweet;
}

/**
 * Process the message date
 */
Message.prototype.processDate = function(){
	var date = new Date(Date.parse(this.date));
	// Put to the right timezone
	date.toLocaleString();
	var year = date.getFullYear();
	var month = date.getMonth();
	month = month < 10 ? '0' + month : month;
	var day = date.getDate();
	day = day < 10 ? '0' + day : day;
	var hour = date.getHours();
	hour = hour < 10 ? '0' + hour : hour;
	var min = date.getMinutes();
	min = min < 10 ? '0' + min : min;

	this.date = date;

	this.friendlyDate = hour + 'h' + min + ' - ' + day + '/'+ month + '/' + year;

	this.updateTime();
}

/**
 * Add event listener on elements
 */
Message.prototype.addEvent = function(retweetButton){
	retweetButton.addEventListener('click', function(e){
			this.sendRetweet();
	}.bind(this));
}

/**
 * Send Retweet message
 */
Message.prototype.sendRetweet = function(){

	if(this.retweeted){
		console.log('Gonna send delete tweet with id: ', this.id);
		socket.emit('delete retweet', this.id);
		this.retweeted = false;
		this.applyTweetStatus();
	}
	else{
		var tweetConfirmationPopup = document.getElementById('tweetConfirmationPopup');
		var tweetView = document.getElementById('tweetView');
		var retweetCancelButton = document.getElementById('retweetCancelButton');
		var retweetButton = document.getElementById('retweetButton');
		var tweet = document.getElementsByName('tweet-' + this.id);
		var clone = tweet[0].cloneNode(true);

		tweetView.innerHTML = clone.innerHTML;

		tweetConfirmationPopup.style.display = 'block';

		function removeAllListeners(){
			columnsList.removeEventListener('click', closeRetweetPopup, true);
			retweetCancelButton.removeEventListener('click', closeRetweetPopup, true);
			retweetButton.removeEventListener('click', bindedFunction, true);
		}

		function closeRetweetPopup(e){
			e.stopPropagation();
			e.preventDefault();
			removeAllListeners();
			var popup = document.getElementById('tweetConfirmationPopup');
			popup.style.display = 'none';
		}

		var columnsList = document.getElementById('tweets-columns-list');
		columnsList.addEventListener('click', closeRetweetPopup, true);
		retweetCancelButton.addEventListener('click', closeRetweetPopup, true);

		function sendRetweetCommand(e){
			socket.emit('retweet', this.id);
			this.retweeted = true;
			removeAllListeners();
			console.log('Gonna send retweet with id: ', this.id);
			var popup = document.getElementById('tweetConfirmationPopup');
			popup.style.display = 'none';
			this.applyTweetStatus();
		}

		var bindedFunction = (sendRetweetCommand).bind(this)

		retweetButton.addEventListener('click', bindedFunction, true);

	}
}

/**
 * Apply tweet's status on the display
 */
Message.prototype.applyTweetStatus = function(){
	if(this.retweeted){
		retweetButtons = document.getElementsByName('retweet-' + this.id);
		for (var i = 0; i < retweetButtons.length; i++) {
			retweetButtons[i].removeAttribute("class");
			retweetButtons[i].setAttribute('class', 'tweet-retweet-button-active');
			console.log('Updated concerning retweet');
		};
	}
	else{
		retweetButtons = document.getElementsByName('retweet-' + this.id);
		for (var i = 0; i < retweetButtons.length; i++) {
			retweetButtons[i].removeAttribute("class");
			retweetButtons[i].setAttribute('class', 'tweet-retweet-button');
			console.log('Updated concerning retweet');
		};	
	}
}

/**
 * Update the relative time for every tweet
 * @return {String} Relative time to be displayed
 */
Message.prototype.updateTime = function(test){
	var timeDifference = Date.now() - this.date.getTime();
	timeDifference = timeDifference / 60000;
	timeDifference = Math.trunc(timeDifference);
	var unit = ' min';

	var toBeDisplayed = timeDifference + unit;

	if(timeDifference >= 60){
		timeDifference = timeDifference / 60;
		timeDifference = Math.round(timeDifference);

		if(timeDifference == 1){
			unit = ' hr';
		}
		else {
			unit = ' hrs';
		}

		toBeDisplayed = timeDifference + unit;

		if (timeDifference >= 24) {

			var month = this.date.getMonth();
			month = month < 10 ? '0' + month : month;

			var day = this.date.getDate();
			day = day < 10 ? '0' + day : day;
			
			if(month == 0) {
				var literalMonth = 'Jan';
			}
			else if (month == 1) {
				var literalMonth = 'Feb';
			}
			else if (month == 2) {
				var literalMonth = 'Mar';
			}
			else if (month == 3) {
				var literalMonth = 'Apr';
			}
			else if (month == 4) {
				var literalMonth = 'May';
			}
			else if (month == 5) {
				var literalMonth = 'Jun';
			}
			else if (month == 6) {
				var literalMonth = 'Jul';
			}
			else if (month == 7) {
				var literalMonth = 'Aug';
			}
			else if (month == 8) {
				var literalMonth = 'Sep';
			}
			else if (month == 9) {
				var literalMonth = 'Oct';
			}
			else if (month == 10) {
				var literalMonth = 'Nov';
			}
			else if (month == 11) {
				var literalMonth = 'Dec';
			}
			else {
				var literalMonth = '/' + month;
			}

			toBeDisplayed = day + ' ' + literalMonth;
		};
	}

	if(this.dateHTML != null){
		// console.log('Updated time with ', toBeDisplayed, ' in ', this.dateHTML);
		this.dateHTML.textContent = toBeDisplayed;
	}

	if(test){
		console.log('Being recalled');
	}

	this.displayedDate = toBeDisplayed; 
	//return toBeDisplayed;
}

/**
 * Process the message text
 * @return {[type]} [description]
 */
Message.prototype.processText = function(){

	// Array where to store all URLs of the tweet
	var urls_indices = [];

	// Copy of the original text
	var tweetText = this.text.textContent;

	// Parse all URLs from the Tweet object to be sort in a array
	if(this.urls) {
		for (var i = 0; i < this.urls.length; i++) {
			var urlIndice = {
				expanded_url: this.urls[i].expanded_url, 
				url: this.urls[i].url, 
				indices: this.urls[i].indices,
				media: false
			};
			urls_indices.push(urlIndice);		
		}
	}
	// Parse all media URLs from the Tweet object to be sort in a array
	if(this.medias) {
		for (var i = 0; i < this.medias.length; i++) {
			var urlIndice = {
				expanded_url: this.medias[i].expanded_url, 
				media_url: this.medias[i].media_url_https, 
				url: this.medias[i].url, 
				indices: this.medias[i].indices,
				largeSize: this.medias[i].sizes.large,
				media: true
			};
			urls_indices.push(urlIndice);
		}; 
	}

	if(this.hashtags) {
		for (var i = 0; i < this.hashtags.length; i++) {
			var urlIndice = {
				url: 'https://twitter.com/hashtag/' + this.hashtags[i].text, 
				text: '#' + this.hashtags[i].text, 
				indices: this.hashtags[i].indices,
				hashtag: true
			};
			urls_indices.push(urlIndice);
		}; 
	}

	if(this.user_mentions) {
		for (var i = 0; i < this.user_mentions.length; i++) {
			var urlIndice = {
				url: 'https://twitter.com/' + this.user_mentions[i].screen_name, 
				text: '@' + this.user_mentions[i].screen_name, 
				indices: this.user_mentions[i].indices,
				user_mentions: true
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

	var parsedText = document.createElement('p');
	if(urls_indices[0]){

		for (var i = 0; i < urls_indices.length; i++) {
			var splittedText = tweetText.substring(urls_indices[i].indices[1]) + " ";
		 	var firstPart = document.createTextNode(splittedText);	

			if(urls_indices[i].indices[0] == 139){
				tweetText = tweetText.substring(0, tweetText.lastIndexOf(' ') + 1);
			}
			else{
				tweetText = tweetText.substring(0, urls_indices[i].indices[0]);
			}

			var link = document.createElement('a');
		 	link.setAttribute('target', "_blank");
		 	link.className = 'tweet-url';

		 	if(urls_indices[i].hashtag || urls_indices[i].user_mentions){
			 	link.setAttribute('href', urls_indices[i].url);
			 	link.textContent = urls_indices[i].text;
		 	}
		 	else{
				if(urls_indices[i].expanded_url.length > 35){
					var displayUrl = urls_indices[i].expanded_url.slice(0, 32);
					displayUrl += '...';
				}
				else {
					var displayUrl = urls_indices[i].expanded_url;
				}
			 	link.setAttribute('href', urls_indices[i].expanded_url);
			 	link.textContent = displayUrl;
		 	}

			if(urls_indices[i].media){
				var image = document.createElement('img');
				image.setAttribute('src', urls_indices[i].media_url + ':thumb');
				image.setAttribute('fullsize', urls_indices[i].largeSize.h + '/' + urls_indices[i].largeSize.w);

				if(this.areImagesEnabled){
					image.className = "tweet-image";
			 		link.className = "tweet-link-image-none";
				}
				else{
					image.className = "tweet-image-none";
		 			link.className = "tweet-link-image";
				}

				// Put an event to enlarge the image
		 		image.addEventListener('click', function(){
		 			this.enlargeImage();
		 		}.bind(this), false);

		 		this.image = image;
		 		parsedText.appendChild(image);
			}
		 	
		 	parsedText.insertBefore(firstPart, parsedText.firstChild);
	 		parsedText.insertBefore(link, parsedText.firstChild);

		 	if(i == urls_indices.length - 1){
				splittedText = tweetText.substring(0, urls_indices[i].indices[0]);
		 		var firstPart = document.createTextNode(splittedText);
		 		parsedText.insertBefore(firstPart, parsedText.firstChild);
		 	}
		};
	}
	else {
 		var firstPart = document.createTextNode(tweetText);
 		parsedText.appendChild(firstPart);
	}

	this.text = parsedText;
}

/**
 * Loads a bigger image
 */
Message.prototype.enlargeImage = function(){
	var srcAttribute = this.image.getAttribute('src');
	var src = srcAttribute.substring(0, srcAttribute.lastIndexOf(':'));
	var size = srcAttribute.substring(srcAttribute.lastIndexOf(':'), srcAttribute.length);
	console.log('size: ', size);
	if(size == ':thumb'){
		this.image.setAttribute('src', src + ':medium');
		this.image.className += " tweet-image-extended";
	}
	else if(size == ':medium'){
		var fullsize = this.image.getAttribute('fullsize');
		var height = fullsize.substring(0, fullsize.lastIndexOf('/'));
		var width = fullsize.substring(fullsize.lastIndexOf('/') + 1, fullsize.length);
		var popup = document.getElementById('largeImagePopup');
		var popupImage = document.querySelector('#largeImagePopup img');
		popupImage.setAttribute('src', src + ':large');

		// 20 is added because of the padding of the parent element
		var halfWidth = width / 2 + 20;
		var left = 'calc(50% - ' + halfWidth + 'px)';
		console.log('left: ', left);
		popup.style.left = left;
		var halfHeight = height / 2 + 20;
		var height = 'calc(50% - ' + halfHeight + 'px)';
		console.log('height: ', height);
		popup.style.top = height;
		popup.style.display = 'block';

		function closeImagePopup(e){
			columnsList.removeEventListener('click', closeImagePopup, true);
			e.stopPropagation();
			e.preventDefault();
			var popup = document.getElementById('largeImagePopup');
			popup.style.display = 'none';
		}

		var columnsList = document.getElementById('tweets-columns-list');
		columnsList.addEventListener('click', closeImagePopup, true);

	}	
}
