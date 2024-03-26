const users = require('../models/user.server.models');


const isAuthenticated = function(req, res, next){
    let token = req.get('X-Authorization');

    console.log(token)

    if(!token || token === null){
        return res.sendStatus(401);
    }

    users.GetIDFromToken(token, (err, id) => {
        console.log(err, id)
        if (err || id === null) {
            return res.sendStatus(401);
        }
        next();
    })
};

module.exports = {
    isAuthenticated: isAuthenticated
}