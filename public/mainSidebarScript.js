/**
 * Displays the main controls
 */
function MainSidebar(buttonOpenMessageEdition, buttonTrackHashtag, inputTag){
	this.buttonOpenMessageEdition = buttonOpenMessageEdition;
	this.buttonTrackHashtag = buttonTrackHashtag;
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

	this.buttonTrackHashtag.addEventListener('click', function(e){
		trackTag(scope);
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