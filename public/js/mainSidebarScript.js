/**
 * Displays the main controls
 */
function MainSidebar(mapping, createBlankColumn){
  this.buttonOpenMessageEdition = mapping.buttonOpenMessageEdition;
  this.buttonAddColumn = mapping.buttonAddColumn;
  this.buttonOpenNotificationPanel = mapping.buttonOpenNotificationPanel;
  this.createBlankColumn = createBlankColumn;
  this.isMessageEditionPanelOpen = false;
  this.isNotificationPanelOpen = false;
  this.messageEditionPanel = mapping.messageEditionPanel;
  this.notificationPanel = mapping.notificationPanel;
  this.messageTextarea = mapping.messageTextarea;
  this.numberCharactersLeft = mapping.numberCharactersLeft;
  this.sendTweetButton = mapping.sendTweetButton;

  this.inputTag = mapping.inputTag;
  this.tagContainer = mapping.tagContainer;
  this.draggableTags = [];
  this.numberConnectedUsersSpan = mapping.numberConnectedUsersSpan;
  this.tweetRecipient = {'tweetRecipientUsername': '',
                         'tweetRecipientId': ''};

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

  // Triggers a click on the button to open the notification panel
  this.buttonOpenNotificationPanel.addEventListener('click', function(e){
    this.toggleNotificationPanel();
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
MainSidebar.prototype.openMessageEdition = function(openForce){
  this.isMessageEditionPanelOpen = !this.isMessageEditionPanelOpen || openForce;
  if(this.isMessageEditionPanelOpen || openForce){
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
    if (this.tweetRecipient.tweetRecipientUsername !== '') {
      var index = message.search(this.tweetRecipient.tweetRecipientUsername);
      if (index !== 1) {
        this.tweetRecipient.tweetRecipientId = '';
      }
      this.tweetRecipient.tweetRecipientUsername = '';
    }
    socket.emit('sendMessage', {
      'message': message,
      'in_reply_to_status_id': this.tweetRecipient.tweetRecipientId
    });
    this.messageTextarea.value = "";
    this.openMessageEdition();
  }
}

/**
 * Insert text in message edition panel
 */
MainSidebar.prototype.insertMessage = function(message){
  // Thank you to nemisj for his setCursor function http://stackoverflow.com/a/1867393
  function setCursor(node,pos){
    node = (typeof node == "string" || node instanceof String) ? document.getElementById(node) : node;
    if(!node){
        return false;
    } else if(node.createTextRange){
        var textRange = node.createTextRange();
        textRange.collapse(true);
        textRange.moveEnd(pos);
        textRange.moveStart(pos);
        textRange.select();
        return true;
    } else if(node.setSelectionRange){
        node.setSelectionRange(pos,pos);
        return true;
    }
    return false;
  }
  this.messageTextarea.value = message + ' ';
  this.messageTextarea.focus();
  setCursor(this.messageTextarea, this.messageTextarea.value.length);
}

MainSidebar.prototype.toggleNotificationPanel = function(forceOpen){
  var toggleNotificationPanel = new Event('toggleNotificationPanel');
  toggleNotificationPanel.forceOpen = forceOpen;
  document.dispatchEvent(toggleNotificationPanel);
}

/**
 * Displays the notifications
 */
function NotificationPanel(mapping){
  this.isNotificationPanelOpen = false;
  this.notificationPanel = mapping.notificationPanel;
  this.notificationPanelList = mapping.notificationPanel.getElementsByTagName('ul')[0];
  this.notificationsList = [];
  this.notificationsCounter = mapping.notificationsCounter;
  this.notificationCount = 0;
}

NotificationPanel.prototype.toggleNotificationPanel = function(forceOpen){
  this.isNotificationPanelOpen = !this.isNotificationPanelOpen;
  if(this.isNotificationPanelOpen){
    this.notificationPanel.style.left = '120px';
    if(this.notificationCount !== 0){
      this.notificationsCounter.style.display = 'none';
      this.notificationCount = 0;
    }
  }
  else{
    this.notificationPanel.style.left = '-330px';
  }
}

NotificationPanel.prototype.processNotification = function(notification, noAlert){
  if(notification.streamSource === 'mention'){
    // Do we activate mentions?
    //this.createNotification(notification, noAlert);
  }
  else if(notification.streamSource === 'retweet'){
    notification.tweet.retweeted_status.created_at = notification.tweet.created_at;
    this.createNotification(notification, noAlert);
  }
  else if(notification.streamSource === 'reply'){
    // Do we activate replies?
    //this.createNotification(notification, noAlert);
  }
  else if(notification.streamSource === 'follow'){
    notification.tweet = notification.event.source;
    notification.tweet.created_at = notification.event.created_at;
    notification.tweet.user = {
      'name': notification.event.source.name,
      'profile_image_url_https': notification.event.source.profile_image_url_https
    };
    notification.tweet.entities = {};
    this.createNotification(notification, noAlert);
  }
  else if(notification.streamSource === 'favorite'){
    notification.tweet = notification.event.target_object;
    notification.tweet.created_at = notification.event.created_at;
    notification.tweet.user = {
      'name': notification.event.target.name,
      'screen_name': notification.event.target.screen_name,
      'profile_image_url_https': notification.event.target.profile_image_url_https
    };
    notification.tweet.entities = {};
    this.createNotification(notification, noAlert);
  }
  // Do we activate unfavorites?
  /*else if(notification.streamSource === 'unfavorite'){
    console.log('A unfavorite');
    console.log('name: ', notification.event.source.name);
    console.log('username: ', notification.event.source.screen_name);
    console.log('profile image: ', notification.event.source.profile_image_url_https);
    notification.tweet = notification.event.source;
    notification.tweet.created_at = notification.event.created_at;
    notification.tweet.user = {
      'name': notification.event.source.name
    };
    notification.tweet.entities = {};
    this.createNotification(notification, noAlert);
  }*/
}

NotificationPanel.prototype.createNotification = function(notification, noAlert){
  var notification = new Notification(notification);

  notification.message.processDate();
  var generatedNotification = notification.generateNotification();
  this.notificationsList.unshift(generatedNotification);
  this.notificationPanelList.insertBefore(generatedNotification, this.notificationPanelList.childNodes[0]);
  if(!noAlert){
    this.notificationsCounter.textContent = this.notificationCount = this.notificationCount + 1;
    this.notificationsCounter.style.display = 'block';
  }
}

/**
 * Notification's class
 * @param {Object} notification            Notification
 */
function Notification(notification){
  this.type = notification.streamSource;
  if(this.type === 'follow' || this.type === 'favorite'){
    this.userDescription = notification.event.source.description;
    this.userName = notification.event.source.name;
    this.userScreenName = notification.event.source.screen_name;
  }
  this.message = new Message(notification.tweet, notification.streamSource, false);
}

/**
 * Create the HTML elements for the notification
 * @return {Object}         Generated notification in HTML
 */
Notification.prototype.generateNotification = function(){

  this.message.processText();

  var notification = document.createElement('li');
  notification.setAttribute('name', 'notification-' + this.id_str);
  notification.setAttribute('class', 'notification');
  var notifTitle = document.createElement('h4');
  var notifIcon = document.createElement('i');
  var twitterIcon = document.createElement('i');
  twitterIcon.setAttribute('class', 'fa fa-twitter');
  notification.appendChild(twitterIcon);

  if(this.type === 'retweet'){
    notifTitle.textContent = this.message.retweeterAuthorUsername + ' retweeted you';
    notifIcon.setAttribute('class', 'fa fa-retweet');
    notification.appendChild(notifTitle);
    notification.appendChild(notifIcon);

    var linkAuthorImg = document.createElement('a');
    linkAuthorImg.setAttribute('href', 'https://twitter.com/' + this.message.authorUsername);
    linkAuthorImg.setAttribute('target', '_blank');

    var linkAuthor = document.createElement('a');
    linkAuthor.setAttribute('class', 'tweet-authorname');
    linkAuthor.setAttribute('href', 'https://twitter.com/' + this.message.authorUsername);
    linkAuthor.setAttribute('target', '_blank');
    linkAuthor.textContent = this.message.authorPseudonym;

    var authorScreenName = document.createElement('span');
    authorScreenName.setAttribute('class', 'tweet-authorScreenName');
    authorScreenName.textContent = '@' + this.message.authorUsername;

    var profileImg = document.createElement('img');
    profileImg.setAttribute('src', this.message.profilePicture);
    profileImg.setAttribute('class', 'tweet-profile');

    var content = document.createElement('p');
    content = this.message.text;
    content.setAttribute('class', 'tweet-text');

    linkAuthorImg.appendChild(profileImg);
    notification.appendChild(linkAuthorImg);
    notification.appendChild(linkAuthor);
    notification.appendChild(authorScreenName);
    notification.appendChild(content);
  }
  else if(this.type === 'favorite'){
    notifTitle.textContent = this.userName + ' favorited you';
    notifIcon.setAttribute('class', 'fa fa-star');
    notification.appendChild(notifTitle);
    notification.appendChild(notifIcon);

    var linkAuthorImg = document.createElement('a');
    linkAuthorImg.setAttribute('href', 'https://twitter.com/' + this.message.authorUsername);
    linkAuthorImg.setAttribute('target', '_blank');

    var linkAuthor = document.createElement('a');
    linkAuthor.setAttribute('class', 'tweet-authorname');
    linkAuthor.setAttribute('href', 'https://twitter.com/' + this.message.authorUsername);
    linkAuthor.setAttribute('target', '_blank');
    linkAuthor.textContent = this.message.authorPseudonym;

    var authorScreenName = document.createElement('span');
    authorScreenName.setAttribute('class', 'tweet-authorScreenName');
    authorScreenName.textContent = '@' + this.message.authorUsername;

    var profileImg = document.createElement('img');
    profileImg.setAttribute('src', this.message.profilePicture);
    profileImg.setAttribute('class', 'tweet-profile');

    var content = document.createElement('p');
    content = this.message.text;
    content.setAttribute('class', 'tweet-text');

    linkAuthorImg.appendChild(profileImg);
    notification.appendChild(linkAuthorImg);
    notification.appendChild(linkAuthor);
    notification.appendChild(authorScreenName);
    notification.appendChild(content);
  }
  else if(this.type === 'follow'){
    notifTitle.textContent = 'New follower';
    notifIcon.setAttribute('class', 'fa fa-user-plus');
    notification.appendChild(notifTitle);
    notification.appendChild(notifIcon);
    var linkAuthorImg = document.createElement('a');
    linkAuthorImg.setAttribute('href', 'https://twitter.com/' + this.userScreenName);
    linkAuthorImg.setAttribute('target', '_blank');

    var profileImg = document.createElement('img');
    profileImg.setAttribute('src', this.message.profilePicture);
    profileImg.setAttribute('class', 'tweet-profile');

    var linkAuthor = document.createElement('a');
    linkAuthor.setAttribute('class', 'tweet-authorname');
    linkAuthor.setAttribute('href', 'https://twitter.com/' + this.userScreenName);
    linkAuthor.setAttribute('target', '_blank');
    linkAuthor.textContent = this.userName;

    var authorScreenName = document.createElement('span');
    authorScreenName.setAttribute('class', 'tweet-authorScreenName');
    authorScreenName.textContent = '@' + this.userScreenName;

    var content = document.createElement('p');
    content.textContent = this.userDescription;
    content.setAttribute('class', 'tweet-text');
    console.log('this.userDescription: ', this.userDescription);
    console.log('content: ', content);

    linkAuthorImg.appendChild(profileImg);
    notification.appendChild(linkAuthorImg);
    notification.appendChild(linkAuthor);
    notification.appendChild(authorScreenName);
    notification.appendChild(content);
  }

  var notificationDate = document.createElement('span');
  notificationDate.setAttribute('class', 'tweet-date');
  notificationDate.setAttribute('title', this.message.friendlyDate);
  notificationDate.textContent = this.message.displayedDate;
  this.message.dateHTML = notificationDate;

  notification.appendChild(notificationDate);

  return notification;
}
