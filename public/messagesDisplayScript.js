/**
 * Displays the social network messages 
 */

/**************************************************************************/
/**                          Messages display                           ***/
/**************************************************************************/

/**
 * MessageDisplay's class
 * @param {Object} columnsListHTML   Reference to the HTML container for all the columns
 */
function MessagesDisplay(columnsListHTML){
	this.messagesColumnsList = [];
	this.messagesColumnsHTML = columnsListHTML;

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
	this.messagesColumnsHTML.innerHTML = "";

	for (var i = 0; i < this.messagesColumnsList.length; i++) {
		var newTweetColumn = this.messagesColumnsList[i].generateColumn();

		this.messagesColumnsHTML.appendChild(newTweetColumn);
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
 * Communicate one message adding command to the concerning column
 * @param  {Object} message     Message to be added
 * @return {Object} newMessage  Added message
 */
MessagesDisplay.prototype.addOneMessage = function(message, streamSource){
	for (var i = 0; i < this.messagesColumnsList.length; i++) {
		if(this.messagesColumnsList[i].id == streamSource){
			var newMessage = this.messagesColumnsList[i].addMessage(message, streamSource);
			return newMessage;
		}
	};
}

/**
 * Communicate all messages adding command to the concerning column
 * @param  {Object} message     Message to be added
 * @return {Object} newMessage  Added message
 */
MessagesDisplay.prototype.addAllMessages = function(allMessages, list){
	for (var i = 0; i < this.messagesColumnsList.length; i++) {
		if(this.messagesColumnsList[i].id == list){
			// Reset the messages list before adding new ones
			this.messagesColumnsList[i].messagesList = [];
			for (var y = 0; y < allMessages.length; y++) {
				this.messagesColumnsList[i].addMessage(allMessages[y], allMessages);
			}
			return {streamSource: this.messagesColumnsList[i].id};
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