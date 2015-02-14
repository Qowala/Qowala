var users = require('../lib/users');

exports.getDashboard = function(req, res) {

	if (req.user){
		var userId = req.user;
		users.addUser(userId);
	}
	else{
    	res.redirect('/');
	}

	// Return the tags the user follows
	users.getTags(userId, function(tags){
		// Renders the dashboard.html page
	    res.render('home/dashboard', {
	        userId : userId,
	        tags : tags,
	    });
	});

	console.log(req.session);
    
};

exports.postTag = function(req, res) {
	users.addTag(req.user, req.body.tag);
    // Redirect to dashboard
    res.redirect('/dashboard');
};