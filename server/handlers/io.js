var cookieParser = require("cookie-parser");
var cookie = require("cookie");

var Functions = require(pathThumbnails + '/handlers/functions.js');
var ListChange = require(pathThumbnails + '/handlers/list_change.js');
var Chat = require(pathThumbnails + '/handlers/chat.js');
var List = require(pathThumbnails + '/handlers/list.js');
var Suggestions = require(pathThumbnails + '/handlers/suggestions.js');
var ListSettings = require(pathThumbnails + '/handlers/list_settings.js');
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

module.exports = function() {
    io.on('connection', function(socket){
        try {
            var parsedCookies = cookie.parse(socket.handshake.headers.cookie);
            socket.cookie_id = parsedCookies["_uI"];
            //return socket.guid;
        } catch(e) {
            socket.cookie_id = "empty";
        }
        socket.zoff_id = socket.id;
        socket.emit("get_list");

        var guid = socket.cookie_id;
        if(guid == "empty" || guid == null || guid == undefined) guid = Functions.hash_pass(socket.handshake.headers["user-agent"] + socket.handshake.address + socket.handshake.headers["accept-language"]);

        socket.guid = guid;
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
        Chat.get_name(guid, {announce: false, socket: socket});
        var offline = false;
        var chromecast_object = false;

        socket.emit("guid", guid);

        socket.on('self_ping', function(msg) {

            var channel = msg.channel;
            if(channel.indexOf("?") > -1){
                channel = channel.substring(0, channel.indexOf("?"));
            }
            if(msg.hasOwnProperty("channel")) {
                msg.channel = Functions.encodeChannelName(msg.channel);
            }
            //channel = channel.replace(/ /g,'');
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

        socket.on("logout", function() {
            Functions.removeSessionAdminPass(Functions.getSession(socket), coll, function() {})
        });

        socket.on('next_song', function(obj) {
            if(obj == undefined || !obj.hasOwnProperty("channel")) return;
            db.collection(obj.channel + "_settings").find(function(e, docs) {
                if(docs.length == 0) return;
                var pass = "";
                if(obj.hasOwnProperty("pass")) {
                    pass = crypto.createHash('sha256').update(Functions.decrypt_string(obj.pass)).digest("base64");
                }
                if((docs.length > 0 && (docs[0].userpass == undefined || docs[0].userpass == "" || docs[0].userpass == pass))) {
                    List.getNextSong(obj.channel, socket);
                }
            });
        });

        socket.on('chromecast', function(msg) {
            try {
                if(typeof(msg) == "object" && msg.hasOwnProperty("guid") &&
                msg.hasOwnProperty("socket_id") && msg.hasOwnProperty("channel") && typeof(msg.guid) == "string" &&
                typeof(msg.channel) == "string" && typeof(msg.socket_id) == "string" && msg.channel != "") {
                    if(msg.hasOwnProperty("channel")) {
                        msg.channel = Functions.encodeChannelName(msg.channel);
                    }
                    db.collection("connected_users").find({"_id": msg.channel}, function(err, connected_users_channel) {
                        if(connected_users_channel.length > 0 && connected_users_channel[0].users.indexOf(msg.guid) > -1) {
                            coll = msg.channel.toLowerCase();//.replace(/ /g,'');
                            coll = Functions.removeEmojis(coll).toLowerCase();
                            //coll = filter.clean(coll);
                            if(coll.indexOf("?") > -1){
                                coll = coll.substring(0, coll.indexOf("?"));
                            }
                            Functions.setChromecastHost(socket.cookie_id, msg.socket_id, msg.channel, function(results) {
                            });
                            //socket.cookie_id = msg.guid;
                            guid = msg.guid;
                            socketid = msg.socket_id;
                            socket.zoff_id = socketid;

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
            socket.emit("id_chromecast", {cookie_id: Functions.getSession(socket), guid: guid});
        });

        socket.on("error_video", function(msg) {
            try {
                var _list = msg.channel;//.replace(/ /g,'');
                if(_list.length == 0) return;
                if(_list.indexOf("?") > -1){
                    _list = _list.substring(0, _list.indexOf("?"));
                    msg.channel = _list;
                }
                coll = Functions.removeEmojis(_list).toLowerCase();
                //coll = coll.replace(/_/g, "");
                msg.channel = Functions.encodeChannelName(msg.channel);
                //coll = filter.clean(coll);
            } catch(e) {
                return;
            }
            if(msg.hasOwnProperty("channel")) {
                msg.channel = Functions.encodeChannelName(msg.channel);
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
            if(msg.hasOwnProperty("channel") && msg.channel.indexOf("?") > -1){
                var _list = msg.channel.substring(0, msg.channel.indexOf("?"));
                msg.channel = _list;
            }
            if(msg.hasOwnProperty("channel")) {
                msg.channel = Functions.encodeChannelName(msg.channel);
            }
            Suggestions.thumbnail(msg, coll, guid, offline, socket);
        });

        socket.on('suggest_description', function(msg){
            if(msg.hasOwnProperty("channel") && msg.channel.indexOf("?") > -1){
                var _list = msg.channel.substring(0, msg.channel.indexOf("?"));
                msg.channel = _list;
            }
            if(msg.hasOwnProperty("channel")) {
                msg.channel = Functions.encodeChannelName(msg.channel);
            }
            Suggestions.description(msg, coll, guid, offline, socket);
        });

        socket.on("namechange", function(msg) {
            if(msg.hasOwnProperty("channel") && msg.channel.indexOf("?") > -1){
                var _list = msg.channel.substring(0, msg.channel.indexOf("?"));
                msg.channel = _list;
            }
            if(msg.hasOwnProperty("channel")) {
                msg.channel = Functions.encodeChannelName(msg.channel);
            }
            Chat.namechange(msg, guid, socket);
        });

        socket.on("removename", function(msg) {
            if(msg.hasOwnProperty("channel") && msg.channel.indexOf("?") > -1){
                var _list = msg.channel.substring(0, msg.channel.indexOf("?"));
                msg.channel = _list;
            }
            if(msg.hasOwnProperty("channel")) {
                msg.channel = Functions.encodeChannelName(msg.channel);
            }
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
            if(msg.hasOwnProperty("channel") && msg.channel.indexOf("?") > -1){
                var _list = msg.channel.substring(0, msg.channel.indexOf("?"));
                msg.channel = _list;
            }
            if(msg.hasOwnProperty("channel")) {
                msg.channel = Functions.encodeChannelName(msg.channel);
            }
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
            var channel = msg.channel;//.replace(/ /g,'');
            if(status){
                in_list = false;
                offline = true;
                if(channel != "") coll = channel;
                if(coll !== undefined) {
                    coll = Functions.removeEmojis(coll).toLowerCase();
                    //coll = filter.clean(coll);
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
                                db.collection("connected_users").update({"_id": "offline_users"}, {$addToSet: {users: guid}}, {upsert: true}, function(err, docs) {
                                    if(docs.nModified == 1 && (coll != undefined && coll != "")) {
                                        db.collection("connected_users").update({"_id": "total_users"}, {$addToSet: {total_users: guid + coll}}, function(err, docs) {});
                                    }
                                });
                            });
                        }
                        Functions.remove_name_from_db(guid);
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
            if(msg.hasOwnProperty("channel") && msg.channel.indexOf("?") > -1){
                var _list = msg.channel.substring(0, msg.channel.indexOf("?"));
                msg.channel = _list;
            }
            if(msg.hasOwnProperty("channel")) {
                msg.channel = Functions.encodeChannelName(msg.channel);
            }
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
            if(msg.hasOwnProperty("channel") && msg.channel.indexOf("?") > -1){
                var _list = msg.channel.substring(0, msg.channel.indexOf("?"));
                msg.channel = _list;
            }
            if(msg.hasOwnProperty("channel")) {
                msg.channel = Functions.encodeChannelName(msg.channel);
            }
            Chat.chat(msg, guid, offline, socket);
        });

        socket.on("all,chat", function(data)
        {
            if(data.hasOwnProperty("channel") && data.channel.indexOf("?") > -1){
                var _list = data.channel.substring(0, data.channel.indexOf("?"));
                data.channel = _list;
            }
            if(data.hasOwnProperty("channel")) {
                data.channel = Functions.encodeChannelName(data.channel);
            }
            Chat.all_chat(data, guid, offline, socket);
        });

        socket.on('frontpage_lists', function(msg)
        {
            if(msg.hasOwnProperty("channel") && msg.channel.indexOf("?") > -1){
                var _list = msg.channel.substring(0, msg.channel.indexOf("?"));
                msg.channel = _list;
            }
            if(msg.hasOwnProperty("channel")) {
                msg.channel = Functions.encodeChannelName(msg.channel);
            }
            Frontpage.frontpage_lists(msg, socket);
        });

        socket.on('import_zoff', function(msg) {
            if(msg.hasOwnProperty("channel") && msg.channel.indexOf("?") > -1){
                var _list = msg.channel.substring(0, msg.channel.indexOf("?"));
                msg.channel = _list;
            }
            if(msg.hasOwnProperty("channel")) {
                msg.channel = Functions.encodeChannelName(msg.channel);
            }
            ListChange.addFromOtherList(msg, guid, offline, socket);
        })

        socket.on('now_playing', function(list, fn)
        {
            List.now_playing(list, fn, socket);
        });

        socket.on('id', function(arr)
        {
            if(arr.hasOwnProperty("channel") && arr.channel.indexOf("?") > -1){
                var _list = arr.channel.substring(0, arr.channel.indexOf("?"));
                arr.channel = _list;
            }
            if(arr.hasOwnProperty("channel")) {
                arr.channel = Functions.encodeChannelName(arr.channel);
            }
            if(typeof(arr) == 'object')
            io.to(arr.id).emit(arr.id.toLowerCase(), {type: arr.type, value: arr.value});
        });

        socket.on('list', function(msg)
        {
            if(msg.hasOwnProperty("channel") && msg.channel.indexOf("?") > -1){
                var _list = msg.channel.substring(0, msg.channel.indexOf("?"));
                msg.channel = _list;
            }
            if(msg.hasOwnProperty("channel")) {
                msg.channel = Functions.encodeChannelName(msg.channel);
            }
            try {
                //var _list = msg.channel.replace(/ /g,'');
                var _list = msg.channel;
                if(_list.length == 0) return;
                if(_list.indexOf("?") > -1){
                    _list = _list.substring(0, _list.indexOf("?"));
                    msg.channel = _list;
                }
                coll = Functions.removeEmojis(_list).toLowerCase();
                //coll = coll.replace(/_/g, "");
                //
                //coll = filter.clean(coll);
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
            if(obj.hasOwnProperty("channel") && obj.channel.indexOf("?") > -1){
                var _list = obj.channel.substring(0, obj.channel.indexOf("?"));
                obj.channel = _list;
            }
            if(obj.hasOwnProperty("channel")) {
                obj.channel = Functions.encodeChannelName(obj.channel);
            }
            if(coll === undefined) {
                try {
                    coll = obj.channel.toLowerCase();//.replace(/ /g,'');
                    if(coll.length == 0) return;
                    coll = Functions.removeEmojis(coll).toLowerCase();
                    //coll = coll.replace(/_/g, "");

                    //coll = filter.clean(coll);
                } catch(e) {
                    return;
                }
            }
            List.end(obj, coll, guid, offline, socket);
        });

        socket.on('addPlaylist', function(arr) {
            if(arr.hasOwnProperty("channel") && arr.channel.indexOf("?") > -1){
                var _list = arr.channel.substring(0, arr.channel.indexOf("?"));
                arr.channel = _list;
            }
            if(arr.hasOwnProperty("channel")) {
                arr.channel = Functions.encodeChannelName(arr.channel);
            }
            ListChange.addPlaylist(arr, guid, offline, socket);
        })

        socket.on('add', function(arr)
        {
            if(arr.hasOwnProperty("list") && arr.list.indexOf("?") > -1){
                var _list = arr.list.substring(0, arr.list.indexOf("?"));
                arr.list = _list;
            }
            if(arr.hasOwnProperty("list")) {
                arr.list = Functions.encodeChannelName(arr.list);
            }
            if(coll !== undefined) {
                try {
                    coll = arr.list;//.replace(/ /g,'');
                    if(coll.length == 0) return;
                    coll = Functions.removeEmojis(coll).toLowerCase();
                    //coll = coll.replace(/_/g, "");

                    //coll = filter.clean(coll);
                } catch(e) {
                    return;
                }
            }
            ListChange.add_function(arr, coll, guid, offline, socket);
        });

        socket.on('delete_all', function(msg) {
            try {
                if(msg.hasOwnProperty("channel") && msg.channel.indexOf("?") > -1){
                    var _list = msg.channel.substring(0, msg.channel.indexOf("?"));
                    msg.channel = _list;
                }
                if(msg.hasOwnProperty("channel")) {
                    msg.channel = Functions.encodeChannelName(msg.channel);
                }
                coll = msg.channel.toLowerCase();//.replace(/ /g,'');
                if(coll.length == 0) return;
                coll = Functions.removeEmojis(coll).toLowerCase();
                //coll = coll.replace(/_/g, "");

                //coll = filter.clean(coll);
            } catch(e) {
                return;
            }

            ListChange.delete_all(msg, coll, guid, offline, socket);
        });

        socket.on('vote', function(msg)
        {
            if(msg.hasOwnProperty("channel") && msg.channel.indexOf("?") > -1){
                var _list = msg.channel.substring(0, msg.channel.indexOf("?"));
                msg.channel = _list;
            }
            if(msg.hasOwnProperty("channel")) {
                msg.channel = Functions.encodeChannelName(msg.channel);
            }
            if(coll !== undefined) {
                try {
                    coll = msg.channel.toLowerCase();//.replace(/ /g,'');
                    if(coll.length == 0) return;
                    coll = Functions.removeEmojis(coll).toLowerCase();
                    //coll = coll.replace(/_/g, "");

                    //coll = filter.clean(coll);
                } catch(e) {
                    return;
                }
            }
            ListChange.voteUndecided(msg, coll, guid, offline, socket);
        });

        socket.on('password', function(inp)
        {
            if(inp.hasOwnProperty("channel") && inp.channel.indexOf("?") > -1){
                var _list = inp.channel.substring(0, inp.channel.indexOf("?"));
                inp.channel = _list;
            }
            if(inp.hasOwnProperty("channel")) {
                inp.channel = Functions.encodeChannelName(inp.channel);
            }
            //if(coll != undefined) coll.replace(/ /g,'');
            ListSettings.password(inp, coll, guid, offline, socket);
        });

        socket.on('skip', function(list)
        {
            if(list.hasOwnProperty("channel") && list.channel.indexOf("?") > -1){
                var _list = list.channel.substring(0, list.channel.indexOf("?"));
                list.channel = _list;
                coll = list.channel;
            }
            if(list.hasOwnProperty("channel")) {
                list.channel = Functions.encodeChannelName(list.channel);
            }
            //if(coll != undefined) coll.replace(/ /g,'');
            List.skip(list, guid, coll, offline, socket);
        });

        socket.on('conf', function(conf)
        {
            if(conf.hasOwnProperty("channel") && conf.channel.indexOf("?") > -1){
                var _list = conf.channel.substring(0, conf.channel.indexOf("?"));
                conf.channel = _list;
                coll = conf.channel;
            }
            if(conf.hasOwnProperty("channel")) {
                conf.channel = Functions.encodeChannelName(conf.channel);
            }
            //if(coll != undefined) coll.replace(/ /g,'');
            ListSettings.conf_function(conf, coll, guid, offline, socket);
        });

        socket.on('shuffle', function(msg)
        {
            if(msg.hasOwnProperty("channel") && msg.channel.indexOf("?") > -1){
                var _list = msg.channel.substring(0, msg.channel.indexOf("?"));
                msg.channel = _list;
            }
            if(msg.hasOwnProperty("channel")) {
                msg.channel = Functions.encodeChannelName(msg.channel);
            }
            if(coll !== undefined) {
                try {
                    coll = msg.channel.toLowerCase();//.replace(/ /g,'');
                    if(coll.length == 0) return;
                    coll = Functions.removeEmojis(coll).toLowerCase();
                    //coll = coll.replace(/_/g, "");

                    //coll = filter.clean(coll);
                } catch(e) {
                    return;
                }
            }
            ListChange.shuffle(msg, coll, guid, offline, socket);
        });

        socket.on('change_channel', function(obj)
        {
            if(obj == undefined && coll != undefined) {
                obj = {};
                obj.channel = coll;
            } else if(obj != undefined && obj.hasOwnProperty("channel") && obj.channel.indexOf("?") > -1){
                var _list = obj.channel.substring(0, obj.channel.indexOf("?"));
                obj.channel = _list;
            }
            if(obj == undefined && coll == undefined) {
                return;
            }
            if(obj.hasOwnProperty("channel")) {
                obj.channel = Functions.encodeChannelName(obj.channel);
            }
            if(coll === undefined && obj !== undefined && obj.channel !== undefined){
                try {
                    coll = obj.channel.toLowerCase();//.replace(/ /g,'');
                    if(coll.length == 0) return;
                    coll = Functions.removeEmojis(coll).toLowerCase();
                    //coll = coll.replace(/_/g, "");

                    //coll = filter.clean(coll);
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
            if(msg.hasOwnProperty("channel") && msg.channel.indexOf("?") > -1){
                var _list = msg.channel.substring(0, msg.channel.indexOf("?"));
                msg.channel = _list;
            }
            if(msg.hasOwnProperty("channel")) {
                msg.channel = Functions.encodeChannelName(msg.channel);
            }
            if(msg.hasOwnProperty("channel") && msg.channel != "" && typeof(msg.channel) == "string") {
                coll = msg.channel;//.replace(/ /g,'');
                coll = Functions.removeEmojis(coll).toLowerCase();
                //coll = filter.clean(coll);
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
            if(obj != undefined && obj.hasOwnProperty("channel") && obj.channel.indexOf("?") > -1){
                var _list = obj.channel.substring(0, obj.channel.indexOf("?"));
                obj.channel = _list;
            }
            if(obj != undefined && obj.hasOwnProperty("channel")) {
                obj.channel = Functions.encodeChannelName(obj.channel);
            }
            if(obj == undefined && coll == undefined) {
                return;
            }
            if(coll !== undefined) {
                try {
                    coll = obj.channel.toLowerCase();//.replace(/ /g,'');
                    if(coll.length == 0) return;
                    coll = Functions.removeEmojis(coll).toLowerCase();
                    //coll = coll.replace(/_/g, "");

                    //coll = filter.clean(coll);
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
            if(coll == undefined) return;
            db.collection(coll + "_settings").find(function(err, docs) {
                Functions.getSessionAdminUser(Functions.getSession(socket), coll, function(userpass, adminpass) {
                    if(userpass != "" || obj.pass == undefined) {
                        obj.pass = userpass;
                    }
                    if(docs.length > 0 && (docs[0].userpass == undefined || docs[0].userpass == "" || (obj.hasOwnProperty('pass') && docs[0].userpass == crypto.createHash('sha256').update(Functions.decrypt_string(obj.pass)).digest("base64")))) {
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
