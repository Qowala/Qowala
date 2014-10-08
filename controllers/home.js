var users = require('../lib/users');

exports.getIndex = function(req, res) {

	var userId;

	if (req.session.userId){
		userId = req.session.userId;
	}
	else{
		userId = req.session.userId = users.addUser();
	}

	// Return the tags the user follows
	users.getTags(userId, function(tags){
		// Renders the index.html page
	    res.render('home/index', {
	        userId : userId,
	        tags : tags	
	    });
	});

	console.log(req.session);
    
};

exports.postTag = function(req, res) {
	users.addTag(req.session.userId, req.body.tag);
    // Redirect to homepage
    res.redirect('/');
};