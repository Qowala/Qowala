var users = require('../lib/users');

exports.getDashboard = function(req, res) {

	var userId;

	if (req.user){
		userId = req.user;
		users.getUserName(userId, function(username){
			// Renders the dashboard.html page
		    res.render('home/dashboard', {
		        userId : userId,
		        username: username
		    });
		});
	}
	else{
		res.render('home/dashboard', {
	        userId : undefined,
	        username: undefined
	    });
	}

	console.log(req.session);
    
};

exports.postTag = function(req, res) {
	users.addTag(req.user, req.body.tag);
    // Redirect to dashboard
    res.redirect('/dashboard');
};