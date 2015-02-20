var tagsModel = require('../model/tagsModel');
var usersModel = require('../model/usersModel');
var twitterAgent = require('../lib/twitter');

// Array to store temporary data such as socket and pause status
var usersArray = [];

var users = {
	/**
     * Add a new connected user
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
    addTag: function(userId, tag, cb){
        // If tag is empty, only resend the tag list
        if(tag == ""){
            usersModel.getUserTokens(userId, function(token, tokenSecret){
                tagsModel.getUserTags(userId, function(taglist){
                    console.log('Log: Gonna broadcast taglist: ', taglist);
                    users.broadcast(userId, 'tag list', taglist ); 
                });
            });
        }
        else {
            usersModel.getUserTokens(userId, function(token, tokenSecret){
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
                throw new Error('User\'s socket doesn\'t exist. Impossible to broadcast');
            }
        }
        else {
            throw new Error('User doesn\'t exist. Impossible to broadcast');
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
     * Start user stream
     * @param  {Number} userID      Users id
     */
    startStream: function(userId){
        usersModel.getUserTokens(userId, function(token, tokenSecret){
            twitterAgent.initStream(userId, token, tokenSecret);
        });
        // In any case disable user pause
        this.togglePause(userId, false);
    }

}

module.exports = users;