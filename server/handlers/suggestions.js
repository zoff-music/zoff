function thumbnail(msg, coll, guid, offline, socket) {
    if(msg.thumbnail && msg.channel && msg.adminpass && msg.thumbnail.indexOf("i.imgur.com") > -1){
        msg.thumbnail = msg.thumbnail.replace(/^https?\:\/\//i, "");
        if(msg.thumbnail.substring(0,2) != "//") msg.thumbnail = "//" + msg.thumbnail;
        var channel = msg.channel.toLowerCase();
        var hash = Functions.hash_pass(Functions.decrypt_string(socket.zoff_id, msg.adminpass));
        db.collection(channel + "_settings").update({views: {$exists: true}}, function(err, docs){
            if(docs.length > 0 && (docs[0].userpass == undefined || docs[0].userpass == "" || (msg.hasOwnProperty('pass') && docs[0].userpass == Functions.decrypt_string(socketid, msg.pass)))) {
                if(docs !== null && docs.length !== 0 && docs[0].adminpass !== "" && docs[0].adminpass == hash){
                    db.collection("suggested_thumbnails").update({channel: channel}, {$set:{thumbnail: msg.thumbnail}}, {upsert:true}, function(err, docs){
                        Notifications.requested_change("thumbnail", msg.thumbnail, channel);
                        socket.emit("toast", "suggested_thumbnail");
                    });
                }
            } else {
                socket.emit("auth_required");
            }
        });
    } else {
        socket.emit("toast", "thumbnail_denied");
    }
}

function description(msg, coll, guid, offline, socket) {
    if(msg.description && msg.channel && msg.adminpass && msg.description.length < 100){
        var channel = msg.channel.toLowerCase();
        var hash = Functions.hash_pass(Functions.decrypt_string(socket.zoff_id, msg.adminpass));
        db.collection(channel + "_settings").update({views: {$exists: true}}, function(err, docs){
            if(docs.length > 0 && (docs[0].userpass == undefined || docs[0].userpass == "" || (msg.hasOwnProperty('pass') && docs[0].userpass == Functions.decrypt_string(socketid, msg.pass)))) {
                if(docs !== null && docs.length !== 0 && docs[0].adminpass !== "" && docs[0].adminpass == hash){
                    db.collection("suggested_descriptions").update({channel: channel}, {$set:{description: msg.description}}, {upsert:true}, function(err, docs){
                        Notifications.requested_change("description", msg.description, channel);
                        socket.emit("toast", "suggested_description");
                    });
                }
            } else {
                socket.emit("auth_required");
            }
        });
    } else {
        socket.emit("toast", "description_denied");
    }
}

module.exports.thumbnail = thumbnail;
module.exports.description = description;
