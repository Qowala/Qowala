const fs = require('fs');

var login = require("facebook-chat-api");

fs.exists('appstate.json', function(exists) { 
  if (exists) { 
    console.log('Login from saved appstate');
    login({appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))}, function callback (err, api) {
        if(err) return console.error(err);
        // Here you can use the api
    });
  }
  else {
    console.log('Login from user credentials');
    login({email: "FB_EMAIL", password: "FB_PASSWORD"}, function callback (err, api) {
        if(err) return console.error(err);

        fs.writeFileSync('appstate.json', JSON.stringify(api.getAppState()));
    });
  }
});
