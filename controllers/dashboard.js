var users = require('../lib/users');

exports.getDashboard = function(req, res) {

  var userId;

  if (req.user){
    userId = req.user;
    users.getUserName(userId, function(username){
        res.render('home/dashboard', {
            userId : userId,
            username: username
        });
    });
  }
  else{
    res.redirect('/');
  }

  console.log(req.session);
};

exports.postTag = function(req, res) {
  users.addTag(req.user, req.body.tag);
    // Redirect to dashboard
    res.redirect('/dashboard');
};
