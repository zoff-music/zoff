var ColorThief = require('color-thief-jimp');
var Jimp = require('jimp');
var Functions = require(pathThumbnails + '/handlers/functions.js');
var Frontpage = require(pathThumbnails + '/handlers/frontpage.js');
var crypto = require('crypto');
var Filter = require('bad-words');
//var filter = new Filter({ placeHolder: 'x'});
var filter = {
    clean: function(str) {
        return str;
    }
}
var request = require('request');
var db = require(pathThumbnails + '/handlers/db.js');

function now_playing(list, fn, socket) {
    if(typeof(list) !== 'string' || typeof(fn) !== 'function') {
        socket.emit('update_required');
        return;
    }
    db.collection(list).find({now_playing:true}, function(err, docs){
        if(docs.length === 0){
            fn("No song currently playing");
            return;
        }
        var title = docs[0].title;
        if(title === undefined) fn("No song currently playing");
        else fn(title);
    });
}

function list(msg, guid, coll, offline, socket) {
    var socketid = socket.zoff_id;

    if(typeof(msg) === 'object' && msg !== undefined && msg !== null)
    {
        Functions.getSessionAdminUser(Functions.getSession(socket), coll, function(userpass, adminpass, gotten) {
            if(gotten && userpass != "" && !msg.hasOwnProperty("pass")) {
                msg.pass = userpass;
            }
            if(!msg.hasOwnProperty('version') || !msg.hasOwnProperty("channel") ||
             msg.version != VERSION || msg.version == undefined ||
            typeof(msg.channel) != "string") {
                var result = {
                    channel: {
                        expected: "string",
                        got: msg.hasOwnProperty("channel") ? typeof(msg.channel) : undefined,
                    },
                    version: {
                        expected: VERSION,
                        got: msg.version,
                    },
                    pass: {
                        expected: "string",
                        got: msg.hasOwnProperty("pass") ? typeof(msg.pass) : undefined,
                    },
                };
                socket.emit('update_required', result);
                return;
            }
            coll = msg.channel.toLowerCase(); //.replace(/ /g,'');
            coll = Functions.removeEmojis(coll).toLowerCase();
            coll = filter.clean(coll);
            var pass = crypto.createHash('sha256').update(Functions.decrypt_string(msg.pass)).digest("base64");
            db.collection('frontpage_lists').find({"_id": coll}, function(err, frontpage_lists){
                if(frontpage_lists.length == 1) {
                    db.collection(coll + "_settings").find(function(err, docs) {
                        if(docs.length == 0 || (docs.length > 0 && (docs[0].userpass == undefined || docs[0].userpass == "" || docs[0].userpass == pass))) {
                            if(docs.length > 0 && docs[0].hasOwnProperty('userpass') && docs[0].userpass != "" && docs[0].userpass == pass) {
                                Functions.setSessionUserPass(Functions.getSession(socket), msg.pass, coll, function(){})
                                socket.emit("auth_accepted", {value: true});
                            }
                            if(docs.length > 0 && docs[0].hasOwnProperty("adminpass") && docs[0].adminpass != "" && docs[0].adminpass == Functions.hash_pass(Functions.hash_pass(Functions.decrypt_string(adminpass), true))) {
                                socket.emit("pw", true);
                            }
                            in_list = true;
                            socket.join(coll);
                            Functions.check_inlist(coll, guid, socket, offline);

                            if(frontpage_lists.viewers != undefined){
                                io.to(coll).emit("viewers", frontpage_lists.viewers);
                            } else {
                                io.to(coll).emit("viewers", 1);
                            }

                            send_list(coll, socket, true, false, true);

                        } else {
                            socket.emit("auth_required");
                        }
                    });
                } else {
                    db.createCollection(coll, function(err, docs){
                        db.collection(coll).createIndex({ id: 1}, {unique: true}, function(e, d) {
                            var configs = {"addsongs":false, "adminpass":"", "allvideos":true, "frontpage":true, "longsongs":false, "removeplay": false, "shuffle": true, "skip": false, "skips": [], "startTime":Functions.get_time(), "views": [], "vote": false, "desc": "", userpass: "", id: "config"};
                            db.collection(coll + "_settings").insert(configs, function(err, docs){
                                socket.join(coll);
                                send_list(coll, socket, true, false, true);
                                db.collection("frontpage_lists").insert({"_id": coll, "count" : 0, "frontpage": true, "accessed": Functions.get_time(), "viewers": 1}, function(e,d){
                                });
                                Functions.check_inlist(coll, guid, socket, offline);
                            });
                        });
                    });
                }
            });
        });
    } else {
        var result = {
            msg: {
                expected: "object",
                got: typeof(msg)
            },
        };
        socket.emit('update_required', result);
    }
}

function skip(list, guid, coll, offline, socket) {
    var socketid = socket.zoff_id;

    if(list !== undefined && list !== null && list !== "")
    {
        if(coll == undefined && list.hasOwnProperty('channel')) coll = list.channel.toLowerCase();
        if(coll !== undefined) {
            try {
                coll = list.channel.toLowerCase();//.replace(/ /g,'');
                if(coll.length == 0) return;
                coll = Functions.removeEmojis(coll).toLowerCase();
                //coll = coll.replace(/_/g, "");

                coll = filter.clean(coll);
            } catch(e) {
                return;
            }
        }

        if(!list.hasOwnProperty("id") || !list.hasOwnProperty("channel") ||
            typeof(list.id) != "string" || typeof(list.channel) != "string") {
                var result = {
                    channel: {
                        expected: "string",
                        got: list.hasOwnProperty("channel") ? typeof(list.channel) : undefined,
                    },
                    pass: {
                        expected: "string",
                        got: list.hasOwnProperty("pass") ? typeof(list.pass) : undefined,
                    },
                    userpass: {
                        expected: "string",
                        got: list.hasOwnProperty("userpass") ? typeof(list.userpass) : undefined,
                    },
                    id: {
                        expected: "string",
                        got: list.hasOwnProperty("id") ? typeof(list.id) : undefined,
                    },
                };
                socket.emit('update_required', result);
                return;
            }
        Functions.getSessionAdminUser(Functions.getSession(socket), coll, function(userpass, adminpass) {
            if(adminpass != "" || list.pass == undefined) {
                list.pass = adminpass;
            }
            if(userpass != "" || list.userpass == undefined) {
                list.userpass = userpass;
            }

            db.collection(coll + "_settings").find(function(err, docs){
                if(docs.length > 0 && (docs[0].userpass == undefined || docs[0].userpass == "" || (list.hasOwnProperty('userpass') && docs[0].userpass == crypto.createHash('sha256').update(Functions.decrypt_string(list.userpass)).digest("base64")))) {

                    Functions.check_inlist(coll, guid, socket, offline);

                    adminpass = "";
                    video_id  = list.id;
                    err       = list.error;
                    var error = false;
                    var video_id;
                    if(err != "5" && err != "100" && err != "101" && err != "150")
                    {
                        adminpass = list.pass;
                    }else if(err == "5" || err == "100" || err == "101" || err == "150"){
                        error = true;
                    }

                    if(adminpass !== undefined && adminpass !== null && adminpass !== "")
                    hash = Functions.hash_pass(Functions.hash_pass(Functions.decrypt_string(adminpass),true));
                    else
                    hash = "";

                    db.collection(coll + "_settings").find(function(err, docs){

                        if(docs !== null && docs.length !== 0)
                        {
                            if(!docs[0].skip || (docs[0].adminpass == hash && docs[0].adminpass !== "") || error)
                            {
                                db.collection("frontpage_lists").find({"_id": coll}, function(err, frontpage_viewers){
                                    if((frontpage_viewers[0].viewers/2 <= docs[0].skips.length+1 && !Functions.contains(docs[0].skips, guid) && frontpage_viewers[0].viewers != 2) ||
                                    (frontpage_viewers[0].viewers == 2 && docs[0].skips.length+1 == 2 && !Functions.contains(docs[0].skips, guid)) ||
                                    (docs[0].adminpass == hash && docs[0].adminpass !== "" && docs[0].skip))
                                    {
                                        change_song(coll, error, video_id);
                                        socket.emit("toast", "skip");
                                        db.collection("user_names").find({"guid": guid}, function(err, docs) {
                                            if(docs.length == 1) {
                                                db.collection("registered_users").find({"_id": docs[0].name}, function(err, n) {
                                                    var icon = false;
                                                    if(n.length > 0 && n[0].icon) {
                                                        icon = n[0].icon;
                                                    }
                                                    io.to(coll).emit('chat', {from: docs[0].name, icon: icon, msg: " skipped"});
                                                });
                                            }
                                        });
                                    }else if(!Functions.contains(docs[0].skips, guid)){
                                        db.collection(coll + "_settings").update({ id: "config" }, {$push:{skips:guid}}, function(err, d){
                                            if(frontpage_viewers[0].viewers == 2)
                                            to_skip = 1;
                                            else
                                            to_skip = (Math.ceil(frontpage_viewers[0].viewers/2) - docs[0].skips.length-1);
                                            socket.emit("toast", to_skip + " more are needed to skip!");
                                            socket.to(coll).emit('chat', {from: name, msg: " voted to skip"});
                                        });
                                    }else{
                                        socket.emit("toast", "alreadyskip");
                                    }
                                });
                            }else
                            socket.emit("toast", "noskip");
                        }
                    });
                } else {
                    socket.emit("auth_required");
                }
            });
        });
    } else {
        var result = {
            msg: {
                expected: "object",
                got: typeof(list),
            },
        };
        socket.emit("update_required", result);
    }
}

function change_song(coll, error, id, callback, socket) {
    //coll = coll.replace(/ /g,'');
    db.collection(coll + "_settings").find(function(err, docs){
        var startTime = docs[0].startTime;
        if(docs !== null && docs.length !== 0)
        {
            db.collection(coll).aggregate([{
                $match:{
                    views:{
                        $exists: false
                    },
                    type:{
                        $ne: "suggested"
                    }
                }
            }, {
                $sort:{
                    now_playing: -1,
                    votes:-1,
                    added:1,
                    title: 1
                }
            }, {
                $limit:2
            }], function(err, now_playing_doc){

                if((id && id == now_playing_doc[0].id) || !id) {
                    if(error){
                        request('http://img.youtube.com/vi/'+now_playing_doc[0].id+'/mqdefault.jpg', function (err, response, body) {
                            if (err || response.statusCode == 404) {
                                db.collection(coll).remove({now_playing:true, id:id}, function(err, docs){
                                    var next_song;
                                    if(now_playing_doc.length == 2) next_song = now_playing_doc[1].id;
                                    change_song_post(coll, next_song, callback, socket);
                                    if(!callback) {
                                        io.to(coll).emit("channel", {type: "deleted", value: now_playing_doc[0].id, removed: true});
                                    }
                                    db.collection("frontpage_lists").update({_id: coll, count: {$gt: 0}}, {$inc: {count: -1}, $set:{accessed: Functions.get_time()}}, {upsert: true}, function(err, docs){});
                                });
                            } else {
                                if((docs[0].skipped_time != undefined && docs[0].skipped_time != Functions.get_time()) || docs[0].skipped_time == undefined) {
                                    db.collection(coll + "_settings").update({id: "config"}, {$set: {skipped_time: Functions.get_time()}}, function(err, updated){
                                        db.collection(coll).update({now_playing:true, id:id}, {
                                            $set:{
                                                now_playing:false,
                                                votes:0,
                                                guids:[]
                                            }
                                        },{multi:true}, function(err, docs){
                                            var next_song;
                                            if(now_playing_doc.length == 2) next_song = now_playing_doc[1].id;
                                            if(docs.n >= 1) change_song_post(coll, next_song, callback, socket);
                                        });
                                    });
                                }
                            }
                        });

                    } else if(docs[0].removeplay === true){
                        db.collection(coll).remove({now_playing:true, id:id}, function(err, docs){
                            var next_song;
                            if(now_playing_doc.length == 2) next_song = now_playing_doc[1].id;
                            change_song_post(coll, next_song, callback, socket);
                            if(!callback) {
                                io.to(coll).emit("channel", {type: "deleted", value: now_playing_doc[0].id, removed: true});
                            }
                            db.collection("frontpage_lists").update({_id: coll, count: {$gt: 0}}, {$inc: {count: -1}, $set:{accessed: Functions.get_time()}}, {upsert: true}, function(err, docs){});
                        });
                    } else {

                        if((docs[0].skipped_time != undefined && docs[0].skipped_time != Functions.get_time()) || docs[0].skipped_time == undefined) {
                            db.collection(coll).update({now_playing:true, id:id}, {
                                $set:{
                                    now_playing:false,
                                    votes:0,
                                    guids:[]
                                }
                            },{multi:true}, function(err, docs){
                                var next_song;
                                if(now_playing_doc.length == 2) next_song = now_playing_doc[1].id;
                                change_song_post(coll, next_song, callback, socket);
                            });
                        }
                    }
                } else {
                    if(now_playing_doc[0].now_playing == true && now_playing_doc.length > 1 && now_playing_doc[1].id == id) {
                        db.collection(coll).update({id: now_playing_doc[0].id}, {$set: {now_playing: false}}, function(e, d) {
                            change_song(coll, error, id, callback, socket);
                        })
                    } else {
                        return;
                    }
                }
            });
        }
    });
}

function change_song_post(coll, next_song, callback, socket) {
    //coll = coll.replace(/ /g,'');
    db.collection(coll).aggregate([{
        $match:{
            now_playing:false,
            type:{
                $ne: "suggested"
            }
        }
    }, {
        $sort:{
            votes:-1,
            added:1,
            title: 1
        }
    }, {
        $limit:2
    }], function(err, docs){
        if(docs !== null && docs.length > 0){
            var id = docs[0].id;
            if(next_song && next_song != id) {
                if((docs.length == 2 && next_song == docs[1].id)) {
                    id = docs[1].id;
                } else {
                    return;
                }
            }
            db.collection(coll).update({id:id},{
                $set:{
                    now_playing:true,
                    votes:0,
                    guids:[],
                    added:Functions.get_time()
                }
            }, function(err, returnDocs){
                db.collection(coll + "_settings").update({id: "config"}, {
                    $set:{
                        startTime:Functions.get_time(),
                        skips:[]
                    }
                }, function(err, returnDocs){
                    db.collection(coll + "_settings").find({id: "config"}, function(err, conf){
                        if(!callback) {
                            io.to(coll).emit("channel", {type: "song_change", time: Functions.get_time(), remove: conf[0].removeplay});
                            send_play(coll);
                        } else {
                            socket.to(coll).emit("channel", {type: "song_change", time: Functions.get_time(), remove: conf[0].removeplay});
                            send_play(coll, socket, true);
                            callback();
                        }
                        Frontpage.update_frontpage(coll, docs[0].id, docs[0].title, docs[0].thumbnail, docs[0].source);
                    });
                });
            });
        }
    });
}

function send_list(coll, socket, send, list_send, configs, shuffled)
{
    //coll = coll.replace(/ /g,'');
    db.collection(coll + "_settings").find({id: "config"}, function(err, _conf){
        var conf = _conf;
        if(conf.length == 0) {
            var conf = {"id": "config", "addsongs":false, "adminpass":"", "allvideos":true, "frontpage":true, "longsongs":false, "removeplay": false, "shuffle": true, "skip": false, "skips": [], "startTime":Functions.get_time(), "views": [], "vote": false, "desc": "", userpass: ""};
            db.collection(coll + "_settings").update({id: "config"}, conf, {upsert: true}, function(err, docs) {
                send_list(coll, socket, send, list_send, configs, shuffled);
            });
        } else {
            var project_object = {
                "_id": 0,
                "id": 1,
                "added": 1,
                "now_playing": 1,
                "title": 1,
                "votes": 1,
                "start": 1,
                "duration": 1,
                "end": 1,
                "type": 1,
                "source": { $ifNull: [ "$source", "youtube" ] },
                "thumbnail": {
                    $ifNull: [ "$thumbnail", {
                        $concat : [ "https://img.youtube.com/vi/", "$id", "/mqdefault.jpg"]
                    } ]
                }
            };
            db.collection(coll).aggregate([
                {
                    "$match": {type: {$ne: "suggested"}}
                },
                {
                    "$project": project_object
                },
                { "$sort" : { "now_playing" : -1, "votes": -1, "added": 1 } }
            ], function(err, docs)
            //db.collection(coll).find({type: {$ne: "suggested"}}, function(err, docs)
            {
                if(docs.length > 0) {
                    db.collection(coll).find({now_playing: true}, function(err, np_docs) {
                        if(np_docs.length == 0) {
                            db.collection(coll).aggregate([{
                                $match:{
                                    views:{
                                        $exists: false
                                    },
                                    type:{
                                        $ne: "suggested"
                                    }
                                }
                            }, {
                                $sort:{
                                    now_playing: -1,
                                    votes:-1,
                                    added:1,
                                    title: 1
                                }
                            }, {
                                $limit:1
                            }], function(err, now_playing_doc){
                                if(now_playing_doc[0].now_playing == false) {
                                    db.collection(coll).update({id:now_playing_doc[0].id}, {
                                        $set:{
                                            now_playing:true,
                                            votes:0,
                                            guids:[],
                                            added:Functions.get_time()
                                        }
                                    }, function(err, returnDocs){
                                        db.collection(coll + "_settings").update({ id: "config" }, {
                                            $set:{
                                                startTime: Functions.get_time(),
                                                skips:[]
                                            }
                                        }, function(err, returnDocs){
                                            Frontpage.update_frontpage(coll, now_playing_doc[0].id, now_playing_doc[0].title, now_playing_doc[0].thumbnail, now_playing_doc[0].source);
                                            send_list(coll, socket, send, list_send, configs, shuffled);
                                        });
                                    });
                                }
                            });
                        } else if(np_docs.length > 1) {
                            db.collection(coll).aggregate([{
                                $match:{
                                    now_playing: true
                                }
                            }, {
                                $sort:{
                                    now_playing: -1,
                                    votes:-1,
                                    added:1,
                                    title: 1
                                }
                            }], function(e, docs) {
                                var real_now_playing = docs[docs.length - 1];
                                db.collection(coll).update({now_playing: true, id: {$ne: real_now_playing.id}}, {$set: {now_playing: false}}, {multi: true}, function(e, d) {
                                    send_list(coll, socket, send, list_send, configs, shuffled);
                                })
                            })
                        } else {
                            if(Functions.get_time()-conf[0].startTime > np_docs[0].duration){
                                change_song(coll, false, np_docs[0].id, function() {
                                    send_list(coll, socket, send, list_send, configs, shuffled);
                                }, socket);
                            } else {
                                if(list_send) {
                                    io.to(coll).emit("channel", {type: "list", playlist: docs, shuffled: shuffled});
                                } else if(!list_send) {
                                    socket.emit("channel", {type: "list", playlist: docs, shuffled: shuffled});
                                }
                                if(socket === undefined && send) {
                                    send_play(coll);
                                } else if(send) {
                                    send_play(coll, socket);
                                }
                            }
                        }
                    });
                } else {
                    if(list_send) {
                        io.to(coll).emit("channel", {type: "list", playlist: docs, shuffled: shuffled});
                    } else if(!list_send) {
                        socket.emit("channel", {type: "list", playlist: docs, shuffled: shuffled});
                    }
                    if(socket === undefined && send) {
                        send_play(coll);
                    } else if(send) {
                        send_play(coll, socket);
                    }
                }
            });
            if(configs)
            {
                if(conf.length > 0) {
                    if(conf[0].adminpass !== "") conf[0].adminpass = true;
                    if(conf[0].hasOwnProperty("userpass") && conf[0].userpass != "") conf[0].userpass = true;
                    else conf[0].userpass = false;
                    io.to(coll).emit("conf", conf);
                } else if(conf.length == 0 && docs.length > 0) {
                    var conf = {"id": "config", "addsongs":false, "adminpass":"", "allvideos":true, "frontpage":true, "longsongs":false, "removeplay": false, "shuffle": true, "skip": false, "skips": [], "startTime":Functions.get_time(), "views": [], "vote": false, "desc": "", userpass: ""};
                    db.collection(coll + "_settings").update({id: "config"}, conf, {upsert: true}, function(err, docs) {
                        io.to(coll).emit("conf", conf);
                    });
                }
            }
        }
    });
    if(socket){
        db.collection(coll).find({type:"suggested"}).sort({added: 1}, function(err, sugg){
            socket.emit("suggested", sugg);
        });
    }
}

function end(obj, coll, guid, offline, socket) {
    var socketid = socket.zoff_id;
    if(typeof(obj) !== 'object') {
        return;
    }
    id = obj.id;

    if(id !== undefined && id !== null && id !== "") {

        if(!obj.hasOwnProperty("id") || !obj.hasOwnProperty("channel") ||
            typeof(obj.id) != "string" || typeof(obj.channel) != "string") {
                var result = {
                    channel: {
                        expected: "string",
                        got: obj.hasOwnProperty("channel") ? typeof(obj.channel) : undefined,
                    },
                    pass: {
                        expected: "string",
                        got: obj.hasOwnProperty("pass") ? typeof(obj.pass) : undefined,
                    },
                    id: {
                        expected: "string",
                        got: obj.hasOwnProperty("id") ? typeof(obj.id) : undefined,
                    },
                };
                socket.emit("update_required", result);
            return;
        }
        //coll = coll.replace(/ /g,'');
        Functions.getSessionAdminUser(Functions.getSession(socket), coll, function(userpass) {
            if(userpass != "" || obj.pass == undefined) {
                obj.pass = userpass;
            }

            db.collection(coll + "_settings").find(function(err, docs){
                if(docs.length > 0 && (docs[0].userpass == undefined || docs[0].userpass == "" || (obj.hasOwnProperty('pass') && docs[0].userpass == crypto.createHash('sha256').update(Functions.decrypt_string(obj.pass)).digest("base64")))) {

                    Functions.check_inlist(coll, guid, socket, offline);
                    db.collection(coll).find({now_playing:true}, function(err, np){
                        if(err !== null) console.log(err);
                        if(np !== null && np !== undefined && np.length == 1 && np[0].id == id){
                            db.collection(coll + "_settings").find(function(err, docs){
                                var startTime = docs[0].startTime;
                                if(docs[0].removeplay === true && startTime+parseInt(np[0].duration)<=Functions.get_time()+5)
                                {
                                    db.collection(coll).remove({now_playing:true}, function(err, docs){
                                        change_song_post(coll);
                                        db.collection("frontpage_lists").update({_id:coll, count: {$gt: 0}}, {$inc:{count:-1}, $set:{accessed: Functions.get_time()}}, {upsert:true}, function(err, docs){});
                                    });
                                }else{
                                    if(startTime+parseInt(np[0].duration)<=Functions.get_time()+5)
                                    {
                                        change_song(coll, false, id);
                                    }
                                }
                            });
                        }
                    });
                } else {
                    socket.emit("auth_required");
                }
            });
        });
    } else {
        var result = {
            msg: {
                expected: "object",
                got: typeof(obj)
            },
        };
        socket.emit("update_required", result);
    }
}

function send_play(coll, socket, broadcast) {
    //coll = coll.replace(/ /g,'');
    db.collection(coll).find({now_playing:true}, function(err, np){
        db.collection(coll + "_settings").find(function(err, conf){
            if(err !== null) console.log(err);
            try{
                if(Functions.get_time()-conf[0].startTime > np[0].duration){
                    change_song(coll, false, np[0].id);
                } else if(conf !== null && conf !== undefined && conf.length !== 0)
                {
                    if(conf[0].adminpass !== "") conf[0].adminpass = true;
                    if(conf[0].hasOwnProperty("userpass") && conf[0].userpass != "") conf[0].userpass = true;
                    else conf[0].userpass = false;
                    if(!np.hasOwnProperty("start")) np.start = 0;
                    if(!np.hasOwnProperty("end")) np.end = np.duration;
                    toSend = {np: np, conf: conf, time: Functions.get_time()};
                    if(socket === undefined) {
                        io.to(coll).emit("np", toSend);
                        //
                        getNextSong(coll)
                        var url = 'https://img.youtube.com/vi/'+np[0].id+'/mqdefault.jpg';
                        if(np[0].source == "soundcloud") url = np[0].thumbnail;
                        sendColor(coll, false, url);
                    } else {
                        var url = 'https://img.youtube.com/vi/'+np[0].id+'/mqdefault.jpg';
                        if(np[0].source == "soundcloud") url = np[0].thumbnail;
                        sendColor(coll, socket, url);
                        if(broadcast) {
                            socket.to(coll).emit("np", toSend);
                            return;
                        }
                        socket.emit("np", toSend);
                    }
                }
            } catch(e){
                if(socket) {
                    if(broadcast) {
                        socket.to(coll).emit("np", {});
                        return;
                    }
                    socket.emit("np", {});
                } else {
                    io.to(coll).emit("np", {});
                }
            }
        });
    });
}

function sendColor(coll, socket, url, ajax, res) {
    if(coll != undefined && typeof(coll) == "string") {
        //coll = coll.replace(/ /g,'');
    }
    if(url.indexOf("://") == -1) url = 'https://img.youtube.com/vi/'+url+'/mqdefault.jpg';
    //var url = 'https://img.youtube.com/vi/'+id+'/mqdefault.jpg';

    Jimp.read(url).then(function (image) {

        var c = ColorThief.getColor(image);
        if(ajax) {
            res.header({"Content-Type": "application/json"});
            res.status(200).send(c);
            return;
        } else {
            if(socket) {
                socket.emit("color", {color: c, only: true});
            } else {
                io.to(coll).emit("color", {color: c, only: false});
            }
        }
    }).catch(function(err) {
        console.log("Crashed on fetching image, url is " + url);
        console.log("Is ajax: " + ajax);
        if(ajax) {
            res.header({"Content-Type": "application/json"});
            res.status(404);
            return;
        }
    });
}

function getNextSong(coll, callback) {
    //coll = coll.replace(/ /g,'');
    db.collection(coll).aggregate([{
        $match:{
            views:{
                $exists: false
            },
            type:{
                $ne: "suggested"
            }
        }
    }, {
        $sort:{
            now_playing: 1,
            votes:-1,
            added:1,
            title: 1
        }
    }, {
        $limit:1
    }], function(err, doc) {
        if(doc.length == 1) {
            var thumbnail = "";
            var source = "youtube";
            if(doc[0].source && doc[0].source == "soundcloud") {
                source = "soundcloud";
                thumbnail = doc[0].thumbnail;
            }
            io.to(coll).emit("next_song", {videoId: doc[0].id, title: doc[0].title, source: source, thumbnail: thumbnail});
        }
        if(typeof(callback) == "function") callback();
    });
}

function left_channel(coll, guid, short_id, in_list, socket, change) {
    if(!coll) return;
    //coll = coll.replace(/ /g,'');
    db.collection("connected_users").update({"_id": coll}, {$pull: {users: guid}}, function(err, updated) {
        if(updated.nModified > 0) {
            db.collection("connected_users").find({"_id": coll}, function(err, new_doc){
                db.collection("frontpage_lists").update({"_id": coll, viewers: {$gt: 0}}, {$inc: {viewers: -1}}, function(err, doc) {
                    db.collection("user_names").find({"guid": guid}, function(err, docs) {
                        if(docs.length == 1) {
                            io.to(coll).emit('chat', {from: docs[0].name, msg: " left"});
                        }
                    });
                    io.to(coll).emit("viewers", new_doc[0].users.length);
                    socket.leave(coll);
                });
                db.collection("connected_users").update({"_id": "total_users"}, {$pull: {total_users: guid + coll}}, function(err, updated){});

                if(!change) {
                    Functions.remove_name_from_db(guid, name);
                }
            });
        } else {
            db.collection("connected_users").update({"_id": "offline_users"}, {$pull: {users: guid}}, function(err, updated){
                if(updated.nModified > 0) {
                    db.collection("connected_users").update({"_id": "total_users"}, {$pull: {total_users: guid + coll}}, function(err, updated){});
                }
            });

        }
    });
    Functions.remove_unique_id(short_id);
}

module.exports.sendColor = sendColor;
module.exports.now_playing = now_playing;
module.exports.list = list;
module.exports.skip = skip;
module.exports.change_song = change_song;
module.exports.change_song_post = change_song_post;
module.exports.send_list = send_list;
module.exports.end = end;
module.exports.send_play = send_play;
module.exports.getNextSong = getNextSong;
module.exports.left_channel = left_channel;
