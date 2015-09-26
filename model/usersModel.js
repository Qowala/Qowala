var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
  user: Number,
  name: String,
  username: String,
  profileImage: String,
  listsTweetsCache: Object,
  lists: Array,
  listsIndex: Object,
  enabledLists: Array,
  columnsLayout: Array,
  homeTimelineCache: Array,
  friendsCache: Object,
  enabledTags: Array,
  notifications: Array
});

var User = mongoose.model('User', userSchema);

/**
 * Create a new user. If already existing, updating its informations
 * @param  {Number}  userId The users ID to create
 * @return {Object}         The user once created
 */
exports.pushUser = function(userId, name, username, profileImage){
  User.findOne({user: userId}).exec(function(err, user) {
    if (err) {
      return ['error', {status: 500}];
    }
    else {
      if(user == null){
        var user = new User({user: userId, name: name, username: username, profileImage: profileImage});
        user.save(function(err) {
          if (err) return [500, err];
          return user;
        });
        console.log('Saved: ', user);
      }
      else{
        User.update({user: userId}, {name: name, username: username, profileImage: profileImage}, {}, function(err, numberAffected, rawResponse) {
            if (err) return [500, err];
            return rawResponse;
        });
      }
    }
  });
};

/**
 * Get username
 * @param  {Number}   userId The users ID
 * @param  {Function} cb     Callback returning the username
 */
exports.getUserName = function (userId, cb){
  User.findOne({user: userId}).exec(function(err, user) {
    if (err) {
      return ['error', {status: 500}];
    }
    else {
      if(user){
        if(user.name){
          cb(user.name);
        }
        else{
          cb('NONAME');
        }
      }
    }
  });
};

/**
 * Get user username (Twitter's screen name)
 * @param  {Number}   userId The users ID
 * @param  {Function} cb     Callback returning the username
 */
exports.getUserUsername = function (userId, cb){
  User.findOne({user: userId}).exec(function(err, user) {
    if (err) {
      return ['error', {status: 500}];
    }
    else {
      if(user){
        if(user.username){
          cb(user.username);
        }
        else{
          cb('NONAME');
        }
      }
    }
  });
};

/**
 * Get all users
 * @param  {Function} cb     Callback returning the socket
 */
exports.getAllUsers = function (cb){
  User.find(function(err, allUsers) {
    if (err) {
      return ['error', {status: 500}];
    }
    else {
      cb(allUsers);
    }
  });
};

/**
 * Puts the tweets coming from the home timeline in cache
 * @param  {Number}  userId The users ID to create
 * @return {Object}         The user once created
 */
exports.pushHomeTimelineCache = function(userId, homeTimelineCache){
  User.update({user: userId}, {homeTimelineCache: homeTimelineCache}, {}, function(err, numberAffected, rawResponse) {
      if (err) return [500, err];
      return rawResponse;
  });
};

/**
 * Get home timeline cache
 * @param  {Function} cb     Callback returning the home timeline
 */
exports.getHomeTimelineCache = function (userId, cb){
  User.findOne({user: userId}).exec(function(err, user) {
    if (err) {
      return ['error', {status: 500}];
    }
    else {
      if(user){
        cb(user.homeTimelineCache);
      }
    }
  });
};

/**
 * Puts the tweets coming from the lists in cache
 * @param  {Number}  userId The users ID to create
 * @return {Object}         The user once created
 */
exports.pushListsTweetsCache = function(userId, listsTweetsCache){
  User.update({user: userId}, {listsTweetsCache: listsTweetsCache}, {}, function(err, numberAffected, rawResponse) {
      if (err) return [500, err];
      return rawResponse;
  });
};

/**
 * Get lists tweets cache
 * @param  {Function} cb     Callback returning the lists tweets
 */
exports.getListsTweetsCache = function (userId, cb){
  User.findOne({user: userId}).exec(function(err, user) {
    if (err) {
      return ['error', {status: 500}];
    }
    else {
      if(user){
        cb(user.listsTweetsCache);
      }
    }
  });
};

/**
 * Puts the tweets coming from the lists in cache
 * @param  {Number}  userId The users ID to create
 * @return {Object}         The user once created
 */
exports.pushListsIndex = function(userId, listsIndex){
  User.update({user: userId}, {listsIndex: listsIndex}, {},
    function(err, numberAffected, rawResponse) {
      if (err) return [500, err];
      return rawResponse;
  });
};

/**
 * Get lists tweets cache
 * @param  {Function} cb     Callback returning the lists tweets
 */
exports.getListsIndex = function (userId, cb){
  User.findOne({user: userId}).exec(function(err, user) {
    if (err) {
      return ['error', {status: 500}];
    }
    else {
      if(user){
        cb(user.listsIndex);
      }
    }
  });
};

/**
 * Push the user's friends
 * @param  {Number}  userId The users ID
 * @param  {Array}   friendsCache  The users friends
 * @return {Object}
 */
exports.pushUserFriendsCache = function(userId, friendsCache){
  User.update({user: userId}, {friendsCache: friendsCache}, {}, function(err, numberAffected, rawResponse) {
      if (err) return [500, err];
      return rawResponse;
  });
};

/**
 * Get user's friends
 * @param  {Function} cb     Callback returning the friends
 */
exports.getUserFriendsCache = function (userId, cb){
  User.findOne({user: userId}).exec(function(err, user) {
    if (err) {
      return ['error', {status: 500}];
    }
    else {
      if(user){
        cb(user.friendsCache);
      }
    }
  });
};

/**
 * Push the users lists
 * @param  {Number}  userId The users ID
 * @param  {Array}   lists  The users lists
 * @return {Object}         The user once created
 */
exports.pushUserListsCache = function(userId, lists){
  User.update({user: userId}, {lists: lists}, {}, function(err, numberAffected, rawResponse) {
      if (err) return [500, err];
      return rawResponse;
  });
};

/**
 * Get user's lists
 * @param  {Function} cb     Callback returning the lists tweets
 */
exports.getUserListsCache = function (userId, cb){
  User.findOne({user: userId}).exec(function(err, user) {
    if (err) {
      return ['error', {status: 500}];
    }
    else {
      if(user){
        cb(user.lists);
      }
    }
  });
};

/**
 * Push the column's layout
 * @param  {Number}  userId     The users ID
 * @param  {Array}   columnsLayout  The users column's layout
 * @return {Object}             The user once created
 */
exports.pushColumnsLayout = function(userId, columnsLayout){
  User.update({user: userId}, {columnsLayout: columnsLayout}, {}, function(err, numberAffected, rawResponse) {
      if (err) return [500, err];
      return rawResponse;
  });
};

/**
 * Get user's column's layout
 * @param  {Function} cb     Callback returning the column's layout
 */
exports.getColumnsLayout = function (userId, cb){
  User.findOne({user: userId}).exec(function(err, user) {
    if (err) {
      return ['error', {status: 500}];
    }
    else {
      if(user){
        if(user.columnsLayout){
          cb(user.columnsLayout);
        }
        else{
          cb('');
        }
      }
    }
  });
};


/**
 * Push the enabled lists
 * @param  {Number}  userId The user's ID
 * @param  {Array}   enabledLists  The user's enabled lists
 * @return {Object}         The user once created
 */
exports.pushEnabledLists = function(userId, enabledLists){
  User.update({user: userId}, {enabledLists: enabledLists}, {}, function(err, numberAffected, rawResponse) {
      if (err) return [500, err];
      return rawResponse;
  });
};

/**
 * Get user's enabled lists
 * @param  {Function} cb     Callback returning the enabled lists
 */
exports.getEnabledLists = function (userId, cb){
  User.findOne({user: userId}).exec(function(err, user) {
    if (err) {
      return ['error', {status: 500}];
    }
    else {
      if(user){
        if(user.enabledLists){
          cb(user.enabledLists);
        }
        else{
          cb('');
        }
      }
    }
  });
};

/**
 * Push the enabled tagss
 * @param  {Number}  userId     The user's ID
 * @param  {Array}   enabledTags   The user's tags lists
 * @return {Object}             The user once created
 */
exports.pushEnabledTags = function(userId, enabledTags){
  User.update({user: userId}, {enabledTags: enabledTags}, {}, function(err, numberAffected, rawResponse) {
      if (err) return [500, err];
      return rawResponse;
  });
};

/**
 * Get user's enabled tags
 * @param  {Function} cb     Callback returning the enabled lists
 */
exports.getEnabledTags = function (userId, cb){
  User.findOne({user: userId}).exec(function(err, user) {
    if (err) {
      return ['error', {status: 500}];
    }
    else {
      if(user){
        if(user.enabledTags){
          cb(user.enabledTags);
        }
        else{
          cb('');
        }
      }
    }
  });
};

/**
 * Push the notifications
 * @param  {Number}  userId          The user's ID
 * @param  {Array}   notifications   The user's notifications
 * @return {Object}                  Confirmation
 */
exports.pushNotifications = function(userId, notifications){
  User.update({user: userId}, { $push : {notifications: notifications}}, {}, function(err, numberAffected, rawResponse) {
      if (err) return [500, err];
      return rawResponse;
  });
};

/**
 * Update the notifications
 * @param  {Number}  userId          The user's ID
 * @param  {Array}   notifications   The user's notifications
 * @return {Object}                  Confirmation
 */
exports.updateNotifications = function(userId, notifications){
  User.update({user: userId}, {notifications: notifications}, {}, function(err, numberAffected, rawResponse) {
      if (err) return [500, err];
      return rawResponse;
  });
};

/**
 * Get user's notifications
 * @param  {Function} cb     Callback returning the notifications
 */
exports.getNotifications = function (userId, cb){
  User.findOne({user: userId}).exec(function(err, user) {
    if (err) {
      return ['error', {status: 500}];
    }
    else {
      if(user){
        if(user.notifications){
          cb(user.notifications);
        }
        else{
          cb('');
        }
      }
    }
  });
};

