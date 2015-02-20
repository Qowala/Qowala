var users = require('../lib/users');

exports.getDashboard = function(req, res) {

	if (req.user){
		var userId = req.user;
	}
	else{
    	res.redirect('/');
	}

	users.getUserName(userId, function(username){
		// Renders the dashboard.html page
	    res.render('home/dashboard', {
	        userId : userId,
	        username: username
	    });
	});

	console.log(req.session);
    
};

exports.postTag = function(req, res) {
	users.addTag(req.user, req.body.tag);
    // Redirect to dashboard
    res.redirect('/dashboard');
};