const posts = require("../models/post.server.models");
const users = require("../models/user.server.models");
const Joi = require("joi")


const add_post = (req, res) => {
    let token = req.get('X-Authorization');


    users.GetIDFromToken(token, (err, user_id) => {
        if (err) return res.sendStatus(500);

        const schema = Joi.object({
            text: Joi.string().required()
        });


        const { error } = schema.validate(req.body);
        if (error) return res.sendStatus(400);

        let post = Object.assign({}, req.body);
        var Filter = require('bad-words'),
            filter = new Filter();

        post.text = filter.clean(post.text)

        posts.addNewPost(post, user_id, (err, id) => {
            if (err) {
                return res.sendStatus(500);
            } else {
                return res.status(201).send({ post_id: id });
            }
        })

    })

};

const get_post = (req, res) => {

    let post_id = parseInt(req.params.post_id);

    posts.getSinglePost(post_id, (err, result) => {
        if (err === 404) {

            return res.sendStatus(404)
        }
        if (err) return res.sendStatus(500);
        return res.status(200).send(result)
    })

};

const update_post = (req, res) => {
    let post_id = parseInt(req.params.post_id);


    let token = req.get('X-Authorization');


    users.GetIDFromToken(token, (err, user_id) => {
        if (err) return res.sendStatus(500);

        posts.getSinglePost(post_id, (err, post) => {
            if (err === 404) return res.sendStatus(404);
            if (err) return res.sendStatus(500);

            if (user_id != post.author.user_id) {
                return res.sendStatus(403);
            }

            const schema = Joi.object({
                "text": Joi.string().required()
            })

            const { error } = schema.validate(req.body);
            if (error) return res.status(400).send(error.details[0].message);

            posts.updatePost(post_id, req.body.text, (err) => {
                if (err) return res.sendStatus(500);
                return res.sendStatus(200);
            })
        })

    })
};

const delete_post = (req, res) => {
    let post_id = parseInt(req.params.post_id);

    let token = req.get('X-Authorization');


    users.GetIDFromToken(token, (err, user_id) => {
        if (err) return res.sendStatus(500);


        posts.getSinglePost(post_id, (err, result) => {

            if (err === 404) {

                return res.sendStatus(404)
            }
            if (err) {
                return res.sendStatus(500);
            }

            if (user_id != result.author.user_id) {
                return res.sendStatus(403);
            }


            posts.deletePost(post_id, (err, result) => {
                if (err) {
                    if (err === 403) {
                        return res.status(403)
                    }
                    return res.sendStatus(500);
                }
                return res.sendStatus(200);
            })

        })
    })

};

const add_like = (req, res) => {

    let post_id = parseInt(req.params.post_id);


    let token = req.get('X-Authorization');

    users.GetIDFromToken(token, (err, id) => {
        if (err) {
            console.log(1, err)
            return res.sendStatus(500);
        }

        let user_id = id;

        posts.getSinglePost(post_id, (err, result) => {

            if (err === 404) {
                return res.sendStatus(404)
            }
            if (err) {
                console.log(2, err)
                return res.sendStatus(500);
            }

            console.log(result)

            posts.addLike(post_id, user_id, (err) => {

                if (err) {
                    console.log(3, err)
                    if (err === 403) return res.status(403).send("You have already liked this post")
                    return res.sendStatus(500);
                }

                return res.sendStatus(200);
            })


        })
    })
};



const remove_like = (req, res) => {

    let post_id = parseInt(req.params.post_id);

    let token = req.get('X-Authorization');

    users.GetIDFromToken(token, (err, id) => {
        if (err) {
            return res.sendStatus(500);
        }

        let user_id = id;

        posts.getSinglePost(post_id, (err, result) => {
            if (err === 404) {
                return res.sendStatus(404)
            }
            if (err) {
                return res.sendStatus(500);
            }

            posts.removeLike(post_id, user_id, (err) => {
                if (err) {
                    //  console.log("its here " + err);
                    if (err === 403) return res.status(403).send("You can not unlike a post that you have not liked")
                    return res.sendStatus(500);

                }
                return res.sendStatus(200);
            })

        })
    })

};


module.exports = {
    add_post: add_post,
    get_post: get_post,
    update_post: update_post,
    delete_post: delete_post,
    add_like: add_like,
    remove_like: remove_like,
};

