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
  this.isSpinnerOpen = false;
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

  /** HASHTAGS **/

  var hashtagsBlock = document.createElement('li');
  hashtagsBlock.className = 'tweets-column-panel-list-hashtagsBlock';

  this.hashtagsBlock = hashtagsBlock;

  var hashtagsList = this.generateHashtagsList();

  hashtagsBlock.appendChild(hashtagsList);

  panelList.appendChild(hashtagsBlock);

  /** FIRST PARAMETER **/
  var changeType = function(target,column) {
    for (var i = 0; i < choices.length; i++) {
      column.choices[i].classList.remove('active');
      if (column.choices[i].textContent == target.textContent) {
        column.choices[i].classList.add('active');
      }
    }
    if (target.textContent == 'Lists') {
      column.hashtagTrack.style.display = "none";
      column.panel.querySelector('li.tweets-column-panel-list-twitterLists').style.display = "block";
    }
    else {
      column.hashtagTrack.style.display = "block";
      column.panel.querySelector('li.tweets-column-panel-list-twitterLists').style.display = "none";
    }
  }
  var categoryToSearch = document.createElement('li');
  categoryToSearch.className = 'tweets-column-panel-categories'

  var searchFor = document.createElement('p');
  searchFor.textContent = 'Search for';
  searchFor.className = 'title';
  categoryToSearch.appendChild(searchFor);

  var choices = ['Hashtags','Lists'];
  this.choices = choices;
  for (var i = 0; i < choices.length; i++) {
    var text = choices[i].slice(0);
    this.choices[i] = document.createElement('p');
    this.choices[i].textContent = text;
    this.choices[i].className = 'category';
    if (i == 0) this.choices[i].classList.add('active');

    categoryToSearch.appendChild(choices[i]);
    var that = this;
    this.choices[i].addEventListener('click', function(){changeType(this,that)});
  };


  panelList.appendChild(categoryToSearch);

  /** LISTS **/

  this.generateColumnTwitterLists();
  twitterListsDOM = this.twitterListsDOM;

  var listChoiceButton = document.createElement('button');
  listChoiceButton.className = 'tweets-column-panel-list-twitterLists-button classic-button';
  listChoiceButton.textContent = "Display";

  this.twitterListsDOM.childNodes[0].appendChild(listChoiceButton);

  panelList.appendChild(this.twitterListsDOM);

  /** HASHTAGS TRACK INPUT **/

  var hashtagTrack = document.createElement('li');
  hashtagTrack.className = "tagInput fa fa-search";
  this.hashtagTrack = hashtagTrack;
  var hashtagTrackInput = document.createElement('input');
  hashtagTrackInput.setAttribute('placeholder','Track...');
  hashtagTrackInput.setAttribute('type','text');
  this.hashtagTrackInput = hashtagTrackInput;

  panelList.appendChild(this.hashtagTrack);
  this.hashtagTrack.appendChild(this.hashtagTrackInput);

  /** FiRST PARAMETER **/

  var secondParameter = document.createElement('li');
  secondParameter.className = 'tweets-column-panel-list-first';

  var secondParameterName = document.createElement('p');
  secondParameterName.textContent = "Display images";

  var newTweetColumnImageSwitch = document.createElement('div');

  var newTweetColumnImageSwitchInput = document.createElement('input');
  newTweetColumnImageSwitchInput.setAttribute('type', 'checkbox');
  newTweetColumnImageSwitchInput.setAttribute('id', 'tweets-column-switch-image' + this.id);
  newTweetColumnImageSwitchInput.setAttribute('name', 'tweets-column-switch-image' + this.id);
  newTweetColumnImageSwitchInput.setAttribute('checked', 'true');
  newTweetColumnImageSwitchInput.setAttribute('class', 'switch');

  this.imagesCheckbox = newTweetColumnImageSwitchInput;

  var newTweetColumnImageSwitchLabel = document.createElement('label');
  newTweetColumnImageSwitchLabel.setAttribute('for', 'tweets-column-switch-image' + this.id);
  newTweetColumnImageSwitchLabel.textContent = 'Display';

  newTweetColumnImageSwitch.appendChild(newTweetColumnImageSwitchInput);
  newTweetColumnImageSwitch.appendChild(newTweetColumnImageSwitchLabel);

  secondParameter.appendChild(secondParameterName);
  secondParameter.appendChild(newTweetColumnImageSwitch);

  panelList.appendChild(secondParameter);

  /** DELETE BUTTON **/
  if(this.type != "home"){
    var deleteParameter = document.createElement('li');

    var deleteColumnButton = document.createElement('button');
    deleteColumnButton.className = 'deleteColumnButton classic-button';
    deleteColumnButton.innerHTML = '<i class="fa fa-times"></i>Delete column';

    deleteParameter.appendChild(deleteColumnButton);
    panelList.appendChild(deleteParameter);
  }

  /** SPINNER **/
  var columnSpinner = document.createElement('div');
  columnSpinner.setAttribute('class', 'loadingProgressContainer');
  columnSpinner.setAttribute('id', 'tweets-column-spinner-' + this.id);
  var columnSpinnerLoad = document.createElement('div');
  columnSpinnerLoad.setAttribute('class', 'loadingProgress');
  columnSpinner.appendChild(columnSpinnerLoad);

  this.columnSpinner = columnSpinner;

  /** BLACK BACKGROUND **/

  var blackBackground = document.createElement('div');
  blackBackground.setAttribute('class', 'black-background');

  /** TWEETS **/

  var newTweetColumnTweets = document.createElement('ul');
  newTweetColumnTweets.setAttribute('class', 'tweets');
  newTweetColumnTweets.setAttribute('id', 'tweets-' + this.id);

  /** TUTORIAL **/
  if(this.type === 'None'){
    var tutorialDiv = document.createElement('div');
    tutorialDiv.setAttribute('class', 'column-tutorial');
    var tutorialP = document.createElement('p');
    tutorialP.innerHTML = 'Your new column is empty. <br /><br /> Go to the \
                           <i class="fa fa-cog"></i> and track a hashtag or \
                           add one of your list to display.';
    tutorialDiv.appendChild(tutorialP);
    newTweetColumnTweets.appendChild(tutorialDiv);
  }

  var elementsToAddEventListener = {
    newTweetColumnParametersButton: newTweetColumnParametersButton,
    newTweetColumnImageSwitch: newTweetColumnImageSwitch,
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
  newTweetColumn.appendChild(columnSpinner);
  newTweetColumn.appendChild(blackBackground);
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
  var previousList = document.querySelector('#tweets-column-panel-' +
    this.id + ' .tweets-column-panel-list-block');
  var twitterListsDOM = document.createElement('li');
  twitterListsDOM.className = 'tweets-column-panel-list-twitterLists';

  var listChoice = document.createElement('select');
  listChoice.className = 'tweets-column-panel-list-twitterLists-select';

  for (var i = 0; i < this.twitterLists.length; i++) {
    var option = document.createElement('option');
    option.textContent = this.twitterLists[i].name;
    listChoice.appendChild(option);
  };

  if(previousList != undefined){
    var listsBlock = previousList;
    previousList.replaceChild(listChoice, listsBlock.childNodes[0]);
    var noListMessage = document.querySelector('#tweets-column-panel-' +
      this.id + ' .tweets-column-panel-list-message');
  }
  else{
    var listsBlock = document.createElement('div');
    listsBlock.className = 'tweets-column-panel-list-block';
    listsBlock.appendChild(listChoice);
    twitterListsDOM.appendChild(listsBlock);
    var noListMessage = document.createElement('p');
    noListMessage.className = 'tweets-column-panel-list-message';
    noListMessage.textContent = 'You have no available list to display';
    twitterListsDOM.appendChild(noListMessage);
  }

  if(this.twitterLists.length < 1){
    listsBlock.style.display = 'none';
    noListMessage.style.display = 'block';
  }
  else {
    listsBlock.style.display = 'block';
    noListMessage.style.display = 'none';
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
    var cross = document.createElement('i');
    cross.className = "fa fa-times hashtag-delete-icon";

    hashtag.className = 'hashtag';
    hashtag.textContent = '#'+this.hashtagsList[i];
    hashtagsList.appendChild(hashtag);
    hashtag.appendChild(cross);

    cross.addEventListener('click', function(e){
      this.untrackTag(e);
    }.bind(this));
  };

  // if(previousList != undefined){
  //   // console.log('previousList: ', previousList);
  //   hashtagsBlock.replaceChild(hashtagsList, hashtagsBlock.lastChild);
  // }

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

  elementsToAddEventListener.listChoiceButton.addEventListener('click', function(){
    this.addListToDisplay();
  }.bind(this));

  //  Triggers the Enter button for tracking tags
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
 * Opens and closes the panel
 */
MessagesColumn.prototype.openSpinner = function(){
  this.isSpinnerOpen = !this.isSpinnerOpen;
  console.log('this.columnSpinner.childNodes[0]: ', this.columnSpinner.childNodes[0]);
  if(this.isSpinnerOpen){
    this.columnSpinner.style.transform = "scaleY(1)";
    this.columnSpinner.childNodes[0].style.animationName = 'bounce_loadingProgress';
  }
  else{
    this.closeSpinner();
  }
}

/**
 * Closes the panel
 */
MessagesColumn.prototype.closeSpinner = function(){
  if(this.isSpinnerOpen){
    this.isSpinnerOpen = false;
    this.columnSpinner.style.transform = "scaleY(0)";
    this.columnSpinner.childNodes[0].style.animationName = '';
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
    document.querySelector('#tweets-column-panel-'+this.id+' .tweets-column-panel-list-first label').textContent = 'Display';
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
    document.querySelector('#tweets-column-panel-'+this.id+' .tweets-column-panel-list-first label').textContent = 'Hide';
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

MessagesColumn.prototype.addListToDisplay = function(){
  var selectList = document.querySelector('#tweets-column-panel-' + this.id + ' .tweets-column-panel-list-twitterLists-select');
  var chosenList = selectList.value;
  var alreadyAffected = false;

  if(selectList.getAttribute('exist') === 'true'){
    alreadyAffected = true;
  }

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

  var hashtagsList = document.createElement('ul');
  hashtagsList.className = 'tweets-column-panel-list-hashtagsList';
  this.hashtagsBlock.innerHTML = '';
  this.hashtagsBlock.appendChild(hashtagsList);

  this.openPanel();
  this.openSpinner();
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
  this.closeSpinner();
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
  var hashtagsList = this.generateHashtagsList();
  this.hashtagsBlock.innerHTML = '';
  this.hashtagsBlock.appendChild(hashtagsList);
  this.openSpinner();
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
  var hashtagsList = this.generateHashtagsList();
  this.hashtagsBlock.innerHTML = '';
  this.hashtagsBlock.appendChild(hashtagsList);
}

/**
 * Deletes the column
 */
MessagesColumn.prototype.deleteColumn = function(){
  this.MessagesDisplay.deleteColumn(this.id);
}

/**
 * Empty column
 */
MessagesColumn.prototype.emptyColumn = function(){
  this.columnContentHTML.innerHTML = '';
  this.messagesList = [];
}
