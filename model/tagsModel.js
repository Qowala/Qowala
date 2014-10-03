var mongoose = require('mongoose');

var tagSchema = mongoose.Schema({
	text: String,
	frequency: Number,
	languages: Object,
	users: [Number]
});

var Tag = mongoose.model('Tag', tagSchema);

exports.pushTag = function(userId, receivedTag){
	Tag.findOne({text: receivedTag}).exec(function(err, tag) {
		if (err) {
			return ['error', {status: 500}];
		} 
		else {
			if(tag == null){
				var tag = new Tag({text: receivedTag, users: [userId]});
				tag.save(function(err) {
					if (err) return [500, err];
					return tag;
				});
				console.log('Saved: ', tag);
			}
			else{
				var existingUser = false;
				for (var i = 0; i < tag.users.length; i++) {
					if(tag.users[i] === userId){
						existingUser = true;
					}
					
				}
				if(!existingUser){
					Tag.update({text: receivedTag}, { $push: {users: userId} }, { upsert: true }, function(err, updatedTag) {
					    if (err) return [500, err];
					    console.log('Update successful');
					    console.log('Updated: ', updatedTag);
					    return updatedTag;
					});
				}
				else{
					return tag;	
				}	
			}
		}
	});
};

exports.getUserTags = function(userId, cb){
	Tag.find({users: userId}).exec(function(err, tags) {
		if (err) {
			return ['error', {status: 500}];
		} else {
			cb(tags);
		}
	});
};

exports.getUsersFollowingTags = function(tags, cb){
	var usersFollowingTags = [];
	var tagsArray = [];

	for (var i = 0; i < tags.length; i++) {
		tagsArray.push(tags[i].text.toLowerCase());
	};
	console.log('tagsArray: ', tagsArray);

	Tag.where('text').in(tagsArray)
	.exec(function(err, tagsFounded) {
		if (err) {
			return ['error', {status: 500}];
		} else {
			if(tagsFounded != null){
				for (var i = 0; i < tagsFounded.length; i++) {
					usersFollowingTags = usersFollowingTags.concat(tagsFounded[i].users);
				};
				
				console.log('Here usersFollowingTags: ', usersFollowingTags);
				cb(usersFollowingTags);
			}
			
		}
	});
};

exports.getAllTags = function(cb){
	Tag.find().exec(function(err, tags) {
		if (err) {
			return ['error', {status: 500}];
		} else {
			cb(tags);
		}
	});
};

exports.removeUserFromTag = function(userId, receivedTag){
	console.log('In mongo, remove: ', userId, ' and tag: ', receivedTag);			
	Tag.update({text: receivedTag}, { $pull: {users: userId} }, { upsert: true }, function(err, updatedTag) {
	    if (err) return [500, err];
	    console.log('Removed user from: ', updatedTag);
	    return updatedTag;
	});
};