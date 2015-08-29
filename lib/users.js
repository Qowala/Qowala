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
            console.error('User doesn\'t exist. Socket can\'t be set');
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
    setInformations: function(userId, token, tokenSecret, name, username, profileImage, cb){
        usersModel.pushUser(userId, name, username, profileImage);
        usersArray[userId] = {socket: null, token: token, tokenSecret: tokenSecret, lastTimeRequestedHomeTimeline: null};
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
            console.error('User doesn\'t exist. Impossible to broadcast');
        }
    },

    /**
     * [setColumnsLayout description]
     * @param {[type]} userId        [description]
     * @param {[type]} columnsLayout [description]
     */
    setColumnsLayout: function(userId, columnsLayout){
        usersModel.pushColumnsLayout(userId, columnsLayout);
    },

    /**
     * [getColumnsLayout description]
     * @param  {[type]}   userId [description]
     * @param  {Function} cb     [description]
     * @return {[type]}          [description]
     */
    getColumnsLayout: function(userId, cb){
        usersModel.getColumnsLayout(userId, cb);
    },

    /**
     * [setColumnsLayout description]
     * @param {[type]} userId        [description]
     * @param {[type]} columnsLayout [description]
     */
    setEnabledLists: function(userId, enabledLists, cb){
        usersModel.pushEnabledLists(userId, enabledLists);
        cb();
    },

    /**
     * [getColumnsLayout description]
     * @param  {[type]}   userId [description]
     * @param  {Function} cb     [description]
     * @return {[type]}          [description]
     */
    getEnabledLists: function(userId, cb){
        usersModel.getEnabledLists(userId, cb);
    },

    /**
     * [setColumnsLayout description]
     * @param {[type]} userId        [description]
     * @param {[type]} columnsLayout [description]
     */
    setEnabledTags: function(userId, enabledTags, cb){
        usersModel.pushEnabledTags(userId, enabledTags);
        console.log('setting tags: ', enabledTags);
        cb();
    },

    /**
     * [getColumnsLayout description]
     * @param  {[type]}   userId [description]
     * @param  {Function} cb     [description]
     * @return {[type]}          [description]
     */
    getEnabledTags: function(userId, cb){
        usersModel.getEnabledTags(userId, cb);
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
     * Update the cache of the lists tweets
     * @param {Number} userId                 Users ID
     * @param {Array}  listsTweetsCache       Last tweets from the lists
     */
    setListsIndex: function(userId, ListsIndex){
        usersModel.pushListsIndex(userId, ListsIndex);
    },

    /**
     * Get the cache of the lists tweets
     * @param {Number}    userId   Users ID
     * @param {Function}  cb       Callback
     */
    getListsIndex: function(userId, cb){
        usersModel.getListsIndex(userId, cb);
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
     * Get user username (Twitter's screen name)
     * @param {Number}    userId  Users ID
     * @param  {Function} cb      Callback returning the username
     */
    getUserUsername: function(userId, cb){
        usersModel.getUserUsername(userId, function(username){
            cb(username);
        });
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
     * Retweet a tweet
     * @param  {Number}   userId  User ID
     * @param  {String}   tweetID Tweet ID to be retweeted
     * @param  {Function} cb      Callback
     */
    sendRetweet: function(userId, tweetID, cb){
        users.getUserTokens(userId, function(token, tokenSecret){
            twitterAgent.sendRetweet(token, tokenSecret, tweetID, cb);
        });
    },

    /**
     * Tweet a message
     * @param  {Number}   userId  User ID
     * @param  {String}   message Message to be Tweeted
     * @param  {Function} cb      Callback
     */
    sendMessage: function(userId, message, cb){
        users.getUserTokens(userId, function(token, tokenSecret){
            twitterAgent.sendTweet(token, tokenSecret, message, cb);
        });
    },

    /**
     * Delete a tweet
     * @param  {Number}   userId  User ID
     * @param  {String}   tweetID Tweet ID to be deleted
     * @param  {Function} cb      Callback
     */
    deleteTweet: function(userId, tweetID, cb){
        users.getUserTokens(userId, function(token, tokenSecret){
            twitterAgent.deleteTweet(token, tokenSecret, tweetID, cb);
        });
    },

    /**
     * Show a tweet
     * @param  {Number}   userId  User ID
     * @param  {String}   tweetID Tweet ID to be shown
     * @param  {Function} cb      Callback
     */
    showTweet: function(userId, tweetID, cb){
        users.getUserTokens(userId, function(token, tokenSecret){
            twitterAgent.showTweet(token, tokenSecret, tweetID, cb);
        });
    },

    /**
     * Search a tweet according to keyword
     * @param  {Number}   userId  User ID
     * @param  {String}   tweetID Tweet ID to be shown
     * @param  {Function} cb      Callback
     */
    searchTweet: function(userId, keyword, cb){
        users.getUserTokens(userId, function(token, tokenSecret){
            twitterAgent.searchTweet(token, tokenSecret, keyword, cb);
        });
    },

    /**
     * Start user stream
     * @param  {Number} userID      Users id
     */
    startStream: function(userId){
      users.getUserUsername(userId, function(username){
        users.getUserTokens(userId, function(token, tokenSecret){
            twitterAgent.initStream(userId, username, token, tokenSecret);
            console.log('Starting general stream with userId ', userId);
        });
      });
    },

    /**
     * Start list stream
     * @param  {Number} userID      Users id
     */
    startListStream: function(userId){
        users.getUserTokens(userId, function(token, tokenSecret){
            users.getEnabledLists(userId, function(lists){
                console.log('enabledLists: ', lists);
                if(lists != ''){
                    twitterAgent.initListsStream(userId,
                        token, tokenSecret, lists);
                    console.log('Starting list stream with userId ', userId);
                }
                else{
                    console.log('No list to stream');
                }
            })
        });
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
