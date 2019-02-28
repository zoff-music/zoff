var Functions = require(pathThumbnails + '/handlers/functions.js');
var List = require(pathThumbnails + '/handlers/list.js');
var Frontpage = require(pathThumbnails + '/handlers/frontpage.js');
var Search = require(pathThumbnails + '/handlers/search.js');
var crypto = require('crypto');
var Filter = require('bad-words');
var filter = new Filter({ placeHolder: 'x'});
/*var filter = {
clean: function(str) {
return str;
}
}*/
var db = require(pathThumbnails + '/handlers/db.js');

function addFromOtherList(arr, guid, offline, socket) {
    var socketid = socket.zoff_id;
    if(typeof(arr) == "object") {
        if(!arr.hasOwnProperty("channel") || !arr.hasOwnProperty("new_channel")
        || typeof(arr.channel) != "string" || typeof(arr.new_channel) != "string") {
            var result = {
                channel: {
                    expected: "string",
                    got: arr.hasOwnProperty("channel") ? typeof(arr.channel) : undefined
                },
                new_channel: {
                    expected: "string",
                    got: arr.hasOwnProperty("new_channel") ? typeof(arr.new_channel) : undefined
                }
            };
            socket.emit('update_required', result);
            return;
        }
        var channel = arr.channel;//.replace(/ /g,'').toLowerCase();
        var new_channel = Functions.encodeChannelName(arr.new_channel);//.replace(/ /g, '').toLowerCase();
        db.collection("frontpage_lists").find({_id: new_channel}, function(err, fp) {
            if(fp.length == 0 || channel == new_channel) {
                socket.emit("toast", "nolist");
                return;
            }
            Functions.getSessionAdminUser(Functions.getSession(socket), channel, function(userpass, adminpass) {
                if(userpass != "" || arr.userpass == undefined) {
                    arr.userpass = userpass;
                } else {
                    arr.userpass = crypto.createHash('sha256').update(Functions.decrypt_string(arr.userpass)).digest('base64')
                }
                if(adminpass != "" || arr.adminpass == undefined) {
                    arr.adminpass = Functions.hash_pass(adminpass);
                } else {
                    arr.adminpass = Functions.hash_pass(Functions.hash_pass(Functions.decrypt_string(arr.adminpass), true));
                }
                Functions.getSessionAdminUser(Functions.getSession(socket), new_channel, function(userpass) {
                    var otheruser = "";
                    if(userpass != "") {
                        otheruser = userpass;
                    } else {
                        otheruser = crypto.createHash('sha256').update(Functions.decrypt_string(otheruser)).digest("base64");
                    }

                    db.collection(channel).find({now_playing: true}, function(e, np) {

                        var project_object = {
                            "id": 1,
                            "added": 1,
                            "guids": { "$literal": [] },
                            "now_playing": 1,
                            "title": 1,
                            "votes": { "$literal": 0 },
                            "start": 1,
                            "duration": 1,
                            "end": 1,
                            "type": 1,
                            "source": 1,
                            "thumbnail": 1
                        };
                        var to_set_np = true;
                        if(np.length > 0) {
                            project_object.now_playing = { "$literal": false };
                            to_set_np = false;
                        }
                        db.collection(new_channel + "_settings").find({id: "config"}, function(e, this_conf) {
                            if(this_conf.length > 0 && (this_conf[0].userpass == "" || !this_conf[0].userpass || this_conf[0].userpass == otheruser)) {
                                db.collection(channel + "_settings").find({id: "config"}, function(e, this_conf) {
                                    var hash = arr.adminpass;
                                    if((this_conf[0].userpass == "" || !this_conf[0].userpass || this_conf[0].userpass == arr.userpass)) {
                                        var connection_id = Functions.hash_pass(socket.handshake.headers["user-agent"] + socket.handshake.address + socket.handshake.headers["accept-language"]);
                                        Functions.checkTimeout("add_playlist", 60, channel, connection_id, this_conf[0].adminpass, hash, socket, function() {
                                            if(((this_conf[0].addsongs === true && (hash == this_conf[0].adminpass || this_conf[0].adminpass === "")) ||
                                            this_conf[0].addsongs === false)) {
                                                db.collection(new_channel).aggregate([
                                                    {
                                                        "$match": { type: "video" }
                                                    },
                                                    {
                                                        "$project": project_object
                                                    }
                                                ], function(e, docs) {
                                                    var path = require('path');
                                                    var mongo_config = require(path.join(path.join(__dirname, '../config/'), 'mongo_config.js'));
                                                    var MongoClient = require('mongodb').MongoClient;
                                                    var url = "mongodb://" + mongo_config.host + ":" + mongo_config.port + "/";
                                                    MongoClient.connect(url, function(err, _db) {
                                                        var dbo = _db.db(mongo_config.config);
                                                        dbo.collection(channel).insertMany(docs, {ordered: false}, function(err, res) {
                                                            db.collection(channel).count({type: {$ne: "suggested"}}, function(err, count) {
                                                                db.collection(channel + "_settings").update({id: "config"}, {$set: {startTime: Functions.get_time()}}, function(e,d) {
                                                                    if(to_set_np) {
                                                                        var to_change = {
                                                                            _id: channel,
                                                                            count: count,
                                                                            frontpage: true,
                                                                            accessed: Functions.get_time(),
                                                                        }
                                                                        db.collection(channel).find({now_playing: true}, function(e, np_docs) {
                                                                            to_change.id = np_docs[0].id;
                                                                            to_change.title = np_docs[0].title;
                                                                            db.collection("frontpage_lists").find({_id: new_channel}, function(e, doc) {
                                                                                if(doc.length > 0 && ((doc[0].thumbnail != "" && doc[0].thumbnail != undefined && (doc[0].thumbnail.indexOf("https://i1.sndcdn.com") > -1 || doc[0].thumbnail.indexOf("https://w1.sndcdn.com") > -1)) || (doc[0].thumbnail == "" || doc[0].thumbnail == undefined))) {
                                                                                    to_change.thumbnail = np_docs[0].thumbnail;
                                                                                }

                                                                                db.collection("frontpage_lists").update({_id: channel}, {$set: to_change}, function(e, d) {
                                                                                    List.send_list(channel, undefined, false, true, false);
                                                                                    List.send_play(channel, undefined);
                                                                                    socket.emit("toast", "addedplaylist");
                                                                                    _db.close();
                                                                                });
                                                                            });
                                                                        });
                                                                    } else {
                                                                        db.collection("frontpage_lists").update({_id: channel}, {$set: {count: count}}, function(e, d) {
                                                                            List.send_list(channel, undefined, false, true, false);
                                                                            List.send_play(channel, undefined);
                                                                            socket.emit("toast", "addedplaylist");
                                                                            _db.close();
                                                                        })
                                                                    }
                                                                });
                                                            });
                                                        });
                                                    });
                                                });
                                            } else {
                                                socket.emit("toast", "listhaspass");
                                                return;
                                            }
                                        }, "Log in to do that, or please wait ");
                                    } else {
                                        socket.emit("auth_required");
                                        return;
                                    }
                                });
                            } else {
                                socket.emit("toast", "other_list_pass");
                                return;
                            }
                        })
                    });
                });
            });
        });
    }
}

function addPlaylist(arr, guid, offline, socket) {
    var socketid = socket.zoff_id;
    if(typeof(arr) == "object") {
        if(!arr.hasOwnProperty("channel") || !arr.hasOwnProperty("songs")
        || typeof(arr.channel) != "string" || typeof(arr.songs) != "object") {
            var result = {
                channel: {
                    expected: "string",
                    got: arr.hasOwnProperty("channel") ? typeof(arr.channel) : undefined
                },
                songs: {
                    expected: "object",
                    got: arr.hasOwnProperty("songs") ? typeof(arr.songs) : undefined
                }
            };
            socket.emit('update_required', result);
            return;
        }
        var channel = arr.channel;//.replace(/ /g,'').toLowerCase();
        if(arr.length == 0 || arr.songs.length == 0) {
            socket.emit("toast", "Empty list..");
            return;
        }
        db.collection("frontpage_lists").find({_id: channel}, function(err, fp) {
            if(fp.length == 0) {
                socket.emit("toast", "nolist");
                return;
            }

            Functions.getSessionAdminUser(Functions.getSession(socket), channel, function(userpass, adminpass) {
                if(userpass != "" || arr.userpass == undefined) {
                    arr.userpass = userpass;
                } else {
                    arr.userpass = crypto.createHash('sha256').update(Functions.decrypt_string(arr.userpass)).digest("base64");
                }
                if(adminpass != "" || arr.adminpass == undefined) {
                    arr.adminpass = Functions.hash_pass(adminpass);
                } else {
                    arr.adminpass = Functions.hash_pass(Functions.hash_pass(Functions.decrypt_string(arr.adminpass), true))
                }
                db.collection(channel).find({now_playing: true}, function(e, np) {
                    var now_playing = false;
                    if(np.length == 0) now_playing = true;
                    db.collection(channel + "_settings").find({id: "config"}, function(e, conf) {
                        if(arr.length == 0 || arr.songs.length == 0) {
                            socket.emit("toast", "Empty list..");
                            return;
                        }
                        if(conf.length > 0) {
                            var hash = arr.adminpass;
                            if((conf[0].userpass == "" || !conf[0].userpass || conf[0].userpass == arr.userpass)) {
                                if(((conf[0].addsongs === true && (hash == conf[0].adminpass || conf[0].adminpass === "")) ||
                                conf[0].addsongs === false)) {
                                    var connection_id = Functions.hash_pass(socket.handshake.headers["user-agent"] + socket.handshake.address + socket.handshake.headers["accept-language"]);
                                    Functions.checkTimeout("add_playlist", 60, channel, connection_id, conf[0].adminpass, hash, socket, function() {
                                        var path = require('path');
                                        var mongo_config = require(path.join(path.join(__dirname, '../config/'), 'mongo_config.js'));
                                        var MongoClient = require('mongodb').MongoClient;
                                        var url = "mongodb://" + mongo_config.host + ":" + mongo_config.port + "/";
                                        MongoClient.connect(url, function(err, _db) {
                                            var dbo = _db.db(mongo_config.config);
                                            var number_elements = arr.songs.length + 1;
                                            var time = Functions.get_time() - number_elements;
                                            var to_set_np = now_playing;
                                            var bulk = dbo.collection(channel).initializeUnorderedBulkOp({useLegacyOps: true});
                                            for(var i = 0; i < arr.songs.length; i++) {
                                                var this_element = arr.songs[i];
                                                if(!this_element.hasOwnProperty("duration") || !this_element.hasOwnProperty("id") || !this_element.hasOwnProperty("title")) {
                                                    continue;
                                                }
                                                this_element.id = this_element.id + "";
                                                this_element.added = time;
                                                this_element.now_playing = now_playing;
                                                this_element.votes = 0;
                                                this_element.guids = [];
                                                if(!this_element.hasOwnProperty("start")) this_element.start = 0;
                                                if(!this_element.hasOwnProperty("end")) this_element.end = this_element.duration;
                                                this_element.start = parseInt(this_element.start);
                                                this_element.end = parseInt(this_element.end);
                                                this_element.type = "video";
                                                this_element.duration = parseInt(this_element.duration);
                                                if(this_element.start > this_element.end) {
                                                    this_element.start = 0;
                                                }
                                                if(this_element.source == "soundcloud") {
                                                    if(this_element.thumbnail.indexOf("https://i1.sndcdn.com") > -1 || this_element.thumbnail.indexOf("https://w1.sndcdn.com") > -1) {
                                                        this_element.thumbnail = this_element.thumbnail;
                                                    } else {
                                                        this_element.thumbnail = "https://img.youtube.com/vi/404_notfound/mqdefault.jpg";
                                                    }
                                                } else if(this_element.source == "youtube") this_element.thumbnail = "https://img.youtube.com/vi/" + this_element.id + "/mqdefault.jpg";
                                                if(now_playing) {
                                                    now_playing = false;
                                                }
                                                bulk.insert(this_element);
                                            }
                                            bulk.execute(function(err, results) {
                                                db.collection(channel).count({type: {$ne: "suggested"}}, function(err, count) {
                                                    db.collection(channel + "_settings").update({id: "config"}, {$set: {startTime: Functions.get_time()}}, function(e,d) {
                                                        if(to_set_np) {
                                                            var to_change = {
                                                                _id: channel,
                                                                count: count,
                                                                frontpage: true,
                                                                accessed: Functions.get_time(),
                                                            }
                                                            db.collection(channel).find({now_playing: true}, function(e, np_docs) {
                                                                to_change.id = np_docs[0].id;
                                                                to_change.title = np_docs[0].title;
                                                                db.collection("frontpage_lists").find({_id: channel}, function(e, doc) {
                                                                    if(doc.length > 0 && ((doc[0].thumbnail != "" && doc[0].thumbnail != undefined && (doc[0].thumbnail.indexOf("https://i1.sndcdn.com") > -1 || doc[0].thumbnail.indexOf("https://w1.sndcdn.com") > -1)) || (doc[0].thumbnail == "" || doc[0].thumbnail == undefined))) {
                                                                        to_change.thumbnail = np_docs[0].thumbnail;
                                                                    }

                                                                    db.collection("frontpage_lists").update({_id: channel}, {$set: to_change}, function(e, d) {
                                                                        List.send_list(channel, undefined, false, true, false);
                                                                        List.send_play(channel, undefined);
                                                                        socket.emit("toast", "addedplaylist");
                                                                        _db.close();
                                                                    });
                                                                });
                                                            });
                                                        } else {
                                                            db.collection("frontpage_lists").update({_id: channel}, {$set: {count: count}}, function(e, d) {
                                                                List.send_list(channel, undefined, false, true, false);
                                                                List.send_play(channel, undefined);
                                                                socket.emit("toast", "addedplaylist");
                                                                _db.close();
                                                            })
                                                        }
                                                    });
                                                });
                                            });
                                        });
                                    }, "Log in to do that, or please wait ");
                                } else {
                                    socket.emit("toast", "listhaspass");
                                    return;
                                }
                            } else {
                                socket.emit("auth_required");
                                return;
                            }
                        } else {
                            socket.emit("toast", "nolist");
                            return;
                        }
                    })
                });
            });
        });
    }
}

function add_function(arr, coll, guid, offline, socket) {
    var socketid = socket.zoff_id;
    if(typeof(arr) === 'object' && arr !== undefined && arr !== null && arr !== "" && !isNaN(parseInt(arr.duration)))
    {
        if(coll == "" || coll == undefined || coll == null || !arr.hasOwnProperty("duration")) {
            console.log(1, arr);
            var result = {
                start: {
                    expected: "number or string that can be cast to int",
                    got: arr.hasOwnProperty("start") ? typeof(arr.start) : undefined
                },
                end: {
                    expected: "number or string that can be cast to int",
                    got: arr.hasOwnProperty("end") ? typeof(arr.end) : undefined
                }
            };
            socket.emit('update_required', result);
            return;
        }

        try {
            if(arr.start == undefined) arr.start = 0;
            if(arr.end == undefined) arr.end = parseInt(arr.duration);
            var start = parseInt(arr.start);
            var end = parseInt(arr.end);
            console.log(2, arr);
            if(start < 0) {
                socket.emit("toast", "faulty_start_end");
                return;
            }
            if(end < 0) {
                socket.emit("toast", "faulty_start_end");
                return;
            }
            if(start >= end) {
                start = 0;
                arr.duration = end - start;
            }
        } catch(e) {
            console.log(3, arr);
            return;
        }


        if(typeof(arr.id) != "string" || typeof(arr.start) != "number" ||
        typeof(arr.end) != "number" || typeof(arr.title) != "string" ||
        typeof(arr.list) != "string" || typeof(arr.duration) != "number" ||
        typeof(arr.source) != "string" ||
        (arr.source == "soundcloud" && (!arr.hasOwnProperty("thumbnail") || !Functions.isUrl(arr.thumbnail)))) {
            var result = {
                start: {
                    expected: "number or string that can be cast to int",
                    got: arr.hasOwnProperty("start") ? typeof(arr.start) : undefined
                },
                end: {
                    expected: "number or string that can be cast to int",
                    got: arr.hasOwnProperty("end") ? typeof(arr.end) : undefined
                },
                title: {
                    expected: "string",
                    got: arr.hasOwnProperty("title") ? typeof(arr.title) : undefined
                },
                list: {
                    expected: "string",
                    got: arr.hasOwnProperty("list") ? typeof(arr.list) : undefined
                },
                duration: {
                    expected: "number or string that can be cast to int",
                    got: arr.hasOwnProperty("duration") ? typeof(arr.duration) : undefined
                },
                pass: {
                    expected: "string",
                    got: arr.hasOwnProperty("pass") ? typeof(arr.pass) : undefined
                },
                adminpass: {
                    expected: "string",
                    got: arr.hasOwnProperty("adminpass") ? typeof(arr.adminpass) : undefined
                },
                source: {
                    expected: "string (youtube or soundcloud)",
                    got: arr.hasOwnProperty("source") ? typeof(arr.source) : undefined
                },
                thumbnail: {
                    expected: "url if source == soundcloud",
                    got: arr.hasOwnProperty("thumbnail") ? typeof(arr.thumbnail) : undefined
                }
            };
            console.log(4, arr);
            socket.emit('update_required', result);
            return;
        }
        if(arr.hasOwnProperty("offsiteAdd") && arr.offsiteAdd) {
            coll = arr.list;
        }
        Functions.getSessionAdminUser(Functions.getSession(socket), coll, function(userpass, adminpass) {
            if(adminpass != "" || arr.adminpass == undefined) {
                arr.adminpass = Functions.hash_pass(adminpass);
            } else {
                arr.adminpass = Functions.hash_pass(Functions.hash_pass(Functions.decrypt_string(arr.adminpass), true));
            }
            if(userpass != "" || arr.pass == undefined) {
                arr.pass = userpass;
            } else {
                arr.pass = crypto.createHash('sha256').update(Functions.decrypt_string(arr.pass)).digest("base64");
            }
            db.collection(coll + "_settings").find(function(err, docs){
                if(docs.length > 0 && (docs[0].userpass == undefined || docs[0].userpass == "" || (arr.hasOwnProperty('pass') && docs[0].userpass == arr.pass))) {
                    if((arr.hasOwnProperty("offsiteAdd") && !arr.offsiteAdd) || !arr.hasOwnProperty("offsiteAdd")) {
                        Functions.check_inlist(coll, guid, socket, offline, undefined, "place 5");
                    }
                    var id = arr.id + "";
                    var title = arr.title;
                    var hash = arr.adminpass;
                    var duration = parseInt(arr.duration);
                    var source = arr.source;
                    conf = docs;
                    if(docs !== null && docs.length !== 0 && ((docs[0].addsongs === true && (hash == docs[0].adminpass || docs[0].adminpass === "")) ||
                    docs[0].addsongs === false)) {
                        db.collection(coll).find({id:id, type:{$ne:"suggested"}}, function(err, docs){
                            if(docs !== null && docs.length === 0) {
                                var guids = [guid];
                                var added = Functions.get_time();
                                var votes = 1;
                                db.collection(coll).find({now_playing:true}, function(err, docs){
                                    if((docs !== null && docs.length === 0)){
                                        np = true;
                                    } else {
                                        np = false;
                                    }
                                    var new_song = {"added": added,"guids":guids,"id":id,"now_playing":np,"title":title,"votes":votes, "duration":duration, "start": parseInt(start), "end": parseInt(end), "type": "video", "source": source};
                                    if(source == "soundcloud") {
                                        if(arr.thumbnail.indexOf("https://i1.sndcdn.com") > -1 || arr.thumbnail.indexOf("https://w1.sndcdn.com") > -1) {
                                            new_song.thumbnail = arr.thumbnail;
                                        } else {
                                            new_song.thumbnail = "https://img.youtube.com/vi/404_notfound/mqdefault.jpg";
                                        }
                                    } else if(source == "youtube") new_song.thumbnail = "https://img.youtube.com/vi/" + new_song.id + "/mqdefault.jpg";
                                    db.collection(coll).update({id: id}, new_song, {upsert: true}, function(err, docs){
                                        new_song._id = "asd";
                                        if(np) {
                                            List.send_list(coll, undefined, false, true, false);
                                            db.collection(coll + "_settings").update({ id: "config" }, {$set:{startTime: Functions.get_time()}});
                                            List.send_play(coll, undefined);
                                            var thumbnail = arr.thumbnail != undefined ? arr.thumbnail : undefined;
                                            Frontpage.update_frontpage(coll, id, title, thumbnail, arr.source);
                                            if(source != "soundcloud") Search.get_correct_info(new_song, coll, false);
                                        } else {
                                            io.to(coll).emit("channel", {type: "added", value: new_song});
                                            if(source != "soundcloud") Search.get_correct_info(new_song, coll, true);
                                        }
                                        db.collection("frontpage_lists").update({_id:coll}, {$inc:{count:1}, $set:{accessed: Functions.get_time()}}, {upsert:true}, function(err, docs){});
                                        List.getNextSong(coll, undefined);
                                    });
                                    socket.emit("toast", "addedsong");
                                });
                            } else {
                                vote(coll, id, guid, socket);
                            }
                        });
                    } else {
                        db.collection(coll).find({id: id}, function(err, docs) {
                            if(docs.length === 0) {
                                var suggestedAdd = {
                                    "added":Functions.get_time(),
                                    "guids": [guid],
                                    "id":id,
                                    "now_playing": false,
                                    "title":title,
                                    "votes":1,
                                    "duration":duration,
                                    "start": start,
                                    "end": end,
                                    "type":"suggested"
                                };
                                var source = arr.source;
                                if(source == "soundcloud") {
                                    suggestedAdd.thumbnail = arr.thumbnail;
                                    suggestedAdd.source = source;
                                } else {
                                    suggestedAdd.source = "youtube";
                                }
                                db.collection(coll).update({id: id}, {$set: suggestedAdd}, {upsert:true}, function(err, docs){
                                    socket.emit("toast", "suggested");
                                    var toSend = suggestedAdd;
                                    toSend.guids = [];
                                    if(source == "soundcloud") toSend.thumbnail = arr.thumbnail;
                                    io.to(coll).emit("suggested", toSend);
                                });
                            } else if(docs[0].now_playing === true){
                                socket.emit("toast", "alreadyplay");
                            } else{
                                if(conf[0].vote === false) vote(coll, id, guid, socket);
                                else socket.emit("toast", "listhaspass");
                            }
                        });
                    }
                } else {
                    if((arr.hasOwnProperty("offsiteAdd") && !arr.offsiteAdd) || !arr.hasOwnProperty("offsiteAdd")) {
                        socket.emit("auth_required");
                    } else {
                        socket.emit("toast", "listhaspass");
                    }
                }
            });
        });
    } else {
        var result = {
            arr: {
                expected: "object",
                got: typeof(arr)
            },
            duration: {
                expected: "number or string that can be cast to int",
                got: arr.hasOwnProperty("duration") ? typeof(arr.duration) : undefined,
            }
        };
        console.log(5, arr);
        socket.emit('update_required', result);
    }
}

function voteUndecided(msg, coll, guid, offline, socket) {
    var socketid = socket.zoff_id;
    if(typeof(msg) === 'object' && msg !== undefined && msg !== null){
        if(msg.hasOwnProperty("id")) msg.id = msg.id + "";
        if(!msg.hasOwnProperty("channel") || !msg.hasOwnProperty("id") ||
        !msg.hasOwnProperty("type") || typeof(msg.channel) != "string" ||
        typeof(msg.id) != "string" || typeof(msg.type) != "string") {
            var result = {
                channel: {
                    expected: "string",
                    got: msg.hasOwnProperty("channel") ? typeof(msg.channel) : undefined,
                },
                id: {
                    expected: "string",
                    got: msg.hasOwnProperty("id") ? typeof(msg.id) : undefined,
                },
                type: {
                    expected: "string",
                    got: msg.hasOwnProperty("type") ? typeof(msg.type) : undefined,
                },
                adminpass: {
                    expected: "adminpass",
                    got: msg.hasOwnProperty("adminpass") ? typeof(msg.adminpass) : undefined,
                },
                pass: {
                    expected: "string",
                    got: msg.hasOwnProperty("pass") ? typeof(msg.pass) : undefined,
                },
            };
            socket.emit('update_required', result);
            return;
        }
        coll = msg.channel.toLowerCase();//.replace(/ /g,'');
        coll = Functions.removeEmojis(coll).toLowerCase();
        //coll = filter.clean(coll);
        Functions.getSessionAdminUser(Functions.getSession(socket), coll, function(userpass, adminpass) {
            if(adminpass != "" || msg.adminpass == undefined) {
                msg.adminpass = Functions.hash_pass(adminpass);
            } else {
                msg.adminpass = Functions.hash_pass(Functions.hash_pass(Functions.decrypt_string(msg.adminpass), true));
            }
            if(userpass != "" || msg.pass == undefined) {
                msg.pass = userpass;
            } else if(msg.hasOwnProperty("pass")){
                msg.pass = crypto.createHash('sha256').update(Functions.decrypt_string(msg.pass)).digest("base64");
            }

            db.collection(coll + "_settings").find({id: "config"}, function(err, docs){
                if(docs.length > 0 && (docs[0].userpass == undefined || docs[0].userpass == "" || (msg.hasOwnProperty('pass') && docs[0].userpass == msg.pass))) {

                    Functions.check_inlist(coll, guid, socket, offline, undefined, "place 6");

                    if(msg.type == "del") {
                        del(msg, socket, socketid);
                    } else {
                        var id = msg.id;
                        var hash = msg.adminpass;
                        if(docs !== null && docs.length !== 0 && ((docs[0].vote === true && (hash == docs[0].adminpass || docs[0].adminpass === "")) ||
                        docs[0].vote === false)) {
                            vote(coll, id, guid, socket);
                        } else {
                            socket.emit("toast", "listhaspass");
                        }
                    }
                } else {
                    socket.emit("auth_required");
                }
            });
        });
    } else {
        var result = {
            msg: {
                expected: "object",
                got: typeof(msg)
            }
        };
        socket.emit('update_required', result);
    }
}

function shuffle(msg, coll, guid, offline, socket) {
    var socketid = socket.zoff_id;
    if(!msg.hasOwnProperty("channel") || typeof(msg.channel) != "string") {
        var result = {
            channel: {
                expected: "string",
                got: msg.hasOwnProperty("channel") ? typeof(msg.channel) : undefined,
            },
            adminpass: {
                expected: "string",
                got: msg.hasOwnProperty("adminpass") ? typeof(msg.adminpass) : undefined,
            },
            pass: {
                expected: "string",
                got: msg.hasOwnProperty("pass") ? typeof(msg.pass) : undefined,
            },
        };
        socket.emit('update_required', result);
        return;
    }
    coll = msg.channel.toLowerCase();//.replace(/ /g,'');
    coll = Functions.removeEmojis(coll).toLowerCase();
    //coll = filter.clean(coll);
    Functions.getSessionAdminUser(Functions.getSession(socket), coll, function(userpass, adminpass) {
        if(adminpass != "" || msg.adminpass == undefined) {
            msg.adminpass = Functions.hash_pass(adminpass);
        } else if(msg.adminpass != ""){
            msg.adminpass = Functions.hash_pass(Functions.hash_pass(Functions.decrypt_string(msg.adminpass),true));
        } else {
            msg.adminpass = "";
        }
        if(userpass != "" || msg.pass == undefined) {
            msg.pass = userpass;
        } else if(msg.hasOwnProperty("pass")) {
            msg.pass = crypto.createHash('sha256').update(Functions.decrypt_string(msg.pass)).digest("base64");
        }
        Functions.checkTimeout("shuffle", 5, coll, coll, "foo", "bar", socket, function() {
            Functions.check_inlist(coll, guid, socket, offline, undefined, "place 7");
            var hash = msg.adminpass;
            db.collection(coll + "_settings").find(function(err, docs){
                if(docs.length > 0 && (docs[0].userpass == undefined || docs[0].userpass == "" || (msg.hasOwnProperty('pass') && docs[0].userpass == msg.pass))) {
                    if(docs !== null && docs.length !== 0 && ((docs[0].adminpass == hash && docs[0].adminpass != "") || docs[0].shuffle === false))
                    {
                        db.collection(coll).find({now_playing:false}).forEach(function(err, docs){
                            if(!docs){
                                List.send_list(coll, undefined, false, true, false, true);
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
                    List.send_list(coll, undefined, false, true, false);
                    List.getNextSong(coll, undefined);
                }
            };
        });

    });
}

function del(params, socket, socketid) {
    if(params.id){
        var coll = Functions.removeEmojis(params.channel).toLowerCase();
        //coll = coll.replace(/_/g, "").replace(/ /g,'');

        //coll = filter.clean(coll);
        db.collection(coll + "_settings").find(function(err, docs){
            if(docs !== null && docs.length !== 0 && docs[0].adminpass == params.adminpass)
            {
                db.collection(coll).find({id:params.id}, function(err, docs){
                    var dont_increment = false;
                    if(docs[0]){
                        if(docs[0].type == "suggested"){
                            dont_increment = true;
                        }
                        db.collection(coll).remove({id:params.id}, function(err, docs){
                            socket.emit("toast", "deletesong");
                            io.to(coll).emit("channel", {type:"deleted", value: params.id});
                            if(!dont_increment) db.collection("frontpage_lists").update({_id: coll, count: {$gt: 0}}, {$inc: {count: -1}, $set:{accessed: Functions.get_time()}}, {upsert: true}, function(err, docs){});
                        });
                    }
                });

            }
        });
    }
}

function delete_all(msg, coll, guid, offline, socket) {
    var socketid = socket.zoff_id;
    if(typeof(msg) == 'object' ) {
        if(!msg.hasOwnProperty('channel') || typeof(msg.channel) != "string") {
            var result = {
                channel: {
                    expected: "string",
                    got: msg.hasOwnProperty("channel") ? typeof(msg.channel) : undefined,
                },
                adminpass: {
                    expected: "adminpass",
                    got: msg.hasOwnProperty("adminpass") ? typeof(msg.adminpass) : undefined,
                },
                pass: {
                    expected: "string",
                    got: msg.hasOwnProperty("pass") ? typeof(msg.pass) : undefined,
                },
            };
            socket.emit('update_required', result);
            return;
        }
        if(coll == undefined) {
            coll = msg.channel;
        }
        //coll = coll.replace(/ /g,'');
        coll = Functions.removeEmojis(coll).toLowerCase();
        //coll = filter.clean(coll);
        Functions.getSessionAdminUser(Functions.getSession(socket), coll, function(userpass, adminpass, gotten) {
            if(adminpass != "" || msg.adminpass == undefined) {
                msg.adminpass = Functions.hash_pass(adminpass);
            } else if(msg.adminpass != "") {
                msg.adminpass = Functions.hash_pass(Functions.hash_pass(Functions.decrypt_string(msg.adminpass),true));
            }
            if(userpass != "" || msg.pass == undefined) {
                msg.pass = userpass;
            } else {
                msg.pass = crypto.createHash('sha256').update(Functions.decrypt_string(msg.pass)).digest("base64");
            }
            var hash = msg.adminpass;
            var hash_userpass = msg.pass;
            db.collection(coll + "_settings").find(function(err, conf) {
                if(conf.length == 1 && conf) {
                    conf = conf[0];
                    if(conf.adminpass == hash && conf.adminpass != "" && (conf.userpass == "" || conf.userpass == undefined || (conf.userpass != "" && conf.userpass != undefined && conf.pass == hash_userpass))) {
                        db.collection(coll).remove({views: {$exists: false}, type: "video"}, {multi: true}, function(err, succ) {
                            List.send_list(coll, false, true, true, true);
                            db.collection("frontpage_lists").update({_id: coll}, {$set: {count: 0, accessed: Functions.get_time()}}, {upsert: true}, function(err, docs) {});
                            socket.emit("toast", "deleted_songs");
                        });
                    } else {
                        socket.emit("toast", "listhaspass");
                    }
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
        return;
    }
}

function vote(coll, id, guid, socket) {
    //coll = coll.replace(/ /g,'');
    db.collection(coll).find({id:id, now_playing: false, type:"video"}, function(err, docs){
        if(docs !== null && docs.length > 0 && !Functions.contains(docs[0].guids, guid))
        {
            db.collection(coll).update({id:id}, {$inc:{votes:1}, $set:{added:Functions.get_time()}, $push :{guids: guid}}, function(err, docs)
            {
                socket.emit("toast", "voted");
                io.to(coll).emit("channel", {type: "vote", value: id, time: Functions.get_time()});

                List.getNextSong(coll, undefined);
            });
        }else
        {
            socket.emit("toast", "alreadyvoted");
        }
    });
}

module.exports.addPlaylist = addPlaylist;
module.exports.addFromOtherList = addFromOtherList;
module.exports.add_function = add_function;
module.exports.voteUndecided = voteUndecided;
module.exports.shuffle = shuffle;
module.exports.del = del;
module.exports.delete_all = delete_all;
module.exports.vote = vote;
