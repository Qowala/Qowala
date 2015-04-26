var tagsModel = require('../model/tagsModel');
var usersModel = require('../model/usersModel');
var twitterAgent = require('../lib/twitter');

// Array to store temporary data such as socket and pause status
var usersArray = [];

var users = {

    /**
     * Set a socket to a user
     * @param {Number} userId Users ID to be set with the socket
     * @param {[type]} socket Socket to set to 
     */
    setSocket: function(userId, socket){
        if(!usersArray[userId]){
            throw new Error('User doesn\'t exist. Socket can\'t be set');
        }
        else{
            usersArray[userId].socket = socket;      
        }
        return usersArray;
    },

    /**
     * Stores users tokens
     * @param {Number} userId       Users ID 
     * @param {String} token        Users token 
     * @param {String} tokenSecret  Users tokenSecret 
     * @param {String} name         Users name 
     * @param {String} profileImage Users profile image 
     */
    setInformations: function(userId, token, tokenSecret, name, profileImage, cb){
        usersModel.pushUser(userId, name, profileImage);
        usersArray[userId] = {socket: null, pause: false, token: token, tokenSecret: tokenSecret, lastTimeRequestedHomeTimeline: null};
        cb();
    },

    /**
     * Returns in the callback the user's tokens
     * @param  {Number}   userId User's ID
     * @param  {Function} cb     Callback function
     */
    getUserTokens: function(userId, cb){
        if(usersArray[userId]) {
            cb(usersArray[userId].token, usersArray[userId].tokenSecret);
            // console.log('Returning tokens: ', usersArray[userId].token, ' and ', usersArray[userId].tokenSecret);
        }
        else {
            throw new Error('User doesn\'t exist. Impossible to broadcast');
        }
    },

    /**
     * Update the cache of the lists tweets
     * @param {Number} userId                 Users ID 
     * @param {Array}  listsTweetsCache       Last tweets from the lists 
     */
    setListsTweetsCache: function(userId, listsTweetsCache){
        usersModel.pushListsTweetsCache(userId, listsTweetsCache);
    },

    /**
     * Get the cache of the lists tweets
     * @param {Number}    userId   Users ID 
     * @param {Function}  cb       Callback 
     */
    getListsTweetsCache: function(userId, cb){
        usersModel.getListsTweetsCache(userId, cb);
    },

    /**
     * Update user's cached lists
     * @param {Number} userId     Users ID 
     * @param {Array}  lists      user's lists
     */
    setUserListsCache: function(userId, lists){
        usersModel.pushUserListsCache(userId, lists);
    },

    /**
     * Get user's cached lists
     * @param {Number}    userId   Users ID 
     * @param {Function}  cb       Callback 
     */
    getUserListsCache: function(userId, cb){
        usersModel.getUserListsCache(userId, cb);
    },

    /**
     * Get user's lists
     * @param {Number}    userId   Users ID 
     * @param {Function}  cb       Callback 
     */
    getUserLists: function(userId, cb){
        users.getUserTokens(userId, function(token, tokenSecret){
            twitterAgent.getUserLists(userId, token, tokenSecret, cb);
        });
    },

    /**
     * Update user's cached home timeline
     * @param {Number} userId           Users ID 
     * @param {Array}  homeTimeline     user's home timeline
     */
    setUserHomeTimelineCache: function(userId, homeTimeline){
        usersModel.pushHomeTimelineCache(userId, homeTimeline);
    },

    /**
     * Get user's cached home timeline
     * @param {Number}    userId   Users ID 
     * @param {Function}  cb       Callback 
     */
    getUserHomeTimelineCache: function(userId, cb){
        usersModel.getHomeTimelineCache(userId, cb);
    },

    /**
     * Get user's home timeline
     * @param {Number}    userId   Users ID 
     * @param {Function}  cb       Callback 
     */
    getUserHomeTimeline: function(userId, cb){
        var elapsedTime = usersArray[userId].lastTimeRequestedHomeTimeline == null ? null : Date.now() - usersArray[userId].lastTimeRequestedHomeTimeline;

        // Put a condition to make a API Request only after at least 1 minute since last time
        if(elapsedTime > 60000 || elapsedTime == null){
            users.getUserTokens(userId, function(token, tokenSecret){
                twitterAgent.getUserHomeTimeline(userId, token, tokenSecret, cb);
            });
            usersArray[userId].lastTimeRequestedHomeTimeline = Date.now();
        }
        else{
            users.getUserHomeTimelineCache(userId, function(data){
                users.broadcast(userId, 'home-timeline', data);
            });
        }
    },

    /**
     * Get username
     * @param {Number}    userId  Users ID 
     * @param  {Function} cb      Callback returning the username
     */
    getUserName: function(userId, cb){
        usersModel.getUserName(userId, function(username){
            cb(username);
        });
    },
    
    /**
     * Subscribe a user to a hashtag
     * @param {Number} userId Users ID to subscribe
     * @param {String} tag    Tag to subscribe to
     */
    addTag: function(userId, tag, cb){
        // If tag is empty, only resend the tag list
        if(tag == ""){
            users.getUserTokens(userId, function(token, tokenSecret){
                tagsModel.getUserTags(userId, function(taglist){
                    console.log('Log: Gonna broadcast taglist: ', taglist);
                    users.broadcast(userId, 'tag list', taglist ); 
                });
            });
        }
        else {
            users.getUserTokens(userId, function(token, tokenSecret){
                tagsModel.pushTag(userId, tag.toLowerCase(), function(){
                    tagsModel.getUserTags(userId, function(taglist){
                        console.log('Log: Gonna broadcast taglist: ', taglist);
                        users.broadcast(userId, 'tag list', taglist );
                        cb(); 
                    });
                });
            });
        }
    },

    /**
     * Broadcast the tweets to the users who have subscribed
     * @param  {Number} userId User's ID to be sent to
     * @param  {String} messageType The type of message to be sent, used by socket.io
     * @param  {Object} toBeSent    Object to be broadcasted
     */
    broadcast: function(userId, messageType, toBeSent){
        if(usersArray[userId]) {
            if(usersArray[userId].socket != null){
                if (usersArray[userId].pause != true) {
                    usersArray[userId].socket.emit(messageType, toBeSent);
                }
            }
            else {
                console.error('User\'s socket doesn\'t exist. Impossible to broadcast');
            }
        }
        else {
            console.error('User doesn\'t exist. Impossible to broadcast');
        }
    },

    /**
     * Get the tags from a user
     * @param  {Number}   userId The users ID to search the corresponding tags
     * @param  {Function} cb     Callback returning the hashtags the user is following
     */
    getTags: function(userId, cb){
        tagsModel.getUserTags(userId, function(tags){
            cb(tags);
        });
    },

    /**
     * Unsubscribe a user from a tag
     * @param  {Object} tagObject The tag to remove and the users ID which unsubscribed
     */
    removeTag: function(tagObject, cb){
        tagsModel.removeUserFromTag(tagObject.userId, tagObject.tag, function(){
            cb();
        });
    },

    /**
     * Switch pause of the stream on/off
     * @param  {Number} userId User ID
     * @param  {Boolean} pause Optional: the status to set the stream
     */
    togglePause: function(userId, pause){
        if(pause != undefined){
            usersArray[userId].pause = pause;  
        }
        else{
            usersArray[userId].pause = !usersArray[userId].pause;
        }
        console.log('Log: Stream pause status is now: ', usersArray[userId].pause);
    },

    /**
     * Retweet a tweet
     * @param  {Number}   userId  User ID
     * @param  {String}   tweetID Tweet ID to be retweeted
     * @param  {Function} cb      Callback
     */
    sendRetweet: function(userId, tweetID, cb){
        users.getUserTokens(userId, function(token, tokenSecret){
            twitterAgent.sendRetweet(userId, token, tokenSecret, tweetID, cb);
        });
    },

    /**
     * Start user stream
     * @param  {Number} userID      Users id
     */
    startStream: function(userId){
        users.getUserTokens(userId, function(token, tokenSecret){
            twitterAgent.initStream(userId, token, tokenSecret);
            console.log('Starting general stream with userId ', userId);
        });
        // In any case disable user pause
        this.togglePause(userId, false);
    },

    /**
     * Stop user stream
     */
    stopStream: function(userId){
        twitterAgent.stopStream(userId);
        console.log('Stopping all');
    }

}

module.exports = users;