module.exports = function() {
    io.on('connection', function(socket){
        socket.zoff_id = socket.id;
        socket.emit("get_list");

        var guid = Functions.hash_pass(socket.handshake.headers["user-agent"] + socket.handshake.address + socket.handshake.headers["accept-language"]);

        socket.on('close', function() {
        });

        socket.on('pinging', function() {
            socket.emit("ok");
        });

        var ping_timeout;
        var socketid = socket.zoff_id;
        var coll;
        var in_list = false;
        var name = "";
        var short_id;
        Chat.get_name(guid, {announce: false});
        var offline = false;
        var chromecast_object = false;

        socket.emit("guid", guid);

        socket.on('self_ping', function(msg) {
            var channel = msg.channel;
            if(offline) {
                db.collection("connected_users").update({"_id": "offline_users"}, {$addToSet: {users: guid}}, {upsert: true}, function(err, docs){});
            } else {
                db.collection("connected_users").update({"_id": channel}, {$addToSet: {users: guid}}, {upsert: true}, function(err, docs){
                    db.collection("frontpage_lists").update({"_id": channel}, {$inc: {viewers: 1}}, {upsert: true}, function(){});
                });
            }
            if(channel != "" && channel != undefined) {
                db.collection("connected_users").update({"_id": "total_users"}, {$addToSet: {total_users: guid + channel}}, {upsert: true}, function(err, docs){});
            }
        });

        socket.on('color', function(msg) {
            if(msg.hasOwnProperty("id")) {
                List.sendColor(false, socket, msg.id);
            }
        });

        socket.on("logout", function() {
            Functions.setSessionAdminPass(Functions.getSession(socket), "", coll, function() {})
        });

        socket.on('chromecast', function(msg) {
            try {
                if(typeof(msg) == "object" && msg.hasOwnProperty("guid") &&
                 msg.hasOwnProperty("socket_id") && msg.hasOwnProperty("channel") && typeof(msg.guid) == "string" &&
                 typeof(msg.channel) == "string" && typeof(msg.socket_id) == "string") {
                    db.collection("connected_users").find({"_id": msg.channel}, function(err, connected_users_channel) {
                        if(connected_users_channel.length > 0 && connected_users_channel[0].users.indexOf(msg.guid) > -1) {
                            var q = socket.handshake.headers.cookie.split(" ");
                            for(var i = 0; i < q.length; i++) {
                                if(q[i].substring(0,4) == "_uI=") {
                                    q[i] = "_uI=rpmFLmS2QvgRavsU6uTNYLAOWjXj5UUi0a4P24eqbao%3D; ";
                                    break;
                                }
                            }
                            socket.handshake.headers.cookie = q.join(" ");
                            guid = msg.guid;
                            socketid = msg.socket_id;
                            socket.zoff_id = socketid;
                            coll = msg.channel.toLowerCase();
                            in_list = true;
                            chromecast_object = true;
                            socket.join(coll);
                        }
                    });
                }
            } catch(e) {
                return;
            }
        });

        socket.on("get_id", function() {
            socket.emit("id_chromecast", Functions.getSession(socket));
        });

        socket.on("error_video", function(msg) {
           try {
               var _list = msg.channel;
               if(_list.length == 0) return;
               coll = emojiStrip(_list).toLowerCase();
               coll = coll.replace("_", "");
               coll = encodeURIComponent(coll).replace(/\W/g, '');
               coll = filter.clean(coll);
           } catch(e) {
               return;
           }
           Search.check_error_video(msg, coll);
       });

        socket.on("get_spread", function(){
            db.collection("connected_users").find({"_id": "total_users"}, function(err, tot) {
                db.collection("connected_users").find({"_id": "offline_users"}, function(err, off) {
                    db.collection("connected_users").find({"_id": {$ne: "total_users"}, "_id": {$ne: "offline_users"}}, function(err, users_list) {
                        if(tot.length > 0 && off.length == 0) {
                            socket.emit("spread_listeners", {offline: 0, total: tot[0].total_users.length, online_users: users_list});
                        } else if(tot.length > 0 && off.length > 0){
                            socket.emit("spread_listeners", {offline: off[0].users.length, total: tot[0].total_users.length, online_users: users_list});
                        }
                    });
                });
            });
        });

        socket.on('suggest_thumbnail', function(msg){
            Suggestions.thumbnail(msg, coll, guid, offline, socket);
        });

        socket.on('suggest_description', function(msg){
            Suggestions.description(msg, coll, guid, offline, socket);
        });

        socket.on("namechange", function(msg) {
            Chat.namechange(msg, guid, socket);
        });

        socket.on("removename", function(msg) {
            if(typeof(msg) != "object" || !msg.hasOwnProperty("channel")) {
                var result = {
                    channel: {
                        expected: "string",
                        got: msg.hasOwnProperty("channel") ? typeof(msg.channel) : undefined,
                    }
                };
               socket.emit('update_required', result);
                return;
            }
            Chat.removename(guid, msg.channel, socket);
        });

        socket.on("offline", function(msg){
            if(!msg.hasOwnProperty('status') || !msg.hasOwnProperty('channel') ||
            typeof(msg.status) != "boolean" || typeof(msg.channel) != "string") {
                var result = {
                    status: {
                        expected: "boolean",
                        got: msg.hasOwnProperty("status") ? typeof(msg.status) : undefined,
                    },
                    channel: {
                        expected: "string",
                        got: msg.hasOwnProperty("channel") ? typeof(msg.channel) : undefined
                    }
                };
               socket.emit('update_required', result);
                return;
            }
            var status = msg.status;
            var channel = msg.channel;
            if(status){
                in_list = false;
                offline = true;
                if(channel != "") coll = channel;
                if(coll !== undefined) {

                    db.collection("connected_users").findAndModify({
                        query: {"_id": coll},
                        update: {$pull: {users: guid}},
                        upsert: true,
                    }, function(err, updated, d) {
                        if(d.n == 1) {
                            var num = 0;
                            if(updated && updated.users) {
                                num = updated.users.length;
                            }
                            io.to(coll).emit("viewers", num);
                            db.collection("frontpage_lists").update({"_id": coll, "viewers": {$gt: 0}}, {$inc: {viewers: -1}}, function(err, docs) { });
                            db.collection("connected_users").update({"_id": "total_users"}, {$pull: {total_users: guid + coll}}, function(err, docs){
                                db.collection("connected_users").update({"_id": "offline_users"}, {$addToSet: {users: guid}}, function(err, docs) {
                                    if(docs.nModified == 1 && (coll != undefined && coll != "")) {
                                        db.collection("connected_users").update({"_id": "total_users"}, {$addToSet: {total_users: guid + coll}}, function(err, docs) {});
                                    }
                                });
                            });
                        }
                        Functions.remove_name_from_db(guid, name);
                    });
                }

                Functions.remove_unique_id(short_id);
            } else {
                offline = false;
                db.collection("connected_users").update({"_id": "offline_users"}, {$pull: {users: guid}}, function(err, docs) {
                    Functions.check_inlist(coll, guid, socket, offline);
                });
            }
        });

        socket.on('get_history', function(msg) {
            if(!msg.hasOwnProperty("channel") || !msg.hasOwnProperty("all") ||
            typeof(msg.channel) != "string" || typeof(msg.all) != "boolean") {
                var result = {
                    all: {
                        expected: "boolean",
                        got: msg.hasOwnProperty("all") ? typeof(msg.all) : undefined,
                    },
                    channel: {
                        expected: "string",
                        got: msg.hasOwnProperty("channel") ? typeof(msg.channel) : undefined,
                    },
                    pass: {
                        expected: "string",
                        got: msg.hasOwnProperty("pass") ? typeof(msg.pass) : undefined,
                    }
                };
               socket.emit('update_required', result);
                return;
            }
            Chat.get_history(msg.channel, msg.all, socket);
        });

        socket.on('chat', function (msg) {
            Chat.chat(msg, guid, offline, socket);
        });

        socket.on("all,chat", function(data)
        {
            Chat.all_chat(data, guid, offline, socket);
        });

        socket.on('frontpage_lists', function(msg)
        {
            Frontpage.frontpage_lists(msg, socket);
        });

        socket.on('now_playing', function(list, fn)
        {
            List.now_playing(list, fn, socket);
        });

        socket.on('id', function(arr)
        {
            if(typeof(arr) == 'object')
            io.to(arr.id).emit(arr.id.toLowerCase(), {type: arr.type, value: arr.value});
        });

        socket.on('list', function(msg)
        {
            try {
                var _list = msg.channel;
                if(_list.length == 0) return;
                coll = emojiStrip(_list).toLowerCase();
                coll = coll.replace("_", "");
                coll = encodeURIComponent(coll).replace(/\W/g, '');
                coll = filter.clean(coll);
            } catch(e) {
                return;
            }

            if(msg.hasOwnProperty("offline") && msg.offline) {
                offline = true;
            }
            List.list(msg, guid, coll, offline, socket);
            Functions.get_short_id(socket);
        });

        socket.on('end', function(obj)
        {
            if(coll === undefined) {
                try {
                    coll = obj.channel.toLowerCase();
                    if(coll.length == 0) return;
                    coll = emojiStrip(coll).toLowerCase();
                    coll = coll.replace("_", "");
                    coll = encodeURIComponent(coll).replace(/\W/g, '');
                    coll = filter.clean(coll);
                } catch(e) {
                    return;
                }
            }
            List.end(obj, coll, guid, offline, socket);
        });

        socket.on('add', function(arr)
        {
            if(coll !== undefined) {
                try {
                    coll = arr.list;
                    if(coll.length == 0) return;
                    coll = emojiStrip(coll).toLowerCase();
                    coll = coll.replace("_", "");
                    coll = encodeURIComponent(coll).replace(/\W/g, '');
                    coll = filter.clean(coll);
                } catch(e) {
                    return;
                }
            }
            ListChange.add_function(arr, coll, guid, offline, socket);
        });

        socket.on('delete_all', function(msg) {
            if(coll !== undefined) {
                try {
                    coll = msg.channel.toLowerCase();
                    if(coll.length == 0) return;
                    coll = emojiStrip(coll).toLowerCase();
                    coll = coll.replace("_", "");
                    coll = encodeURIComponent(coll).replace(/\W/g, '');
                    coll = filter.clean(coll);
                } catch(e) {
                    return;
                }
            }

            ListChange.delete_all(msg, coll, guid, offline, socket);
        });

        socket.on('vote', function(msg)
        {
            if(coll !== undefined) {
                try {
                    coll = msg.channel.toLowerCase();
                    if(coll.length == 0) return;
                    coll = emojiStrip(coll).toLowerCase();
                    coll = coll.replace("_", "");
                    coll = encodeURIComponent(coll).replace(/\W/g, '');
                    coll = filter.clean(coll);
                } catch(e) {
                    return;
                }
            }
            ListChange.voteUndecided(msg, coll, guid, offline, socket);
        });

        socket.on('password', function(inp)
        {
            ListSettings.password(inp, coll, guid, offline, socket);
        });

        socket.on('skip', function(list)
        {
            List.skip(list, guid, coll, offline, socket);
        });

        socket.on('conf', function(params)
        {
            ListSettings.conf_function(params, coll, guid, offline, socket);
        });

        socket.on('shuffle', function(msg)
        {
            if(coll !== undefined) {
                try {
                    coll = msg.channel.toLowerCase();
                    if(coll.length == 0) return;
                    coll = emojiStrip(coll).toLowerCase();
                    coll = coll.replace("_", "");
                    coll = encodeURIComponent(coll).replace(/\W/g, '');
                    coll = filter.clean(coll);
                } catch(e) {
                    return;
                }
            }
            ListChange.shuffle(msg, coll, guid, offline, socket);
        });

        socket.on('change_channel', function(obj)
        {
            if(coll === undefined && obj !== undefined && obj.channel !== undefined){
                try {
                    coll = obj.channel.toLowerCase();
                    if(coll.length == 0) return;
                    coll = emojiStrip(coll).toLowerCase();
                    coll = coll.replace("_", "");
                    coll = encodeURIComponent(coll).replace(/\W/g, '');
                    coll = filter.clean(coll);
                } catch(e) {
                    return;
                }
            }
            List.left_channel(coll, guid, short_id, in_list, socket, true);
            in_list = false;
        });

        socket.on('disconnect', function()
        {
            List.left_channel(coll, guid, short_id, in_list, socket, false);
        });

        socket.on('disconnected', function()
        {
            List.left_channel(coll, guid, short_id, in_list, socket, false);
        });

        socket.on("left_channel", function(msg) {
            if(msg.hasOwnProperty("channel") && msg.channel != "" && typeof(msg.channel) == "string") {
                coll = msg.channel;
                List.left_channel(coll, guid, short_id, in_list, socket, false);
            }
        })

        socket.on('reconnect_failed', function()
        {
            List.left_channel(coll, guid, short_id, in_list, socket, false);
        });

        socket.on('connect_timeout', function()
        {
            List.left_channel(coll, guid, short_id, in_list, socket, false);
        });

        socket.on('error', function()
        {
            List.left_channel(coll, guid, short_id, in_list, socket, false);
        });

        socket.on('pos', function(obj)
        {
            if(!obj.hasOwnProperty("channel") || typeof(obj.channel) != "string")
            if(coll !== undefined) {
                try {
                    coll = obj.channel.toLowerCase();
                    if(coll.length == 0) return;
                    coll = emojiStrip(coll).toLowerCase();
                    coll = coll.replace("_", "");
                    coll = encodeURIComponent(coll).replace(/\W/g, '');
                    coll = filter.clean(coll);
                } catch(e) {
                    return;
                }
            }

            if(!obj.hasOwnProperty("channel") || typeof(obj.channel) != "string") {
                var result = {
                    channel: {
                        expected: "string",
                        got: obj.hasOwnProperty("channel") ? typeof(obj.channel) : undefined
                    },
                    pass: {
                        expected: "string",
                        got: obj.hasOwnProperty("pass") ? typeof(obj.pass) : undefined
                    }
                };
                socket.emit('update_required', result);
                return;
            }

            db.collection(coll + "_settings").find(function(err, docs) {
                Functions.getSessionAdminUser(Functions.getSession(socket), coll, function(userpass, adminpass) {
                    obj.pass = userpass;
                    if(docs.length > 0 && (docs[0].userpass == undefined || docs[0].userpass == "" || (obj.hasOwnProperty('pass') && docs[0].userpass == crypto.createHash('sha256').update(Functions.decrypt_string(socketid, obj.pass)).digest("base64")))) {
                        Functions.check_inlist(coll, guid, socket, offline);
                        List.send_play(coll, socket);
                    } else {
                        socket.emit("auth_required");
                    }
                });
            });
        });

    });

    //send_ping();
}


/*
function send_ping() {
    db.collection("connected_users").update({users: {$exists: true}}, {$set: {users: []}}, {multi: true}, function(err, docs){
        db.collection("connected_users").update({"_id": "total_users"}, {$add: {total_users: 0}}, {multi: true}, function(err, docs){
            db.collection("frontpage_lists").update({viewers: {$ne: 0}}, {$set: {"viewers": 0}}, {multi: true}, function(err, docs) {
                io.emit("self_ping");
                setTimeout(send_ping, 25000);
            });
        });
    });
}*/
