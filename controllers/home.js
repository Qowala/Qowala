var users = require('../lib/users');
var passport = require('passport');

exports.getIndex = function(req, res) {

	var userId;

	if (req.user){
		userId = req.user;
	}

	// Renders the index.html page
    res.render('home/index', {
        userId : userId,
    });

	console.log(req.session);
    
};

// exports.getAuthenticated = function(req, res, next) {
// 	console.log('Got here getAuthenticated');
// 	passport.authenticate('twitter');
// };

// exports.getAuthenticationResponse = function(req, res) {

// 	console.log('Got here getAuthenticatedResponse');
// 	passport.authenticate('twitter', { 
// 		successRedirect: '/dashboard',
// 			failureRedirect: '/' 
// 	});
// };