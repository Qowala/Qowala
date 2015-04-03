/**
 * Displays the main controls
 */
function MainSidebar(buttonOpenMessageEdition, inputTag){
	this.buttonOpenMessageEdition = buttonOpenMessageEdition;
	this.inputTag = inputTag;

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