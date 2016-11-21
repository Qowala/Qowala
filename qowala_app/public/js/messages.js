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
  // Use this variable to manage tweet if it is either retweeted or not
  this.messageStatus = message.retweeted_status ? message.retweeted_status : message;

  this.id_str = this.messageStatus.id_str;
  this.retweeterAuthorUsername = message.user.name;
  this.retweeterAuthorPseudonym = message.user.screen_name;
  this.retweeterProfilePicture = message.user.profile_image_url_https;
  this.retweetCount = this.messageStatus.retweet_count;
  this.authorUsername = this.messageStatus.user.screen_name;
  this.authorPseudonym = this.messageStatus.user.name;
  this.date = this.messageStatus.created_at;
  this.displayedDate = '0 min ago';
  this.friendlyDate = this.messageStatus.created_at;
  this.dateHTML = null;
  this.text = document.createTextNode('p');
  this.hasBeenTextAlreadyProcessed = false;
  this.text.textContent = this.messageStatus.text;
  this.profilePicture = this.messageStatus.user.profile_image_url_https;
  this.streamSource = streamSource
  this.retweeted = this.messageStatus.retweeted;
  this.areImagesEnabled = areImagesEnabled;
  this.image = null;
  this.user = message.retweeted_status ? message.retweeted_status.user : message.user;

  this.isRetweet = message.retweeted_status ? true : false;

  this.messageStatus = message.retweeted_status ? message.retweeted_status : message;

  this.urls = message.retweeted_status ? message.retweeted_status.entities.urls : message.entities.urls;
  this.medias = this.messageStatus.extended_entities ? this.messageStatus.extended_entities.media : this.messageStatus.entities.media;
  this.hashtags = message.retweeted_status ? message.retweeted_status.entities.hashtags : message.entities.hashtags;
  this.user_mentions = message.retweeted_status ? message.retweeted_status.entities.user_mentions : message.entities.user_mentions;

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
  // Be careful to change it to id_str when it will be updated
  newTweet.setAttribute('name', 'tweet-' + this.id_str);

  if(this.isRetweet){
    var newUserRetweeter = document.createElement('p');
    newUserRetweeter.className = "tweet-retweeter";

    var newRetweeterFont = document.createElement('i');
    newRetweeterFont.setAttribute('class', 'fa fa-retweet');
    newUserRetweeter.appendChild(newRetweeterFont);

    var retweeterImg = document.createElement('img');
    retweeterImg.setAttribute('src', this.retweeterProfilePicture);
    retweeterImg.setAttribute('class', 'tweet-retweeter-profile');
    newUserRetweeter.insertBefore(retweeterImg, newUserRetweeter.firstChild);

    newUserRetweeter.insertAdjacentHTML('beforeend', ' retweeted by <span>' + this.retweeterAuthorUsername + '</span>');

    newTweet.appendChild(newUserRetweeter);
  }

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
  newRetweetButton.setAttribute('name', 'retweet-' + this.id_str);
  newRetweetButton.setAttribute('class', 'tweet-retweet-button');
  newRetweetButton.textContent = ' ' + this.retweetCount;

  var newRetweetFont = document.createElement('i');
  newRetweetFont.setAttribute('class', 'fa fa-retweet');

  var replyButton = document.createElement('button');
  replyButton.setAttribute('name', 'reply-' + this.id_str);
  replyButton.setAttribute('class', 'tweet-reply-button');

  var replyFont = document.createElement('i');
  replyFont.setAttribute('class', 'fa fa-reply');

  var retweetConfirmationNotice = document.createElement('div');
  retweetConfirmationNotice.className = 'retweet-confirmation-notice';

  var retweetConfirmationText = document.createElement('p');
  retweetConfirmationText.textContent = 'Are you sure you want to retweet?';

  var retweetConfirmationApproveButton = document.createElement('button');
  retweetConfirmationApproveButton.className = 'retweet-confirmation-approve-button';

  var approveFont = document.createElement('i');
  approveFont.setAttribute('class', 'fa fa-check');

  var retweetConfirmationDenyButton = document.createElement('button');
  retweetConfirmationDenyButton.className = 'retweet-confirmation-deny-button';

  var denyFont = document.createElement('i');
  denyFont.setAttribute('class', 'fa fa-times');

  retweetConfirmationNotice.appendChild(retweetConfirmationText);
  retweetConfirmationDenyButton.appendChild(denyFont);
  retweetConfirmationNotice.appendChild(retweetConfirmationDenyButton);
  retweetConfirmationApproveButton.appendChild(approveFont);
  retweetConfirmationNotice.appendChild(retweetConfirmationApproveButton);

  // Put event listener on elements
  this.addEvent(newRetweetButton, replyButton);

  newImg.addEventListener('click', function(e){
    this.openUserPanel(e);
  }.bind(this));

  newLinkAuthor.addEventListener('click', function(e){
    e.preventDefault();
    this.openUserPanel(e);
  }.bind(this));

  newRetweetButton.insertBefore(newRetweetFont, newRetweetButton.firstChild);
  replyButton.appendChild(replyFont);
  newTweet.appendChild(newImg);
  newTweet.appendChild(newLinkAuthor);
  newTweet.appendChild(newAuthorScreenName);
  newTweet.appendChild(newDate);
  newTweet.appendChild(newContent);
  newTweet.appendChild(replyButton);
  newTweet.appendChild(newRetweetButton);
  newTweet.appendChild(retweetConfirmationNotice);

  return newTweet;
}

Message.prototype.openUserPanel = function(e){
  socket.emit('getFollowedBy', this.user.id);
  var userProfilePanel = document.getElementById('userProfilePanel');
  var userProfileBannerImg = document.getElementById('userProfileBannerImg');
  var userProfileTweets = document.getElementById('userProfileTweets');
  var userProfileFollowers = document.getElementById('userProfileFollowers');
  var userProfileFollowings = document.getElementById('userProfileFollowings');
  var userProfileListed = document.getElementById('userProfileListed');
  var userProfileImg = document.getElementById('userProfileImg');
  var userProfileName = document.getElementById('userProfileName');
  var userProfileCity = document.getElementById('userProfileCity');
  var userProfileDescription = document.getElementById('userProfileDescription');
  var userProfileTweetsLink = document.getElementById('userProfileTweetsLink');
  var userProfileMentionsLink = document.getElementById('userProfileMentionsLink');
  var userProfileListsLink = document.getElementById('userProfileListsLink');
  var userProfileFavoritesLink = document.getElementById('userProfileFavoritesLink');
  var userProfileTweetButton = document.getElementById('userProfileTweetButton');
  var userProfileFollowing = document.getElementById('userProfileFollowing');
  var mainSidebar = document.getElementById('mainSidebar');

  userProfilePanel.style.display = 'block';

  function closeUserProfilePopup(e){
    e.stopPropagation();
    e.preventDefault();
    columnsList.removeEventListener('click', closeUserProfilePopup, true);
    mainSidebar.removeEventListener('click', closeUserProfilePopup, true);
    var popup = document.getElementById('userProfilePanel');
    popup.style.display = 'none';
  }

  var columnsList = document.getElementById('tweets-columns-list');
  columnsList.addEventListener('click', closeUserProfilePopup, true);
  mainSidebar.addEventListener('click', closeUserProfilePopup, true);


  if (this.user.profile_banner_url) {
    userProfileBannerImg.style.height = '200px';
    userProfileImg.setAttribute('class', '');
    userProfileBannerImg.style.backgroundImage = 'url('+this.user.profile_banner_url+'/600x200)';
  }
  else {
    userProfileImg.setAttribute('class', 'top');
    userProfileBannerImg.style.height = 0;
  }
  userProfileTweets.innerHTML = this.user.statuses_count;
  userProfileFollowers.innerHTML = this.user.followers_count;
  userProfileFollowings.innerHTML = this.user.friends_count;
  userProfileListed.innerHTML = this.user.listed_count;

  var re = /normal/;
  var str = this.user.profile_image_url;
  var subst = 'bigger';
  var result = str.replace(re, subst);
  userProfileImg.setAttribute('src',result);

  userProfileName.innerHTML = this.user.name;
  var nameSpan = document.createElement('span');
  nameSpan.innerHTML = "@" + this.user.screen_name
  userProfileName.appendChild(nameSpan);

  if (this.user.location) {
    var markerIcon = document.createElement('i');
    markerIcon.setAttribute('class','fa fa-map-marker');
    userProfileCity.appendChild(markerIcon);
    userProfileCity.innerHTML = " " + this.user.location;
  }

  var description = document.createElement('p');
  description.textContent = this.user.description;

  userProfileDescription.innerHTML = '';
  userProfileDescription.appendChild(processText(description).text);

  userProfileTweetButton.addEventListener('click', function(e){
      this.prepareReply();
  }.bind(this));

  var emit = ['followUser', 'unfollowUser'];
  var actions = ['Unfollow', 'Follow'];
  var classes = ['following', ''];
  var index = 1;
  if (this.user.following) {
    index = 0;
  }

  userProfileFollowing.innerHTML = actions[index];
  userProfileFollowing.setAttribute('class', classes[index]);

  userProfileFollowing.addEventListener('click', function(){
    index ^= 1;
    socket.emit(emit[index], this.user.id);
    userProfileFollowing.innerHTML = actions[index];
    userProfileFollowing.setAttribute('class', classes[index]);
  }.bind(this), true);

  var baseUrl = 'https://twitter.com/' + this.user.screen_name;
  userProfileTweetsLink.setAttribute('href', baseUrl);
  userProfileMentionsLink.setAttribute('href', 'https://twitter.com/search?q=@' + this.user.screen_name);
  userProfileListsLink.setAttribute('href', baseUrl + '/lists');
  userProfileFavoritesLink.setAttribute('href', baseUrl + '/favorites');

  document.getElementById('userProfileFollowedBy').innerHTML = 'Followed by <i class="fa fa-spinner"></i>';
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
  month++; // Increment by one as it begins at 0 in Javascript
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
Message.prototype.addEvent = function(retweetButton, replyButton){
  retweetButton.addEventListener('click', function(e){
      this.sendRetweet(e);
  }.bind(this));
  replyButton.addEventListener('click', function(e){
      this.prepareReply();
  }.bind(this));
}

/**
 * Send Retweet message
 */
Message.prototype.sendRetweet = function(e){

  if(this.retweeted){
    console.log('Gonna send delete tweet with id_str: ', this.id_str);
    socket.emit('delete retweet', this.id_str);
    this.retweeted = false;
    this.applyTweetStatus();
  }
  else{
    var tweet = e.target.parentElement;
    var tweetConfirmationNotice = tweet.getElementsByClassName ('retweet-confirmation-notice')[0];
    var retweetCancelButton = tweetConfirmationNotice.getElementsByClassName('retweet-confirmation-deny-button')[0];
    var retweetButton = tweetConfirmationNotice.getElementsByClassName('retweet-confirmation-approve-button')[0];

    tweetConfirmationNotice.style.display = 'block';

    function closeRetweetNotice(e){
      tweetConfirmationNotice.style.display = 'none';
    }

    retweetCancelButton.addEventListener('click', closeRetweetNotice, true);

    function sendRetweetCommand(e){
      socket.emit('retweet', this.id_str);
      this.retweeted = true;
      tweetConfirmationNotice.style.display = 'none';
      this.applyTweetStatus();
    }

    var bindedFunction = (sendRetweetCommand).bind(this);

    retweetButton.addEventListener('click', bindedFunction, true);

  }
}

/**
 * Prepare message trail to reply
 */
Message.prototype.prepareReply = function(){

  var prepareReply = new Event('prepareReply');
  prepareReply.tweetRecipientId = this.id_str;
  prepareReply.tweetRecipientUsername = this.authorUsername;
  document.dispatchEvent(prepareReply);
}

/**
 * Apply tweet's status on the display
 */
Message.prototype.applyTweetStatus = function(){
  if(this.retweeted){
    retweetButtons = document.getElementsByName('retweet-' + this.id_str);
    for (var i = 0; i < retweetButtons.length; i++) {
      retweetButtons[i].removeAttribute("class");
      retweetButtons[i].setAttribute('class', 'tweet-retweet-button-active');
      console.log('Updated concerning retweet ', this.id_str);
    };
  }
  else{
    retweetButtons = document.getElementsByName('retweet-' + this.id_str);
    for (var i = 0; i < retweetButtons.length; i++) {
      retweetButtons[i].removeAttribute("class");
      retweetButtons[i].setAttribute('class', 'tweet-retweet-button');
      console.log('Updated disabled concerning retweet');
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
  toBeDisplayed = toBeDisplayed + ' ago';

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
    toBeDisplayed = toBeDisplayed + ' ago';

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
    // console.log('Being recalled');
  }

  this.displayedDate = toBeDisplayed;
  //return toBeDisplayed;
}

/**
 * Process the message text
 * @return {[type]} [description]
 */
Message.prototype.processText = function(){
  if(!this.hasBeenTextAlreadyProcessed){
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
        var videoInfo = false;
        if (this.medias[i].type == 'animated_gif') {
          videoInfo = this.medias[i].video_info;
        }

        var urlIndice = {
          expanded_url: this.medias[i].expanded_url,
          media_url: this.medias[i].media_url_https,
          url: this.medias[i].url,
          indices: this.medias[i].indices,
          largeSize: this.medias[i].sizes.large,
          media: true,
          videoInfo: videoInfo
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

    /**
    * Search for escaped special characters and transform them
    * @param {String} text Unescaped text
    */
    function unescapeHTML(text){
      text = text.replace(/&amp;/g, '&');
      text = text.replace(/&gt;/g, '>');
      text = text.replace(/&lt;/g, '<');
      text = text.replace(/&quot;/g, '"');
      text = text.replace(/&#39;/g, "'");
      return text;
    }

    // Sort the indices from bigger to smaller
    urls_indices.sort(compareIndicesInversed);

    var parsedText = document.createElement('p');
    if(urls_indices[0]){

      for (var i = 0; i < urls_indices.length; i++) {
        var decodedText = punycode.ucs2.decode(tweetText);
        var splittedText = punycode.ucs2.encode(decodedText.slice(urls_indices[i].indices[1]));

        splittedText = unescapeHTML(splittedText);

        var firstPart = document.createTextNode(splittedText);

        if(urls_indices[i].indices[0] == 139){
          tweetText = tweetText
            .substring(0, tweetText.lastIndexOf(' ') + 1);
        }
        else{
          var decodedText = punycode.ucs2.decode(tweetText);
          tweetText = punycode.ucs2.encode(decodedText.slice(0, urls_indices[i].indices[0]));
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
            var displayUrl = urls_indices[i].expanded_url
              .slice(0, 32);
            displayUrl += '...';
          }
          else {
            var displayUrl = urls_indices[i].expanded_url;
          }
          link.setAttribute('href', urls_indices[i].expanded_url);
          link.textContent = displayUrl;
        }

        if(urls_indices[i].media){
          if(urls_indices[i].videoInfo){
            var video = document.createElement('video');
            video.setAttribute('src',
            urls_indices[i].videoInfo.variants[0].url);
            video.setAttribute('controls', true);
            video.setAttribute('loop', true);

            if(this.areImagesEnabled){
              video.className = "tweet-image";
              link.className = "tweet-link-image-none";
            }
            else{
              video.className = "tweet-image-none";
              link.className = "tweet-link-image";
            }
            parsedText.appendChild(video);
          }
          else {
            var image = document.createElement('img');
            image.setAttribute('src',
              urls_indices[i].media_url + ':small');
            image.setAttribute('fullsize',
              urls_indices[i].largeSize.h +
              '/' +
              urls_indices[i].largeSize.w);

            if(this.areImagesEnabled){
              image.className = "tweet-image";
              link.className = "tweet-link-image-none";
            }
            else{
              image.className = "tweet-image-none";
              link.className = "tweet-link-image";
            }

            // Put an event to enlarge the image
            image.addEventListener('click', function(e){
              this.enlargeImage(e);
            }.bind(this), false);

            this.image = image;
            parsedText.appendChild(image);
          }
        }

        parsedText.insertBefore(firstPart, parsedText.firstChild);
        parsedText.insertBefore(link, parsedText.firstChild);

        if(i == urls_indices.length - 1){
          var decodedText = punycode.ucs2.decode(tweetText);
          splittedText = punycode.ucs2.encode(decodedText.slice(0, urls_indices[i].indices[0]));
          splittedText = unescapeHTML(splittedText);
          var firstPart = document.createTextNode(splittedText);
          parsedText.insertBefore(firstPart, parsedText.firstChild);
        }
      };
    }
    else {
      tweetText = unescapeHTML(tweetText);
      var firstPart = document.createTextNode(tweetText);
      parsedText.appendChild(firstPart);
    }

    this.text = parsedText;
    this.text = twemoji.parse(this.text);
    this.hasBeenTextAlreadyProcessed = true;
  }
}

/**
 * Process tweet's medias
 */
Message.prototype.processMedia = function(){

  var medias = document.createElement('div');

  if(this.areImagesEnabled){
    medias.setAttribute('class', 'tweet-medias');
    //link.className = "tweet-link-image-none";
  }
  else{
    medias.setAttribute('class', 'tweet-medias-none');
    //link.className = "tweet-link-image";
  }

  var imageSize = ':small';

  for (var i = 0; i < this.medias.length; i++) {
    if (this.medias[i].type == 'animated_gif') {
      var video = document.createElement('video');
      video.setAttribute('src',
      this.medias[i].video_info.variants[0].url);
      video.setAttribute('controls', true);
      video.setAttribute('loop', true);

      medias.appendChild(video);
    }
    else {
      var image = document.createElement('img');
      image.setAttribute('src',
        this.medias[i].media_url + imageSize);
      image.setAttribute('fullsize',
        this.medias[i].sizes.large.h +
        '/' +
        this.medias[i].sizes.large.w);

      image.addEventListener('click', enlargeImage);

      medias.appendChild(image);
      imageSize = ':thumb';
    }
  }

  this.mediasElement = medias;
}

/**
 * Loads a bigger image
 */
Message.prototype.enlargeImage = function(e){
  var srcAttribute = e.target.src;
  var src = srcAttribute.substring(0, srcAttribute.lastIndexOf(':'));
  var popupImage = document.querySelector('#largeImagePopup img');
  popupImage.setAttribute('src', srcAttribute);

  var fullsize = e.target.attributes[1].value;
  var height = parseInt(fullsize.substring(0, fullsize.lastIndexOf('/')));
  var width = parseInt(fullsize.substring(fullsize.lastIndexOf('/') + 1, fullsize.length));
  var differencial = Math.min(window.innerHeight*0.8 / height, window.innerWidth*0.8 / width);
  if (differencial < 1) {
    height = height*differencial;
    width = width*differencial;
  }
  var popup = document.getElementById('largeImagePopup');
  var popupBack = document.querySelector('#largeImagePopup .back');
  var popupCross = document.querySelector('#largeImagePopup .cross');
  var downloadingImage = new Image();
  downloadingImage.onload = function(){
    popupImage.setAttribute('src', this.src);
  };
  downloadingImage.src = src + ':large';

  var halfWidth = width / 2;
  var left = 'calc(50% - ' + halfWidth + 'px)';
  // console.log('left: ', left);
  popupImage.style.left = left;
  var halfHeight = height / 2;
  var top = 'calc(50% - ' + halfHeight + 'px)';
  // console.log('top: ', top);
  popupImage.style.top = top;

  popupImage.style.height = height + 'px';
  popupImage.style.width = width + 'px';

  popup.style.zIndex = 20000;
  popup.style.opacity = 1;

  popupCross.style.right = 'calc(50% - ' + (halfWidth-15) + 'px)';
  popupCross.style.top = 'calc(50% - ' + (halfHeight-15) + 'px)';

  function closeImagePopup(e){
    // columnsList.removeEventListener('click', closeImagePopup, true);
    document.querySelector('#largeImagePopup .cross').removeEventListener('click', closeImagePopup, true);
    e.stopPropagation();
    e.preventDefault();
    var popup = document.getElementById('largeImagePopup');
    var popupBack = document.querySelector('#largeImagePopup .back');
    popupBack.removeEventListener('click', closeImagePopup, true);
    popup.style.zIndex = -1;
    popup.style.opacity = 0;
  }

  // var columnsList = document.getElementById('tweets-columns-list');
  // columnsList.addEventListener('click', closeImagePopup, true);
  popupBack.addEventListener('click', closeImagePopup, true);
  popupCross.addEventListener('click', closeImagePopup, true);
}

/**
 * Process the description text
 * @return {[type]} [description]
 */
processText = function(text){
  if(!text.hasBeenTextAlreadyProcessed){
    // Array where to store all URLs of the tweet
    var urls_indices = [];

    // Copy of the original text
    var tweetText = text.textContent;

    // Parse all URLs from the Tweet object to be sort in a array
    if(text.urls) {
      for (var i = 0; i < text.urls.length; i++) {
        var urlIndice = {
          expanded_url: text.urls[i].expanded_url,
          url: text.urls[i].url,
          indices: text.urls[i].indices,
          media: false
        };
        urls_indices.push(urlIndice);
      }
    }
    // Parse all media URLs from the Tweet object to be sort in a array
    if(text.medias) {
      for (var i = 0; i < text.medias.length; i++) {
        var videoInfo = false;
        if (text.medias[i].type == 'animated_gif') {
          videoInfo = text.medias[i].video_info;
        }

        var urlIndice = {
          expanded_url: text.medias[i].expanded_url,
          media_url: text.medias[i].media_url_https,
          url: text.medias[i].url,
          indices: text.medias[i].indices,
          largeSize: text.medias[i].sizes.large,
          media: true,
          videoInfo: videoInfo
        };
        urls_indices.push(urlIndice);
      };
    }

    if(text.hashtags) {
      for (var i = 0; i < text.hashtags.length; i++) {
        var urlIndice = {
          url: 'https://twitter.com/hashtag/' + text.hashtags[i].text,
          text: '#' + text.hashtags[i].text,
          indices: text.hashtags[i].indices,
          hashtag: true
        };
        urls_indices.push(urlIndice);
      };
    }

    if(text.user_mentions) {
      for (var i = 0; i < text.user_mentions.length; i++) {
        var urlIndice = {
          url: 'https://twitter.com/' + text.user_mentions[i].screen_name,
          text: '@' + text.user_mentions[i].screen_name,
          indices: text.user_mentions[i].indices,
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

    /**
    * Search for escaped special characters and transform them
    * @param {String} text Unescaped text
    */
    function unescapeHTML(text){
      text = text.replace(/&amp;/g, '&');
      text = text.replace(/&gt;/g, '>');
      text = text.replace(/&lt;/g, '<');
      text = text.replace(/&quot;/g, '"');
      text = text.replace(/&#39;/g, "'");
      return text;
    }

    // Sort the indices from bigger to smaller
    urls_indices.sort(compareIndicesInversed);

    var parsedText = document.createElement('p');
    if(urls_indices[0]){

      for (var i = 0; i < urls_indices.length; i++) {
        var splittedText = tweetText
          .substring(urls_indices[i].indices[1]) + " ";

        splittedText = unescapeHTML(splittedText);

        var firstPart = document.createTextNode(splittedText);

        if(urls_indices[i].indices[0] == 139){
          tweetText = tweetText
            .substring(0, tweetText.lastIndexOf(' ') + 1);
        }
        else{
          tweetText = tweetText
            .substring(0, urls_indices[i].indices[0]);
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
            var displayUrl = urls_indices[i].expanded_url
              .slice(0, 32);
            displayUrl += '...';
          }
          else {
            var displayUrl = urls_indices[i].expanded_url;
          }
          link.setAttribute('href', urls_indices[i].expanded_url);
          link.textContent = displayUrl;
        }

        if(urls_indices[i].media){
          if(urls_indices[i].videoInfo){
            var video = document.createElement('video');
            video.setAttribute('src',
            urls_indices[i].videoInfo.variants[0].url);
            video.setAttribute('controls', true);
            video.setAttribute('loop', true);

            if(text.areImagesEnabled){
              video.className = "tweet-image";
              link.className = "tweet-link-image-none";
            }
            else{
              video.className = "tweet-image-none";
              link.className = "tweet-link-image";
            }
            parsedText.appendChild(video);
          }
          else {
            var image = document.createElement('img');
            image.setAttribute('src',
              urls_indices[i].media_url + ':small');
            image.setAttribute('fullsize',
              urls_indices[i].largeSize.h +
              '/' +
              urls_indices[i].largeSize.w);

            if(text.areImagesEnabled){
              image.className = "tweet-image";
              link.className = "tweet-link-image-none";
            }
            else{
              image.className = "tweet-image-none";
              link.className = "tweet-link-image";
            }

            // Put an event to enlarge the image
            image.addEventListener('click', function(){
              text.enlargeImage();
            }.bind(text), false);

            text.image = image;
            parsedText.appendChild(image);
          }
        }

        parsedText.insertBefore(firstPart, parsedText.firstChild);
        parsedText.insertBefore(link, parsedText.firstChild);

        if(i == urls_indices.length - 1){
          splittedText = tweetText.substring(0,
            urls_indices[i].indices[0]);
          splittedText = unescapeHTML(splittedText);
          var firstPart = document.createTextNode(splittedText);
          parsedText.insertBefore(firstPart, parsedText.firstChild);
        }
      };
    }
    else {
      tweetText = unescapeHTML(tweetText);
      var firstPart = document.createTextNode(tweetText);
      parsedText.appendChild(firstPart);
    }

    text.text = parsedText;
    text.hasBeenTextAlreadyProcessed = true;
  }
  return text;
}
