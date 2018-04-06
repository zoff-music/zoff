var path = require('path');
try {
    var mongo_config = require(path.join(path.join(__dirname, '../config/'), 'mongo_config.js'));
} catch(e) {
    console.log("Error - missing file");
    console.log("Seems you forgot to create the file mongo_config.js in /server/config/. Have a look at mongo_config.example.js.");
    process.exit();
}
var mongojs = require('mongojs');
var connected_db = mongojs('mongodb://' + mongo_config.host + '/user_credentials');

function remove_unique_id(short_id) {
    db.collection("unique_ids").update({"_id": "unique_ids"}, {$pull: {unique_ids: short_id}}, function(err, docs) {});
}

function remove_name_from_db(guid, name) {
    db.collection("user_names").update({"_id": "all_names"}, {$pull: {names: name}}, function(err, updated) {
        db.collection("user_names").remove({"guid": guid}, function(err, removed) {	});
    });
}

function getSession(socket) {
    try {
        /*var cookieParser = require("cookie-parser");
        var cookie = require("cookie");
        var parsedCookies = cookie.parse(socket.handshake.headers.cookie);
        return parsedCookies["_uI"];*/
        return socket.cookie_id;
    } catch(e) {
        return "empty";
    }
}

function remove_from_array(array, element){
    if(Functions.contains(array, element)){
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

function check_inlist(coll, guid, socket, offline)
{
    if(coll == undefined) return;
    coll = coll.replace(/ /g,'');
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
                        db.collection("user_names").find({"guid": guid}, function(err, docs) {
                            if(docs.length == 1) {
                                socket.broadcast.to(coll).emit('chat', {from: docs[0].name, msg: " joined"});
                            }
                        });
                        db.collection("connected_users").update({"_id": "total_users"}, {$addToSet: {total_users: guid + coll}}, function(err, docs){});
                    });
                });
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
    }
}

function rndName(seed, len) {
    var vowels = ['a', 'e', 'i', 'o', 'u'];
    consts =  ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w', 'x', 'y'];
    len = Math.floor(len);
    word = '';
    is_vowel = false;
    var arr;
    for (var i = 0; i < len; i++) {
        if (is_vowel) arr = vowels;
        else arr = consts;
        is_vowel = !is_vowel;
        word += arr[(seed[i%seed.length].charCodeAt()+i) % (arr.length-1)];
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
    if(hex) return crypto.createHash('sha256').update(adminpass).digest('hex');
    return crypto.createHash('sha256').update(adminpass).digest('base64');
}

function setSessionAdminPass(id, adminpass, list, callback) {
    try {
        if(id == "empty" || id == undefined) {
            callback();
            return;
        }

        connected_db.collection(id).update({_id: list}, {$set: {adminpass: adminpass}}, {upsert: true}, function(e, d){
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

function setSessionUserPass(id, userpass, list, callback) {
    try {
        if(id == "empty" || id == undefined) {
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
                if(d[0].userpass != undefined) userpass = d[0].userpass;
                if(d[0].adminpass != undefined) adminpass = d[0].adminpass;
            }
            callback(userpass, adminpass, true);
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
    connected_db.collection(id).remove({_id: channel}, function() {
        callback();
        return;
    });
}

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
