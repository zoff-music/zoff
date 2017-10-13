var mongo_db_cred = {config: 'mydb'};
var mongojs = require('mongojs');
var db = mongojs(mongo_db_cred.config);

db.collection("chat_logs").createIndex({ "createdAt": 1 }, { expireAfterSeconds: 600 });

db.on('connected', function(err) {
    console.log("connected");
})

db.on('error',function(err) {
    console.log("\n" + new Date().toString() + "\n Database error: ", err);
});

module.exports = db;
