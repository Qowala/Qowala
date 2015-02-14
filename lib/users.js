var tagsModel = require('../model/tagsModel');
var twitterAgent = require('../lib/twitter');

var ids = 0;

var usersArray = [];

var users = {
	/**
     * Add a new user
     */
    addUser: function(id) {
        // var id = ++ids;
        usersArray[id] = {socket: null, tags: [], pause: false};

        return id;
    },

    /**
     * Set a socket to a user
     * @param {Number} userId Users ID to be set with the socket
     * @param {[type]} socket Socket to set to 
     */
    setSocket: function(userId, socket){
        if(!usersArray[userId]){
            console.log('User doesnt exist. Database will be updated');
            this.addUser(userId);
        }
        else{
            usersArray[userId].socket = socket;             
        }
    },
    
    /**
     * Subscribe a user to a hashtag
     * @param {Number} userId Users ID to subscribe
     * @param {String} tag    Tag to subscribe to
     */
    addTag: function(userId, tag){
        tagsModel.pushTag(userId, tag.toLowerCase(), function(){
            console.log('calling twitterAgent');
            twitterAgent.initStream();
        });
    },

    /**
     * Broadcast the tweets to the users who have subscribed
     * @param  {Object} tweet       Received tweet
     * @param  {Object} updatedTags Hashtags containt in the tweet
     * @param  {Object} tagsStats   Frequency statistics corresponding to the hashtags in the tweet
     */
    broadcast: function(tweet, updatedTags, tagsStats){
        // console.log('Prepare to broadcast');
        tagsModel.getUsersFollowingTags(tweet.entities.hashtags, function(usersFollowingTag){
            for (var k = 0; k < usersFollowingTag.length; k++){
                if(!usersArray[usersFollowingTag[k]]) continue;
                if(usersArray[usersFollowingTag[k]].socket != null && usersArray[usersFollowingTag[k]].pause != true){
                    usersArray[usersFollowingTag[k]].socket.emit('tweet', {tweet: tweet, updatedTags: updatedTags, tagsStats: tagsStats});
                }
            }
        });
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
    }

}

module.exports = users;