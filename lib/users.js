var tagsModel = require('../model/tagsModel');
var usersModel = require('../model/usersModel');
var twitterAgent = require('../lib/twitter');

// Array to store temporary data such as socket and pause status
var usersArray = [];

var users = {
	/**
     * Add a new user
     */
    addUser: function(id) {
        // Register in a array just for the socket and pause
        usersArray[id] = {socket: null, pause: false};

        return {id:id, usersArray:usersArray};
    },

    /**
     * Set a socket to a user
     * @param {Number} userId Users ID to be set with the socket
     * @param {[type]} socket Socket to set to 
     */
    setSocket: function(userId, socket){
        if(!usersArray[userId]){
            throw new Error('User doesn\'t exist. Socket can\'t be set');
            console.error('Error: User doesn\'t exist. Socket can\'t be set');
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
    setInformations: function(userId, token, tokenSecret, name, profileImage){
        usersModel.pushUser(userId, token, tokenSecret, name, profileImage);
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
    addTag: function(userId, tag){
        usersModel.getUserTokens(userId, function(token, tokenSecret){
            tagsModel.pushTag(userId, tag.toLowerCase(), function(){
                console.log('calling twitterAgent');
                // twitterAgent.initStream(userId, token, tokenSecret);
            });
        })
    },

    /**
     * Broadcast the tweets to the users who have subscribed
     * @param  {Object} tweet       Received tweet
     * @param  {Object} updatedTags Hashtags containt in the tweet
     * @param  {Object} tagsStats   Frequency statistics corresponding to the hashtags in the tweet
     */
    broadcast: function(userId, tweet, updatedTags, tagsStats){
        if(usersArray[userId]) {
            if(usersArray[userId].socket != null){
                if (usersArray[userId].pause != true) {
                    usersArray[userId].socket.emit('tweet', {tweet: tweet, updatedTags: updatedTags, tagsStats: tagsStats});
                }
            }
            else {
                throw new Error('User\'s socket doesn\'t exist. Impossible to broadcast');
                console.error('Error: User\'s socket doesn\'t exist. Impossible to broadcast');
            }
        }
        else {
            throw new Error('User doesn\'t exist. Impossible to broadcast');
            console.error('Error: User doesn\'t exist. Impossible to broadcast');
        }
    },

    /**
     * Get the tags from a user
     * @param  {Number}   userId The users ID to search the corresponding tags
     * @param  {Function} cb     Callback returning the hashtags the user is following
     */
    getTags: function(userId, cb){
        tagsModel.getUserTags(userId, function(tags){
            var tagsToTrack = [];
            for (var i = 0; i < tags.length; i++) {
                tagsToTrack.push('#' + tags[i].text);
            };
            cb(tagsToTrack);
        });
    },

    /**
     * Unsubscribe a user from a tag
     * @param  {Object} tagObject The tag to remove and the users ID which unsubscribed
     */
    removeTag: function(tagObject){
        tagsModel.removeUserFromTag(tagObject.userId, tagObject.tag);
    },

    /**
     * Switch pause of the stream on/off
     * @param  {Number} userId User ID
     */
    togglePause: function(userId){
        usersArray[userId].pause = !usersArray[userId].pause;
        console.log('The user is now: ', usersArray[userId].pause);
    },

    /**
     * Start user stream
     * @param  {Number} userID      Users id
     */
    startStream: function(userId){
        usersModel.getUserTokens(userId, function(token, tokenSecret){
            twitterAgent.initStream(userId, token, tokenSecret);
        })
    }

}

module.exports = users;