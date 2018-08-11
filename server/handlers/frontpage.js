var Functions = require(pathThumbnails + '/handlers/functions.js');
var db = require(pathThumbnails + '/handlers/db.js');
function frontpage_lists(msg, socket) {
    if(msg == undefined || !msg.hasOwnProperty('version') || msg.version != VERSION || msg.version == undefined) {
        var result = {
            version: {
                expected: VERSION,
                got: msg.hasOwnProperty("version") ? msg.version : undefined,
            }
        };
        socket.emit('update_required', result);
        return;
    }

    db.collection("frontpage_lists").find({frontpage:true}, function(err, docs){
        db.collection("connected_users").find({"_id": "total_users"}, function(err, tot){
            socket.compress(true).emit("playlists", {channels: docs, viewers: tot[0].total_users.length});
        });
    });
}

function get_frontpage_lists(callback) {
    var project_object = {
        "_id": 1,
        "count": 1,
        "frontpage": 1,
        "id": 1,
        "title": 1,
        "viewers": 1,
        "accessed": 1,
        "pinned": { $ifNull: [ "$pinned", 0 ] },
        "description": {
            $ifNull: [ {$cond: {
                "if": {
                    "$or": [
                        { "$eq": [ "$description", ""] },
                        { "$eq": [ "$description", null] },
                        { "$eq": [ "$description", undefined] }
                    ]
                },
                then: "This list has no description",
                else: "$description"
            }}, "This list has no description"]

        },
        "thumbnail": {
            $ifNull: [ {$cond: {
                "if": {
                    "$or": [
                        { "$eq": [ "$thumbnail", ""] },
                        { "$eq": [ "$thumbnail", null] },
                        { "$eq": [ "$thumbnail", undefined] }
                    ]
                },
                then: {
                    $concat : [ "https://img.youtube.com/vi/", "$id", "/mqdefault.jpg"]
                },
                else: "$thumbnail"
            }}, { $concat : [ "https://img.youtube.com/vi/", "$id", "/mqdefault.jpg"]}]

        }
    };
    db.collection("frontpage_lists").aggregate([
        {
            "$match": {
                frontpage: true,
                count: {$gt: 3},
            }
        },
        {
            "$project": project_object
        },
        {
            "$sort" : {
                "pinned": -1,
                "viewers": -1,
                "accessed": -1,
                "count": -1,
                "title": 1
            }
        },
    ], callback);
}

function update_frontpage(coll, id, title, thumbnail, source, callback) {
    //coll = coll.replace(/ /g,'');
    db.collection("frontpage_lists").find({_id: coll}, function(e, doc) {
        var updateObject = {
            id: id,
            title: title,
            accessed: Functions.get_time()
        };
if(doc.length > 0 && ((doc[0].thumbnail != "" && doc[0].thumbnail != undefined && (doc[0].thumbnail.indexOf("https://i1.sndcdn.com") > -1 || doc[0].thumbnail.indexOf("https://w1.sndcdn.com") > -1 || doc[0].thumbnail.indexOf("https://img.youtube.com") > -1)) || (doc[0].thumbnail == "" || doc[0].thumbnail == undefined))) {
            updateObject.thumbnail = thumbnail;
            if(thumbnail == undefined) updateObject.thumbnail = "";
        }
        db.collection("frontpage_lists").update({_id: coll}, {$set: updateObject
        },{upsert: true}, function(err, returnDocs){
            if(typeof(callback) == "function") callback();
        });
    });
}

module.exports.get_frontpage_lists = get_frontpage_lists;
module.exports.frontpage_lists = frontpage_lists;
module.exports.update_frontpage = update_frontpage;
