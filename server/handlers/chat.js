
function chat(msg, guid, offline, socket) {
  if(typeof(msg) !== 'object' && !msg.hasOwnProperty('data') && !msg.hasOwnProperty('channel') && !msg.hasOwnProperty('pass')) {
    socket.emit('update_required');
    return;
  }
  var coll = msg.channel;
  db.collection(coll).find({views:{$exists:true}}, function(err, docs){
    if(docs.length > 0 && (docs[0].userpass == undefined || docs[0].userpass == "" || (msg.hasOwnProperty('pass') && docs[0].userpass == Functions.decrypt_string(socket.zoff_id, msg.pass)))) {
      var data = msg.data;
      Functions.check_inlist(coll, guid, socket, offline);
      if(data !== "" && data !== undefined && data !== null &&
      data.length < 151 && data.replace(/\s/g, '').length){
        db.collection("user_names").find({"guid": guid}, function(err, docs) {
          if(docs.length == 1) {
            io.to(coll).emit('chat', {from: docs[0].name, msg: ": " + data});
          } else if(docs.length == 0){
            get_name(guid, {announce: false, channel: coll, message: data, all: false});
          }
        });
      }
    } else {
      socket.emit('auth_required');
    }
  });
}

function all_chat(msg, guid, offline, socket) {
  if(typeof(msg) !== 'object' || !msg.hasOwnProperty("channel") || !msg.hasOwnProperty("data")) {
    socket.emit('update_required');
    return;
  }
  var coll = msg.channel;
  var data = msg.data;

  Functions.check_inlist(coll, guid, socket, offline);
  if(data !== "" && data !== undefined && data !== null &&
  data.length < 151 && data.replace(/\s/g, '').length){
    db.collection("user_names").find({"guid": guid}, function(err, docs) {
      if(docs.length == 1) {
        io.sockets.emit('chat.all', {from: docs[0].name, msg: ": " + data, channel: coll});
      } else if(docs.length == 0) {
        get_name(guid, {announce: false, channel: coll, message: data, all: true});
      }
    });
  }
}

function namechange(data, guid, coll) {
  if(typeof(data) !== "string" || coll == undefined) return;
  data = encodeURIComponent(data).replace(/\W/g, '').replace(/[^\x00-\x7F]/g, "");
  db.collection("user_names").find({"guid": guid}, function(err, docs) {
    if(docs.length == 1) {
      if(docs[0].name == data) return;
      var change_name = function(new_name, guid, old_name) {
        if(new_name.length > 9) {
          return;
        } else {
          db.collection("user_names").update({"_id": "all_names"}, {$addToSet: {names: new_name}}, function(err, updated) {
            if(updated.nModified == 1) {
              db.collection("user_names").update({"guid": guid}, {$set: {name: new_name}}, function(err, updated) {
                db.collection("user_names").update({"_id": "all_names"}, {$pull: {names: old_name}}, function(err, updated) {});
                name = new_name;
                io.to(coll).emit('chat', {from: old_name, msg: " changed name to " + name});
                io.sockets.emit('chat.all', {from: old_name , msg: " changed name to " + name, channel: coll});
              });
            } else {
              change_name(new_name + "_", guid, old_name);
            }
          });
        }
      }

      var old_name = docs[0].name;
      change_name(data, guid, old_name);

    }
  });
}

function removename(guid, coll) {
  db.collection("user_names").find({"guid": guid}, function(err, docs) {
    if(docs.length == 1) {
      var old_name = docs[0].name;
      db.collection("user_names").update({"_id": "all_names"}, {$pull: {names: old_name}}, function(err, updated) {
        db.collection("user_names").remove({"guid": guid}, function(err, removed) {
          get_name(guid, {announce: true, old_name: old_name, channel: coll});
        });
      });
    }
  });
}

function generate_name(guid, announce_payload) {
  var tmp_name = Functions.rndName(guid, 8);
  db.collection("user_names").update({"_id": "all_names"}, {$addToSet: {names: tmp_name}}, {upsert: true}, function(err, updated) {
    if(updated.nModified == 1 || (updated.hasOwnProperty("upserted") && n == 1)) {
      db.collection("user_names").update({"guid": guid}, {$set: {name: tmp_name}}, {upsert: true}, function(err, update){
        name = tmp_name;
        if(announce_payload.announce) {
          io.to(announce_payload.channel).emit('chat', {from: announce_payload.old_name,  msg: " changed name to " + name});
          io.sockets.emit('chat.all', {from: announce_payload.old_name , msg: " changed name to " + name, channel: announce_payload.channel});
        } else if(announce_payload.message && !announce_payload.all) {
          io.to(announce_payload.channel).emit('chat', {from: name, msg: ": " + announce_payload.message});
        } else if(announce_payload.message && announce_payload.all) {
          io.sockets.emit('chat.all', {from: name, msg: ": " + announce_payload.message, channel: announce_payload.channel});
        }
      });
    } else {
      Chat.generate_name(tmp_name, announce_payload);
    }
  })
}

function get_name(guid, announce_payload) {
  db.collection("user_names").find({"guid": guid}, function(err, docs) {
    if(docs.length == 0) {
      Chat.generate_name(guid, announce_payload);
    } else {
      name = docs[0].name;
    }
  })
}

module.exports.chat = chat;
module.exports.all_chat = all_chat;
module.exports.namechange = namechange;
module.exports.removename = removename;
module.exports.generate_name = generate_name;
module.exports.get_name = get_name;
