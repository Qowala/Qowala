var users = require('../lib/users');

exports.getDashboard = function(req, res) {

	var userId;

	if (req.session.userId){
		userId = req.session.userId;
	}
	else{
		userId = req.session.userId = users.addUser();
	}

	var user = req.user;

	// Return the tags the user follows
	users.getTags(userId, function(tags){
		// Renders the dashboard.html page
	    res.render('home/dashboard', {
	        userId : userId,
	        tags : tags,
	        user: user	
	    });
	});

	console.log(req.session);
    
};

exports.postTag = function(req, res) {
	users.addTag(req.session.userId, req.body.tag);
    // Redirect to homepage
    res.redirect('/dashboard');
};