const posts = require('../controllers/post.server.controllers'); //importing the controller
const auth = require('../lib/middleware')

module.exports = function (app) {                             //makes them publics
    app.route('/posts')
        .post(auth.isAuthenticated, posts.add_post);

    app.route('/posts/:post_id')
        .get(posts.get_post)
        .patch(auth.isAuthenticated, posts.update_post)                                //Creating the routes for the endpoints
        .delete(auth.isAuthenticated, posts.delete_post);


    app.route('/posts/:post_id/like')
        .post(auth.isAuthenticated, posts.add_like)
        .delete(auth.isAuthenticated, posts.remove_like);


};