exports.getLogin = function(req, res) {
  if (req.user) {
    res.redirect('/dashboard');
  }
  else {
    res.render('home/login', {
      piwikUrl: process.env.QOWALA_PIWIK_URL,
      piwikId: process.env.QOWALA_PIWIK_ID
    });
  }
};
