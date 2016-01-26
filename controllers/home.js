exports.getLogin = function(req, res) {
  if (req.user) {
    res.redirect('/dashboard');
  }
  else {
    res.render('home/login');
  }
};
