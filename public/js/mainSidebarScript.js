/**
 * Displays the main controls
 */
function MainSidebar(mapping, createBlankColumn){
	this.buttonOpenMessageEdition = mapping.buttonOpenMessageEdition;
	this.buttonAddColumn = mapping.buttonAddColumn;
	this.createBlankColumn = createBlankColumn;
	this.isMessageEditionPanelOpen = false;
	this.messageEditionPanel = mapping.messageEditionPanel;
	this.messageTextarea = mapping.messageTextarea;
	this.numberCharactersLeft = mapping.numberCharactersLeft;
	this.sendTweetButton = mapping.sendTweetButton;

	this.inputTag = mapping.inputTag;
	this.tagContainer = mapping.tagContainer;
	this.draggableTags = [];
	this.numberConnectedUsersSpan = mapping.numberConnectedUsersSpan;

	this.hashtagsToTrack = [];
}

/**
 * Track tag
 * @param {String} id               Slug of the column's name
 * @param {String} columnHeaderName Column's name
 */
MainSidebar.prototype.init = function(){

	// Triggers a click on the button to open the message edition panel
	this.buttonOpenMessageEdition.addEventListener('click', function(e){
		this.openMessageEdition();
	}.bind(this));

	// Triggers a click on the button to add new column
	this.buttonAddColumn.addEventListener('click', function(e){
		this.createBlankColumn();
	}.bind(this));

	// Triggers a click on the button to send a message
	this.sendTweetButton.addEventListener('click', function(e){
		this.sendMessage();
	}.bind(this));

	this.textareaListener();
}

/**
 * Updates the number of connected uers
 * @param  {Number}  numberConnectedUsers
 */
MainSidebar.prototype.updateNumberConnectedUsers = function(numberConnectedUsers){
	this.numberConnectedUsersSpan.textContent = numberConnectedUsers;
	if(numberConnectedUsers == 1){
		koalaPlural.textContent = "";
	}
	else{
		koalaPlural.textContent = "s";
	}

	// console.log('updating the number');
}

/**
 * Opens and closes the message edition panel
 */
MainSidebar.prototype.openMessageEdition = function(){
	this.isMessageEditionPanelOpen = !this.isMessageEditionPanelOpen;
	if(this.isMessageEditionPanelOpen){
		var width = calculateWidth();

		this.messageEditionPanel.style.left = '-' + width +'px';
		this.messageEditionPanel.style.width = width + 'px';
		this.messageEditionPanel.style.left = 120 + 'px';

	}
	else{
		var width = calculateWidth();
		this.messageEditionPanel.style.left = '-' + width +'px';
	}

	function calculateWidth(){
		// Give it the same size as a tweet column
		if(window.innerWidth > 1500){
			var width = (window.innerWidth - 192) * 25/100;
		}
		else if(window.innerWidth > 1200){
			var width = (window.innerWidth - 192) * 33.333/100;
		}
		else{
			var width = (window.innerWidth - 192) * 50/100;
		}
		
		return width;
	}
}

/**
 * Updates the textarea
 */
MainSidebar.prototype.textareaListener = function(){
	// Triggers inputs for updating the number of characters
	this.messageTextarea.addEventListener('input', function(e){
		updateNumberCharacters();
	}.bind(this));

	function updateNumberCharacters(){
		var numberCharacters = this.messageTextarea.value.length;
		var numberCharactersLeft = 140 - numberCharacters
		this.numberCharactersLeft.textContent = numberCharactersLeft;

		// If number of characters negative, display in red
		if(numberCharactersLeft < 0){
			this.numberCharactersLeft.className = "red";
			this.sendTweetButton.disabled = true;
		}
		else if (numberCharactersLeft == 140){
			this.sendTweetButton.disabled = true;
		}
		else{
			this.numberCharactersLeft.className = "";
			this.sendTweetButton.disabled = false;
		}
	}
}

/**
 * Sends the message
 */
MainSidebar.prototype.sendMessage = function(){
	var message = this.messageTextarea.value;
	if(message != "" && message.length <= 140){
		// console.log('Going to send: ', message);
		socket.emit('sendMessage', message);
		this.messageTextarea.value = "";
		this.openMessageEdition();
	}
}