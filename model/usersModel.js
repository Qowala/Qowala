var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	user: Number,
	name: String,
	profileImage: String,
	listsTweetsCache: Object,
	lists: Array,
	enabledLists: Array,
	columnsLayout: Array,
	homeTimelineCache: Array,
	enabledTags: Array
});

var User = mongoose.model('User', userSchema);

/**
 * Create a new user. If already existing, updating its informations
 * @param  {Number}  userId The users ID to create
 * @return {Object}         The user once created
 */
exports.pushUser = function(userId, name, profileImage){
	User.findOne({user: userId}).exec(function(err, user) {
		if (err) {
			return ['error', {status: 500}];
		} 
		else {
			if(user == null){
				var user = new User({user: userId, name: name, profileImage: profileImage});
				user.save(function(err) {
					if (err) return [500, err];
					return user;
				});
				console.log('Saved: ', user);
			}
			else{
				User.update({user: userId}, {name: name, profileImage: profileImage}, {}, function(err, numberAffected, rawResponse) {
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
 * @param  {Number}  userId 		The users ID 
 * @param  {Array}   columnsLayout  The users column's layout
 * @return {Object}         		The user once created
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
 * @param  {Number}  userId 		The user's ID 
 * @param  {Array}   enabledTags   The user's tags lists
 * @return {Object}         		The user once created
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

