const feed = require('../models/feed.server.model')
const users = require("../models/user.server.models");

const get_feed = (req, res) => {

    let token = req.get('X-Authorization');

    console.log("do we get the token" + token)

    let isAuthed = false;

    if (!token || token === null) {
        isAuthed = false
        console.log("HERE", isAuthed)
        token = "";
    }

    users.GetIDFromToken(token, (err, id) => {

        console.log("Ash", token, "id", id)

        if (err || id === null || !id) {
            isAuthed = false
        } else {
            isAuthed = true

        }

        if (isAuthed) {
            console.log("User logged in")

            feed.getFollowerPosts(id, (err, results) => {
                if (err) {
                    console.log(err)
                    return res.sendStatus(500);
                }
                return res.status(200).send(results)
            })
        } else {
            console.log("User not logged in")
            feed.getAllPosts((err, results) => {
                if (err) return res.sendStatus(500);
                return res.status(200).send(results)
            })
        }
    })
}

module.exports = {
    get_feed
}