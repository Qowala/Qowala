var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	user: Number,
	socket: Object
});

var User = mongoose.model('User', userSchema);

/**
 * Create a new user. If already existing, updating his socket. 
 * @param  {Number} userId The users ID to create
 * @param  {Object} socket The users socket
 * @return {Object}        The user once created
 */
exports.pushUser = function(userId, socket){
	User.findOne({user: userId}).exec(function(err, user) {
		if (err) {
			return ['error', {status: 500}];
		} 
		else {
			if(user == null){
				var user = new User({user: userId, socket: socket});
				user.save(function(err) {
					if (err) return [500, err];
					return user;
				});
				console.log('Saved: ', user);
			}
			else{
				User.update({user: userId}, {socket: socket}, {}, function(err, updatedUser) {
				    if (err) return [500, err];
				    return updatedUser;
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
}