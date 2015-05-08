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

	this.addEvent(newTweetColumnParametersButton, newTweetColumnImageSwitch, listsOrTagsSwitch, listChoiceButton);

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
MessagesColumn.prototype.addEvent = function(buttonOpenOptions, newTweetColumnImageSwitch, listsOrTagsSwitch, listChoiceButton){
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
	this.id = message.id_str;
	this.authorUsername = message.user.screen_name;
	this.authorPseudonym = message.user.name;
	this.date = message.created_at;
	this.displayedDate = '0 min';
	this.friendlyDate = message.created_at;
	this.dateHTML = null;
	this.text = document.createTextNode('p');
	this.text.textContent = message.text;
	this.profilePicture = message.user.profile_image_url_https;
	this.streamSource = streamSource
	this.retweeted = message.retweeted;
	this.areImagesEnabled = areImagesEnabled;
	this.image = null;

	this.urls = message.entities.urls;
	this.medias = message.entities.media;
	this.hashtags = message.entities.hashtags;
	this.user_mentions = message.entities.user_mentions;

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
	}
	else{
		console.log('Gonna send retweet with id: ', this.id);
		socket.emit('retweet', this.id);
		this.retweeted = true;
	}
	this.applyTweetStatus();
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
	var src = this.image.getAttribute('src');
	src = src.substring(0, src.lastIndexOf(':'));
	this.image.setAttribute('src', src + ':medium');
	this.image.className += " tweet-image-extended";
}