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
	this.columnCreator = null;
	this.columnsId = 0;
	this.messagesColumnsList = [];
	this.messagesColumnsHTML = columnsListHTML;
	this.twitterLists = [];
	this.columnsLayout = [];
	this.enabledTagsList = [];
	this.enabledListsList = [];
	this.availableLists = [];
}

/**
 * Update the twitter lists
 * @param  {Object} listsObject Object of lists
 */
MessagesDisplay.prototype.storeTwitterLists = function(listsObject){
	for (var i = 0; i < listsObject.length; i++) {
		var listFound = false;
		for (var y = 0; y < this.twitterLists.length; y++) {
			if(this.twitterLists[y].slug == listsObject[i].slug){
				listFound = true;
			}
		};
		if(!listFound){
			this.twitterLists.push(
				{
					id: listsObject[i].id_str,
					slug: listsObject[i].slug,
					name: listsObject[i].name,
					exist: false
				}
			);
		}
	};

	Array.prototype.diff = function(a) {
	    return this.filter(function(array) {
	    		var exist = false;
	    		for (var i = 0; i < a.length; i++) {
	    			if(array.id === a[i].id){
	    				exist = true;
	    			}
	    		};
	    		if(!exist){
	    			return array;
	    		}
	    });
	};

	this.availableLists = this.twitterLists.diff(this.enabledListsList);

	for (var i = 0; i < this.messagesColumnsList.length; i++) {
		this.messagesColumnsList[i].updateAvailableLists(this.availableLists);
		console.log('updating twitterLists to ', this.messagesColumnsList[i]);
	};	
}

/**
 * Stores the column's layout
 * @param  {Object} columnsLayout Column's layout
 */
MessagesDisplay.prototype.storeColumnsLayout = function(columnsLayout){
	this.columnsLayout = columnsLayout;
}

/**
 * Stores the column's layout
 * @param  {Object} columnsLayout Column's layout
 */
MessagesDisplay.prototype.storeEnabledLists = function(enabledListsList){
	this.enabledListsList = enabledListsList;
	for (var i = 0; i < this.enabledListsList.length; i++) {
		this.addUsedListToTwitterLists(this.enabledListsList[i].slug);
	};
}

/**
 * Regenerate columns from column's layout
 */
MessagesDisplay.prototype.addAllColumns = function(){
	this.messagesColumnsHTML.innerHTML = "";

	this.createUserColumn();
	this.createColumnCreator();
	
	for (var i = 0; i < this.columnsLayout.length; i++) {
		if(this.columnsLayout[i].type != 'home'){
			this.columnsId++;
			var column = new MessagesColumn(this.columnsLayout[i].id , this.columnsLayout[i].name, this);
			this.messagesColumnsList.push(column);
			column.updateAvailableLists(this.availableLists);
			var generatedColumn = column.generateColumn();

			console.log('Created: ', column);

			this.messagesColumnsHTML.insertBefore(generatedColumn, this.messagesColumnsHTML.lastChild);
		}
	};

}

/**
 * Update the lists if one is already used
 * @param {String} id List ID
 */
MessagesDisplay.prototype.addUsedListToTwitterLists = function(id){
	for (var i = 0; i < this.twitterLists.length; i++) {
		if(this.twitterLists[i].slug == id){
			this.twitterLists[i].exist = true;
		}
	};
	for (var i = 0; i < this.messagesColumnsList.length; i++) {
		this.messagesColumnsList[i].updateAvailableLists(this.availableLists);
	};	

}

MessagesDisplay.prototype.useList = function(columnId, slug){
	for (var i = 0; i < this.twitterLists.length; i++) {
		if(this.twitterLists[i].slug == slug){
			this.twitterLists[i].exist = true;
			this.enabledListsList.push({
				id: this.twitterLists[i].id, 
				columnId: columnId,
				slug: this.twitterLists[i].slug
			});
			this.columnsLayout.push({
				id: columnId,
				name: this.twitterLists[i].name,
				type: 'list'
			});
		}
	};
	for (var i = 0; i < this.availableLists.length; i++) {
		if(this.availableLists[i].slug === slug){
			this.availableLists.splice(i, 1);
		}
	};

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
		var messageToDisplay = this.addOneMessage(incoming.tweet, incoming.streamSource);
		if(messageToDisplay != undefined){
			this.displayOneMessage(messageToDisplay);
		}		
	}
	else if(incoming.streamSource === 'lists'){
		console.log('Got message from lists');
		for (var list in incoming.tweet) {
			// console.log('Searching ', list, ' in ', this.enabledListsList);
			for (var i = 0; i < this.enabledListsList.length; i++) {
				if(this.enabledListsList[i].id == list){
					var messagesToDisplay = this.addAllMessages(incoming.tweet[list], this.enabledListsList[i].columnId);
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
	var column = new MessagesColumn(this.columnsId , 'New column', this);
	this.messagesColumnsList.push(column);
	console.log('this.twitterLists : ', this.twitterLists);
	column.updateAvailableLists(this.availableLists);
	var generatedColumn = column.generateColumn();

	console.log('Created: ', column);

	this.hideColumnCreator(); 
	this.messagesColumnsHTML.insertBefore(generatedColumn, this.messagesColumnsHTML.lastChild);
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

		console.log('Created: ', column);

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

	this.messagesColumnsHTML.insertBefore(generatedColumn, this.messagesColumnsHTML.lastChild);
}

/**
 * Creates the button to add new columns
 */
MessagesDisplay.prototype.createColumnCreator = function(){
	var column = document.createElement('li');
	column.className = 'tweets-column';
	column.setAttribute('id', 'plusColumn');

	var button = document.createElement('button');
	button.setAttribute('id', 'plusColumnButton');

	var stack = document.createElement('span');
	stack.className = 'fa-stack fa-lg';

	var firstIcon = document.createElement('i');
	firstIcon.className = 'fa fa-circle fa-stack-2x';

	var secondIcon = document.createElement('i');
	secondIcon.className = 'fa fa-plus fa-stack-1x';

	stack.appendChild(firstIcon);
	stack.appendChild(secondIcon);

	button.appendChild(stack);

	button.addEventListener('click', function(e){
			this.createBlankColumn();
	}.bind(this));

	column.appendChild(button);
	this.messagesColumnsHTML.appendChild(column);

	this.columnCreator = column;

}

/**
 * Displays the column creator
 * @return {[type]} [description]
 */
MessagesDisplay.prototype.displayColumnCreator = function(){
	this.columnCreator.style.display = 'block';
}
/**
 * Hides the column creator
 * @return {[type]} [description]
 */
MessagesDisplay.prototype.hideColumnCreator = function(){
	this.columnCreator.style.display = 'none';
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
			console.log('Found and gonna reset and display messages');
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
	for (var i = 0; i < this.enabledListsList.length; i++) {
		for (var y = 0; y < this.twitterLists.length; y++) {
			if(this.enabledListsList[i].slug === this.twitterLists[y].slug){
				var alreadyExist = false;
				for (var z = 0; z < listsToRequest.length; z++) {
					if(listsToRequest[z].slug === this.enabledListsList[i].slug){
						alreadyExist = true;
					}
				}
				if(!alreadyExist){
					listsToRequest.push({
						id: this.twitterLists[y].id,
						slug: this.twitterLists[y].slug,
						columnId: this.enabledListsList[i].columnId
					});
				}
			}
		};
	};
	socket.emit('update lists request', listsToRequest);
	console.log('emitting ', listsToRequest);
}

/**
 * Sends to the server the column's layout to be saved
 */
MessagesDisplay.prototype.updateColumnsLayout = function(){
	socket.emit('update columns layout', this.columnsLayout);
}