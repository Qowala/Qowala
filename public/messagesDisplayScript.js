/**
 * Displays the social network messages 
 */

/**
 * MessageDisplay's class
 */
function MessagesDisplay(columnsListHTML){
	this.messagesColumnsList = [];
	this.messagesColumnsHTML = columnsListHTML;

}

/**
 * MessagesColumn's class
 * @param {[type]} id               [description]
 * @param {[type]} columnHeaderName [description]
 */
function MessagesColumn(id, columnHeaderName){
	this.id = id;
	this.columnHeaderName = columnHeaderName;
	this.buttonOpenOptions = createButtonOpenOptions(id);
	this.columnHTML = null;
	this.columnContentHTML = null;
	this.columnHeaderHTML = null;

	this.messagesList = [];

	function createButtonOpenOptions(id){
		var button = document.createElement('button');
		button.setAttribute('buttonOptionsId', id);

		return button;
	}

}

/**
 * Message's class
 * @param {[type]} id              [description]
 * @param {[type]} authorUsername  [description]
 * @param {[type]} authorPseudonym [description]
 * @param {[type]} date            [description]
 * @param {[type]} text            [description]
 * @param {[type]} profilePicture  [description]
 */
function Message(id, authorUsername, authorPseudonym, date, text, profilePicture){
	this.id = id;
	this.authorUsername = authorUsername;
	this.authorPseudonym = authorPseudonym;
	this.date = date;
	this.text = text;
	this.profilePicture = profilePicture;

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
 * @param {[type]} message [description]
 */
MessagesDisplay.prototype.addMessage = function(message){
	console.log('In MessagesDisplay for adding message');
	for (var i = 0; i < this.messagesColumnsList.length; i++) {
		if(this.messagesColumnsList[i].id == message.streamSource){
			this.messagesColumnsList[i].addMessage(message);
		}
	};
}

MessagesDisplay.prototype.displayMessages = function(message){
	console.log('In MessagesDisplay for displaying message');
	for (var i = 0; i < this.messagesColumnsList.length; i++) {
		if(this.messagesColumnsList[i].id == message.streamSource){
			this.messagesColumnsList[i].displayMessages();
		}
	};
}



/**
 * Add a message to a column
 * @param {[type]} id              [description]
 * @param {[type]} authorUsername  [description]
 * @param {[type]} authorPseudonym [description]
 * @param {[type]} date            [description]
 * @param {[type]} text            [description]
 * @param {[type]} profilePicture  [description]
 */
MessagesColumn.prototype.addMessage = function(message){
	var newMessage = new Message(message.id, message.tweet.user.screen_name, message.tweet.user.name, message.tweet.created_at.slice(0, -5), message.tweet.text, message.tweet.user.profile_image_url);
	this.messagesList.push(newMessage);
	console.log('Pushed: ', newMessage);
}

/**
 * Displays the messages in the column
 * @return {[type]} [description]
 */
MessagesColumn.prototype.displayMessages = function(){
	console.log('In MessagesColumn to display messages');
	console.log('messagesList: ', this.messagesList);
	this.columnContentHTML.innerHTML = "";
	for (var i = this.messagesList.length -1; i >= 0; i--) {

			var newTweet = document.createElement('li');

			var newLinkAuthorImg = document.createElement('a');
			newLinkAuthorImg.setAttribute('href', 'http://twitter.com/' + this.messagesList[i].authorUsername);
			newLinkAuthorImg.setAttribute('target', '_blank');

			var newImg = document.createElement('img');
			newImg.setAttribute('src', this.messagesList[i].profilePicture);
			newImg.setAttribute('class', 'tweet-profile');

			var newDate = document.createElement('span');
			newDate.setAttribute('class', 'tweet-date');
			newDate.textContent = this.messagesList[i].date;
			
			var newLinkAuthor = document.createElement('a');
			newLinkAuthor.setAttribute('class', 'tweet-authorname');
			newLinkAuthor.setAttribute('href', 'http://twitter.com/' + this.messagesList[i].authorUsername);
			newLinkAuthor.setAttribute('target', '_blank');
			newLinkAuthor.textContent = this.messagesList[i].authorPseudonym;

			var newContent = document.createElement('p');
			newContent.setAttribute('class', 'tweet-text');
			newContent.textContent = this.messagesList[i].text;

			newLinkAuthorImg.appendChild(newImg);
			newTweet.appendChild(newLinkAuthorImg);
			newTweet.appendChild(newDate);
			newTweet.appendChild(newLinkAuthor);
			newTweet.appendChild(newContent);

			this.columnContentHTML.appendChild(newTweet);
	};
}
