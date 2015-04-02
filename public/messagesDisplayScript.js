/**
 * Displays the social network messages 
 */

/**
 * MessageDisplay's class
 * @param {Object} columnsListHTML   Reference to the HTML container for all the columns
 */
function MessagesDisplay(columnsListHTML){
	this.messagesColumnsList = [];
	this.messagesColumnsHTML = columnsListHTML;

}

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
 * Add a column to the columns list
 * @param {String} id               Slug of the column's name
 * @param {String} columnHeaderName Column's name
 */
MessagesDisplay.prototype.addColumn = function(id, columnHeaderName){
	var column = new MessagesColumn(id, columnHeaderName);
	console.log('Created: ', column);
	this.messagesColumnsList.push(column);
}

/**
 * Display the columns listed in the columns list
 */
MessagesDisplay.prototype.displayColumns = function(){
	for (var i = 0; i < this.messagesColumnsList.length; i++) {
			var newTweetColumn = document.createElement('li');
			newTweetColumn.setAttribute('class', 'tweets-column');
			newTweetColumn.setAttribute('id', 'tweets-column-' + this.messagesColumnsList[i].id);

			var newTweetColumnHeader = document.createElement('h3');
			newTweetColumnHeader.setAttribute('class', 'tweets-column-header');
			newTweetColumnHeader.setAttribute('id', 'tweets-column-header-' + this.messagesColumnsList[i].id);
			newTweetColumnHeader.textContent = this.messagesColumnsList[i].columnHeaderName;
			
			var newTweetColumnTweets = document.createElement('ul');
			newTweetColumnTweets.setAttribute('class', 'tweets');
			newTweetColumnTweets.setAttribute('id', 'tweets-' + this.messagesColumnsList[i].id);

			newTweetColumn.appendChild(newTweetColumnHeader);
			newTweetColumn.appendChild(newTweetColumnTweets);

			this.messagesColumnsHTML.appendChild(newTweetColumn);
			this.messagesColumnsList[i].columnHTML = newTweetColumn;
			this.messagesColumnsList[i].columnContentHTML = newTweetColumnTweets;
			this.messagesColumnsList[i].columnHeaderHTML = newTweetColumnHeader;
	};
}

/**
 * Returns the columns list
 * @return {Object} Column's list
 */
MessagesDisplay.prototype.getColumnList = function(){
	return this.messagesColumnsList;
}

/**
 * [addMessage description]
 * @param  {Object} message     Message to be added
 * @return {Object} newMessage  Added message
 */
MessagesDisplay.prototype.addMessage = function(message){
	for (var i = 0; i < this.messagesColumnsList.length; i++) {
		if(this.messagesColumnsList[i].id == message.streamSource){
			var newMessage = this.messagesColumnsList[i].addMessage(message);
			return newMessage;
		}
	};
}

/**
 * Communicate all messages display command to the concerning column
 * @param  {Object} message Message to be added
 */
MessagesDisplay.prototype.displayAllMessages = function(message){
	for (var i = 0; i < this.messagesColumnsList.length; i++) {
		if(this.messagesColumnsList[i].id == message.streamSource){
			this.messagesColumnsList[i].displayAllMessages();
		}
	};
}

/**
 * Communicate one message display command to the concerning column
 * @param  {Object} message Message to be added
 */
MessagesDisplay.prototype.displayOneMessage = function(message){
	for (var i = 0; i < this.messagesColumnsList.length; i++) {
		if(this.messagesColumnsList[i].id == message.streamSource){
			this.messagesColumnsList[i].displayOneMessage(message);
		}
	};
}

/**
 * Add a message to a column
 * @param  {Object} message         Message to be added
 * @return {Object} Added message
 */
MessagesColumn.prototype.addMessage = function(message){
	var newMessage = new Message(message.tweet.id_str, message.tweet.user.screen_name, message.tweet.user.name, message.tweet.created_at.slice(0, -5), message.tweet.text, message.tweet.user.profile_image_url, message.streamSource);
	this.messagesList.push(newMessage);
	console.log('Pushed: ', newMessage);

	// Limit number of messages
	if(this.messagesList == this.limitNumberMessages){
		var i = this.limitNumberMessages;
		while(i--) { 
			if(this.messagesList[i]){
				this.messagesList[i+1] = this.messagesList[i];
			}
		 }
	}

	return newMessage;
}

/**
 * Displays all the messages in the column
 */
MessagesColumn.prototype.displayAllMessages = function(){
	this.columnContentHTML.innerHTML = "";
	for (var i = this.messagesList.length -1; i >= 0; i--) {
		var newTweet = this.generateMessage(this.messagesList[i]);

		this.columnContentHTML.appendChild(newTweet);
	};
}

/**
 * Displays one message in the column
 */
MessagesColumn.prototype.displayOneMessage = function(message){
	var newTweet = this.generateMessage(message);

	this.columnContentHTML.insertBefore(newTweet, this.columnContentHTML.childNodes[0]);

	// Limit number of messages displayed
	if(this.columnContentHTML.childNodes[this.limitNumberMessages]){
		this.columnContentHTML.removeChild(this.columnContentHTML.childNodes[this.limitNumberMessages]);
	}
}

/**
 * Create the HTML elements for the message
 * @param  {Object} message Processed message to be generated
 * @return {Object}         Generated message in HTML
 */
MessagesColumn.prototype.generateMessage = function(message){

	var newTweet = document.createElement('li');

	var newLinkAuthorImg = document.createElement('a');
	newLinkAuthorImg.setAttribute('href', 'http://twitter.com/' + message.authorUsername);
	newLinkAuthorImg.setAttribute('target', '_blank');

	var newImg = document.createElement('img');
	newImg.setAttribute('src', message.profilePicture);
	newImg.setAttribute('class', 'tweet-profile');

	var newDate = document.createElement('span');
	newDate.setAttribute('class', 'tweet-date');
	newDate.textContent = message.date;
	
	var newLinkAuthor = document.createElement('a');
	newLinkAuthor.setAttribute('class', 'tweet-authorname');
	newLinkAuthor.setAttribute('href', 'http://twitter.com/' + message.authorUsername);
	newLinkAuthor.setAttribute('target', '_blank');
	newLinkAuthor.textContent = message.authorPseudonym;

	var newContent = document.createElement('p');
	newContent.setAttribute('class', 'tweet-text');
	newContent.textContent = message.text;

	newLinkAuthorImg.appendChild(newImg);
	newTweet.appendChild(newLinkAuthorImg);
	newTweet.appendChild(newDate);
	newTweet.appendChild(newLinkAuthor);
	newTweet.appendChild(newContent);

	return newTweet;
}
