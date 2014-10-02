var home = require('./controllers/home');

function routes (app){
    app.get('/', home.getIndex);
    
    app.post('/tag', home.postTag);
}

module.exports = routes; 