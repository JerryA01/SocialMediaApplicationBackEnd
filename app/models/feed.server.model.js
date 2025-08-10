const db = require("../../database");


const getLikesForPost = (post_id, done) => {
    let sql = "SELECT u.user_id, u.first_name, u.last_name, u.username FROM users u, likes l WHERE l.post_id = ? AND l.user_id = u.user_id"
    let likes = [];
    db.each(
        sql,
        [post_id],
        (err, row) => {
            if (err) return done(err);

            likes.push({
                user_id: row.user_id,
                first_name: row.first_name,
                last_name: row.last_name,
                username: row.username
            })

        },
        (err) => {
            if (err) return done(err);

            return done(null, likes)
        }
    )
}


const getAllPosts = (done) => {

    const sql = `   SELECT p.post_id, p.text, p.date_published, u.user_id, u.first_name, u.last_name, u.username
                    FROM posts p, users u
                    WHERE p.author_id = u.user_id
                    ORDER BY p.date_published DESC`
    console.log("here")
    const posts = [];
    db.each(
        sql,
        [],
        (err, row) => {
            if (err) {
                return done(err);
            }

            posts.push({
                "post_id": row.post_id,
                "timestamp": row.date_published,
                "text": row.text,
                "author": {
                    "user_id": row.user_id,
                    "first_name": row.first_name,
                    "last_name": row.last_name,
                    "username": row.username
                }
            })
        },

        (err, num_rows) => {
            if (err) return done(err);

            let count = 0;

            console.log("Get the likes")

            posts.forEach((post) => {

                getLikesForPost(post.post_id, (err, likes) => {

                    if (err) return done(err);

                    post['likes'] = likes;
                    count++;
                    console.log(post, count)
                    if (count === posts.length) {
                        return done(null, posts)
                    }
                })
            })



        }
    )
}


const getFollowerPosts = (user_id, done) => {
    const sql = `   SELECT p.post_id, p.text, p.date_published, u.user_id, u.first_name, u.last_name, u.username
                    FROM posts p, users u
                    WHERE p.author_id = u.user_id 
                    AND (u.user_id IN (SELECT follower_id FROM followers WHERE user_id = ?) OR p.author_id = ?)
                    ORDER BY p.date_published DESC`
    console.log("here")
    const posts = [];
    db.each(
        sql,
        [user_id, user_id],
        (err, row) => {
            if (err) {
                return done(err);
            }

            posts.push({
                "post_id": row.post_id,
                "timestamp": row.date_published,
                "text": row.text,
                "author": {
                    "user_id": row.user_id,
                    "first_name": row.first_name,
                    "last_name": row.last_name,
                    "username": row.username
                }
            })
        },

        (err, num_rows) => {
            if (err) return done(err);
            let count = 0;

            console.log("Get the likes")

            posts.forEach((post) => {

                getLikesForPost(post.post_id, (err, likes) => {

                    if (err) return done(err);

                    post['likes'] = likes;
                    count++;
                    console.log(post, count)
                    if (count === posts.length) {
                        return done(null, posts)
                    }
                })
            })
        }
    )
}

module.exports = {
    getAllPosts,
    getFollowerPosts
}