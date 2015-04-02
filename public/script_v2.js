/**
 * Socket initialization
 * @type {Object}
 */
var socket = io();

/**
 * Mapping object with the HTML elements
 * @type {Object}
 */
var mapping = {
	buttonOpenMessageEdition: document.getElementById('buttonOpenMessageEdition'),
	buttonTrackHashtag: document.getElementById('buttonTrackHashtag'),
	columnsList: document.getElementById('tweets-columns-list')
};

/**
 * Dashboard main module
 * @param  {[type]} socket){	var mainSidebar   [description]
 * @return {[type]}               [description]
 */
var dashboard = (function (socket){
	var mainSidebar = null;
	var statisticsSidebar = null;
	var messagesDisplay = null;

	var socket = socket;

	socket.on('tweet', function(message){
		console.log('Got tweet');
		if(message.streamSource == 'user'){
			console.log('got tweet for user');
			messagesDisplay.addMessage(message);
			messagesDisplay.displayMessages(message);
		}
	});

	socket.on('lists-list', function(listsObject){
		for (var i = 0; i < listsObject.length; i++) {
			messagesDisplay.addColumn(listsObject[i].slug, listsObject[i].name);
		};
		messagesDisplay.displayColumns();
	});

	socket.on('remove tag', function(){});

	var init = function(mapping){

		// Create the main components of the application
		mainSidebar = new MainSidebar(mapping.buttonOpenMessageEdition, mapping.buttonTrackHashtag);
		statisticsSidebar = new StatisticsSidebar();
		messagesDisplay = new MessagesDisplay(mapping.columnsList);

		// Generate the defaults columns
		messagesDisplay.addColumn('user', 'Timeline');
		messagesDisplay.addColumn('tracking', 'Tracking');

		// Emit a message to connect to the server
		socket.emit('auth', userId);
	}

	var display = function(){

	}

	return {
		init:init,
		display:display
	};

})(socket);

dashboard.init(mapping);




