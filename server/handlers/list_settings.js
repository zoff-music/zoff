var Functions = require(pathThumbnails + '/handlers/functions.js');
var crypto = require('crypto');
var Filter = require('bad-words');
//var filter = new Filter({ placeHolder: 'x'});
var filter = {
    clean: function(str) {
        return str;
    }
}
var db = require(pathThumbnails + '/handlers/db.js');

function password(inp, coll, guid, offline, socket) {
    var sessionId = Functions.getSession(socket);
    if(sessionId == "") sessionId = "empty";
    if(inp !== undefined && inp !== null && inp !== "")
    {
        if(!inp.hasOwnProperty("password") || !inp.hasOwnProperty("channel") ||
         typeof(inp.password) != "string" || typeof(inp.channel) != "string") {
             var result = {
                 channel: {
                     expected: "string",
                     got: inp.hasOwnProperty("channel") ? typeof(iinp.channel) : undefined,
                 },
                 password: {
                     expected: "password",
                     got: inp.hasOwnProperty("password") ? typeof(inp.password) : undefined,
                 },
             };
             socket.emit('update_required', result);
            return;
        }
        pw = inp.password;
        try {
            coll = inp.channel;
            if(coll.length == 0) return;
            coll = Functions.removeEmojis(coll).toLowerCase();
            //coll = coll.replace(/_/g, "");

            coll = filter.clean(coll);
        } catch(e) {
            return;
        }
        //coll = coll.replace(/ /g,'');
        uncrypted = pw;
        pw = Functions.hash_pass(Functions.decrypt_string(pw), true);
        Functions.check_inlist(coll, guid, socket, offline);
        Functions.getSessionAdminUser(sessionId, coll, function(userpass, adminpass) {

            db.collection(coll + "_settings").find(function(err, docs){
                if(docs !== null && docs.length !== 0)
                {
                    if(docs[0].adminpass === "" || docs[0].adminpass == Functions.hash_pass(pw))
                    {
                        Functions.setSessionAdminPass(sessionId, inp.password, coll, function() {
                            db.collection(coll + "_settings").update({ id: "config" }, {$set:{adminpass:Functions.hash_pass(pw)}}, function(err, docs){
                                if(adminpass != pw && adminpass != "") {
                                    socket.emit("toast", "changedpass");
                                } else {
                                    socket.emit("toast", "correctpass");
                                }
                                socket.emit("pw", true);
                            });
                        });
                    } else if(docs[0].adminpass === "" || docs[0].adminpass == Functions.hash_pass(Functions.hash_pass(Functions.decrypt_string(adminpass), true))) {
                        Functions.setSessionAdminPass(sessionId, inp.password, coll, function() {
                            db.collection(coll + "_settings").update({ id: "config" }, {$set:{adminpass:Functions.hash_pass(pw)}}, function(err, docs){
                                if(adminpass != pw) {
                                    socket.emit("toast", "changedpass");
                                }
                                socket.emit("pw", true);
                            });
                        });
                    } else {
                        Functions.setSessionAdminPass(Functions.getSession(socket), "", coll, function() {
                            socket.emit("toast", "wrongpass");
                            socket.emit("pw", false);
                        });
                    }
                }
            });
        });
    } else {
        var result = {
            inp: {
                expected: "string",
                got: typeof(inpt)
            },
        };
        socket.emit('update_required', result);
    }
}

function conf_function(params, coll, guid, offline, socket) {
    if(params !== undefined && params !== null && params !== "")
    {
        if(coll !== undefined) {
            try {
                coll = params.channel;//.replace(/ /g,'');
                if(coll.length == 0) return;
                coll = Functions.removeEmojis(coll).toLowerCase();
                //coll = coll.replace(/_/g, "");

                coll = filter.clean(coll);
            } catch(e) {
                return;
            }
        }

        if(coll == "" || coll == undefined || coll == null) {
            socket.emit("update_required");
            return;
        }

        Functions.check_inlist(coll, guid, socket, offline);

        Functions.getSessionAdminUser(Functions.getSession(socket), coll, function(userpass, adminpass, gotten) {
            if(gotten) {
                params.adminpass = adminpass;
                if(!params.userpass_changed) params.userpass = userpass;

            }
            if(!params.hasOwnProperty('voting') || !params.hasOwnProperty('addsongs') ||
                !params.hasOwnProperty('longsongs') || !params.hasOwnProperty('frontpage') ||
                !params.hasOwnProperty('allvideos') || !params.hasOwnProperty('removeplay') ||
                !params.hasOwnProperty('adminpass') || !params.hasOwnProperty('skipping') ||
                !params.hasOwnProperty('shuffling') || !params.hasOwnProperty('channel') ||
                typeof(params.userpass) != "string" || typeof(params.adminpass) != "string" ||
                typeof(params.voting) != "boolean" || typeof(params.addsongs) != "boolean" ||
                typeof(params.longsongs) != "boolean" || typeof(params.frontpage) != "boolean" ||
                typeof(params.allvideos) != "boolean" || typeof(params.removeplay) != "boolean" ||
                typeof(params.skipping) != "boolean" || typeof(params.shuffling) != "boolean" ||
                typeof(params.userpass_changed) != "boolean") {
                    var result = {
                        adminpass: {
                            expected: "string",
                            got: params.hasOwnProperty("adminpass") ? typeof(params.adminpass) : undefined,
                        },
                        userpass: {
                            expected: "string",
                            got: params.hasOwnProperty("userpass") ? typeof(params.userpass) : undefined,
                        },
                        vote: {
                            expected: "boolean",
                            got: params.hasOwnProperty("vote") ? typeof(params.vote) : undefined,
                        },
                        addsongs: {
                            expected: "boolean",
                            got: params.hasOwnProperty("addsongs") ? typeof(params.addsongs) : undefined,
                        },
                        longsongs: {
                            expected: "boolean",
                            got: params.hasOwnProperty("longsongs") ? typeof(params.longsongs) : undefined,
                        },
                        frontpage: {
                            expected: "boolean",
                            got: params.hasOwnProperty("frontpage") ? typeof(params.frontpage) : undefined,
                        },
                        skipping: {
                            expected: "boolean",
                            got: params.hasOwnProperty("skipping") ? typeof(params.skipping) : undefined,
                        },
                        shuffling: {
                            expected: "boolean",
                            got: params.hasOwnProperty("shuffling") ? typeof(params.shuffling) : undefined,
                        },
                        userpass_changed: {
                            expected: "boolean",
                            got: params.hasOwnProperty("userpass_changed") ? typeof(params.userpass_changed) : undefined,
                        }
                    };
                    socket.emit("update_required", result);
                    return;
                }
            var voting = params.voting;
            var addsongs = params.addsongs;
            var longsongs = params.longsongs;
            var frontpage = params.frontpage;
            var allvideos = params.allvideos;
            var removeplay = params.removeplay;
            var adminpass = params.adminpass;
            var skipping = params.skipping;
            var shuffling = params.shuffling;
            var userpass = Functions.decrypt_string(params.userpass);


            if((!params.userpass_changed && frontpage) || (params.userpass_changed && userpass == "")) {
                userpass = "";
            } else if(params.userpass_changed && userpass != "") {
                frontpage = false;
            }
            var description = "";
            var hash;
            if(params.description) description = params.description;
            if(adminpass !== "") {
                hash = Functions.hash_pass(Functions.hash_pass(Functions.decrypt_string(adminpass), true));
            } else {
                hash = adminpass;
            }
            if(userpass != "") {
                userpass = crypto.createHash('sha256').update(userpass).digest("base64");
            }
            db.collection(coll + "_settings").find({id: "config"}, function(err, docs){
                if(docs !== null && docs.length !== 0 && (docs[0].adminpass === "" || docs[0].adminpass == hash)) {
                    var obj = {
                        addsongs:addsongs,
                        allvideos:allvideos,
                        frontpage:frontpage,
                        skip:skipping,
                        vote:voting,
                        removeplay:removeplay,
                        shuffle:shuffling,
                        longsongs:longsongs,
                        adminpass:hash,
                        desc: description,
                    };
                    if(params.userpass_changed) {
                        obj["userpass"] = userpass;
                    } else if (frontpage) {
                        obj["userpass"] = "";
                    }
                    db.collection(coll + "_settings").update({ id: "config" }, {
                        $set:obj
                    }, function(err, docs){
                        Functions.setSessionUserPass(Functions.getSession(socket), params.userpass, coll, function() {
                            db.collection(coll + "_settings").find(function(err, docs){
                                if(docs[0].adminpass !== "") docs[0].adminpass = true;
                                if(docs[0].hasOwnProperty("userpass") && docs[0].userpass != "") docs[0].userpass = true;
                                else docs[0].userpass = false;
                                io.to(coll).emit("conf", docs);
                                socket.emit("toast", "savedsettings");

                                db.collection("frontpage_lists").update({_id: coll}, {$set:{
                                    frontpage:frontpage, accessed: Functions.get_time()}
                                },
                                {upsert:true}, function(err, docs){});
                            });
                        });
                    });
                } else {
                    socket.emit("toast", "wrongpass");
                }
            });
        });
    } else {
        var result = {
            params: {
                expected: "object",
                got: typeof(params),
            }
        }
        socket.emit('update_required', result);
    }

}

module.exports.password = password;
module.exports.conf_function = conf_function;
