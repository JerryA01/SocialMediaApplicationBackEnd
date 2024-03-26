const db = require("../../database");     
//Creating the functions that will interact with the database

const addNewPost = (post, user_id, done) => {      //Adds the details of a new post, to the database.
    const sql = 'INSERT INTO posts (text, date_published, author_id) VALUES (?, ?, ?)';
    let values = [post.text, Date.now(), user_id];

    db.run(sql, values,function(err) {   //db.run is for adding a post to the database
        if(err) return done(err);
        return done(null, this.lastID);
    })

}

const getSinglePost = (post_id, done) => {

  
const sql = 'SELECT p.post_id, p.date_published, p.text, u.user_id, u.first_name, u.last_name, u.username FROM posts p, users u WHERE p.post_id=? AND p.author_id = u.user_id';

db.get(sql, [post_id], function(err, post_details) { //postdeails checks if post exist
    if(err) return done(err); //checks sql 
    
    if(!post_details){ //checks if the post exists
        return done(404);
    } 
    //if all that passes.. then
    //Now we execute another db interaction to get the likes

     const sql = 'SELECT u.user_id, u.first_name, u.last_name, u.username FROM users u, likes l WHERE l.post_id=? AND l.user_id=u.user_id';

     const likes = [];    //Empty array to store our likes
     db.each( 
         sql,
         [post_id],
         (err, row) => {             //check if any errors for each row and refers them up to the controller if there are any, if not add each like to array
             if(err) return done(err);     
               
                
             likes.push({
                 user_id: row.user_id,
                 first_name: row.first_name,
                 last_name: row.last_name,
                 username: row.username
             })
         },
         (err, num_rows) => { //execute this function once finished
             if(err) return done(err);

             return done(null, {                 //once all rows processed if there are no errors we return all of our data up to the controller, leaeving the parameter null
                 post_id: post_details.post_id,
                 timestamp: post_details.date_published,
                 text: post_details.text,
                 author: {
                     user_id: post_details.user_id,
                     first_name: post_details.first_name,
                     last_name: post_details.last_name,
                     username: post_details.username
                 },
                 likes: likes
             })
         }
     )
})

} 

const updatePost = (post_id, new_text, done) => {
    const sql = 'UPDATE posts SET text=? WHERE post_id=?';

    db.run(sql, [new_text, post_id], (err) => {
        return done(err);
    })
   
}

const deletePost = (post_id, done) => {
const sql = 'DELETE FROM posts WHERE post_id=?';


db.run(sql, [post_id], (err) => {
    return done(err);
})

}

const addLike = (post_id, user_id, done) => {
const sql = 'INSERT INTO likes  (post_id, user_id) VALUES (?, ?)';
let values = [post_id, user_id];

console.log("the post id is " + post_id);
console.log("the user id is " + user_id);

db.run(sql, values, function(err) {
    if(err){ 
        if(err.errno === 19) return done(403);
        return done(err);       
    }
    return done(null)   
})

}


const removeLike = (post_id, user_id, done) => {

const sql = 'SELECT user_id, post_id FROM likes WHERE post_id=? AND user_id=?';

console.log("Post_id " + post_id);
console.log("User_id " + user_id);

db.get(sql, [post_id, user_id], function(err, like_details){  //see if it exists if it does 403 then delete it
if(err) return done(err);

if(!like_details){
    console.log(like_details, err);
    return done(403);
}


   

console.log("it exists!");

const sql2 = 'DELETE FROM likes WHERE post_id=? AND user_id=?';   


db.run(sql2, [post_id, user_id], (err) => {
    return done(err);
})

})

}


module.exports = {
    addNewPost: addNewPost,
    getSinglePost: getSinglePost,
    updatePost: updatePost,
    deletePost: deletePost,
    addLike: addLike,
    removeLike: removeLike
}