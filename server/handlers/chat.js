var Functions = require(pathThumbnails + '/handlers/functions.js');
var crypto = require('crypto');
var Filter = require('bad-words');
var filter = new Filter({ placeHolder: 'x'});
/*var filter = {
clean: function(str) {
return str;
}
}*/
var db = require(pathThumbnails + '/handlers/db.js');

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
    //channel = channel.replace(/ /g,'');
    var pass = "";
    if(!query.all) {
        Functions.getSessionAdminUser(Functions.getSession(socket), channel, function(userpass) {
            if(userpass != "" || pass == undefined) {
                pass = userpass
            } else {
                pass = crypto.createHash('sha256').update(Functions.decrypt_string(pass)).digest('base64')
            }
            db.collection(channel + "_settings").find({id: "config"}, function(err, conf) {
                if(conf.length > 0) {
                    if(conf[0].userpass == "" || conf[0].userpass == pass) {
                        getAndSendLogs(channel, all, socket, pass, query);
                    }
                }
            });
        });
    } else {
        getAndSendLogs(channel, all, socket, pass, query);
    }
}

function getAndSendLogs(channel, all, socket, pass, query) {
    //channel = channel.replace(/ /g,'');
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
    if(typeof(msg) !== 'object' || !msg.hasOwnProperty('data') ||
    !msg.hasOwnProperty('channel') || typeof(msg.data) != "string" || typeof(msg.channel) != "string") {
        var result = {
            data: {
                expected: "string",
                got: msg.hasOwnProperty("data") ? typeof(msg.data) : undefined,
            },
            channel: {
                expected: "string",
                got: msg.hasOwnProperty("channel") ? typeof(msg.channel) : undefined
            },
            pass: {
                expected: "string",
                got: msg.hasOwnProperty("pass") ? typeof(msg.pass) : undefined
            }
        };
        socket.emit('update_required', result);
        return;
    }
    var coll = msg.channel.toLowerCase();//.replace(/ /g,'');
    coll = Functions.removeEmojis(coll).toLowerCase();
    //coll = filter.clean(coll);

    checkIfUserIsBanned(coll, socket, guid, function() {
        Functions.getSessionAdminUser(Functions.getSession(socket), coll, function(userpass, adminpass) {
            if(userpass != "" || msg.pass == undefined) {
                msg.pass = userpass;
            } else {
                msg.pass = crypto.createHash('sha256').update(Functions.decrypt_string(msg.pass)).digest("base64");
            }
            db.collection(coll + "_settings").find(function(err, conf){
                if(conf.length > 0 && (conf[0].hasOwnProperty("toggleChat") && !conf[0].toggleChat)) {
                    socket.emit('chat', {from: "System", msg: ": Chat for this channel has been disabled.", icon: "https://zoff.me/assets/images/favicon-32x32.png"});
                    return;
                } else if(conf.length > 0 && (conf[0].userpass == undefined || conf[0].userpass == "" || (msg.hasOwnProperty('pass') && conf[0].userpass == msg.pass))) {
                    var data = msg.data;

                    Functions.check_inlist(coll, guid, socket, offline, function() {
                        if(data == "/who") {
                            db.collection("user_names").distinct("name", {channels: coll}, function(err, docs) {
                                var userAdd = "s";
                                if(docs.length == 1) userAdd = "";
                                socket.emit('chat', {from: "System", msg: ": User" + userAdd + " in channel are: " + docs.join(", "), icon: "https://zoff.me/assets/images/favicon-32x32.png"});
                            });
                        } else if(data !== "" && data !== undefined && data !== null &&
                        data.length < 151 && data.replace(/\s/g, '').length){
                            db.collection("user_names").find({"guid": guid}, function(err, docs) {
                                if(docs.length == 1) {
                                    var splitData = data.split(" ");
                                    if((data.startsWith("/ban") && splitData.length >= 3) || (data.startsWith("/unban") && splitData.length >= 2)) {
                                        if(splitData[1].length > 0) {
                                            var passToCompare = Functions.hash_pass(adminpass);
                                            if(passToCompare == conf[0].adminpass) {
                                                db.collection("user_names").find({name: splitData[1]}, function(err, name) {
                                                    if(name.length == 1) {
                                                        if(data.startsWith("/ban") && splitData.length >= 3) {
                                                            var reason = splitData.slice(2, splitData.length).join(" ");
                                                            var connection_id = name[0].connection_id;
                                                            var yourSelf = Functions.hash_pass(socket.handshake.headers["user-agent"] + socket.handshake.address + socket.handshake.headers["accept-language"]);
                                                            if(connection_id != yourSelf) {
                                                                db.collection(coll + "_banned_chat").update({
                                                                    connection_id: connection_id
                                                                }, {
                                                                    connection_id: connection_id,
                                                                    by: docs[0].name,
                                                                    reason: reason
                                                                }, {
                                                                    upsert: true
                                                                }, function(err, results) {
                                                                    io.to(coll).emit('chat', {from: "System", msg: ": " + docs[0].name + " has banned " + splitData[1] + " for: " + reason, icon: "https://zoff.me/assets/images/favicon-32x32.png"});
                                                                    return;
                                                                });
                                                            } else {
                                                                socket.emit('chat', {from: "System", msg: ": I'm sorry but you can't ban yourself..", icon: "https://zoff.me/assets/images/favicon-32x32.png"});
                                                                return;
                                                            }
                                                        } else if(data.startsWith("/unban")) {
                                                            db.collection(coll + "_banned_chat").remove({connection_id: name[0].connection_id}, function(err, results) {
                                                                if(results.hasOwnProperty("n") && results.n == 1 && results.hasOwnProperty("deletedCount") && results.deletedCount == 1) {
                                                                    io.to(coll).emit('chat', {from: "System", msg: ": " + docs[0].name + " has unbanned " + splitData[1], icon: "https://zoff.me/assets/images/favicon-32x32.png"});
                                                                    return;
                                                                } else {
                                                                    socket.emit('chat', {from: "System", msg: ": Cannot find anyone with that username in this chat.", icon: "https://zoff.me/assets/images/favicon-32x32.png"});
                                                                    return;
                                                                }

                                                            })
                                                        } else if(data.startsWith("/ban") && splitData.length < 3) {
                                                            socket.emit('chat', {from: "System", msg: ": You are doing that command wrong. its /ban USERNAME", icon: "https://zoff.me/assets/images/favicon-32x32.png"});
                                                            return;
                                                        }
                                                    } else {
                                                        socket.emit('chat', {from: "System", msg: ": No user by that name.", icon: "https://zoff.me/assets/images/favicon-32x32.png"});
                                                        return;
                                                    }
                                                });
                                            } else {
                                                socket.emit('chat', {from: "System", msg: ": You are not logged in as an admin to the channel, don't try any funnybusiness.", icon: "https://zoff.me/assets/images/favicon-32x32.png"});
                                                return;
                                            }
                                        } else {
                                            socket.emit('chat', {from: "System", msg: ": You are doing that command wrong. its /ban USERNAME REASON or /unban USERNAME", icon: "https://zoff.me/assets/images/favicon-32x32.png"});
                                            return;
                                        }
                                    } else {
                                        db.collection("registered_users").find({"_id": docs[0].name}, function(err, n) {
                                            var icon = false;
                                            if(n.length > 0 && n[0].icon) {
                                                icon = n[0].icon;
                                            }
                                            db.collection("chat_logs").insert({ "createdAt": new Date(), all: false, channel: coll, from: docs[0].name, msg: ": " + data, icon: icon });
                                            io.to(coll).emit('chat', {from: docs[0].name, msg: ": " + data, icon: icon});
                                        });
                                    }
                                } else if(docs.length == 0){
                                    get_name(guid, {announce: false, channel: coll, message: data, all: false, socket: socket});
                                }
                            });
                        }
                    }, "place 1");
                } else {
                    socket.emit('auth_required');
                }
            });
        });
    });
}

function all_chat(msg, guid, offline, socket) {
    if(typeof(msg) !== 'object' || !msg.hasOwnProperty("channel") ||
    !msg.hasOwnProperty("data") || typeof(msg.data) != "string" ||
    typeof(msg.channel) != "string") {
        var result = {
            data: {
                expected: "string",
                got: msg.hasOwnProperty("data") ? typeof(msg.data) : undefined,
            },
            channel: {
                expected: "string",
                got: msg.hasOwnProperty("channel") ? typeof(msg.channel) : undefined
            }
        };
        socket.emit('update_required', result);
        return;
    }
    var coll = msg.channel.toLowerCase();//.replace(/ /g,'');
    var data = msg.data;
    coll = Functions.removeEmojis(coll).toLowerCase();
    //coll = filter.clean(coll);
    Functions.check_inlist(coll, guid, socket, offline, function() {
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
                    get_name(guid, {announce: false, channel: coll, message: data, all: true, socket: socket});
                }
            });
        }
    }, "place 2");
}

function checkIfChatEnabled(channel, socket, callback) {
    if(channel == "" || channel == undefined) callback();
    else {
        db.collection(channel + "_settings").find(function(err, docs){
            if(docs.length > 0 && (docs[0].hasOwnProperty("toggleChat") && !docs[0].toggleChat)) {
                socket.emit('chat', {from: "System", msg: ": Chat for this channel has been disabled.", icon: "https://zoff.me/assets/images/favicon-32x32.png"});
                callback(false);
            } else {
                callback(true);
            }
        });
    }
}

function checkIfUserIsBanned(channel, socket, guid, callback, callback_error) {
    var connection_id = Functions.hash_pass(socket.handshake.headers["user-agent"] + socket.handshake.address + socket.handshake.headers["accept-language"]);
    db.collection(channel + "_banned_chat").find({$or: [{connection_id: connection_id}, {connection_id: guid}]}, function(err, docs) {
        if(docs.length == 0) callback();
        else {
            db.collection("user_names").findAndModify({query: {guid, guid}, update: {$addToSet:{channels: channel}}}, function(e, d){
                socket.emit('chat', {from: "System", msg: ": You can't chat in this channel, you are banned. The reason is: " + docs[0].reason, icon: "https://zoff.me/assets/images/favicon-32x32.png"});
                if(typeof(callback_error) == "function") callback_error();
                else return;
            });
        }
    })
}

function namechange(data, guid, socket, tried, callback) {
    checkIfChatEnabled(data.channel, socket, function(enabled) {
        if(!enabled) {
            callback();
            return;
        }
        checkIfUserIsBanned(data.channel, socket, guid, function() {
            var pw = "";
            var new_password;
            var first = false;
            Functions.getSessionChatPass(Functions.getSession(socket), function(name, pass) {
                var fetched = false;
                if(data.hasOwnProperty("first") && data.first) {
                    pw = pass;
                    name = name;
                    data.name = name;
                    data.password = pass;
                    new_password = false;
                    if(name == "" || pass == "") {
                        if(typeof(callback) == "function") callback();
                        return;
                    }
                    fetched = true;
                    password = pw;
                } else {
                    var name = data.name;
                    if(data.hasOwnProperty("first")) {
                        first = data.first;
                    }
                    if(data.hasOwnProperty("password")) {
                        pw = data.password;
                        new_password = false;
                    } else if(data.hasOwnProperty("new_password") && data.hasOwnProperty("old_password")) {
                        pw = data.old_password;
                        new_password = Functions.decrypt_string(data.new_password);
                    }
                    password = Functions.decrypt_string(pw);
                    password = Functions.hash_pass(password);
                    doubled = true;
                }

                if(name == "") {
                    if(typeof(callback) == "function") callback();
                    return;
                }


                db.collection("registered_users").find({"_id": name.toLowerCase()}, function(err, docs) {
                    var accepted_password = false;
                    var icon = false;
                    if(docs.length == 0) {
                        if(new_password) {
                            if(typeof(callback) == "function") callback();
                            return;
                        }
                        accepted_password = true;
                        Functions.setSessionChatPass(Functions.getSession(socket), name.toLowerCase(), data.password, function() {
                            db.collection("registered_users").update({"_id": name.toLowerCase()}, {$set: {password: password}}, {upsert: true}, function() {
                            });
                        });
                    } else if(docs[0].password == password) {
                        if(docs[0].icon) {
                            icon = docs[0].icon;
                        }
                        accepted_password = true;
                        if(new_password) {
                            Functions.setSessionChatPass(Functions.getSession(socket), name.toLowerCase(), data.new_password, function() {

                                db.collection("registered_users").update({"_id": name.toLowerCase(), password: password}, {$set: {password: Functions.hash_pass(new_password)}}, function() {

                                });
                            });
                        } else {
                            Functions.setSessionChatPass(Functions.getSession(socket), name.toLowerCase(), fetched ? data.password : Functions.hash_pass(Functions.decrypt_string(data.password)), function() {
                            });
                        }
                    }
                    if(accepted_password) {

                        db.collection("user_names").find({"guid": guid}, function(err, names) {
                            if(names.length > 0 || (docs.length != 0 && docs[0].password == password)) {
                                var no_name = false;
                                if(names.length == 0) no_name = true;
                                if(!no_name) {
                                    var old_name = names[0].name;
                                    db.collection("user_names").update({"_id": "all_names"}, {$pull: {names: old_name}}, function() {});
                                }
                                var connection_id = Functions.hash_pass(socket.handshake.headers["user-agent"] + socket.handshake.address + socket.handshake.headers["accept-language"]);
                                var updateElement = {$set: {name: name, icon: icon, connection_id: connection_id}};
                                if(data.hasOwnProperty("channel") && data.channel != "") {
                                    updateElement["$addToSet"] = {channels: data.channel};
                                }
                                db.collection("user_names").update({"guid": guid}, updateElement, {upsert: true}, function(err, docs) {
                                    db.collection("user_names").update({"_id": "all_names"}, {$addToSet: {names: name}}, function(err, docs) {
                                        //socket.emit('name', {type: "name", accepted: true});
                                        if(old_name != name && !first && !no_name) {
                                            if(data.hasOwnProperty("channel") && typeof(data.channel) == "string") {
                                                io.to(data.channel).emit('chat', {from: old_name, msg: " changed name to " + name});
                                                io.sockets.emit('chat.all', {from: old_name , msg: " changed name to " + name, channel: data.channel});
                                            }
                                        }
                                        if(callback != undefined && typeof(callback) == "function") callback();
                                    });
                                });
                            } else {
                                if(tried < 3 || tried == undefined) {
                                    if(tried == undefined) {
                                        tried = 1;
                                    }
                                    namechange(data, guid, socket, tried + 1);
                                }
                            }
                        });
                    } else {
                        Functions.removeSessionChatPass(Functions.getSession(socket), function() {
                            socket.emit('name', {type: "name", accepted: false});
                        });
                    }
                });
            });
        }, callback);
    });
}

function removename(guid, coll, socket) {
    //coll = coll.replace(/ /g,'');
    checkIfChatEnabled(coll, socket, function(enabled) {
        if(enabled) return;
        db.collection("user_names").find({"guid": guid}, function(err, docs) {
            if(docs.length == 1) {
                var old_name = docs[0].name;
                Functions.removeSessionChatPass(Functions.getSession(socket), function() {
                    db.collection("user_names").update({"_id": "all_names"}, {$pull: {names: old_name}}, function(err, updated) {
                        db.collection("user_names").remove({"guid": guid}, function(err, removed) {
                            get_name(guid, {announce: true, old_name: old_name, channel: coll, socket: socket});
                        });
                    });
                });
            }
        });
    });
}

function generate_name(guid, announce_payload, second, round, channel) {
    if(round == undefined) round = 0;
    var tmp_name = Functions.rndName(second ? second : guid, Math.floor(8 + round));
    db.collection("registered_users").find({"_id": tmp_name}, function(err, docs) {
        if(docs.length == 0) {
            db.collection("user_names").update({"_id": "all_names"}, {$addToSet: {names: tmp_name}}, {upsert: true}, function(err, updated) {
                if(updated.nModified == 1 || (updated.hasOwnProperty("upserted") && updated.hasOwnProperty("n") && updated.n == 1)) {
                    var connection_id = Functions.hash_pass(announce_payload.socket.handshake.headers["user-agent"] + announce_payload.socket.handshake.address + announce_payload.socket.handshake.headers["accept-language"]);
                    var updateElement = {$set: {name: tmp_name, icon: false, connection_id: connection_id}};
                    if(channel != undefined && channel != "") {
                        updateElement["$addToSet"] = {channels: channel};
                    }
                    if(announce_payload.hasOwnProperty("channel") && announce_payload.channel != "") {
                        updateElement["$addToSet"] = {channels: announce_payload.channel};
                    }
                    db.collection("user_names").update({"guid": guid}, updateElement, {upsert: true}, function(err, update){
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
                    generate_name(guid, announce_payload, tmp_name, round + 0.25, channel);
                }
            })
        } else {
            generate_name(guid, announce_payload, tmp_name, round + 0.25, channel);
        }
    })
}

function get_name(guid, announce_payload, first) {
    if(!announce_payload.announce && announce_payload.hasOwnProperty("socket")) {
        Functions.getSessionChatPass(Functions.getSession(announce_payload.socket), function(name, pass) {
            if(name == "" || pass == "") {
                get_name_generate(guid, announce_payload, first, announce_payload.channel);
                return;
            }
            db.collection("registered_users").find({"_id": name.toLowerCase()}, function(err, docs) {
                if(docs[0].password == Functions.hash_pass(Functions.decrypt_string(pass))) {
                    var icon = false;
                    if(docs[0].icon) {
                        icon = docs[0].icon;
                    }
                    Functions.setSessionChatPass(Functions.getSession(announce_payload.socket), name.toLowerCase(), pass, function() {
                    });
                    var connection_id = Functions.hash_pass(announce_payload.socket.handshake.headers["user-agent"] + announce_payload.socket.handshake.address + announce_payload.socket.handshake.headers["accept-language"]);
                    var updateElement = {$set: {name: name, icon: icon, connection_id: connection_id}};
                    if(announce_payload.hasOwnProperty("channel") && announce_payload.channel != "") updateElement["$addToSet"] = {channel: announce_payload.channel};
                    db.collection("user_names").update({"guid": guid}, updateElement, {upsert: true}, function(err, docs) {
                        db.collection("user_names").update({"_id": "all_names"}, {$addToSet: {names: name}}, function(err, docs) {
                            name = name;
                        });
                    });
                }
            });
        });
    } else {
        get_name_generate(guid, announce_payload, first, announce_payload.channel);
    }
}

function get_name_generate(guid, announce_payload, first, channel) {
    db.collection("user_names").find({"guid": guid}, function(err, docs) {
        if(docs.length == 0) {
            generate_name(guid, announce_payload, undefined);
        } else {
            name = docs[0].name;
        }
    });
}

module.exports.get_history = get_history;
module.exports.chat = chat;
module.exports.all_chat = all_chat;
module.exports.namechange = namechange;
module.exports.removename = removename;
module.exports.generate_name = generate_name;
module.exports.get_name = get_name;
