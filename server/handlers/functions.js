var path = require('path');
try {
    var mongo_config = require(path.join(path.join(__dirname, '../config/'), 'mongo_config.js'));
} catch(e) {
    console.log("Error - missing file");
    console.log("Seems you forgot to create the file mongo_config.js in /server/config/. Have a look at mongo_config.example.js.");
    process.exit(1);
}
var mongojs = require('mongojs');
var connected_db = mongojs('mongodb://' + mongo_config.host + '/user_credentials');
var crypto = require('crypto');
var db = require(pathThumbnails + '/handlers/db.js');
var uniqid = require('uniqid');
var Filter = require('bad-words');
var filter = new Filter({ placeHolder: 'x'});

var Chat = require(pathThumbnails + '/handlers/chat.js');

function encodeChannelName(str) {
    var _fn = encodeURIComponent;
    str = filter.clean(str);
    var toReturn = _fn(str);
    toReturn = toReturn.replace(/_/g, "%5F");
    toReturn = toReturn.replace(/'/g, "%27");
    toReturn = toReturn.replace(/%26amp%3B/g, "%26").replace(/%26amp%3b/g, "%26");
    toReturn = toReturn.toLowerCase();
    return toReturn;
}

function decodeChannelName(str) {
    var _fn = decodeURIComponent;
    str = str.toUpperCase();
    var toReturn = _fn(str.replace(/%5F/g, "_").replace(/%27/g, "'"));
    toReturn = filter.clean(toReturn);
    return toReturn.toLowerCase();
}

function remove_unique_id(short_id) {
    db.collection("unique_ids").update({"_id": "unique_ids"}, {$pull: {unique_ids: short_id}}, function(err, docs) {});
}

function remove_name_from_db(guid, channel) {
    // Use temporary, with caution. Can bottleneck in large quantity of users.
    //
    // Find a way of indexing users in lists in a clever way, to avoid the search here
    db.collection("connected_users").find({"_id": "total_users"}, function(err, all_users) {
        var hasOne = all_users[0].total_users.some(function(v){ return v.indexOf(guid)>=0 });
        if(!hasOne) {
            db.collection("user_names").find({"guid": guid}, function(err, user){
                if(user.length == 1){
                    db.collection("user_names").update({"_id": "all_names"}, {$pull: {names: user[0].name}}, function(err, updated) {
                        db.collection("user_names").remove({"guid": guid}, function(err, removed) {	});
                    });
                }
            });
        } else {
            if(channel == undefined || channel == "") return;
            db.collection("user_names").update({"guid": guid}, {$pull: {channels: channel}}, function(err, docs) {
                //console.log("Pulled user from current channel");
            });
        }
    });
}

function isUrl(str) {
    var pattern = new RegExp("\\b(((ht|f)tp(s?)\\:\\/\\/|~\\/|\\/)|www.)" +
    "(\\w+:\\w+@)?(([-\\w]+\\.)+(com|org|net|gov" +
    "|mil|biz|info|mobi|name|aero|jobs|museum" +
    "|travel|[a-z]{2}))(:[\\d]{1,5})?" +
    "(((\\/([-\\w~!$+|.,=]|%[a-f\\d]{2})+)+|\\/)+|\\?|#)?" +
    "((\\?([-\\w~!$+|.,*:]|%[a-f\\d{2}])+=?" +
    "([-\\w~!$+|.,*:=]|%[a-f\\d]{2})*)" +
    "(&(?:[-\\w~!$+|.,*:]|%[a-f\\d{2}])+=?" +
    "([-\\w~!$+|.,*:=]|%[a-f\\d]{2})*)*)*" +
    "(#([-\\w~!$+|.,*:=]|%[a-f\\d]{2})*)?\\b");
    if(!pattern.test(str)) {
        return false;
    } else {
        return true;
    }
}

function getSession(socket) {
    try {
        /*var cookieParser = require("cookie-parser");
        var cookie = require("cookie");
        var parsedCookies = cookie.parse(socket.handshake.headers.cookie);
        return parsedCookies["_uI"];*/
        if(socket.cookie_id == undefined) throw "Undefined error";
        return socket.cookie_id;
    } catch(e) {
        // Returning "sessiong"-based on place of connection
        return hash_pass(socket.handshake.headers["user-agent"] + socket.handshake.address + socket.handshake.headers["accept-language"]);
        //return "empty";
    }
}

function remove_from_array(array, element){
    if(contains(array, element)){
        var index = array.indexOf(element);
        if(index != -1)
        array.splice(index, 1);
    }
}

function generate_channel_name(res) {
    var trying_id = uniqid.time().toLowerCase();
    db.collection("frontpage_lists").find({frontpage: {$exists: true }, "_id": trying_id }, {"_id": 1}, function(err, docs){
        if(docs.length == 0) {
            res.send(trying_id);
            return;
        }
        generate_channel_name(res);
    });
}

function get_short_id(socket) {
    var new_short_id = uniqid.time().toLowerCase();

    socket.join(new_short_id);
    socket.emit("id", new_short_id);
}

function check_inlist(coll, guid, socket, offline, callback, double_check)
{
    if(coll == undefined) {
        if(typeof(callback) == "function") callback();
        return;
    }
    //coll = coll.replace(/ /g,'');
    if(!offline && coll != undefined){
        db.collection("connected_users").update({"_id": coll}, {$addToSet:{users: guid}}, {upsert: true}, function(err, updated) {
            if(updated.nModified > 0 || updated.upserted != undefined) {
                db.collection("connected_users").find({"_id": coll}, function(err, new_doc) {
                    db.collection("frontpage_lists").update({"_id": coll}, {$set: {"viewers": new_doc[0].users.length}}, function(){
                        if(new_doc[0].users == undefined || new_doc[0].users.length == undefined) {
                            io.to(coll).emit("viewers", 1);
                        } else {
                            io.to(coll).emit("viewers", new_doc[0].users.length);
                        }
                        Chat.namechange({initial: true, first:true, channel: coll}, guid, socket, false, function(enabled) {
                            db.collection("user_names").find({"guid": guid}, function(err, docs) {
                                if(docs.length == 1) {
                                    var icon = "";
                                    if(docs[0].icon != undefined) icon = docs[0].icon;
                                    db.collection("user_names").update({"guid": guid}, {$addToSet:{channels: coll}}, function(err, doc){});
                                    if(enabled) {
                                        socket.broadcast.to(coll).emit('chat', {from: docs[0].name, icon: icon, msg: " joined"});
                                    }
                                } else if(docs.length == 0) {
                                    //console.log("User doesn't have a name for some reason.");
                                    //console.log("guid", guid);
                                    //console.log("channel", coll);
                                    //console.log("Trying to get a chat-name");
                                    Chat.get_name(guid, {announce: false, socket: socket, channel: coll});
                                }
                            });
                            db.collection("connected_users").update({"_id": "total_users"}, {$addToSet: {total_users: guid + coll}}, function(err, docs){
                                if(callback != undefined && typeof(callback) == "function") callback();
                            });
                        });
                    });
                });
            } else {
                db.collection("connected_users").find({"_id": coll}, function(err, new_doc) {
                    io.to(coll).emit("viewers", new_doc[0].users.length);
                });
                if(callback != undefined && typeof(callback) == "function") callback();
            }
        });

    } else {
        if(offline) {
            db.collection("connected_users").update({"_id": "offline_users"}, {$addToSet: {users: guid}}, function(err, docs){});
        } else {
            db.collection("connected_users").update({"_id": coll}, {$addToSet: {users: guid}}, function(err, docs){});
        }
        //
        if(coll != undefined && coll != "") {
            db.collection("connected_users").update({"_id": "total_users"}, {$addToSet: {total_users: guid + coll}}, function(err, docs) {});
        }
        if(callback != undefined && typeof(callback) == "function") callback();
    }
}

function rndName(seed, len) {
    var vowels = ['a', 'e', 'i', 'o', 'u'];
    consts =  ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w', 'x', 'y'];
    len = Math.floor(len);
    word = '';
    is_vowel = false;
    var arr;
    try {
        for (var i = 0; i < len; i++) {
            if (is_vowel) arr = vowels;
            else arr = consts;
            is_vowel = !is_vowel;
            word += arr[(seed[i%seed.length].charCodeAt()+i) % (arr.length-1)];
        }
    } catch(e) {
        return rndName(uniqid.time().toLowerCase(), len);
    }
    return word;
}

function removeEmojis (string) {
    //https://stackoverflow.com/a/41164278/4266467
    var regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
    return string.replace(regex, '');
}

function decrypt_string(pw){
    try {
        return Buffer.from(pw, 'base64').toString('ascii')
    } catch(e) {
        return "";
    }
}

function get_time()
{
    var d = new Date();
    var time = Math.floor(d.getTime() / 1000);
    return time;
}

function contains(a, obj) {
    try{
        var i = a.length;
        while (i--) {
            if (a[i] === obj) {
                return true;
            }
        }
        return false;
    }catch(e){
        return false;
    }
}

function hash_pass(adminpass, hex) {
    if(adminpass == undefined || adminpass == "") return "";
    if(hex) return crypto.createHash('sha256').update(adminpass).digest('hex');
    return crypto.createHash('sha256').update(adminpass).digest('base64');
}

function setSessionAdminPass(id, adminpass, list, callback) {
    try {
        if(id == "empty" || id == undefined) {
            callback();
            return;
        }

        connected_db.collection(id).update({_id: list}, {$set: {adminpass: hash_pass(decrypt_string(adminpass), true)}}, {upsert: true}, function(e, d){
            callback();
            return;
        });
    } catch(e) {

    }
}

function setSessionChatPass(id, name, pass, callback) {
    try {
        if(id == "empty" || id == undefined) {
            callback();
            return;
        }
        connected_db.collection(id).update({_id: "_chat_"}, {$set: {password: pass, name: name}}, {upsert: true}, function(e) {
            callback();
            return;
        })
    } catch(e) {
        callback();
        return;
    }
}

function getSessionChatPass(id, callback) {
    try {
        if(id == "empty" || id == undefined) {
            callback("", "", false);
            return;
        }

        connected_db.collection(id).find({_id: "_chat_"}, function(e, d) {
            if(d.length > 0) {
                var name = "";
                var pass = "";
                if(d[0].name != undefined) name = d[0].name;
                if(d[0].password != undefined) pass = d[0].password;
                callback(name, pass);
                return;
            } else {
                callback("", "", false);
                return;
            }
        })
    } catch(e) {
        callback();
        return;
    }
}


function setChromecastHost(id, other_id, list, callback) {
    try {
        if(id == "empty" || id == undefined || other_id == "empty" || other_id == undefined) {
            callback();
            return;
        }
        connected_db.collection(id).update({_id: list}, {"chromecast": true, id: other_id}, {upsert: true}, function(e, docs) {
            callback(true);
            return;
        });
    } catch(e) {
        callback(false);
    }
}

function setSessionUserPass(id, userpass, list, callback) {
    try {
        if(id == "empty" || id == undefined || userpass == undefined) {
            callback();
            return;
        }

        connected_db.collection(id).update({_id: list}, {$set: {userpass: userpass}}, {upsert: true}, function(e, d){
            callback();
            return;
        });
    } catch(e) {
        callback();
    }
}

function getSessionAdminUser(id, list, callback) {
    try {
        if(id == "empty" || id == undefined) {
            callback("", "", false);
            return;
        }
        connected_db.collection(id).find({_id: list}, function(e, d) {
            var userpass = "";
            var adminpass = "";
            if(d.length > 0) {
                if(d[0].hasOwnProperty("chromecast") && d[0].chromecast) {
                    getSessionAdminUser(d[0].id, list, callback);
                } else {
                    if(d[0].userpass != undefined) userpass = d[0].userpass;
                    if(d[0].adminpass != undefined) adminpass = d[0].adminpass;
                    callback(userpass, adminpass, true);
                }
            } else {
                callback(userpass, adminpass, true);
            }
        })
    } catch(e) {
        callback("", "", false);
    }
}

function removeSessionChatPass(id, callback) {
    if(id == "empty" || id == undefined) {
        callback();
        return;
    }
    connected_db.collection(id).remove({_id: "_chat_"}, function() {
        callback();
        return;
    });
}


function removeSessionAdminPass(id, channel, callback) {
    if(id == "empty" || id == undefined) {
        callback();
        return;
    }
    connected_db.collection(id).update({_id: channel}, {$set: {"adminpass": ""}}, function() {
        callback();
        return;
    });
}

function remove_from_chat_channel(coll, guid) {
    db.collection("user_names").update({"guid": guid}, {$pull: {channels: coll}}, function(err, docs) {
    });
}

function left_channel(coll, guid, short_id, in_list, socket, change, caller) {
    if(!coll) {
        if(!change) {
            remove_name_from_db(guid, coll);
        } else {
            remove_from_chat_channel(coll, guid);
        }
        return;
    }
    //coll = coll.replace(/ /g,'');
    db.collection("connected_users").update({"_id": coll}, {$pull: {users: guid}}, function(err, updated) {
        if(updated.nModified > 0) {
            db.collection("connected_users").update({"_id": "total_users"}, {$pull: {total_users: guid + coll}}, function(err, updated){});
            db.collection("connected_users").find({"_id": coll}, function(err, new_doc){
                db.collection("frontpage_lists").update({"_id": coll, viewers: {$gt: 0}}, {$inc: {viewers: -1}}, function(err, doc) {
                    db.collection("user_names").find({"guid": guid}, function(err, docs) {
                        if(docs.length == 1) {
                            var icon = "";
                            if(docs[0].icon != undefined) icon = docs[0].icon;
                            io.to(coll).emit('chat', {from: docs[0].name, icon: icon, msg: " left"});
                        }
                    });
                    io.to(coll).emit("viewers", new_doc[0].users.length);
                    socket.leave(coll);
                    if(!change) {
                        remove_name_from_db(guid, coll);
                    } else {
                        remove_from_chat_channel(coll, guid);
                    }
                });
            });

        } else {
            db.collection("connected_users").update({"_id": "offline_users"}, {$pull: {users: guid}}, function(err, updated){
                //if(updated.nModified > 0) {
                    db.collection("connected_users").update({"_id": "total_users"}, {$pull: {total_users: guid + coll}}, function(err, updated){});
                    if(!change) {
                        remove_name_from_db(guid, coll);
                    } else {
                        remove_from_chat_channel(coll, guid);
                    }
                //}
            });

        }
    });
    remove_unique_id(short_id);
}


function checkTimeout(type, timeout, channel, guid, conf_pass, this_pass, socket, callback, error_message, error_callback){
    if(conf_pass != "" && conf_pass == this_pass) {
        callback();
        return;
    }
    db.collection("timeout_api").find({
        type: type,
        guid: guid,
    }, function(err, docs) {
        if(docs.length > 0) {
            var date = new Date(docs[0].createdAt);
            date.setSeconds(date.getSeconds() + timeout);
            var now = new Date();

            var retry_in = (date.getTime() - now.getTime()) / 1000;
            if(retry_in > 0) {
                if(typeof(error_callback) == "function") {
                    error_callback();
                } else if(error_message) {
                    var sOrNot = Math.ceil(retry_in) > 1 || Math.ceil(retry_in) == 0 ? "s" : "";
                    socket.emit("toast", error_message + Math.ceil(retry_in) + " second" + sOrNot + ".");
                } else {
                    socket.emit("toast", "wait_longer");
                }
                return;
            }
        }
        var now_date = new Date();
        db.collection("timeout_api").update({type: type, guid: guid}, {
            $set: {
                "createdAt": now_date,
                type: type,
                guid: guid,
            },
        }, {upsert: true}, function(err, docs) {
            callback();
            return;
        });
    });
}

module.exports.checkTimeout = checkTimeout;
module.exports.left_channel = left_channel;
module.exports.setChromecastHost = setChromecastHost;
module.exports.decodeChannelName = decodeChannelName;
module.exports.encodeChannelName = encodeChannelName;
module.exports.isUrl = isUrl;
module.exports.removeEmojis = removeEmojis;
module.exports.getSessionChatPass = getSessionChatPass;
module.exports.setSessionChatPass = setSessionChatPass;
module.exports.removeSessionAdminPass = removeSessionAdminPass;
module.exports.removeSessionChatPass = removeSessionChatPass;
module.exports.setSessionAdminPass = setSessionAdminPass;
module.exports.setSessionUserPass = setSessionUserPass;
module.exports.getSessionAdminUser = getSessionAdminUser;
module.exports.getSession = getSession;
module.exports.generate_channel_name = generate_channel_name;
module.exports.remove_unique_id = remove_unique_id;
module.exports.remove_name_from_db = remove_name_from_db;
module.exports.remove_from_array = remove_from_array;
module.exports.get_short_id = get_short_id;
module.exports.check_inlist = check_inlist;
module.exports.rndName = rndName;
module.exports.decrypt_string = decrypt_string;
module.exports.get_time = get_time;
module.exports.contains = contains;
module.exports.hash_pass = hash_pass;
