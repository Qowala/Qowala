var home = require('./controllers/home');
var dashboard = require('./controllers/dashboard');
var passport = require('passport');

function routes (app){
    app.get('/', home.redirectToDashboard);

    app.get('/dashboard', dashboard.getDashboard);
    
    app.post('/tag', ensureAuthenticated, dashboard.postTag);

    // Redirect the user to Twitter for authentication.  When complete, Twitter
	// will redirect the user back to the application at
	//   /auth/twitter/callback
	app.get('/auth/twitter', passport.authenticate('twitter'));

	// Twitter will redirect the user to this URL after approval.  Finish the
	// authentication process by attempting to obtain an access token.  If
	// access was granted, the user will be logged in.  Otherwise,
	// authentication has failed.
	app.get('/auth/twitter/callback', 
		passport.authenticate('twitter', { 
			successRedirect: '/dashboard',
 			failureRedirect: '/' 
		})
	);

	app.get('/logout', function(req, res){
		req.logout();
		res.redirect('/');
	});

	// Simple route middleware to ensure user is authenticated.
	// Use this route middleware on any resource that needs to be protected. If
	// the request is authenticated (typically via a persistent login session),
	// the request will proceed. Otherwise, the user will be redirected to the
	// login page.
	function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) { return next(); }
		res.redirect('auth/twitter');
	}
}

module.exports = routes; 