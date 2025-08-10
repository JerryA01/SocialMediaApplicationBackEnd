const { add } = require("nodemon/lib/rules");
const crypto = require("crypto");
const db = require("../../database");


const getHash = function (password, salt) {
    return crypto.pbkdf2Sync(password, salt, 100000, 256, 'sha256').toString('hex')
};

const addNewUser = (user, done) => {
    const salt = crypto.randomBytes(64);
    const hash = getHash(user.password, salt);

    const sql = 'INSERT INTO users (first_name, last_name, username, password, salt) VALUES (?, ?, ?, ?, ?)'
    let values = [user.first_name, user.last_name, user.username, hash, salt.toString('hex')];

    db.run(sql, values, function (err) {
        if (err) return done(err);
        return done(null, this.lastID)
    })
};

const authenticateUser = (username, password, done) => {
    const sql = 'SELECT user_id, password, salt FROM users WHERE username=?'


    db.get(sql, [username], (err, row) => {

        if (err) return done(err)
        if (!row) return done(404)


        if (row.salt === null) row.salt = ''

        let salt = Buffer.from(row.salt, 'hex')

        if (row.password === getHash(password, salt)) {
            return done(false, row.user_id)
        } else {
            return done(404)
        }
    })
}


const getToken = (id, done) => {

    const sql = 'SELECT session_token FROM users WHERE user_id=?'

    db.get(sql, [id], (err, token) => {
        return done(err, token)
    })
}

const setToken = (id, done) => {
    let token = crypto.randomBytes(16).toString('hex');

    const sql = 'UPDATE users SET session_token=? WHERE user_id=?'

    db.run(sql, [token, id], (err) => {
        return done(err, token)
    })
}

const removeToken = (token, done) => {
    const sql = 'UPDATE users SET session_token=null WHERE session_token=?'

    db.run(sql, [token], (err) => {
        return done(err)
    })
}

const GetIDFromToken = (token, done) => {
    console.log("token", token)
    const sql = 'SELECT user_id FROM users WHERE session_token=?'
    const params = [token]

    db.get(sql, params, (err, row) => {
        console.log(err, row, token)
        if (err) return done("Something has broke")
        if (!row) return done("Not Found")

        console.log(row.user_id)
        return done(null, row.user_id);
    })


}

const getSingleUser = (user_id, done) => {

    const sql = 'SELECT u.user_id, u.first_name, u.last_name, u.username FROM users u WHERE u.user_id=?';

    db.get(sql, [user_id], function (err, user_details) {
        console.log("the current user details" + user_details)

        if (err) {
            console.log("somethng wrong wit hthe sql")
            return done(err);
        }

        if (!user_details) {
            return done(404);
        }

        const sql = `SELECT u.user_id, u.first_name, u.last_name, u.username 
                 FROM users u, followers f 
                 WHERE f.follower_id=?
                 AND u.user_id=f.user_id`;

        const followers = [];
        db.each(
            sql,
            [user_id],
            (err, row) => {
                if (err) {
                    return done(err);

                }
                followers.push({
                    user_id: row.user_id,
                    first_name: row.first_name,
                    last_name: row.last_name,
                    username: row.username
                })
            },
            (err, num_rows) => {
                if (err) return done(err);

                const sql3 = `SELECT u.user_id, u.first_name, u.last_name, u.username 
                FROM users u, followers f 
                WHERE f.user_id=?      
                AND u.user_id=f.follower_id`;


                const following = [];
                db.each(
                    sql3,
                    [user_id],
                    (err, row) => {
                        if (err) {
                            return done(err);
                        }

                        following.push({
                            user_id: row.user_id,
                            first_name: row.first_name,
                            last_name: row.last_name,
                            username: row.username
                        })
                    },
                    (err, num_rows) => {
                        if (err) return done(err);

                        let sql = 'SELECT p.post_id, p.date_published, p.text, u.user_id, u.first_name, u.last_name, u.username FROM posts p, users u WHERE p.author_id=? AND p.author_id = u.user_id';
                        let posts = [];
                        db.each(
                            sql,
                            [user_id],
                            (err, row) => {
                                if (err) {
                                    console.log("this is the error " + err)
                                    return done(err);
                                }
                                if (!row) return done(404);

                                console.log(row)

                                posts.push({
                                    post_id: row.post_id,
                                    timestamp: row.date_published,
                                    text: row.text,
                                    author: {
                                        user_id: row.user_id,
                                        first_name: row.first_name,
                                        last_name: row.last_name,
                                        username: row.username
                                    },
                                })

                            },
                            (err) => {
                                if (err) return done(err);

                                if (posts.length === 0) {
                                    return done(null, {
                                        user_id: user_details.user_id,
                                        first_name: user_details.first_name,
                                        last_name: user_details.last_name,
                                        username: user_details.username,
                                        followers: followers,
                                        following: following,
                                        posts: []
                                    })
                                }


                                let count = 0;
                                posts.forEach((post) => {


                                    let sql = "SELECT u.user_id, u.first_name, u.last_name, u.username FROM users u, likes l WHERE l.post_id=? AND l.user_id = u.user_id";
                                    let likes = [];

                                    db.each(
                                        sql,
                                        [post.post_id],
                                        (err, row) => {
                                            if (err) {
                                                console.log("this is the error " + err)
                                                return done(err);
                                            }
                                            if (!row) return done(404);

                                            likes.push({
                                                user_id: row.user_id,
                                                first_name: row.first_name,
                                                last_name: row.last_name,
                                                username: row.username

                                            })
                                        },
                                        (err) => {
                                            if (err) return done(err)
                                            post["likes"] = likes;
                                            count++;


                                            if (posts.length === count) {
                                                return done(null, {
                                                    user_id: user_details.user_id,
                                                    first_name: user_details.first_name,
                                                    last_name: user_details.last_name,
                                                    username: user_details.username,
                                                    followers: followers,
                                                    following: following,
                                                    posts: posts
                                                })

                                            }

                                        }
                                    )
                                })


                            }
                        )

                    }
                )

            }
        )

    })

}

const follow = (user_id, follower_id, done) => {
    const sql = 'INSERT INTO followers (user_id, follower_id) VALUES (?, ?)';
    let values = [user_id, follower_id];

    console.log("the follower id is " + follower_id);
    console.log("the user id is " + user_id);

    db.run(sql, values, function (err) {
        if (err) {
            if (err.errno === 19) return done(403);
            return done(err);
        }
        return done(null)
    })

}

const unfollow = (user_id, follower_id, done) => {


    const sql5 = 'SELECT user_id, follower_id FROM followers WHERE user_id=? AND follower_id=?';

    console.log("follower_id is " + follower_id);
    console.log("user_id is " + user_id);

    db.get(sql5, [user_id, follower_id], function (err, follow_details) {
        if (err) {
            return done(err);
        }

        if (!follow_details) {
            console.log("this is the error " + err)
            return done(404);
        }

        console.log("it exists!");

        const sql2 = 'DELETE FROM followers WHERE user_id=? AND follower_id=?'

        db.run(sql2, [user_id, follower_id], (err) => {
            return done(err);
        })
    })
}

const searching = (q, done) => {
    console.log("q = " + q)
    if (!q || q === null) {
        q = ""
    }
    const sql = 'SELECT u.user_id, u.first_name, u.last_name, u.username FROM users u WHERE u.first_name LIKE "%' + q + '%" OR u.last_name LIKE "%' + q + '%" OR u.username LIKE "%' + q + '%"';

    const users = [];
    db.each(
        sql,
        [],
        (err, row) => {
            console.log("hello")
            console.log("this is the row" + row)
            if (err) {
                console.log(err)
                return done(err);

            }
            users.push({
                user_id: row.user_id,
                first_name: row.first_name,
                last_name: row.last_name,
                username: row.username
            })
        },

        (err, num_rows) => {
            if (err) return done(err);
            console.log("this is the error" + err)
            return done(null, users)
        }

    )
    console.log("it gets here")
}


module.exports = {
    addNewUser: addNewUser,
    authenticateUser: authenticateUser,
    getToken: getToken,
    setToken: setToken,
    removeToken: removeToken,
    GetIDFromToken: GetIDFromToken,
    getSingleUser: getSingleUser,
    follow: follow,
    unfollow: unfollow,
    searching: searching

}