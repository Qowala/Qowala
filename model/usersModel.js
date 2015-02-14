var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	user: Number,
	token: String,
	tokenSecret: String,
	name: String,
	profileImage: String
	// socket: Object, --REMOVED--
	// pause: Boolean  --REMOVED--
});

var User = mongoose.model('User', userSchema);

/**
 * Create a new user. If already existing, updating its informations
 * @param  {Number}  userId The users ID to create
 * @param  {Object}  socket The users socket       --REMOVED--
 * @param  {Boolean} pause  Users pause status     --REMOVED--
 * @return {Object}         The user once created
 */
exports.pushUser = function(userId, token, tokenSecret, name, profileImage){
	User.findOne({user: userId}).exec(function(err, user) {
		if (err) {
			return ['error', {status: 500}];
		} 
		else {
			if(user == null){
				var user = new User({user: userId, token:token, tokenSecret: tokenSecret, name: name, profileImage: profileImage});
				user.save(function(err) {
					if (err) return [500, err];
					return user;
				});
				console.log('Saved: ', user);
			}
			else{
				User.update({user: userId}, {token:token, tokenSecret: tokenSecret, name: name, profileImage: profileImage}, {}, function(err, numberAffected, rawResponse) {
				    if (err) return [500, err];
				    return rawResponse;
				});
				
			}
		}
	});
};

/**
 * Get the socket from a user
 * @param  {Number}   userId The users ID to get the socket from
 * @param  {Function} cb     Callback returning the socket
 */
exports.getUserSocket = function (userId, cb){
	User.findOne({user: userId}).exec(function(err, user) {
		if (err) {
			return ['error', {status: 500}];
		} 
		else {
			cb(user.socket);
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