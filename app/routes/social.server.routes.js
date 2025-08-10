const users = require('../controllers/user.server.controllers'); //importing the controller
const auth = require('../lib/middleware')

module.exports = function(app){   
                              //makes them publics
    app.route('/users/:user_id/follow')
    .post(auth.isAuthenticated, users.follow_user)
    .delete(auth.isAuthenticated, users.unfollow_user);

    app.route('/users/:user_id')
    .get(users.get_user);

    app.route('/search')
        .get(users.get_search)
    
    app.route('/searchloggedin')
        .get(auth.isAuthenticated, users.get_search_loggedin)
   
};