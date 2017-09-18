function add_function(arr, coll, guid, offline, socket) {
  var socketid = socket.zoff_id;
  if(typeof(arr) === 'object' && arr !== undefined && arr !== null && arr !== "" && !isNaN(parseInt(arr.duration)))
  {

    if(coll == "" || coll == undefined || coll == null) {
      socket.emit("update_required");
      return;
    }

    db.collection(coll).find({views:{$exists:true}}, function(err, docs){
      if(docs.length > 0 && (docs[0].userpass == undefined || docs[0].userpass == "" || (arr.hasOwnProperty('pass') && docs[0].userpass == decrypt_string(socketid, arr.pass)))) {

        check_inlist(coll, guid, socket, offline);

        var id = arr.id;
        var title = arr.title;
        var hash = hash_pass(decrypt_string(socketid, arr.adminpass));
        var duration = parseInt(arr.duration);
        var full_list = arr.playlist;
        var last = arr.num == arr.total - 1;
        var num = arr.num;
        var total = arr.total;
        db.collection(coll).find({views:{$exists:true}}, function(err, docs)
        {
          conf = docs;
          if(docs !== null && docs.length !== 0 && ((docs[0].addsongs === true && (hash == docs[0].adminpass || docs[0].adminpass === "")) ||
          docs[0].addsongs === false))
          {
            db.collection(coll).find({id:id, type:{$ne:"suggested"}}, function(err, docs){
              if(docs !== null && docs.length === 0)
              {
                var guids = full_list === true ? [] : [guid];
                var votes;
                var added;
                if(full_list) {
                  var time = get_time()-total;
                  time = time.toString();
                  var total_len = total.toString().length;
                  var now_len = num.toString().length;
                  var to_add = num.toString();
                  while(now_len < total_len) {
                    to_add = "0" + to_add;
                    now_len = to_add.length;
                  }
                  time = time.substring(0, time.length - total_len);
                  time = time + to_add;
                  time = parseInt(time);
                  added = time;
                  votes = 0;
                } else {
                  added = get_time();
                  votes = 1;
                }

                db.collection(coll).find({now_playing:true}, function(err, docs){
                  if((docs !== null && docs.length === 0)){
                    np = true;
                    if(full_list && num === 0){
                      np = true;
                      time = time.toString();
                      total += 1;
                      var total_len = total.toString().length;
                      var now_len = total.toString().length;
                      var to_add = total.toString();
                      while(now_len < total_len) {
                        to_add = "0" + to_add;
                        now_len = to_add.length;
                      }
                      time = time.substring(0, time.length - total_len);
                      time = parseInt(time).toString() + to_add;
                      time = parseInt(time);
                      added = time;
                      votes = 0;
                    } else if(full_list) {
                      np = false;
                    }
                  } else {
                    np = false;
                  }
                  db.collection(coll).update({id: id}, {"added": added,"guids":guids,"id":id,"now_playing":np,"title":title,"votes":votes, "duration":duration}, {upsert: true}, function(err, docs){
                    if(np)
                    {
                      send_list(coll, undefined, false, true, false);
                      db.collection(coll).update({views:{$exists:true}}, {$set:{startTime: get_time()}});
                      send_play(coll, undefined);
                      update_frontpage(coll, id, title);
                    } else {
                      io.to(coll).emit("channel", {type: "added", value: {"_id": "asd", "added":added,"guids":guids,"id":id,"now_playing":np,"title":title,"votes":votes, "duration":duration}});
                    }
                    db.collection("frontpage_lists").update({_id:coll}, {$inc:{count:1}, $set:{accessed: get_time()}}, {upsert:true}, function(err, docs){});
                    getNextSong(coll);
                  });
                  if(!full_list) {
                    socket.emit("toast", "addedsong");
                  } else if(full_list && last) {
                    socket.emit("toast", "addedplaylist");
                  }
                });
              } else if(!full_list) {
                vote(coll, id, guid, socket, full_list, last);
                if(full_list && last) {
                  socket.emit("toast", "addedplaylist");
                }
              } else if(full_list && last) {
                socket.emit("toast", "addedplaylist");
              }
            });
          } else if(!full_list) {
            db.collection(coll).find({id: id}, function(err, docs) {
              if(docs.length === 0) {
                db.collection(coll).update({id: id}, {$set:{
                  "added":get_time(),
                  "guids": [guid],
                  "id":id,
                  "now_playing": false,
                  "title":title,
                  "votes":1,
                  "duration":duration,
                  "type":"suggested"}
                },
                {upsert:true}, function(err, docs){
                  socket.emit("toast", "suggested");
                  io.to(coll).emit("suggested", {id: id, title: title, duration: duration});
                });
              } else if(docs[0].now_playing === true){
                socket.emit("toast", "alreadyplay");
              } else{
                if(conf[0].vote === false) vote(coll, id, guid, socket, full_list, last);
                else socket.emit("toast", "listhaspass");
              }
            });
          } else if (full_list){
            if(arr.num == 0) {
              socket.emit("toast", "listhaspass");
            }
          }
        });
      } else {
        socket.emit("auth_required");
      }
    });
  } else {
    socket.emit('update_required');
  }
}

function voteUndecided(msg, coll, guid, offline, socket) {
  var socketid = socket.zoff_id;
  if(typeof(msg) === 'object' && msg !== undefined && msg !== null){

    if(coll == "" || coll == undefined || coll == null || !msg.hasOwnProperty("adminpass") || !msg.hasOwnProperty("pass") || !msg.hasOwnProperty("id")) {
      socket.emit("update_required");
      return;
    }

    db.collection(coll).find({views:{$exists:true}}, function(err, docs){
      if(docs.length > 0 && (docs[0].userpass == undefined || docs[0].userpass == "" || (msg.hasOwnProperty('pass') && docs[0].userpass == decrypt_string(socketid, msg.pass)))) {

        check_inlist(coll, guid, socket, offline);

        if(msg.type == "del")
        del(msg, socket, socketid);
        else
        {
          var id = msg.id;
          var hash = hash_pass(decrypt_string(socketid, msg.adminpass));
          db.collection(coll).find({views:{$exists:true}}, function(err, docs){
            if(docs !== null && docs.length !== 0 && ((docs[0].vote === true && (hash == docs[0].adminpass || docs[0].adminpass === "")) ||
            docs[0].vote === false))
            {
              vote(coll, id, guid, socket, false, false);
            }else{
              socket.emit("toast", "listhaspass");
            }
          });
        }
      } else {
        socket.emit("auth_required");
      }
    });
  } else {
    socket.emit('update_required');
  }
}

function shuffle(msg, coll, guid, offline, socket) {
  var socketid = socket.zoff_id;
  if(msg.hasOwnProperty('adminpass') && msg.adminpass !== undefined && msg.adminpass !== null)
  {
    if(coll == "" || coll == undefined || coll == null) {
      socket.emit("update_required");
      return;
    }

    check_inlist(coll, guid, socket, offline);
    var hash;
    if(msg.adminpass === "") hash = msg.adminpass;
    else hash = hash_pass(decrypt_string(socketid, msg.adminpass));
    db.collection(coll).find({views:{$exists:true}}, function(err, docs){
      if(docs.length > 0 && (docs[0].userpass == undefined || docs[0].userpass == "" || (msg.hasOwnProperty('pass') && docs[0].userpass == decrypt_string(socketid, msg.pass)))) {
        if(docs !== null && docs.length !== 0 && ((docs[0].adminpass == hash || docs[0].adminpass === "") || docs[0].shuffle === false))
        {
          db.collection(coll).find({now_playing:false}).forEach(function(err, docs){
            if(!docs){
              send_list(coll, undefined, false, true, false, true);
              socket.emit("toast", "shuffled");

              return;
            }else{
              num = Math.floor(Math.random()*1000000);
              db.collection(coll).update({id:docs.id}, {$set:{added:num}});
            }
          });
        }else
        socket.emit("toast", "wrongpass");
      } else {
        socket.emit("auth_required");
      }
    });

    var complete = function(tot, curr){
      if(tot == curr)
      {
        send_list(coll, undefined, false, true, false);
        getNextSong(coll);
      }
    };

  }else
  socket.emit("toast", "wrongpass");
}

function del(params, socket, socketid) {
	if(params.id){
		var coll = emojiStrip(params.channel).toLowerCase();
		coll = coll.replace("_", "");
		coll = encodeURIComponent(coll).replace(/\W/g, '');
		coll = filter.clean(coll);
		db.collection(coll).find({views:{$exists:true}}, function(err, docs){
			if(docs !== null && docs.length !== 0 && docs[0].adminpass == hash_pass(decrypt_string(socketid, params.adminpass)))
			{
				db.collection(coll).find({id:params.id}, function(err, docs){
					dont_increment = true;
					if(docs[0]){
						if(docs[0].type == "suggested"){
							dont_increment = false;
						}
						db.collection(coll).remove({id:params.id}, function(err, docs){
							socket.emit("toast", "deletesong");
							io.to(coll).emit("channel", {type:"deleted", value: params.id});
							if(dont_increment) db.collection("frontpage_lists").update({_id: coll}, {$inc: {count: -1}, $set:{accessed: get_time()}}, {upsert: true}, function(err, docs){});
						});
					}
				});

			}
		});
	}
}

function delete_all(msg, coll, guid, offline, socket) {
  var socketid = socket.zoff_id;
  if(typeof(msg) == 'object' && msg.hasOwnProperty('channel') && msg.hasOwnProperty('adminpass') && msg.hasOwnProperty('pass')) {
    var hash = hash_pass(decrypt_string(socketid, msg.adminpass));
    var hash_userpass = decrypt_string(socketid, msg.pass);

    db.collection(coll).find({views: {$exists: true}}, function(err, conf) {
      if(conf.length == 1 && conf) {
        conf = conf[0];
        if(conf.adminpass == hash && conf.adminpass != "" && (conf.userpass == "" || conf.userpass == undefined || (conf.userpass != "" && conf.userpass != undefined && conf.pass == hash_userpass))) {
          db.collection(coll).remove({views: {$exists: false}}, {multi: true}, function(err, succ) {
            send_list(coll, false, true, true, true);
            db.collection("frontpage_lists").update({_id: coll}, {$set: {count: 0, accessed: get_time()}}, {upsert: true}, function(err, docs) {});
            socket.emit("toast", "deleted_songs");
          });
        } else {
          socket.emit("toast", "listhaspass");
        }
      }
    });
  } else {
    socket.emit("update_required");
    return;
  }
}

function vote(coll, id, guid, socket, full_list, last) {
	db.collection(coll).find({id:id, now_playing: false}, function(err, docs){
		if(docs !== null && docs.length > 0 && !contains(docs[0].guids, guid))
		{
			db.collection(coll).update({id:id}, {$inc:{votes:1}, $set:{added:get_time()}, $push :{guids: guid}}, function(err, docs)
			{
				if((full_list && last) || (!full_list))
				socket.emit("toast", "voted");
				io.to(coll).emit("channel", {type: "vote", value: id, time: get_time()});

				getNextSong(coll);
			});
		}else
		{
			socket.emit("toast", "alreadyvoted");
		}
	});
}
