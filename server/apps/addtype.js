path = require('path'),
pathThumbnails = __dirname;
db = require(pathThumbnails + '/../handlers/db.js');

db.getCollectionNames(function(err, docs) {
    for(var i = 0; i < docs.length; i++) {
        addType(docs[i]);
    }
})

function addType(name) {
    db.collection(name).update({duration: {$exists: true},type:{$ne:"suggested"}}, {$set: { type: "video" }}, {multi: true}, function(err, doc) {
        process.exit();
    });
}
