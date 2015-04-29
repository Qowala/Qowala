/**
 * Displays the main controls
 */
function MainSidebar(mapping){
	this.buttonOpenMessageEdition = mapping.buttonOpenMessageEdition;
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
	var trackTag = this.trackTag;
	var scope = this;

	// Triggers the Enter button for tracking tags
	this.inputTag.addEventListener('keypress', function(e){
		if (e.keyCode == 13) {
			trackTag(scope);
	    }
	});

	// Triggers a click on the button to open the message edition panel
	this.buttonOpenMessageEdition.addEventListener('click', function(e){
		this.openMessageEdition();
	}.bind(this));

	// Triggers a click on the button to send a message
	this.sendTweetButton.addEventListener('click', function(e){
		this.sendMessage();
	}.bind(this));

	var dragSrcEl = null;

	function handleDragStart(e) {
		// Target (this) element is the source node.
		this.style.opacity = '0.4';

		dragSrcEl = this;

		e.dataTransfer.effectAllowed = 'move';
		e.dataTransfer.setData('text/html', this.innerHTML);
	}

	function handleDragOver(e) {
		if (e.preventDefault) {
		e.preventDefault(); // Necessary. Allows us to drop.
		}

		e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.

		return false;
	}

	function handleDragEnter(e) {
		// this / e.target is the current hover target.
		this.classList.add('over');
	}

	function handleDragLeave(e) {
		this.classList.remove('over');  // this / e.target is previous target element.
	}
	
	function handleDrop(e) {
		// this/e.target is current target element.

		if (e.stopPropagation) {
			e.stopPropagation(); // Stops some browsers from redirecting.
		}

		// Don't do anything if dropping the same column we're dragging.
		if (dragSrcEl != this) {
			// Set the source column's HTML to the HTML of the column we dropped on.
			console.log('Dropping with html: ',this.innerHTML )
			dragSrcEl.innerHTML = this.innerHTML;
			this.innerHTML = e.dataTransfer.getData('text/html');
		}

		return false;
	}

	function handleDragEnd(e) {
		// this/e.target is the source node.

		[].forEach.call(this.draggableTags, function (draggableTag) {
			draggableTag.classList.remove('over');
		});
	}

	this.draggableTags = document.querySelectorAll('.draggableTag');
	console.log('this.draggableTags : ', this.draggableTags);
	[].forEach.call(this.draggableTags, function(draggableTag) {
		draggableTag.addEventListener('dragstart', handleDragStart, false);
		draggableTag.addEventListener('dragenter', handleDragEnter, false);
		draggableTag.addEventListener('drop', handleDrop, false);
		draggableTag.addEventListener('dragend', handleDragEnd, false);
	});
}

/**
 * Sends tag tracking request
 */
MainSidebar.prototype.trackTag = function(scope){
	var tagObject = {};
	console.log('scope: ', scope);
	tagObject.tag = scope.inputTag.value;
	scope.inputTag.value = "";
	tagObject.userId = userId;
	socket.emit('add tag', tagObject);
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

	console.log('updating the number');
}

/**
 * Opens and closes the message edition panel
 */
MainSidebar.prototype.openMessageEdition = function(){
	this.isMessageEditionPanelOpen = !this.isMessageEditionPanelOpen;
	if(this.isMessageEditionPanelOpen){
		console.log('Opening the panel');

		var width = calculateWidth();

		this.messageEditionPanel.style.left = '-' + width +'px';
		this.messageEditionPanel.style.width = width + 'px';
		this.messageEditionPanel.style.left = 192 + 'px';

		this.textareaListener();
	}
	else{
		console.log('Closing the panel');

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
		}
		else{
			this.numberCharactersLeft.className = "";
		}
	}
}

/**
 * Sends the message
 * @return {[type]} [description]
 */
MainSidebar.prototype.sendMessage = function(){
	var message = this.messageTextarea.value;
	console.log('Going to send: ', message);
	socket.emit('sendMessage', message);
}