var frontpage_lists = function(msg, socket) {
  if(!msg.hasOwnProperty('version') || msg.version != VERSION || msg.version == undefined) {
    socket.emit("update_required");
  }

  db.collection("frontpage_lists").find({frontpage:true, count: {$gt: 0}}, function(err, docs){
    db.collection("connected_users").find({"_id": "total_users"}, function(err, tot){
      socket.emit("playlists", {channels: docs, viewers: tot[0].total_users});
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

module.exports.update_frontpage = update_frontpage;
module.exports.frontpage_lists = frontpage_lists;
