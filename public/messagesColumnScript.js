/**************************************************************************/
/**                          Messages column                            ***/
/**************************************************************************/


/**
 * MessagesColumn's class
 * @param {String} id               Column ID from social network
 * @param {String} columnHeaderName Column name from social network
 */
function MessagesColumn(id, columnHeaderName){
	this.id = id;
	this.columnHeaderName = columnHeaderName;
	this.buttonOpenOptions = createButtonOpenOptions(id);
	this.columnHTML = null;
	this.columnContentHTML = null;
	this.columnHeaderHTML = null;
	this.limitNumberMessages = 50;

	this.messagesList = [];

	function createButtonOpenOptions(id){
		var button = document.createElement('button');
		button.setAttribute('buttonOptionsId', id);

		return button;
	}

}

/**
 * Add a message to a column
 * @param  {Object} message         Message to be added
 * @return {Object} Added message
 */
MessagesColumn.prototype.addMessage = function(message, streamSource){
	var newMessage = new Message(message.id_str, message.user.screen_name, message.user.name, message.created_at.slice(0, -5), message.text, message.user.profile_image_url, streamSource);
	newMessage.processText(message.entities.urls, message.entities.media);
	this.messagesList.unshift(newMessage);

	// Limit number of messages
	if(this.messagesList.length > this.limitNumberMessages){
		this.messagesList.pop();
	}

	return newMessage;
}

/**
 * Displays all the messages in the column
 */
MessagesColumn.prototype.displayAllMessages = function(){
	this.columnContentHTML.innerHTML = "";
	for (var i = this.messagesList.length -1; i >= 0; i--) {
		var newTweet = this.messagesList[i].generateMessage();

		this.columnContentHTML.appendChild(newTweet);
	};
}

/**
 * Displays one message in the column
 */
MessagesColumn.prototype.displayOneMessage = function(message){
	var newTweet = message.generateMessage();

	this.columnContentHTML.insertBefore(newTweet, this.columnContentHTML.childNodes[0]);

	// Limit number of messages displayed
	if(this.columnContentHTML.childNodes[this.limitNumberMessages]){
		this.columnContentHTML.removeChild(this.columnContentHTML.childNodes[this.limitNumberMessages]);
	}
}


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
function Message(id, authorUsername, authorPseudonym, date, text, profilePicture, streamSource){
	this.id = id;
	this.authorUsername = authorUsername;
	this.authorPseudonym = authorPseudonym;
	this.date = date;
	this.text = text;
	this.profilePicture = profilePicture;
	this.streamSource = streamSource

	this.buttonRetweet = createButtonRetweet(id);

	function createButtonRetweet(id){
		var button = document.createElement('button');
		button.setAttribute('retweetId', id);

		return button;
	}
}

/**
 * Create the HTML elements for the message
 * @param  {Object} message Processed message to be generated
 * @return {Object}         Generated message in HTML
 */
Message.prototype.generateMessage = function(){

	var newTweet = document.createElement('li');

	var newLinkAuthorImg = document.createElement('a');
	newLinkAuthorImg.setAttribute('href', 'http://twitter.com/' + this.authorUsername);
	newLinkAuthorImg.setAttribute('target', '_blank');

	var newImg = document.createElement('img');
	newImg.setAttribute('src', this.profilePicture);
	newImg.setAttribute('class', 'tweet-profile');

	var newDate = document.createElement('span');
	newDate.setAttribute('class', 'tweet-date');
	newDate.textContent = this.date;
	
	var newLinkAuthor = document.createElement('a');
	newLinkAuthor.setAttribute('class', 'tweet-authorname');
	newLinkAuthor.setAttribute('href', 'http://twitter.com/' + this.authorUsername);
	newLinkAuthor.setAttribute('target', '_blank');
	newLinkAuthor.textContent = this.authorPseudonym;

	var newContent = document.createElement('p');
	newContent.setAttribute('class', 'tweet-text');
	newContent.innerHTML = this.text;

	newLinkAuthorImg.appendChild(newImg);
	newTweet.appendChild(newLinkAuthorImg);
	newTweet.appendChild(newDate);
	newTweet.appendChild(newLinkAuthor);
	newTweet.appendChild(newContent);

	return newTweet;
}

/**
 * Process the message text
 * @return {[type]} [description]
 */
Message.prototype.processText = function(urls, medias){

	// Array where to store all URLs of the tweet
	var urls_indices = [];

	// Copy of the original text
	var tweetText = this.text;

	// Parse all URLs from the Tweet object to be sort in a array
	if(urls) {
		for (var i = 0; i < urls.length; i++) {
			urlIndice = {
				expanded_url: urls[i].expanded_url, 
				url: urls[i].url, 
				indices: urls[i].indices
			};
			urls_indices.push(urlIndice);
		}
	}
	// Parse all media URLs from the Tweet object to be sort in a array
	if(medias) {
		for (var i = 0; i < medias.length; i++) {
			urlIndice = {
				expanded_url: medias[i].expanded_url, 
				url: medias[i].url, 
				indices: medias[i].indices
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

 	this.text =  newTweetText;
}
