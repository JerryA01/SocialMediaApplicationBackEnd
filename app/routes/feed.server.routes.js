const feed = require('../controllers/feed.server.controllers'); //importing the controller
const auth = require('../lib/middleware')

module.exports = function(app){   
                              //makes them publics
    app.route('/feed')
    .get(feed.get_feed)
   

};