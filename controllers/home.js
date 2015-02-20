var users = require('../lib/users');
var passport = require('passport');

exports.getIndex = function(req, res) {

	var userId;

	if (req.user){
		userId = req.user;
		users.getUserName(userId, function(username){
			// Renders the index.html page
		    res.render('home/index', {
		        userId : userId,
		        username: username
		    });	
		});
	}
	else{
		// Renders the index.html page
	    res.render('home/index', {
	        userId : userId,
	        username: null
	    });	
	}
	
	console.log(req.session);
    
};
