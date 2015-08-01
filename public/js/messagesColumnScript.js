/**************************************************************************/
/**                          Messages column                            ***/
/**************************************************************************/


/**
 * MessagesColumn's class
 * @param {String} id               Column ID from social network
 * @param {String} columnHeaderName Column name from social network
 */
function MessagesColumn(id, columnHeaderName, type, MessagesDisplay){
	this.id = id;
	this.twitterLists = [];
	this.hashtagsList = [];
	this.MessagesDisplay = MessagesDisplay;
	this.type = type;

	this.columnHeaderName = columnHeaderName;
	this.columnHTML = null;
	this.columnContentHTML = null;
	this.columnHeaderHTML = null;
	this.limitNumberMessages = 50;
	this.buttonOpenOptions = null;
	this.panel = null;
	this.isPanelOpen = false;
	this.areImagesEnabled = true;
	this.imagesCheckbox = null;
	this.isListsOpen = true;
	this.twitterListsDOM = null;
	this.hashtagsBlock = null;
	this.hashtagTrackInput = null;

	this.messagesList = [];
}

/**
 * [updateTwitterLists description]
 * @param  {[type]} listsObject [description]
 * @return {[type]}             [description]
 */
MessagesColumn.prototype.updateTwitterLists = function(listsObject){
	this.twitterLists = listsObject;

	this.generateColumnTwitterLists();
}

/**
 * [updateHasgtagsList description]
 * @param  {[type]} listsObject [description]
 * @return {[type]}             [description]
 */
MessagesColumn.prototype.updateHashtagsList = function(listsObject){
	this.hashtagsList = listsObject;

	this.generateHashtagsList();
}

/**
 * Generate column
 * @return {Object} generated column
 */
MessagesColumn.prototype.generateColumn = function(){
	var newTweetColumn = document.createElement('li');
	newTweetColumn.setAttribute('class', 'tweets-column');
	newTweetColumn.setAttribute('id', 'tweets-column-' + this.id);

	var newTweetColumnHeader = document.createElement('div');
	newTweetColumnHeader.setAttribute('class', 'tweets-column-header');
	newTweetColumnHeader.setAttribute('id', 'tweets-column-header-' + this.id);

	var newTweetColumnTitle = document.createElement('h3');
	if(this.type == "tracking"){
		newTweetColumnTitle.setAttribute('contentEditable', 'true');
	}
	newTweetColumnTitle.textContent = this.columnHeaderName;

	var newTweetColumnParametersButton = document.createElement('button');
	newTweetColumnParametersButton.setAttribute('class', 'tweets-column-header-button');
	newTweetColumnParametersButton.setAttribute('id', 'tweets-column-header-button-' + this.id);

	this.buttonOpenOptions = newTweetColumnParametersButton;

	var newTweetColumnParametersIcon = document.createElement('i');
	newTweetColumnParametersIcon.setAttribute('class', 'fa fa-cog');

	var newTweetColumnPanel = document.createElement('div');
	newTweetColumnPanel.setAttribute('class', 'tweets-column-panel');
	newTweetColumnPanel.setAttribute('id', 'tweets-column-panel-' + this.id);

	this.panel = newTweetColumnPanel;

	var panelList = document.createElement('ul');
	panelList.className = "tweets-column-panel-list";

	/** DELETE BUTTON **/
	if(this.type != "home"){
		var deleteParameter = document.createElement('li');

		var deleteColumnButton = document.createElement('button');
		deleteColumnButton.className = 'deleteColumnButton classic-button';
		deleteColumnButton.textContent = 'Delete';

		deleteParameter.appendChild(deleteColumnButton);
		panelList.appendChild(deleteParameter);
	}

	/** FIRST PARAMETER **/

	var firstParameter = document.createElement('li');
	firstParameter.className = 'tweets-column-panel-list-first';

	var firstParameterName = document.createElement('p');
	firstParameterName.textContent = "Show images";

	var newTweetColumnImageSwitch = document.createElement('span');
	newTweetColumnImageSwitch.setAttribute('class', 'switch');

	var newTweetColumnImageSwitchInput = document.createElement('input');
	newTweetColumnImageSwitchInput.setAttribute('type', 'checkbox');
	newTweetColumnImageSwitchInput.setAttribute('id', 'tweets-column-switch-image' + this.id);
	newTweetColumnImageSwitchInput.setAttribute('name', 'tweets-column-switch-image' + this.id);
	newTweetColumnImageSwitchInput.setAttribute('checked', 'true');

	this.imagesCheckbox = newTweetColumnImageSwitchInput;

	var newTweetColumnImageSwitchLabel = document.createElement('label');
	newTweetColumnImageSwitchLabel.setAttribute('for', 'tweets-column-switch-image' + this.id);

	var newTweetColumnImageSwitchKnob = document.createElement('span');
	newTweetColumnImageSwitchKnob.setAttribute('class', 'switch-knob');
	
	newTweetColumnImageSwitch.appendChild(newTweetColumnImageSwitchInput);
	newTweetColumnImageSwitch.appendChild(newTweetColumnImageSwitchLabel);
	newTweetColumnImageSwitch.appendChild(newTweetColumnImageSwitchKnob);

	firstParameter.appendChild(firstParameterName);
	firstParameter.appendChild(newTweetColumnImageSwitch);

	panelList.appendChild(firstParameter);

	/** SECOND PARAMETER **/

	var secondParamter = document.createElement('li');
	secondParamter.className = 'tweets-column-panel-list-second';

	var secondParameterFirstChoice = document.createElement('p');
	secondParameterFirstChoice.textContent = "Lists";

	var secondParameterSecondChoice = document.createElement('p');
	secondParameterSecondChoice.textContent = "Hashtags";

	var listsOrTagsSwitch = document.createElement('span');
	listsOrTagsSwitch.setAttribute('class', 'switch');

	var listsOrTagsSwitchInput = document.createElement('input');
	listsOrTagsSwitchInput.setAttribute('type', 'checkbox');
	listsOrTagsSwitchInput.setAttribute('id', 'tweets-column-switch-listsOrTags' + this.id);
	listsOrTagsSwitchInput.setAttribute('name', 'tweets-column-switch-listsOrTags' + this.id);

	var listsOrTagsSwitchLabel = document.createElement('label');
	listsOrTagsSwitchLabel.setAttribute('for', 'tweets-column-switch-listsOrTags' + this.id);

	var listsOrTagsSwitchKnob = document.createElement('span');
	listsOrTagsSwitchKnob.setAttribute('class', 'switch-knob');

	listsOrTagsSwitch.appendChild(listsOrTagsSwitchInput);
	listsOrTagsSwitch.appendChild(listsOrTagsSwitchLabel);
	listsOrTagsSwitch.appendChild(listsOrTagsSwitchKnob);

	secondParamter.appendChild(secondParameterFirstChoice);
	secondParamter.appendChild(secondParameterSecondChoice);
	secondParamter.appendChild(listsOrTagsSwitch);

	panelList.appendChild(secondParamter);
	
	/** LISTS **/

	
	this.generateColumnTwitterLists();
	
	var listChoiceButton = document.createElement('button');
	listChoiceButton.className = 'tweets-column-panel-list-twitterLists-button classic-button';
	listChoiceButton.textContent = "Display";

	this.twitterListsDOM.appendChild(listChoiceButton);
	
	panelList.appendChild(this.twitterListsDOM);

	/** HASHTAGS */

	var hashtagsBlock = document.createElement('li');
	hashtagsBlock.className = 'tweets-column-panel-list-hashtagsBlock';

	this.hashtagsBlock = hashtagsBlock;

	var hashtagsBlockTitle = document.createElement('h4');
	hashtagsBlockTitle.textContent = "Add hashtag to track";

	var hashtagTrackInput = document.createElement('input');
	hashtagTrackInput.className = "tagInput";
	hashtagTrackInput.setAttribute('placeholder','Track...');
	hashtagTrackInput.setAttribute('type','text');

	this.hashtagTrackInput = hashtagTrackInput;

	var hashtagsList = this.generateHashtagsList();

	hashtagsBlock.appendChild(hashtagsBlockTitle);
	hashtagsBlock.appendChild(hashtagTrackInput);
	hashtagsBlock.appendChild(hashtagsList);

	panelList.appendChild(hashtagsBlock);

	if(this.type == 'tracking'){
		this.isListsOpen = false;
		listsOrTagsSwitchInput.setAttribute('checked', true);
		this.hashtagsBlock.style.display = "block";
		this.twitterListsDOM.style.display = "none";
	}

	/** DELETE **/

	/** TWEETS **/

	var newTweetColumnTweets = document.createElement('ul');
	newTweetColumnTweets.setAttribute('class', 'tweets');
	newTweetColumnTweets.setAttribute('id', 'tweets-' + this.id);

	var elementsToAddEventListener = {
		newTweetColumnParametersButton: newTweetColumnParametersButton,
		newTweetColumnImageSwitch: newTweetColumnImageSwitch,
		listsOrTagsSwitch: listsOrTagsSwitch,
		listChoiceButton: listChoiceButton,
		hashtagTrackInput: hashtagTrackInput,
		deleteColumnButton: deleteColumnButton,
		newTweetColumnTitle: newTweetColumnTitle
	};

	this.addEvent(elementsToAddEventListener);

	newTweetColumnPanel.appendChild(panelList);

	newTweetColumnHeader.appendChild(newTweetColumnTitle);
	newTweetColumnParametersButton.appendChild(newTweetColumnParametersIcon);
	newTweetColumnHeader.appendChild(newTweetColumnParametersButton);
	newTweetColumn.appendChild(newTweetColumnHeader);
	newTweetColumn.appendChild(newTweetColumnPanel);
	newTweetColumn.appendChild(newTweetColumnTweets);

	console.log('Column ', this.id, ' generated');

	this.columnHTML = newTweetColumn;
	this.columnContentHTML = newTweetColumnTweets;
	this.columnHeaderHTML = newTweetColumnHeader;

	return newTweetColumn;
}

/**
 * Generate the lists of Twitter lists
 * @return {Object} Generated list
 */
MessagesColumn.prototype.generateColumnTwitterLists = function(){
	var previousList = document.querySelector('#tweets-column-panel-' + this.id + ' .tweets-column-panel-list-twitterLists');

	var twitterListsDOM = document.createElement('li');
	twitterListsDOM.className = 'tweets-column-panel-list-twitterLists';

	var listsBlockTitle = document.createElement('h4');
	listsBlockTitle.textContent = "Choose list to display";
	twitterListsDOM.appendChild(listsBlockTitle);

	var listChoice = document.createElement('select');
	listChoice.className = 'tweets-column-panel-list-twitterLists-select';

	for (var i = 0; i < this.twitterLists.length; i++) {
		var option = document.createElement('option');
		option.textContent = this.twitterLists[i].name;
		listChoice.appendChild(option);
	};

	if(previousList != undefined){
		previousList.replaceChild(listChoice, previousList.childNodes[1]);
	}
	else{
		twitterListsDOM.appendChild(listChoice);
	}

	this.twitterListsDOM = twitterListsDOM;
}

MessagesColumn.prototype.generateHashtagsList = function(){

	var previousList = document.querySelector('#tweets-column-panel-' + this.id + ' .tweets-column-panel-list-hashtagsList');

	var hashtagsBlock = document.querySelector('#tweets-column-panel-' + this.id + ' .tweets-column-panel-list-hashtagsBlock');

	var hashtagsList = document.createElement('ul');
	hashtagsList.className = 'tweets-column-panel-list-hashtagsList';

	for (var i = 0; i < this.hashtagsList.length; i++) {
		var hashtag = document.createElement('li');
		var deleteButton = document.createElement('button');
		var cross = document.createElement('i');
		cross.className = "fa fa-times";

		deleteButton.className = "hashtag-delete-button";
		hashtag.className = 'hashtag';
		hashtag.textContent = this.hashtagsList[i];
		hashtagsList.appendChild(hashtag);
		deleteButton.appendChild(cross);
		hashtag.appendChild(deleteButton);

		deleteButton.addEventListener('click', function(e){
			this.untrackTag(e);
		}.bind(this));
	};

	if(previousList != undefined){
		// console.log('previousList: ', previousList);
		hashtagsBlock.replaceChild(hashtagsList, hashtagsBlock.lastChild);
	}

	return hashtagsList;
}

/**
 * Change column's name
 * @param  {String} name Column name to set
 */
MessagesColumn.prototype.changeName = function(name){
	this.columnHeaderName = name;
	var title = this.columnHeaderHTML.getElementsByTagName('h3');
	title[0].textContent = name;

	for (var i = 0; i < this.MessagesDisplay.columnsLayout.length; i++) {
		if(this.MessagesDisplay.columnsLayout[i].id === this.id){
			this.MessagesDisplay.columnsLayout[i].name = name;
		}
	};
}

/**
 * Change column's name in columns layout
 */
MessagesColumn.prototype.changeColumnsLayoutName = function(){
	var title = this.columnHeaderHTML.getElementsByTagName('h3');
	name = title[0].textContent;

	this.columnHeaderName = name;

	for (var i = 0; i < this.MessagesDisplay.columnsLayout.length; i++) {
		if(this.MessagesDisplay.columnsLayout[i].id === this.id){
			this.MessagesDisplay.columnsLayout[i].name = name;
			this.MessagesDisplay.updateColumnsLayout();
		}
	};
}



/**
 * Add events on buttons and other inputs
 * @param {Object} buttonOpenOptions          [description]
 * @param {Object]} newTweetColumnImageSwitch [description]
 * @param {Object} listsOrTagsSwitch          [description]
 */
MessagesColumn.prototype.addEvent = function(elementsToAddEventListener){
	this.buttonOpenOptions.addEventListener('click', function(){
		this.openPanel();
	}.bind(this));

	elementsToAddEventListener.newTweetColumnImageSwitch.addEventListener('change', function(){
		this.enableImages();
	}.bind(this));

	elementsToAddEventListener.listsOrTagsSwitch.addEventListener('change', function(){
		this.switchListsOrHashtags();
	}.bind(this));

	elementsToAddEventListener.listChoiceButton.addEventListener('click', function(){
		this.addListToDisplay();
	}.bind(this));

	// 	Triggers the Enter button for tracking tags
	elementsToAddEventListener.hashtagTrackInput.addEventListener('keypress', function(e){
		if (e.keyCode == 13) {
			this.trackTag();
	    }
	}.bind(this));

	if(elementsToAddEventListener.deleteColumnButton){
		elementsToAddEventListener.deleteColumnButton.addEventListener('click', function(){
			this.deleteColumn();
		}.bind(this));
	}
		
	elementsToAddEventListener.newTweetColumnTitle.addEventListener('keypress', function(e){
		if (e.keyCode == 13) {
			this.changeColumnsLayoutName();
			e.preventDefault();
			return false;
	    }
	}.bind(this));
}


/**
 * Opens and closes the panel
 */
MessagesColumn.prototype.openPanel = function(){
	this.isPanelOpen = !this.isPanelOpen;
	if(this.isPanelOpen){
		this.panel.style.transform = "scaleY(1)";
		this.buttonOpenOptions.className = "tweets-column-header-button tweets-column-header-button-active";
	}
	else{
		this.panel.style.transform = "scaleY(0)";
		this.buttonOpenOptions.className = "tweets-column-header-button";
	}
}

/**
 * Enable/Disables images display
 */
MessagesColumn.prototype.enableImages = function(){
	this.areImagesEnabled = !this.areImagesEnabled;

	for (var i = 0; i < this.messagesList.length; i++) {
		this.messagesList[i].areImagesEnabled = this.areImagesEnabled;
	};

	if(this.areImagesEnabled){
		var allImages = document.querySelectorAll('#tweets-' + this.id + ' .tweet-image-none');
		var allLinksImages = document.querySelectorAll('#tweets-' + this.id + ' .tweet-link-image');
		for (var i = 0; i < allImages.length; i++) {
			allImages[i].className = "tweet-image";
		};
		for (var i = 0; i < allLinksImages.length; i++) {
			allLinksImages[i].className = "tweet-link-image-none";
		};
	}
	else{
		var allImages = document.querySelectorAll('#tweets-' + this.id + ' .tweet-image');
		var allLinksImages = document.querySelectorAll('#tweets-' + this.id + ' .tweet-link-image-none');
		for (var i = 0; i < allImages.length; i++) {
			allImages[i].className = "tweet-image-none";
		};
		for (var i = 0; i < allLinksImages.length; i++) {
			allLinksImages[i].className = "tweet-link-image";
		};
	}
}

/**
 * Switchs display between hashtags and Twitter lists
 */
MessagesColumn.prototype.switchListsOrHashtags = function(){
	this.isListsOpen = !this.isListsOpen;

	var hashtagsBlock = document.querySelector('#tweets-column-panel-' + this.id + ' .tweets-column-panel-list-hashtagsBlock');
	var twitterListsDOM = document.querySelector('#tweets-column-panel-' + this.id + ' .tweets-column-panel-list-twitterLists');
	if(this.isListsOpen){
		hashtagsBlock.style.display = "none";
		twitterListsDOM.style.display = "block";
	}
	else{
		hashtagsBlock.style.display = "block";
		twitterListsDOM.style.display = "none";
	}
}

MessagesColumn.prototype.addListToDisplay = function(){
	var selectList = document.querySelector('#tweets-column-panel-' + this.id + ' .tweets-column-panel-list-twitterLists-select');
	var chosenList = selectList.value;
	var alreadyAffected = false;

	if(selectList.getAttribute('exist') === 'true'){
		alreadyAffected = true;
		// console.log('already exist! ');
	}


	// console.log('Chosen list: ', chosenList);
	for (var i = 0; i < this.twitterLists.length; i++) {
		if(this.twitterLists[i].name === chosenList){
			var listId = this.twitterLists[i].id;
			socket.emit('get list cache', listId);
			this.MessagesDisplay.useList(this.twitterLists[i].id, this.id);
		}	
	};

	this.columnHeaderName = chosenList;

	var previousHeaderName = document.querySelector('#tweets-column-' + this.id + ' h3');

	previousHeaderName.textContent = this.columnHeaderName;

	this.openPanel();
} 

/**
 * Add a message to a column
 * @param  {Object} message         Message to be added
 * @return {Object} Added message
 */
MessagesColumn.prototype.addMessage = function(message, streamSource){
	var newMessage = new Message(message, streamSource, this.areImagesEnabled);
	newMessage.processDate();
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
	for (var i = 0; i < this.messagesList.length; i++) {
		var newTweet = this.messagesList[i].generateMessage();

		this.columnContentHTML.appendChild(newTweet);
		newTweet.style.transform = "scaleY(1)";
		this.messagesList[i].applyTweetStatus();
	};
}

/**
 * Displays one message in the column
 */
MessagesColumn.prototype.displayOneMessage = function(message){
	var newTweet = message.generateMessage();
	if(this.columnContentHTML.childNodes[0]){
		this.columnContentHTML.insertBefore(newTweet, this.columnContentHTML.childNodes[0]);
		setTimeout(function(){
			newTweet.style.transform = "scaleY(1)";
		},50);
	}
	else{
		this.columnContentHTML.appendChild(newTweet);
		setTimeout(function(){
			newTweet.style.transform = "scaleY(1)";
		},50);
	}

	// Limit number of messages displayed
	if(this.columnContentHTML.childNodes[this.limitNumberMessages]){
		this.columnContentHTML.removeChild(this.columnContentHTML.childNodes[this.limitNumberMessages]);
	}

	message.applyTweetStatus();
}

/**
 * Delete message
 * @param  {Object} message Message to be deleted
 */
MessagesColumn.prototype.deleteMessage = function(message){
	for (var i = 0; i < this.messagesList.length; i++) {
		if(this.messagesList[i].id_str === message.tweet.delete.status.id_str){
			console.log('Message to be deleted found');
			this.messagesList.splice(i, 1);
			this.displayAllMessages();
		}
	};
}

/**
 * Sends tag tracking request
 */
MessagesColumn.prototype.trackTag = function(){
	var tagObject = {};
	tagObject.tag = this.hashtagTrackInput.value;
	this.hashtagTrackInput.value = "";
	tagObject.tag = tagObject.tag.toLowerCase();
	if(tagObject.tag.substring(0, 1) == '#'){
		tagObject.tag = tagObject.tag.slice(1);
	}
	tagObject.userId = userId;
	socket.emit('searchTweet', '#' + tagObject.tag);
	if(this.type != 'tracking'){
		// console.log('Update as it is first tracking')
		this.MessagesDisplay.useHashtag(this.id, tagObject.tag);
	}
	else{
		this.MessagesDisplay.addHashtag(this.id, tagObject.tag);
	}
}

/**
 * Delete hashtag from column
 * @return {[type]} [description]
 */
MessagesColumn.prototype.untrackTag = function(e){
	var tagObject = {};
	// console.log('Its parent content: ', e.target.parentNode.textContent);
	tagObject.tag = e.target.parentNode.textContent;
	tagObject.tag = tagObject.tag.toLowerCase();
	if(tagObject.tag.substring(0, 1) == '#'){
		tagObject.tag = tagObject.tag.slice(1);
	}
	tagObject.userId = userId;
	this.MessagesDisplay.removeHashtag(this.id, tagObject.tag);
}

/**
 * Deletes the column
 */
MessagesColumn.prototype.deleteColumn = function(){
	this.MessagesDisplay.deleteColumn(this.id);
}
