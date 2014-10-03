//var configTv = require('../config/tv');
var users = require('../lib/users');

exports.getIndex = function(req, res) {

	var userId;

	if (req.session.userId){
		userId = req.session.userId;
	}
	else{
		userId = req.session.userId = users.addUser();
	}

	// Renvoie les tags suivis par l'utilisateur
	users.getTags(userId, function(tags){
		// Fait un rendu de la page index .html
	    res.render('home/index', {
	        // tv : configTv,
	        userId : userId,
	        tags : tags	
	    });
	});

	console.log(req.session);
    
};

exports.postTag = function(req, res) {
	users.addTag(req.session.userId, req.body.tag);
    // Redirige vers la Homepage
    res.redirect('/');
};