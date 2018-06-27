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

module.exports.frontpage_lists = frontpage_lists;
module.exports.update_frontpage = update_frontpage;
