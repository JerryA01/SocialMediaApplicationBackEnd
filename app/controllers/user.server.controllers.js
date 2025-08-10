const Joi = require("joi");
const users = require("../models/user.server.models");
const { sendStatus } = require("express/lib/response");


const add_user = (req, res) => {
    let pwRegex = RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,30}$/)

    const schema = Joi.object({
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        username: Joi.string().required(),
        password: Joi.string().pattern(pwRegex).required()
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send({ "error_message": error.details[0].message });

    let user = Object.assign({}, req.body);

    users.addNewUser(user, (err, id) => {
        if (err === 400) {
            res.status(400).send({ "error_message": error.details[0].message });
        } else if (err) {

            return res.sendStatus(500);
        }
        else {
            return res.status(201).send({ user_id: id });
        }
    })
};

const login = (req, res) => {
    const schema = Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required()
    });



    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send({ "error_message": error.details[0].message });

    let user = Object.assign({}, req.body);


    users.authenticateUser(req.body.username, req.body.password, (err, id) => {
        if (err === 404) return res.status(400).send({ "error_message": "Invalid username/password supplied" })


        if (err) {
            console.log(1, err);
            return res.sendStatus(500)
        }

        users.getToken(id, (err, token) => {
            if (err) {
                console.log(2, err)
                return res.sendStatus(500)
            }

            if (token.session_token) {
                return res.status(200).send({ user_id: id, session_token: token.session_token })
            } else {
                users.setToken(id, (err, token) => {
                    if (err) {
                        console.log(3, err)
                        return res.sendStatus(500)
                    }
                    return res.status(200).send({ user_id: id, session_token: token })
                })
            }
        })
    })


}

const logout = (req, res) => {

    let token = req.get('X-Authorization');

    users.removeToken(token, (err) => {
        if (err) {
            console.log("your getting an error when you try to logout")
            return res.sendStatus(500)
        }
        else {
            return res.sendStatus(200)

        }


    })


}

const get_user = (req, res) => {

    let user_id = parseInt(req.params.user_id);

    users.getSingleUser(user_id, (err, result) => {
        if (err === 404) {
            return res.sendStatus(404)
        }

        if (err) {
            console.log(err)
            return res.sendStatus(500);

        }


        return res.status(200).send(result)
    })


};

const follow_user = (req, res) => {

    let follower_id = parseInt(req.params.user_id);

    console.log("this is the follower id " + follower_id);

    let token = req.get('X-Authorization');

    users.GetIDFromToken(token, (err, id) => {
        if (err) {
            return res.sendStatus(500);
        }

        let user_id = id;

        users.getSingleUser(follower_id, (err, result) => {
            console.log("up to here", err, result)
            if (err === 404) {
                console.log("SHOULD BE HITTING THIS")
                return res.sendStatus(404)
            }
            if (err) {
                return res.sendStatus(500);

            }

            console.log(user_id, follower_id)
            users.follow(user_id, follower_id, (err, result) => {

                if (err) {
                    console.log(3, err)
                    if (err === 403) return res.status(403).send("You have already followed this person")

                    return res.sendStatus(500);
                }

                return res.sendStatus(200);
            })

        })

    })

};

const unfollow_user = (req, res) => {

    let follower_id = parseInt(req.params.user_id);

    let token = req.get('X-Authorization');

    users.GetIDFromToken(token, (err, id) => {
        if (err) {
            return res.sendStatus(500);
        }

        let user_id = id;


        users.getSingleUser(follower_id, (err, result) => {

            if (err === 404) {
                return res.sendStatus(404)
            }
            if (err) {
                return res.sendStatus(500);
            }

            users.unfollow(user_id, follower_id, (err) => {

                if (err) {
                    //  console.log("its here " + err);
                    if (err === 404) return res.status(403).send("You can not unfollow a user you have not yet followed")
                    return res.sendStatus(500);

                }
                return res.sendStatus(200);

            })
        })

    })

};



const get_search = (req, res) => {
    let q = req.query.q;
    users.searching(q, (err, result) => {
        if (err === 500) {
            return res.sendStatus(500)
        }
        else if (err === 404) {
            return res.sendStatus(404)
        }
        else {
            return res.status(200).send(result)
        }
    })
};


const get_search_loggedin = (req, res) => {
    let q = req.query.q;
    users.searching(q, (err, result) => {
        if (err === 500) {
            return res.sendStatus(500)
        }
        else if (err === 404) {
            return res.sendStatus(404)
        }
        else {
            return res.status(200).send(result)
        }
    })
};



module.exports = {
    add_user: add_user,
    login: login,
    logout: logout,
    get_user: get_user,
    follow_user: follow_user,
    unfollow_user: unfollow_user,
    get_search: get_search,
    get_search_loggedin: get_search_loggedin
};

