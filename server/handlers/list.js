var ColorThief = require('color-thief-jimp');
var Jimp = require('jimp');

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

    if(typeof(msg) === 'object' && msg !== undefined && msg !== null && msg.hasOwnProperty("channel") && msg.hasOwnProperty('pass'))
    {
        if(!msg.hasOwnProperty('version') || msg.version != VERSION || msg.version == undefined) {
            socket.emit("update_required");
        }

        if(coll == "" || coll == undefined || coll == null) {
            socket.emit("update_required");
            return;
        }
        var pass = Functions.decrypt_string(socketid, msg.pass);
        db.collection('frontpage_lists').find({"_id": coll}, function(err, frontpage_lists){
            if(frontpage_lists.length == 1)
            {
                db.collection(coll + "_settings").find(function(err, docs) {
                    if(docs.length == 0 || (docs.length > 0 && (docs[0].userpass == undefined || docs[0].userpass == "" || docs[0].userpass == pass))) {
                        if(docs.length > 0 && docs[0].hasOwnProperty('userpass') && docs[0].userpass != "" && docs[0].userpass == pass) {
                            socket.emit("auth_accepted", {value: true});
                        }
                        in_list = true;
                        socket.join(coll);
                        Functions.check_inlist(coll, guid, socket, offline);

                        if(frontpage_lists.viewers != undefined){
                            io.to(coll).emit("viewers", frontpage_lists.viewers);
                        } else {
                            io.to(coll).emit("viewers", 1);
                        }

                        List.send_list(coll, socket, true, false, true);

                    } else {
                        socket.emit("auth_required");
                    }
                });
            } else {
                db.createCollection(coll, function(err, docs){
                    var configs = {"addsongs":false, "adminpass":"", "allvideos":true, "frontpage":true, "longsongs":false, "removeplay": false, "shuffle": true, "skip": false, "skips": [], "startTime":Functions.get_time(), "views": [], "vote": false, "desc": ""};
                    db.collection(coll + "_settings").insert(configs, function(err, docs){
                        socket.join(coll);
                        List.send_list(coll, socket, true, false, true);
                        db.collection("frontpage_lists").insert({"_id": coll, "count" : 0, "frontpage": true, "accessed": Functions.get_time(), "viewers": 1});
                        Functions.check_inlist(coll, guid, socket, offline);
                    });
                });
            }
        });
    } else {
        socket.emit('update_required');
    }
}

function skip(list, guid, coll, offline, socket) {
    var socketid = socket.zoff_id;
    if(list !== undefined && list !== null && list !== "")
    {

        if(coll == "" || coll == undefined || coll == null) {
            socket.emit("update_required");
            return;
        }

        db.collection(coll + "_settings").find(function(err, docs){
            if(docs.length > 0 && (docs[0].userpass == undefined || docs[0].userpass == "" || (list.hasOwnProperty('userpass') && docs[0].userpass == Functions.decrypt_string(socketid, list.userpass)))) {

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
                hash = Functions.hash_pass(Functions.decrypt_string(socketid, adminpass));
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
                                    List.change_song(coll, error, video_id);
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
                                    db.collection(coll + "_settings").update({views:{$exists:true}}, {$push:{skips:guid}}, function(err, d){
                                        if(frontpage_viewers[0].viewers == 2)
                                        to_skip = 1;
                                        else
                                        to_skip = (Math.ceil(frontpage_viewers[0].viewers/2) - docs[0].skips.length-1);
                                        socket.emit("toast", to_skip + " more are needed to skip!");
                                        socket.broadcast.to(coll).emit('chat', {from: name, msg: " voted to skip"});
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
    } else {
        socket.emit('update_required');
    }
}

function change_song(coll, error, id, callback) {
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
                                    List.change_song_post(coll, next_song, callback);
                                    if(!callback) {
                                        io.to(coll).emit("channel", {type: "deleted", value: now_playing_doc[0].id, removed: true});
                                    }
                                    db.collection("frontpage_lists").update({_id: coll, count: {$gt: 0}}, {$inc: {count: -1}, $set:{accessed: Functions.get_time()}}, {upsert: true}, function(err, docs){});
                                });
                            } else {
                                if((docs[0].skipped_time != undefined && docs[0].skipped_time != Functions.get_time()) || docs[0].skipped_time == undefined) {
                                    db.collection(coll + "_settings").update({views: {$exists: true}}, {$set: {skipped_time: Functions.get_time()}}, function(err, updated){
                                        db.collection(coll).update({now_playing:true, id:id}, {
                                            $set:{
                                                now_playing:false,
                                                votes:0,
                                                guids:[]
                                            }
                                        },{multi:true}, function(err, docs){
                                            var next_song;
                                            if(now_playing_doc.length == 2) next_song = now_playing_doc[1].id;
                                            if(docs.n >= 1) List.change_song_post(coll, next_song, callback);
                                        });
                                    });
                                }
                            }
                        });

                    } else if(docs[0].removeplay === true){
                        db.collection(coll).remove({now_playing:true, id:id}, function(err, docs){
                            var next_song;
                            if(now_playing_doc.length == 2) next_song = now_playing_doc[1].id;
                            List.change_song_post(coll, next_song, callback);
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
                                List.change_song_post(coll, next_song, callback);
                            });
                        }
                    }
                } else {
                    return;
                }
            });
        }
    });
}

function change_song_post(coll, next_song, callback)
{
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
                db.collection(coll + "_settings").update({views: {$exists: true}}, {
                    $set:{
                        startTime:Functions.get_time(),
                        skips:[]
                    }
                }, function(err, returnDocs){
                    db.collection(coll + "_settings").find(function(err, conf){
                        if(!callback) {
                            io.to(coll).emit("channel", {type: "song_change", time: Functions.get_time(), remove: conf[0].removeplay});
                            List.send_play(coll);
                        } else {
                            callback();
                        }
                        Frontpage.update_frontpage(coll, docs[0].id, docs[0].title);
                    });
                });
            });
        }
    });
}

function send_list(coll, socket, send, list_send, configs, shuffled)
{
    db.collection(coll + "_settings").find(function(err, conf){
        db.collection(coll).find({views:{$exists:false}, type: {$ne: "suggested"}}, function(err, docs)
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
                                    db.collection(coll + "_settings").update({views:{$exists:true}}, {
                                        $set:{
                                            startTime: Functions.get_time(),
                                            skips:[]
                                        }
                                    }, function(err, returnDocs){
                                        Frontpage.update_frontpage(coll, now_playing_doc[0].id, now_playing_doc[0].title);
                                        List.send_list(coll, socket, send, list_send, configs, shuffled);
                                    });
                                });
                            }
                        });
                    } else {
                        if(Functions.get_time()-conf[0].startTime > np_docs[0].duration){
                            List.change_song(coll, false, np_docs[0].id, function() {
                                List.send_list(coll, socket, send, list_send, configs, shuffled);
                            });
                        } else {
                            if(list_send) {
                                io.to(coll).emit("channel", {type: "list", playlist: docs, shuffled: shuffled});
                            } else if(!list_send) {
                                socket.emit("channel", {type: "list", playlist: docs, shuffled: shuffled});
                            }
                            if(socket === undefined && send) {
                                List.send_play(coll);
                            } else if(send) {
                                List.send_play(coll, socket);
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
                    List.send_play(coll);
                } else if(send) {
                    List.send_play(coll, socket);
                }
            }
        });

        if(configs)
        {
            if(conf[0].adminpass !== "") conf[0].adminpass = true;
            if(conf[0].hasOwnProperty("userpass") && conf[0].userpass != "") conf[0].userpass = true;
            else conf[0].userpass = false;
            io.to(coll).emit("conf", conf);
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

        if(coll == "" || coll == undefined || coll == null) {
            socket.emit("update_required");
            return;
        }

        db.collection(coll + "_settings").find(function(err, docs){
            if(docs.length > 0 && (docs[0].userpass == undefined || docs[0].userpass == "" || (obj.hasOwnProperty('pass') && docs[0].userpass == Functions.decrypt_string(socketid, obj.pass)))) {

                Functions.check_inlist(coll, guid, socket, offline);
                db.collection(coll).find({now_playing:true}, function(err, np){
                    if(err !== null) console.log(err);
                    if(np !== null && np !== undefined && np.length == 1 && np[0].id == id){
                        db.collection(coll + "_settings").find(function(err, docs){
                            var startTime = docs[0].startTime;
                            if(docs[0].removeplay === true && startTime+parseInt(np[0].duration)<=Functions.get_time()+5)
                            {
                                db.collection(coll).remove({now_playing:true}, function(err, docs){
                                    List.change_song_post(coll);
                                    db.collection("frontpage_lists").update({_id:coll, count: {$gt: 0}}, {$inc:{count:-1}, $set:{accessed: Functions.get_time()}}, {upsert:true}, function(err, docs){});
                                });
                            }else{
                                if(startTime+parseInt(np[0].duration)<=Functions.get_time()+5)
                                {
                                    List.change_song(coll, false, id);
                                }
                            }
                        });
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

function send_play(coll, socket)
{
    db.collection(coll).find({now_playing:true}, function(err, np){
        db.collection(coll + "_settings").find(function(err, conf){
            if(err !== null) console.log(err);
            try{
                if(Functions.get_time()-conf[0].startTime > np[0].duration){
                    List.change_song(coll, false, np[0].id);
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
                        List.getNextSong(coll)
                        sendColor(coll, false, np[0].id);
                    } else {
                        socket.emit("np", toSend);
                        sendColor(coll, socket, np[0].id);
                    }
                }
            } catch(e){
                if(socket) {
                    socket.emit("np", {});
                } else {
                    io.to(coll).emit("np", {});
                }
            }
        });
    });
}

function sendColor(coll, socket, id) {
    var url = 'https://img.youtube.com/vi/'+id+'/mqdefault.jpg';
    Jimp.read(url).then(function (image) {

        var c = ColorThief.getColor(image);
        if(socket) {
            socket.emit("color", {color: c});
        } else {
            io.to(coll).emit("color", {color: c});
        }
    });
}

function getNextSong(coll) {
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
            io.to(coll).emit("next_song", {videoId: doc[0].id, title: doc[0].title});
        }
    });
}

function left_channel(coll, guid, short_id, in_list, socket, change)
{
    if(!coll) return;
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
