path = require('path'),
pathThumbnails = __dirname;
db = require(pathThumbnails + '/../handlers/db.js');
var usual = [];
var settings = [];

db.getCollectionNames(function(err, docs) {
    for(var i = 0; i < docs.length; i++) {
        //console.log(docs[i] == "");
        if(docs[i].indexOf("_settings") == -1 && docs[i].substring(0,1) != "." && docs[i].substring(docs[i].length - 1, docs[i].length) != ".") {
            t(docs[i]);
        }
    }
    /*for(var i = 0; i < docs.length; i++) {
        if(docs[i].indexOf("_settings") > -1) {
            settings.push(docs[0]);
        } else {
            usual.push(docs[0]);
        }
        //addType(docs[i]);
    }
    for(var i = 0; i < usual.length; i++) {
        if(settings.indexOf(usual + "_settings") < 0) {
            console.log(usual);
        }
    }*/
})

function t(docs) {
    db.collection(docs).find({id: {$exists: true}}, function(e, _docs) {
        if(_docs.length > 0) {
            db.collection(docs).createIndex({id: 1}, {unique: true}, function(e,d){
                console.log(docs);
            });
        }
    })
}

function addType(name) {
    if(name.indexOf("_settings") > -1) {
        db.collection(name).update({views: {$exists: true}}, {$set: { id: "config" }}, {multi: true}, function(err, doc) {
            console.log(name);
        });
    }
}
