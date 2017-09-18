function frontpage_lists(msg, socket) {
  if(!msg.hasOwnProperty('version') || msg.version != VERSION || msg.version == undefined) {
    socket.emit("update_required");
  }

console.log("gotten second ", get_time());
  db.collection("frontpage_lists").find({frontpage:true}, function(err, docs){
    console.log("gotten third ", get_time());
        db.collection("connected_users").find({"_id": "total_users"}, function(err, tot){
        console.log("sending frontpage ", get_time());
        socket.compress(true).emit("playlists", {channels: docs, viewers: tot[0].total_users});
        console.log("sent frontpage ", get_time());
         });
  });
}

function update_frontpage(coll, id, title) {
        db.collection("frontpage_lists").update({_id: coll}, {$set: {
                id: id,
                title: title,
                accessed: get_time()}
        },{upsert: true}, function(err, returnDocs){});
}
