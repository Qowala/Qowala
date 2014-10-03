var tagsModel = require('../model/tagsModel');
var twitterAgent = require('../lib/twitter');
// var usersModel = require('../model/usersModel');

var ids = 0;

var usersArray = [];

var users = {
	// Ajoute un utilisateur
    addUser: function() {
        var id = ++ids;
        usersArray[id] = {socket: null, tags: []};

        //usersModel.pushUser(id, null);
        return id;
    },

    // Assigne un socket à un utilisateur
    setSocket: function(userId, socket){
        if(!usersArray[userId]){
            console.log('User doesnt exist');
        }
        else{
            usersArray[userId].socket = socket;             
        }
        //usersModel.setUserSocket(userId, socket);
    },
    
    // Ajoute le tag à suivre à un utilisateur
    addTag: function(userId, tag){
        tagsModel.pushTag(userId, tag.toLowerCase(), function(){
            console.log('calling twitterAgent');
            twitterAgent.initStream();
        });
        
    },

    // Transmettre les tweets aux utilisateurs selon leurs tags
    broadcast: function(tweet){
        tagsModel.getUsersFollowingTags(tweet.entities.hashtags, function(usersFollowingTag){
            for (var k = 0; k < usersFollowingTag.length; k++){
                if(!usersArray[usersFollowingTag[k]]) continue;
                usersArray[usersFollowingTag[k]].socket.emit('tweet', tweet);
            }
        });
    },

    getTags: function(userId, cb){
        tagsModel.getUserTags(userId, function(tags){
            var tagsToTrack = [];
            for (var i = 0; i < tags.length; i++) {
                tagsToTrack.push('#' + tags[i].text);
            };
            cb(tagsToTrack);
        });
    },

    removeTag: function(tagObject){
        tagsModel.removeUserFromTag(tagObject.userId, tagObject.tag);
    }
}

module.exports = users;