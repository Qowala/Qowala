var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	user: Number,
	socket: Object
});

var User = mongoose.model('User', userSchema);

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