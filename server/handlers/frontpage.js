function frontpage_lists(msg, socket) {
    if(msg == undefined || !msg.hasOwnProperty('version') || msg.version != VERSION || msg.version == undefined) {
        socket.emit("update_required");
    }

    db.collection("frontpage_lists").find({frontpage:true}, function(err, docs){
        db.collection("connected_users").find({"_id": "total_users"}, function(err, tot){
            socket.compress(true).emit("playlists", {channels: docs, viewers: tot[0].total_users.length});
        });
    });
}

function update_frontpage(coll, id, title) {
    db.collection("frontpage_lists").update({_id: coll}, {$set: {
        id: id,
        title: title,
        accessed: Functions.get_time()}
    },{upsert: true}, function(err, returnDocs){});
}

module.exports.frontpage_lists = frontpage_lists;
module.exports.update_frontpage = update_frontpage;
