var users = require('../lib/users');

exports.getDashboard = function(req, res) {

  var userId;

  if (req.user){
    userId = req.user;
    users.getUserName(userId, function(username){
        res.render('home/dashboard', {
            userId : userId,
            username: username,
            piwikUrl: process.env.QOWALA_PIWIK_URL,
            piwikId: process.env.QOWALA_PIWIK_ID
        });
    });
  }
  else{
    res.redirect('/');
  }

  console.log(req.session);
};
