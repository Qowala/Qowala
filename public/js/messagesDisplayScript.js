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
	this.columnsId = 0;
	this.messagesColumnsList = [];
	this.messagesColumnsHTML = columnsListHTML;
	this.twitterLists = [];
	this.columnsLayout = [];
	this.enabledTagsList = [];
}

/**
 * Update the twitter lists
 * @param  {Object} listsObject Object of lists
 */
MessagesDisplay.prototype.storeTwitterLists = function(listsObject){
	this.twitterLists = listsObject;
}

/**
 * Update columns with available Twitter lists
 * @return {Array} available Twitter lists
 */
MessagesDisplay.prototype.updateColumnsTwitterLists = function(){
	var availableLists = [];

	Array.prototype.diff = function(a) {
	    return this.filter(function(array) {
	    		var exist = false;
	    		for (var i = 0; i < a.length; i++) {
	    			if(array.id === a[i].listId){
	    				exist = true;
	    			}
	    		};
	    		if(!exist){
	    			return array;
	    		}
	    });
	};

	availableLists = this.twitterLists.diff(this.columnsLayout);

	for (var i = 0; i < this.messagesColumnsList.length; i++) {
		this.messagesColumnsList[i].updateTwitterLists(availableLists);
		// console.log('updating twitterLists to ', this.messagesColumnsList[i]);
	};	

	return availableLists;
}

/**
 * Stores the column's layout
 * @param  {Object} columnsLayout Column's layout
 */
MessagesDisplay.prototype.storeColumnsLayout = function(columnsLayout){
	this.columnsLayout = columnsLayout;
}

/**
 * Regenerate columns from column's layout
 */
MessagesDisplay.prototype.addAllColumns = function(){
	this.messagesColumnsHTML.innerHTML = "";

	this.createUserColumn();
	
	for (var i = 0; i < this.columnsLayout.length; i++) {
		if(this.columnsLayout[i].type != 'home'){
			this.columnsId++;
			var column = new MessagesColumn(this.columnsLayout[i].id , 
											this.columnsLayout[i].name, 
											this.columnsLayout[i].type, 
											this);
			this.messagesColumnsList.push(column);
			column.updateTwitterLists(this.twitterLists);
			column.updateHashtagsList(this.columnsLayout[i].hashtags);
			var generatedColumn = column.generateColumn();

			// console.log('Created: ', column);

			this.messagesColumnsHTML.appendChild(generatedColumn);
		}
	};
}

/**
 * Use a list and affect it to a column if mentionned
 * @param  {[type]} columnId      [description]
 * @param  {[type]} twitterListId [description]
 * @return {[type]}               [description]
 */
MessagesDisplay.prototype.useList = function(twitterListId, columnId){
	loop:
	for (var i = 0; i < this.twitterLists.length; i++) {
		if(this.twitterLists[i].id == twitterListId){
			if(columnId){
				for (var y = 0; y < this.columnsLayout.length; y++) {
					if(this.columnsLayout[y].id === columnId){
						this.columnsLayout[y].name = this.twitterLists[i].name;
						this.columnsLayout[y].type = 'list';
						this.columnsLayout[y].listId = twitterListId;
						this.columnsLayout[y].hashtags = []
						for (var z = 0; z < this.messagesColumnsList.length; z++) {
							if(this.messagesColumnsList[z].id === columnId){
								this.messagesColumnsList[z].type = 'list';
								this.messagesColumnsList[z].updateHashtagsList(this.columnsLayout[y].hashtags);
							}
						};
						break loop;
					}
				};
				this.columnsLayout.push({
					id: columnId,
					name: this.twitterLists[i].name,
					type: 'list',
					listId: twitterListId,
					hashtags: []
				});
			}
		}
	};

	this.updateListsToDisplay();
	this.updateColumnsLayout();
	this.updateColumnsTwitterLists();
}

MessagesDisplay.prototype.useHashtag = function(columnId, hashtag){
	var exist = false
	var hashtagsArray = [];
	for (var y = 0; y < this.columnsLayout.length; y++) {
		if(this.columnsLayout[y].id === columnId){
			this.columnsLayout[y].name = '#' + hashtag;
			this.columnsLayout[y].type = 'tracking';
			this.columnsLayout[y].listId = null;
			this.columnsLayout[y].hashtags.push(hashtag);
			exist = true;
			hashtagsArray = this.columnsLayout[y].hashtags;
		}
	};
	if(!exist){
		this.columnsLayout.push({
			id: columnId,
			name: '#' + hashtag,
			type: 'tracking',
			hashtags: [hashtag]
		});
		hashtagsArray = this.columnsLayout[y].hashtags;
	}

	for (var i = 0; i < this.messagesColumnsList.length; i++) {
		if(this.messagesColumnsList[i].id === columnId){
			this.messagesColumnsList[i].changeName('#' + hashtag);
			this.messagesColumnsList[i].type = 'tracking';
			this.messagesColumnsList[i].updateHashtagsList(hashtagsArray);
		}
	};

	// console.log('Setting up the column as hashtag');
	this.updateListsToDisplay();
	this.updateColumnsLayout();
	this.updateColumnsTwitterLists();
	this.updateTagsToDisplay();
}

/**
 * Add hashtag to track
 * @param {[type]} columnId [description]
 * @param {[type]} hashtag  [description]
 */
MessagesDisplay.prototype.addHashtag = function(columnId, hashtag){

	var hashtagsArray = [];
	loop:
	for (var y = 0; y < this.columnsLayout.length; y++) {
		if(this.columnsLayout[y].id === columnId){
			for (var i = 0; i < this.columnsLayout[y].hashtags.length; i++) {
				if(this.columnsLayout[y].hashtags[i] == hashtag){
					break loop;
				}
			};
			this.columnsLayout[y].hashtags.push(hashtag);
			hashtagsArray = this.columnsLayout[y].hashtags;
		}
	};

	for (var i = 0; i < this.messagesColumnsList.length; i++) {
		if(this.messagesColumnsList[i].id === columnId){
			this.messagesColumnsList[i].updateHashtagsList(hashtagsArray);
		}
	};
	// console.log('Updating the column hashtag after adding');
	this.updateColumnsLayout();
	this.updateTagsToDisplay();
}

/**
 * Remove hashtag to track
 * @param  {[type]} columnId [description]
 * @param  {[type]} hashtag  [description]
 * @return {[type]}          [description]
 */
MessagesDisplay.prototype.removeHashtag = function(columnId, hashtag){
	var hashtagsArray = [];
	for (var y = 0; y < this.columnsLayout.length; y++) {
		if(this.columnsLayout[y].id === columnId){
			if(this.columnsLayout[y].hashtags.indexOf(hashtag)){
				this.columnsLayout[y].hashtags.splice(this.columnsLayout[y].hashtags.indexOf(hashtag), 1);
				hashtagsArray = this.columnsLayout[y].hashtags;
				// console.log('Updating the column hashtag after removing');
				this.updateColumnsLayout();
				this.updateTagsToDisplay();
				for (var y = 0; y < this.messagesColumnsList.length; y++) {
					if(this.messagesColumnsList[y].id === columnId){
						this.messagesColumnsList[y].updateHashtagsList(hashtagsArray);
					}
				};
			}
		}
	};

}

/**
 * Unuse a list
 * @param  {String} columnId Column's id
 * @param  {String} slug     List's slug
 */
MessagesDisplay.prototype.deleteColumn = function(columnId){
	for (var y = 0; y < this.columnsLayout.length; y++) {
		if(this.columnsLayout[y].id === columnId){
			this.columnsLayout.splice(y, 1);
		}
	};

	for (var y = 0; y < this.messagesColumnsList.length; y++) {
		if(this.messagesColumnsList[y].id === columnId){
			this.messagesColumnsList.splice(y, 1);
			var columnToRemove = document.getElementById('tweets-column-' + columnId);
			this.messagesColumnsHTML.removeChild(columnToRemove);
		}
	};

	this.updateListsToDisplay();
	this.updateColumnsLayout();
	this.updateColumnsTwitterLists();
	this.updateTagsToDisplay();

	console.log('Column ' + columnId + ' deleted from columnsLayout: ', this.columnsLayout);
}

/**
 * Process incoming message and directs to the corresponding logic
 * @param  {Object} incoming [description]
 * @return {[type]}          [description]
 */
MessagesDisplay.prototype.processIncoming = function(incoming){
	if(incoming.streamSource === 'user' ){
		var messageToDisplay = this.addOneMessage(incoming.tweet, 'home');
		if(messageToDisplay != undefined){
			this.displayOneMessage(messageToDisplay);
		}
	}
	else if(incoming.streamSource === 'tracking'){
		for (var i = 0; i < this.columnsLayout.length; i++) {
			if(this.columnsLayout[i].type === 'tracking'){
				for (var y = 0; y < this.columnsLayout[i].hashtags.length; y++) {
					for (var z = 0; z < incoming.updatedTags.length; z++) {
						if(this.columnsLayout[i].hashtags[y] == incoming.updatedTags[z]){
							var messageToDisplay = this.addOneMessage(incoming.tweet, this.columnsLayout[i].id);
							if(messageToDisplay != undefined){
								this.displayOneMessage(messageToDisplay);
							}		
						}
					};
				};
				
			}
		};
	}
	else if(incoming.streamSource === 'lists'){
		// console.log('Got message from lists');
		for (var list in incoming.tweet) {
			// console.log('Searching ', list, ' in ', this.columnsLayout);
			for (var i = 0; i < this.columnsLayout.length; i++) {
				if(this.columnsLayout[i].listId == list){
					var messagesToDisplay = this.addAllMessages(incoming.tweet[list], this.columnsLayout[i].id);
					if(messagesToDisplay != undefined){
						this.displayAllMessages(messagesToDisplay);
					}
				}
			}
		}
	}
}

/**
 * Create a blank column
 */
MessagesDisplay.prototype.createBlankColumn = function(){
	this.columnsId++;
	for (var i = 0; i < this.columnsLayout.length; i++) {
		while(this.columnsLayout[i].id === this.columnsId){
			this.columnsId++;
		}
	};
	var column = new MessagesColumn(this.columnsId , 
									'New column', 
									'None', 
									this);
	this.messagesColumnsList.push(column);
	this.updateColumnsTwitterLists();
	var generatedColumn = column.generateColumn();

	// console.log('Created: ', column);

	this.messagesColumnsHTML.appendChild(generatedColumn);
}

/**
 * Add a column to the columns list
 * @param {String} id               Slug of the column's name
 * @param {String} columnHeaderName Column's name
 */
MessagesDisplay.prototype.createUserColumn = function(){
	this.columnsId++;
	var columnHeaderName = 'Home';
	var type = 'home';


	var alreadyExist = false;
	for (var i = 0; i < this.columnsLayout.length; i++) {
		if(this.columnsLayout[i].type === type){
			alreadyExist = true;
		}
	};

	if(!alreadyExist){
		var column = new MessagesColumn(type, columnHeaderName, this);

		// console.log('Created: ', column);

		this.messagesColumnsList.push(column);
		this.columnsLayout.push({
			id: column.id,
			name: columnHeaderName,
			type: type
		});
	}
	else{
		for (var i = 0; i < this.messagesColumnsList.length; i++) {
			if(this.messagesColumnsList[i].type = type){
				var column = this.messagesColumnsList[i];
			}
		};
	}

	var generatedColumn = column.generateColumn();

	this.messagesColumnsHTML.insertBefore(generatedColumn, this.messagesColumnsHTML.firstChild);
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

	this.createColumnCreator();
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
MessagesDisplay.prototype.addOneMessage = function(message, streamDestination){
	for (var i = 0; i < this.messagesColumnsList.length; i++) {
		if(this.messagesColumnsList[i].id == streamDestination){
			var newMessage = this.messagesColumnsList[i].addMessage(message, streamDestination);
			return newMessage;
		}
	};
}

/**
 * Communicate all messages adding command to the concerning column
 * @param  {Object} message     Message to be added
 * @return {Object} newMessage  Added message
 */
MessagesDisplay.prototype.addAllMessages = function(allMessages, id){
	// console.log('Searching', id, ' in this.messagesColumnsList ', this.messagesColumnsList);
	for (var y = 0; y < this.messagesColumnsList.length; y++) {
		if(this.messagesColumnsList[y].id === id){
			// console.log('Found and gonna reset and display messages');
			// Reset the messages list before adding new ones
			this.messagesColumnsList[y].messagesList = [];
			for (var z = 0; z < allMessages.length; z++) {
				this.messagesColumnsList[y].addMessage(allMessages[z], allMessages);
			}
			return {streamSource: this.messagesColumnsList[y].id};
		}
	}
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

/**
 * Gives the message to be deleted to the concerned column
 * @param  {Object} message Message to be deleted
 */
MessagesDisplay.prototype.deleteMessage = function(message){
	for (var i = 0; i < this.messagesColumnsList.length; i++) {
		if(this.messagesColumnsList[i].id == message.streamSource){
			this.messagesColumnsList[i].deleteMessage(message);
		}
	};
}

/**
 * Sends to server the all the lists to be requested
 */
MessagesDisplay.prototype.updateListsToDisplay = function(){
	var listsToRequest = [];

	for (var i = 0; i < this.columnsLayout.length; i++) {
		if(this.columnsLayout[i].type === 'list'){
			for (var y = 0; y < this.twitterLists.length; y++) {
				if(this.columnsLayout[i].listId === this.twitterLists[y].id){
					listsToRequest.push({id: this.twitterLists[y].id});
				}
			};
		}
	};
	socket.emit('update lists request', listsToRequest);
	// console.log('emitting ', listsToRequest);
	return listsToRequest;
}

/**
 * Sends to server the all the tags to be requested
 */
MessagesDisplay.prototype.updateTagsToDisplay = function(){
	var tagsToRequest = [];

	for (var i = 0; i < this.columnsLayout.length; i++) {
		if(this.columnsLayout[i].type === 'tracking'){
			for (var y = 0; y < this.columnsLayout[i].hashtags.length; y++) {
				tagsToRequest.push(this.columnsLayout[i].hashtags[y]);
			};
		}
	};
	socket.emit('update tags request', tagsToRequest);
	// console.log('emitting ', tagsToRequest);
	return tagsToRequest;
}

/**
 * Sends to the server the column's layout to be saved
 */
MessagesDisplay.prototype.updateColumnsLayout = function(){
	socket.emit('update columns layout', this.columnsLayout);
}