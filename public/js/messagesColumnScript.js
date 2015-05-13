/**************************************************************************/
/**                          Messages column                            ***/
/**************************************************************************/


/**
 * MessagesColumn's class
 * @param {String} id               Column ID from social network
 * @param {String} columnHeaderName Column name from social network
 */
function MessagesColumn(id, columnHeaderName, MessagesDisplay){
	this.id = id;
	this.availableLists = [];
	this.MessagesDisplay = MessagesDisplay;

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
MessagesColumn.prototype.updateAvailableLists = function(listsObject){
	this.availableLists = [];
	for (var i = 0; i < listsObject.length; i++) {
		this.availableLists.push(
			{
				slug: listsObject[i].slug,
				name: listsObject[i].name,
				exist: listsObject[i].exist
			}
		);
	};

	this.generateColumnTwitterLists();
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
	listChoiceButton.className = 'tweets-column-panel-list-twitterLists-button';
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

	hashtagsBlock.appendChild(hashtagsBlockTitle);
	hashtagsBlock.appendChild(hashtagTrackInput);

	panelList.appendChild(hashtagsBlock);

	if(this.id == 'tracking'){
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

	this.addEvent(newTweetColumnParametersButton, newTweetColumnImageSwitch, listsOrTagsSwitch, listChoiceButton, hashtagTrackInput);

	newTweetColumnPanel.appendChild(panelList);

	newTweetColumnHeader.appendChild(newTweetColumnTitle);
	newTweetColumnParametersButton.appendChild(newTweetColumnParametersIcon);
	newTweetColumnHeader.appendChild(newTweetColumnParametersButton);
	newTweetColumn.appendChild(newTweetColumnHeader);
	newTweetColumn.appendChild(newTweetColumnPanel);
	newTweetColumn.appendChild(newTweetColumnTweets);

	console.log('Column ', this.id, 'generated');

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

	var listChoice = document.createElement('select');
	listChoice.className = 'tweets-column-panel-list-twitterLists-select';

	for (var i = 0; i < this.availableLists.length; i++) {
		var option = document.createElement('option');
		option.textContent = this.availableLists[i].name;
		if(this.availableLists[i].slug == this.id){
			option.setAttribute('selected', 'true');
		}
		listChoice.appendChild(option);
	};

	if(previousList != undefined){
		previousList.replaceChild(listChoice, previousList.firstChild);
	}
	else{
		twitterListsDOM.appendChild(listChoice);
	}

	this.twitterListsDOM = twitterListsDOM;
}

/**
 * Add events on buttons and other inputs
 * @param {Object} buttonOpenOptions          [description]
 * @param {Object]} newTweetColumnImageSwitch [description]
 * @param {Object} listsOrTagsSwitch          [description]
 */
MessagesColumn.prototype.addEvent = function(buttonOpenOptions, newTweetColumnImageSwitch, listsOrTagsSwitch, listChoiceButton, hashtagTrackInput){
	buttonOpenOptions.addEventListener('click', function(){
		this.openPanel();
	}.bind(this));

	newTweetColumnImageSwitch.addEventListener('change', function(){
		this.enableImages();
	}.bind(this));

	listsOrTagsSwitch.addEventListener('change', function(){
		this.switchListsOrHashtags();
	}.bind(this));

	listChoiceButton.addEventListener('click', function(){
		this.addListToDisplay();
	}.bind(this));

	// 	Triggers the Enter button for tracking tags
	hashtagTrackInput.addEventListener('keypress', function(e){
		if (e.keyCode == 13) {
			this.trackTag();
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
	// this.displayAllMessages();
}

/**
 * Switchs display between hashtags and Twitter lists
 */
MessagesColumn.prototype.switchListsOrHashtags = function(){
	this.isListsOpen = !this.isListsOpen;
	if(this.isListsOpen){
		this.hashtagsBlock.style.display = "none";
		this.twitterListsDOM.style.display = "block";
		console.log('Opening this.twitterListsDOM : ', this.twitterListsDOM);
	}
	else{
		this.hashtagsBlock.style.display = "block";
		this.twitterListsDOM.style.display = "none";
		console.log('CLosing this.twitterListsDOM : ', this.twitterListsDOM);
	}
}

MessagesColumn.prototype.addListToDisplay = function(){
	var selectList = document.querySelector('#tweets-column-panel-' + this.id + ' .tweets-column-panel-list-twitterLists-select');
	var chosenList = selectList.value;
	var alreadyAffected = false;

	if(selectList.getAttribute('exist') === 'true'){
		alreadyAffected = true;
		console.log('already exist! ');
	}


	console.log('Chosen list: ', chosenList);
	for (var i = 0; i < this.availableLists.length; i++) {
		if(this.availableLists[i].name === chosenList){
			for (var y = 0; y < this.MessagesDisplay.enabledListsList.length; y++) {
				if(this.MessagesDisplay.enabledListsList[y].columnId === this.id){
					alreadyAffected = true;
					this.MessagesDisplay.enabledListsList[y].slug = this.availableLists[i].slug;
				}
			}

			for (var y = 0; y < this.MessagesDisplay.columnsLayout.length; y++) {
				if(this.MessagesDisplay.columnsLayout[y].id === this.id){
					alreadyAffected = true;
					this.MessagesDisplay.columnsLayout[y].name = this.availableLists[i].name;
					this.MessagesDisplay.columnsLayout[y].type = 'list';
				}
			}

			this.MessagesDisplay.useList(this.id, this.availableLists[i].slug);
			this.MessagesDisplay.addUsedListToTwitterLists(this.availableLists[i].slug);
		}	
	};

	this.columnHeaderName = chosenList;

	var previousHeaderName = document.querySelector('#tweets-column-' + this.id + ' h3');

	previousHeaderName.textContent = this.columnHeaderName;

	this.openPanel();

	this.MessagesDisplay.updateListsToDisplay();
	this.MessagesDisplay.updateColumnsLayout();
	this.MessagesDisplay.displayColumnCreator();
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
	for (var i = this.messagesList.length -1; i >= 0; i--) {
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
		if(this.messagesList[i].id == message.tweet.delete.status.id_str){
			console.log('Message to be deleted found');
			this.messagesList.splice(i, 1);
			this.displayAllMessages();
		}
	};
}

/**
 * Sends tag tracking request
 */
MessagesColumn.prototype.trackTag = function(scope){
	var tagObject = {};
	console.log('hashtagTrackInput: ', this.hashtagTrackInput.value);
	tagObject.tag = this.hashtagTrackInput.value;
	this.hashtagTrackInput.value = "";
	tagObject.userId = userId;
	socket.emit('add tag', tagObject);
}