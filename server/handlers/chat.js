function get_history(channel, all, socket) {
    var query = {};
    if(all) {
        query = {
            all: true,
        };
    } else {
        query = {
            all: false,
            channel: channel,
        };
    }
    db.collection("chat_logs").find(query, {
        from: 1,
        createdAt: 1,
        all: 1,
        channel: 1,
        msg: 1,
        icon: 1,
        _id: 0
    }).sort({createdAt: 1}).limit(20, function(err, docs) {
        socket.emit("chat_history", {all: all, data: docs});
    });
}


function chat(msg, guid, offline, socket) {
    if(typeof(msg) !== 'object' && !msg.hasOwnProperty('data') && !msg.hasOwnProperty('channel') && !msg.hasOwnProperty('pass')) {
        socket.emit('update_required');
        return;
    }
    var coll = msg.channel;
    db.collection(coll + "_settings").find(function(err, docs){
        if(docs.length > 0 && (docs[0].userpass == undefined || docs[0].userpass == "" || (msg.hasOwnProperty('pass') && docs[0].userpass == Functions.decrypt_string(socket.zoff_id, msg.pass)))) {
            var data = msg.data;
            Functions.check_inlist(coll, guid, socket, offline);
            if(data !== "" && data !== undefined && data !== null &&
            data.length < 151 && data.replace(/\s/g, '').length){
                db.collection("user_names").find({"guid": guid}, function(err, docs) {
                    if(docs.length == 1) {
                        db.collection("registered_users").find({"_id": docs[0].name}, function(err, n) {
                            var icon = false;
                            if(n.length > 0 && n[0].icon) {
                                icon = n[0].icon;
                            }
                            db.collection("chat_logs").insert({ "createdAt": new Date(), all: false, channel: coll, from: docs[0].name, msg: ": " + data, icon: icon });
                            io.to(coll).emit('chat', {from: docs[0].name, msg: ": " + data, icon: icon});
                        });
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
                db.collection("registered_users").find({"_id": docs[0].name}, function(err, n) {
                    var icon = false;
                    if(n.length > 0 && n[0].icon) {
                        icon = n[0].icon;
                    }
                    db.collection("chat_logs").insert({ "createdAt": new Date(), all: true, channel: coll, from: docs[0].name, msg: ": " + data, icon: icon }, function(err, docs) {});
                    io.sockets.emit('chat.all', {from: docs[0].name, msg: ": " + data, channel: coll, icon: icon});
                });
            } else if(docs.length == 0) {
                get_name(guid, {announce: false, channel: coll, message: data, all: true});
            }
        });
    }
}

function namechange(data, guid, socket, tried) {
    if(!data.hasOwnProperty("name") || data.name.length > 10 || !data.hasOwnProperty("channel")) return;
    var pw = "";
    var new_password;
    var first = false;
    if(data.hasOwnProperty("first")) {
        first = data.first;
    }
    if(data.hasOwnProperty("password")) {
        pw = data.password;
        new_password = false;
    } else if(data.hasOwnProperty("new_password") && data.hasOwnProperty("old_password")) {
        pw = data.old_password;
        new_password = Functions.decrypt_string(socket.zoff_id, data.new_password);
    }
    var password = Functions.decrypt_string(socket.zoff_id, pw);
    var name = data.name;
    db.collection("registered_users").find({"_id": name.toLowerCase()}, function(err, docs) {
        var accepted_password = false;
        var icon = false;
        if(docs.length == 0) {
            if(new_password) {
                return;
            }
            accepted_password = true;
            db.collection("registered_users").update({"_id": name.toLowerCase()}, {$set: {password: Functions.hash_pass(password)}}, {upsert: true}, function() {});
        } else if(docs[0].password == Functions.hash_pass(password)) {
            if(docs[0].icon) {
                icon = docs[0].icon;
            }
            accepted_password = true;
            if(new_password) {
                db.collection("registered_users").update({"_id": name.toLowerCase(), password: Functions.hash_pass(password)}, {$set: {password: Functions.hash_pass(new_password)}}, function() {});
            }
        }
        if(accepted_password) {
            db.collection("user_names").find({"guid": guid}, function(err, names) {
                if(names.length > 0) {
                    var old_name = names[0].name;
                    db.collection("user_names").update({"_id": "all_names"}, {$pull: {names: old_name}}, function() {});
                    db.collection("user_names").update({"guid": guid}, {$set: {name: name, icon: icon}}, function(err, docs) {
                        db.collection("user_names").update({"_id": "all_names"}, {$addToSet: {names: name}}, function(err, docs) {
                            socket.emit('name', {type: "name", accepted: true});
                            if(old_name != name && !first) {
                                io.to(data.channel).emit('chat', {from: old_name, msg: " changed name to " + name});
                                io.sockets.emit('chat.all', {from: old_name , msg: " changed name to " + name, channel: data.channel});
                            }
                        });
                    });
                } else {
                    if(tried < 3 || tried == undefined) {
                        if(tried == undefined) {
                            tried = 1;
                        }
                        namechange(data, guid, socket, tried + 1);
                    }
                }
            });
        } else {
            socket.emit('name', {type: "name", accepted: false});
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

function generate_name(guid, announce_payload, second) {
    var tmp_name = Functions.rndName(second ? second : guid, 8);
    db.collection("registered_users").find({"_id": tmp_name}, function(err, docs) {
        if(docs.length == 0) {
            db.collection("user_names").update({"_id": "all_names"}, {$addToSet: {names: tmp_name}}, {upsert: true}, function(err, updated) {
                if(updated.nModified == 1 || (updated.hasOwnProperty("upserted") && n == 1)) {
                    db.collection("user_names").update({"guid": guid}, {$set: {name: tmp_name, icon: false}}, {upsert: true}, function(err, update){
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
                    Chat.generate_name(guid, announce_payload, tmp_name);
                }
            })
        } else {
            Chat.generate_name(guid, announce_payload, tmp_name);
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

module.exports.get_history = get_history;
module.exports.chat = chat;
module.exports.all_chat = all_chat;
module.exports.namechange = namechange;
module.exports.removename = removename;
module.exports.generate_name = generate_name;
module.exports.get_name = get_name;
