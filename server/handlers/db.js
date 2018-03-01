var path = require('path');
try {
    var mongo_config = require(path.join(path.join(__dirname, '../config/'), 'mongo_config.js'));
} catch(e) {
    console.log("Error - missing file");
    console.log("Seems you forgot to create the file mongo_config.js in /server/config/. Have a look at mongo_config.example.js.");
    process.exit();
}
var mongojs = require('mongojs');
var db = mongojs('mongodb://' + mongo_config.host + '/' + mongo_config.config);

db.collection("chat_logs").createIndex({ "createdAt": 1 }, { expireAfterSeconds: 600 });
db.collection("timeout_api").createIndex({ "createdAt": 1 }, { expireAfterSeconds: 5 });
db.on('connected', function(err) {
    console.log("connected");
})

db.on('error',function(err) {
    console.log("\n" + new Date().toString() + "\n Database error: ", err);
});

module.exports = db;
