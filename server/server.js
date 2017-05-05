var server;
var add = "";
const path = require('path');
const publicPath = path.join(__dirname, 'public');
var express = require('express');
var app = express();
var exphbs = require('express-handlebars');
var hbs = exphbs.create({
  defaultLayout: publicPath + '/layouts/main',
  layoutsDir: publicPath + '/layouts',
  partialsDir: publicPath + '/partials'
});
var uniqid = require('uniqid');
var mongo_db_cred = {config: 'mydb'};


app.engine('handlebars', hbs.engine);
//hbs.loadPartials(publicPath + "/layouts/");
app.set('view engine', 'handlebars');

app.set('views', publicPath);

try{
    var fs = require('fs');
    var privateKey  = fs.readFileSync('/etc/letsencrypt/live/zoff.me/privkey.pem').toString();
    var certificate = fs.readFileSync('/etc/letsencrypt/live/zoff.me/cert.pem').toString();
    var ca          = fs.readFileSync('/etc/letsencrypt/live/zoff.me/chain.pem').toString();
    var credentials = {
      key: privateKey,
      cert: certificate,
      ca: ca
    };

    var https = require('https');
    server = https.Server(credentials, app);

    var cors_proxy = require('cors-anywhere');

    cors_proxy.createServer({
        requireHeader: ['origin', 'x-requested-with'],
        removeHeaders: ['cookie', 'cookie2'],
        httpsOptions: credentials
    }).listen(8081, function() {
        console.log('Running CORS Anywhere on :' + 8081);
    });
}
catch(err){
    console.log("Starting without https (probably on localhost)");
    if(err.errno != 34)console.log(err);
    var cors_proxy = require('cors-anywhere');
    cors_proxy.createServer({
        requireHeader: ['origin', 'x-requested-with'],
        removeHeaders: ['cookie', 'cookie2'],
    }).listen(8081, function() {
        console.log('Running CORS Anywhere on :' + 8081);
    });
    var http = require('http');
    server = http.Server(app);
    add = ",http://localhost:80*,http://localhost:8080*,localhost:8080*, localhost:8082*,,http://zoff.dev:80*,http://zoff.dev:8080*,zoff.dev:8080*, zoff.dev:8082*";
}

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.use(cookieParser());

var io = require('socket.io')(server, {'pingTimeout': 25000, "origins": ("https://zoff.me:443*,https://zoff.me:8080*,zoff.me:8080*,https://remote.zoff.me:443*,https://remote.zoff.me:8080*,https://fb.zoff.me:443*,https://fb.zoff.me:8080*,https://admin.zoff.me:443*,https://admin.zoff.me:8080*" + add)});
var request = require('request');
var mongojs = require('mongojs');
var db = mongojs(mongo_db_cred.config);
var crypto = require('crypto');
var node_cryptojs = require('node-cryptojs-aes');
var router = require('./router.js');
var CryptoJS = node_cryptojs.CryptoJS;
var emojiStrip = require('emoji-strip');
var Filter = require('bad-words');
var filter = new Filter({ placeHolder: 'x'});

var port       = 8080;
var lists      = {};
var offline_users = [];
var unique_ids = [];
var names      = {names: []};
var locks      = {};
var skipped    = {};
var tot_view   = 0;



server.listen(port, function () {
    console.log('Server listening at port %d', port);
});


app.get('/robots.txt', function (req, res) {
    res.type('text/plain');
    res.send("User-agent: *\nAllow: /$\nDisallow: /");
});

app.use(function (req, res, next) {
  var cookie = req.cookies._uI;
  if (cookie === undefined) {
    var user_name = rndName(uniqid.time(), 15);
    res.cookie('_uI',user_name, { maxAge: 365 * 10000 * 3600000 });
  }
  next();
});

app.use('/service-worker.js', function(req, res) {
  res.sendFile(publicPath + '/service-worker.js');
});
app.use('/', router);
app.use('/assets', express.static(publicPath + '/assets'));



/*process.on('uncaughtException', function(e){
    console.log("\n" + new Date().toString() + "\n", e.stack || e);
    process.exit(1);
})*/

db.on('error',function(err) {
    console.log("\n" + new Date().toString() + "\n Database error: ", err);
});

io.on('connection', function(socket){
    socket.emit("get_list");

    var guid = hash_pass(socket.handshake.headers["user-agent"] + socket.handshake.address + socket.handshake.headers["accept-language"]);

    socket.on('close', function() {
        console.log("closing socket");
    });

    socket.on('ping', function() {
        socket.emit("ok");
    });

    var socketid = socket.id;
    var coll;
    var tot_lists = [];
    var in_list = false;
    var short_id = uniqueID(socketid,4);
    var offline = false;
    //names.push(name);
    unique_ids.push(short_id);
    var name;

    if(names[guid] === undefined){
        name = get_name(guid);
    }
    else
        name = names[guid];

    socket.on("get_userlists", function(id) {
      db.collection("frontpage_lists_" + id).find(function(err, docs) {
        socket.emit("userlists", [docs]);
      });
    });

    socket.on("get_spread", function(){
        socket.emit("spread_listeners", {offline: offline_users.length, total: tot_view, online_users: lists});
    });

    socket.on('suggest_thumbnail', function(msg){
        if(msg.thumbnail && msg.channel && msg.adminpass && msg.thumbnail.indexOf("i.imgur.com") > -1){
            msg.thumbnail = msg.thumbnail.replace(/^https?\:\/\//i, "");
            if(msg.thumbnail.substring(0,2) != "//") msg.thumbnail = "//" + msg.thumbnail;
            var channel = msg.channel.toLowerCase();
            var hash = hash_pass(decrypt_string(socketid, msg.adminpass));
            db.collection(channel).find({views:{$exists:true}}, function(err, docs){
                if(docs !== null && docs.length !== 0 && docs[0].adminpass !== "" && docs[0].adminpass == hash){
                    db.collection("suggested_thumbnails").update({channel: channel}, {$set:{thumbnail: msg.thumbnail}}, {upsert:true}, function(err, docs){
                        socket.emit("toast", "suggested_thumbnail");
                    });
                }
            });
        } else {
            socket.emit("toast", "thumbnail_denied");
        }
    });

    socket.on('suggest_description', function(msg){
        if(msg.description && msg.channel && msg.adminpass && msg.description.length < 100){
            var channel = msg.channel.toLowerCase();
            var hash = hash_pass(decrypt_string(socketid, msg.adminpass));
            db.collection(channel).find({views:{$exists:true}}, function(err, docs){
                if(docs !== null && docs.length !== 0 && docs[0].adminpass !== "" && docs[0].adminpass == hash){
                    db.collection("suggested_descriptions").update({channel: channel}, {$set:{description: msg.description}}, {upsert:true}, function(err, docs){
                        socket.emit("toast", "suggested_description");
                    });
                }
            });
        } else {
            socket.emit("toast", "description_denied");
        }
    });

    socket.on("offline", function(status){
        if(status){
          in_list = false;
          offline = true;
          if(coll !== undefined && lists[coll] !== undefined && contains(lists[coll], guid))
          {
              var index = lists[coll].indexOf(guid);
              if(index != -1)
              {
                  lists[coll].splice(index, 1);
                  //socket.leave(coll);
                  io.to(coll).emit("viewers", lists[coll].length);
                  //io.to(coll).emit('chat', {from: name, msg: " left"});
                  tot_view -= 1;
              }

                  remove_from_array(names.names, name);
                  delete names[guid];

          }

          remove_from_array(unique_ids, short_id);
          if(!contains(offline_users, guid) && coll != undefined)
          {
              offline_users.push(guid);
              tot_view += 1;
          }
        } else {
            offline = false;
            if(contains(offline_users, guid))
            {
                var index = offline_users.indexOf(guid);
                if(index != -1){
                    offline_users.splice(index, 1);
                    tot_view -= 1;
                }
            }
            check_inlist(coll, guid, socket, names[guid], offline);
        }
    });

    socket.on('namechange', function(data)
    {
        if(typeof(data) !== "string") return;
        data = encodeURIComponent(data).replace(/\W/g, '').replace(/[^\x00-\x7F]/g, "");
        old_name = names[guid];
        new_name = change_name(data, guid, name);
        if(new_name == name || new_name === false) return;
        else if(data.length < 9 && data.indexOf(" ") == -1 && data.length >= 4)
        {
            remove_from_array(names.names, old_name);
            delete names[guid];
            name = new_name;
            names[guid] = new_name;
            names.names.push(new_name);
            io.to(coll).emit('chat', {from: old_name, msg: " changed name to " + new_name});
            io.sockets.emit('chat.all', {from: old_name , msg: " changed name to " + new_name, channel: coll});
        }
    });

    socket.on("removename", function()
    {
        old_name = names[guid];
        new_name = rndName(guid, 8);
        if(old_name != new_name){
            name = new_name;
            names[guid] = name;
            remove_from_array(names.names, old_name);
            io.to(coll).emit('chat', {from: old_name,  msg: " changed name to " + new_name});
            io.sockets.emit('chat.all', {from: old_name , msg: " changed name to " + new_name, channel: coll});
        }
    });

    socket.on('chat', function (data) {
        if(typeof(data) !== 'string') return;
        check_inlist(coll, guid, socket, names[guid], offline);
        if(data !== "" && data !== undefined && data !== null &&
        data.length < 151 && data.replace(/\s/g, '').length){
            if(names[guid] === undefined){
                name = get_name(guid);
            } else name = names[guid];
            io.to(coll).emit('chat', {from: names[guid], msg: ": " + data});
        }
    });

    socket.on("all,chat", function(data)
    {
        if(typeof(data) !== 'string') return;
        check_inlist(coll, guid, socket, names[guid], offline);
        if(data !== "" && data !== undefined && data !== null &&
        data.length < 151 && data.replace(/\s/g, '').length){
            if(names[guid] === undefined){
                name = get_name(guid);
            } else name = names[guid];
            io.sockets.emit('chat.all', {from: names[guid], msg: ": " + data, channel: coll});
        }
    });

    socket.on('frontpage_lists', function()
    {

        var playlists_to_send = [];
        var i = 0;
        var viewers;
        in_list = false;

        db.collection("frontpage_lists").find({frontpage:true}, function(err, docs){
            var playlists_to_send = [];
            for(var x in docs){
                var pinned = 0;
                if(docs[x].pinned == 1) pinned = 1;
                try{viewers = lists[docs[x]._id].length;}
                catch(error){viewers = 0;}
                var to_push = {
                  viewers: viewers,
                  id: docs[x].id,
                  title: docs[x].title,
                  channel: docs[x]._id,
                  count: docs[x].count,
                  pinned: pinned,
                  accessed: docs[x].accessed != undefined ? docs[x].accessed : 0,
                  thumbnail: docs[x].thumbnail != undefined ? docs[x].thumbnail : "",
                  description: docs[x].description != undefined ? docs[x].description : ""
                };
                if(pinned == 1 && docs[x].count > 0) playlists_to_send.unshift(to_push);
                else if(docs[x].count > 0) playlists_to_send.push(to_push);
            }
            socket.emit("playlists", {channels: playlists_to_send, viewers: tot_view});
        });
    });

    socket.on('now_playing', function(list, fn)
    {
        if(typeof(list) !== 'string' || typeof(fn) !== 'function') return;
        db.collection(list).find({now_playing:true}, function(err, docs){
            if(docs.length === 0){
                fn("No song currently playing");
                return;
            }
            var title = docs[0].title;
            //socket.emit("now_playing", title);
            if(title === undefined) fn("No song currently playing");
            else fn(title);
        });
    });

    socket.on('id', function(arr)
    {
        if(typeof(arr) == 'object')
            io.to(arr.id).emit(arr.id, {type: arr.type, value: arr.value});
    });

    socket.on('list', function(msg)
    {
        if(typeof(msg) === 'object' && msg !== undefined && msg !== null && msg.hasOwnProperty("channel") && msg.hasOwnProperty('pass'))
        {
            var list = msg.channel;
            var pass = decrypt_string(socketid, msg.pass);
            db.collection(list).find({views: {$exists: true}}, function(err, docs) {
              if(docs.length == 0 || (docs.length > 0 && (docs[0].userpass == undefined || docs[0].userpass == "" || docs[0].userpass == pass))) {
                    if(docs.length > 0 && docs[0].hasOwnProperty('userpass') && docs[0].userpass != "" && docs[0].userpass == pass) {
                        socket.emit("auth_accepted", {value: true});
                    }
                    in_list = true;
                    coll = emojiStrip(list).toLowerCase();
                    //coll = decodeURIComponent(coll);
                    coll = coll.replace("_", "");
                    coll = encodeURIComponent(coll).replace(/\W/g, '');
                    coll = filter.clean(coll);
                    socket.join(coll);
                    socket.join(short_id);
                    socket.emit("id", short_id);
                    check_inlist(coll, guid, socket, name, offline);
                    io.to(coll).emit("viewers", lists[coll] == undefined ? 0 : lists[coll].length);
                    db.getCollectionNames(function(err, docs){
                        if(contains(docs, coll))
                        {
                            send_list(coll, socket, true, false, true);
                        }else{
                            db.createCollection(coll, function(err, docs){
                                db.collection(coll).insert({"addsongs":false, "adminpass":"", "allvideos":true, "frontpage":true, "longsongs":false, "removeplay": false, "shuffle": true, "skip": false, "skips": [], "startTime":get_time(), "views": [], "vote": false, "desc": ""}, function(err, docs){
                                    send_list(coll, socket, true, false, true);
                                    db.collection("frontpage_lists").insert({"_id": coll, "count" : 0, "frontpage": true, "accessed": get_time()});
                                });
                            });
                        }
                    });
              } else {
                  socket.emit("auth_required");
              }
            })
        }
    });

    socket.on('end', function(obj)
    {
        if(typeof(obj) !== 'object') return;
        id = obj.id;
        if(id !== undefined && id !== null && id !== "")
        {
            if(coll === undefined) {
                coll = obj.channel;
                coll = emojiStrip(coll).toLowerCase();
                //coll = decodeURIComponent(coll);
                coll = coll.replace("_", "");
                coll = encodeURIComponent(coll).replace(/\W/g, '');
                coll = filter.clean(coll);
            }
            check_inlist(coll, guid, socket, name, offline);
            db.collection(coll).find({now_playing:true}, function(err, np){
                if(err !== null) console.log(err);
                if(np !== null && np !== undefined && np.length == 1 && np[0].id == id){
                    db.collection(coll).find({views:{$exists:true}}, function(err, docs){
                        var startTime = docs[0].startTime;
                        if(docs[0].removeplay === true && startTime+parseInt(np[0].duration)<=get_time()+5)
                        {
                            db.collection(coll).remove({now_playing:true}, function(err, docs){
                                change_song_post(coll);
                            });
                        }else{
                            if(startTime+parseInt(np[0].duration)<=get_time()+5)
                            {
                                change_song(coll, false, id);
                            }
                        }
                    });
                }
            });
        }
    });

    socket.on('add', function(arr)
    {
        if(typeof(arr) === 'object' && arr !== undefined && arr !== null && arr !== "" && !isNaN(parseInt(arr.duration)))
        {
            //if(arr.length == 5) coll = arr[4];
            if(arr.list !== undefined) {
                coll = arr.list;
                coll = emojiStrip(coll).toLowerCase();
                //coll = decodeURIComponent(coll);
                coll = coll.replace("_", "");
                coll = encodeURIComponent(coll).replace(/\W/g, '');
                coll = filter.clean(coll);
            }

            check_inlist(coll, guid, socket, name, offline);

            var id = arr.id;
            var title = arr.title;
            var hash = hash_pass(decrypt_string(socketid, arr.adminpass));
            var duration = parseInt(arr.duration);
            var full_list = arr.playlist;
            var last = arr.num == arr.total - 1;
            var num = arr.num;
            var total = arr.total;
            db.collection(coll).find({views:{$exists:true}}, function(err, docs)
            {
                conf = docs;

                if(docs !== null && docs.length !== 0 && ((docs[0].addsongs === true && (hash == docs[0].adminpass || docs[0].adminpass === "")) ||
                    docs[0].addsongs === false))
                {
                    db.collection(coll).find({id:id, type:{$ne:"suggested"}}, function(err, docs){
                        if(docs !== null && docs.length === 0)
                        {
                            var guids = full_list === true ? [] : [guid];
                            var votes;
                            var added;
                            if(full_list) {
                                var time = get_time()-total;
                                time = time.toString();
                                var total_len = total.toString().length;
                                var now_len = num.toString().length;
                                var to_add = num.toString();
                                while(now_len < total_len) {
                                    to_add = "0" + to_add;
                                    now_len = to_add.length;
                                }
                                time = time.substring(0, time.length - total_len);
                                time = time + to_add;
                                time = parseInt(time);
                                added = time;
                                votes = 0;
                            } else {
                                added = get_time();
                                votes = 1;
                            }

                            db.collection(coll).find({now_playing:true}, function(err, docs){
                                if((docs !== null && docs.length === 0)){
                                    np = true;
                                    if(full_list && num === 0){
                                        np = true;
                                        //var time = get_time() - total - 1;
                                        time = time.toString();
                                        total += 1;
                                        var total_len = total.toString().length;
                                        var now_len = total.toString().length;
                                        var to_add = total.toString();
                                        while(now_len < total_len) {
                                            to_add = "0" + to_add;
                                            now_len = to_add.length;
                                        }
                                        time = time.substring(0, time.length - total_len);
                                        time = parseInt(time).toString() + to_add;
                                        time = parseInt(time);
                                        added = time;
                                        votes = 0;
                                    } else if(full_list) {
                                        np = false;
                                    }
                                } else
                                    np = false;
                                db.collection(coll).update({id: id}, {"added": added,"guids":guids,"id":id,"now_playing":np,"title":title,"votes":votes, "duration":duration}, {upsert: true}, function(err, docs){
                                        if(np)
                                        {
                                            send_list(coll, undefined, false, true, false);
                                            db.collection(coll).update({views:{$exists:true}}, {$set:{startTime: get_time()}});
                                            send_play(coll, undefined);
                                            //io.to(coll).emit("channel", "song_change", get_time()]);
                                            update_frontpage(coll, id, title);
                                            //io.to(coll).emit("channel", ["added", {"_id": "asd", "added":added,"guids":guids,"id":id,"now_playing":np,"title":title,"votes":votes, "duration":duration}]);
                                        } else {
                                            io.to(coll).emit("channel", {type: "added", value: {"_id": "asd", "added":added,"guids":guids,"id":id,"now_playing":np,"title":title,"votes":votes, "duration":duration}});
                                        }
                                        db.collection("frontpage_lists").update({_id:coll}, {$inc:{count:1}, $set:{accessed: get_time()}}, {upsert:true}, function(err, docs){});
                                });
                                if(!full_list)
                                    socket.emit("toast", "addedsong");
                                else if(full_list && last) {
                                    socket.emit("toast", "addedplaylist");
                                }
                            });
                        }else if(!full_list){
                            vote(coll, id, guid, socket, full_list, last);
                            if(full_list && last) {
                                socket.emit("toast", "addedplaylist");
                            }
                        } else if(full_list && last) {
                            socket.emit("toast", "addedplaylist");
                        }
                    });
                }else if(!full_list)
                {
                    db.collection(coll).find({id: id}, function(err, docs){
                        if(docs.length === 0){
                            db.collection(coll).update({id: id},
                                {$set:{
                                    "added":get_time(), "guids": [guid], "id":id, "now_playing": false, "title":title, "votes":1, "duration":duration, type:"suggested"}},
                                    {upsert:true}, function(err, docs){
                                socket.emit("toast", "suggested");
                                io.to(coll).emit("suggested", {id: id, title: title, duration: duration});
                            });
                        }else if(docs[0].now_playing === true){
                            socket.emit("toast", "alreadyplay");
                        }else{
                            if(conf[0].vote === false) vote(coll, id, guid, socket, full_list, last);
                            else socket.emit("toast", "listhaspass");
                        }
                    });
                    //socket.emit("toast", "listhaspass");
                }
            });
        }
    });

    socket.on('vote', function(msg)
    {
        if(typeof(msg) === 'object' && msg !== undefined && msg !== null)
        {
            check_inlist(coll, guid, socket, name, offline);

            if(msg.type == "del")
                del(msg, socket, socketid);
            else
            {
                var id = msg.id;
                var hash = hash_pass(decrypt_string(socketid, msg.adminpass));
                db.collection(coll).find({views:{$exists:true}}, function(err, docs){
                    if(docs !== null && docs.length !== 0 && ((docs[0].vote === true && (hash == docs[0].adminpass || docs[0].adminpass === "")) ||
                    docs[0].vote === false))
                    {
                        vote(coll, id, guid, socket, false, false);
                    }else{
                        socket.emit("toast", "listhaspass");
                    }
                });
            }
        }
    });

    socket.on('password', function(inp)
    {
        if(inp !== undefined && inp !== null && inp !== "")
        {
            pw = inp.password;
            opw = inp.password;
            coll = inp.channel;
            coll = emojiStrip(coll).toLowerCase();
            //coll = decodeURIComponent(coll);
            coll = coll.replace("_", "");
            coll = encodeURIComponent(coll).replace(/\W/g, '');
            coll = filter.clean(coll);

            uncrypted = pw;
            pw = decrypt_string(socketid, pw);

            check_inlist(coll, guid, socket, name, offline);

            if(inp.oldpass)
            {
                opw = inp.oldpass;
            }
            opw = decrypt_string(socketid, opw);

            db.collection(coll).find({views:{$exists:true}}, function(err, docs){
                if(docs !== null && docs.length !== 0)
                {
                    if(docs[0].adminpass === "" || docs[0].adminpass == hash_pass(opw))
                    {
                        db.collection(coll).update({views:{$exists:true}}, {$set:{adminpass:hash_pass(pw)}}, function(err, docs){
                            if(inp.oldpass)
                                socket.emit("toast", "changedpass");
                            else
                                socket.emit("toast", "correctpass");
                            socket.emit("pw", uncrypted);
                        });
                    }else
                        socket.emit("toast", "wrongpass");
                }
            });
        }
    });

    socket.on('skip', function(list)
    {
        //if(1==2)
        if(list !== undefined && list !== null && list !== "")
        {
            if(coll === undefined) {
                coll = list.channel;
                coll = emojiStrip(coll).toLowerCase();
                //coll = decodeURIComponent(coll);
                coll = coll.replace("_", "");
                coll = encodeURIComponent(coll).replace(/\W/g, '');
                coll = filter.clean(coll);
            }
            check_inlist(coll, guid, socket, name, offline);

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
                hash = hash_pass(decrypt_string(socketid, adminpass));
            else
                hash = "";

            db.collection(coll).find({views: {$exists:true}}, function(err, docs){
                if(docs !== null && docs.length !== 0)
                {
                    if(!docs[0].skip || (docs[0].adminpass == hash && docs[0].adminpass !== "") || error)
                    {
                        if((lists[coll].length/2 <= docs[0].skips.length+1 && !contains(docs[0].skips, guid) && lists[coll].length != 2) ||
                        (lists[coll].length == 2 && docs[0].skips.length+1 == 2 && !contains(docs[0].skips, guid)) ||
                        (docs[0].adminpass == hash && docs[0].adminpass !== "" && docs[0].skip))
                        {
                            //if(!locks[coll] || locks[coll] == undefined){
                                locks[coll] = true;
                                change_song(coll, error, video_id);
                                socket.emit("toast", "skip");
                                io.to(coll).emit('chat', {from: name, msg: " skipped"});
                            //}
                        }else if(!contains(docs[0].skips, guid)){
                            db.collection(coll).update({views:{$exists:true}}, {$push:{skips:guid}}, function(err, d){
                                if(lists[coll].length == 2)
                                    to_skip = 1;
                                else
                                    to_skip = (Math.ceil(lists[coll].length/2) - docs[0].skips.length-1);
                                socket.emit("toast", to_skip + " more are needed to skip!");
                                socket.broadcast.to(coll).emit('chat', {from: name, msg: " voted to skip"});
                            });
                        }else{
                            socket.emit("toast", "alreadyskip");
                        }
                    }else
                        socket.emit("toast", "noskip");
                }
            });
        }
    });

    socket.on('conf', function(params)
    {
        if(params !== undefined && params !== null && params !== "")
        {
            check_inlist(coll, guid, socket,name, offline);

            var voting = params.voting;
            var addsongs = params.addsongs;
            var longsongs = params.longsongs;
            var frontpage = params.frontpage;
            var allvideos = params.allvideos;
            var removeplay = params.removeplay;
            var adminpass = params.adminpass;
            var skipping = params.skipping;
            var shuffling = params.shuffling;
            var userpass = params.userpass;
            if(!params.userpass_changed && frontpage) {
              userpass = "";
            } else if(params.userpass_changed && userpass != "") {
              frontpage = false;
            }
            var description = "";
            var hash;
            if(params.description) description = params.description;

            if(adminpass !== "")
                hash = hash_pass(decrypt_string(socketid, adminpass));
            else
                hash = adminpass;

            db.collection(coll).find({views:{$exists:true}}, function(err, docs){
                if(docs !== null && docs.length !== 0 && docs[0].adminpass === "" || docs[0].adminpass == hash)
                {
                    db.collection(coll).update({views:{$exists:true}}, {
                        $set:{addsongs:addsongs,
                        allvideos:allvideos,
                        frontpage:frontpage,
                        skip:skipping,
                        vote:voting,
                        removeplay:removeplay,
                        shuffle:shuffling,
                        longsongs:longsongs,
                        adminpass:hash,
                        desc: description,
                        userpass: userpass,
                    }}, function(err, docs){
                        db.collection(coll).find({views:{$exists:true}}, function(err, docs){
                            if(docs[0].adminpass !== "") docs[0].adminpass = true;
                            if(docs[0].hasOwnProperty("userpass") && docs[0].userpass != "") docs[0].userpass = true;
                            else docs[0].userpass = false;
                            io.to(coll).emit("conf", docs);
                            socket.emit("toast", "savedsettings");

                            db.collection("frontpage_lists").update({_id: coll},
                                {$set:{frontpage:frontpage, accessed: get_time()}},
                                {upsert:true}, function(err, docs){});
                        });
                    });
                }else{
                    socket.emit("toast", "wrongpass");
                }
            });
        }
    });

    socket.on('shuffle', function(pass)
    {
        if(pass !== undefined && pass !== null)
        {
            check_inlist(coll, guid, socket, name, offline);
            var hash;
            if(pass === "") hash = pass;
            else hash = hash_pass(decrypt_string(socketid, pass));
            db.collection(coll).find({views:{$exists:true}}, function(err, docs){
                if(docs !== null && docs.length !== 0 && ((docs[0].adminpass == hash || docs[0].adminpass === "") || docs[0].shuffle === false))
                {
                    db.collection(coll).find({now_playing:false}).forEach(function(err, docs){
                        if(!docs){
                            send_list(coll, undefined, false, true, false, true);
                            socket.emit("toast", "shuffled");
                            return;
                        }else{
                            num = Math.floor(Math.random()*1000000);
                            db.collection(coll).update({id:docs.id}, {$set:{added:num}});
                        }
                    });
                }else
                    socket.emit("toast", "wrongpass");
            });

            var complete = function(tot, curr){
                if(tot == curr)
                {
                    send_list(coll, undefined, false, true, false);
                }
            };
        }else
            socket.emit("toast", "wrongpass");
    });

    socket.on('change_channel', function(obj)
    {
        if(coll === undefined && obj !== undefined && obj.channel !== undefined){
            coll = obj.channel;
            coll = emojiStrip(coll).toLowerCase();
            //coll = decodeURIComponent(coll);
            coll = coll.replace("_", "");
            coll = encodeURIComponent(coll).replace(/\W/g, '');
            coll = filter.clean(coll);
        }
        left_channel(coll, guid, name, short_id, in_list, socket, true);
    });

    socket.on('disconnect', function()
    {
        left_channel(coll, guid, name, short_id, in_list, socket, false);
    });

    socket.on('disconnected', function()
    {
        left_channel(coll, guid, name, short_id, in_list, socket, false);
    });

    socket.on('reconnect_failed', function()
    {
        left_channel(coll, guid, name, short_id, in_list, socket, false);
    });

    socket.on('connect_timeout', function()
    {
        left_channel(coll, guid, name, short_id, in_list, socket, false);
    });

    socket.on('error', function()
    {
        left_channel(coll, guid, name, short_id, in_list, socket, false);
    });

    socket.on('pos', function(obj)
    {
        if(coll === undefined) {
            coll = obj.channel;
            coll = emojiStrip(coll).toLowerCase();
            //coll = decodeURIComponent(coll);
            coll = coll.replace("_", "");
            coll = encodeURIComponent(coll).replace(/\W/g, '');
            coll = filter.clean(coll);
        }
        check_inlist(coll, guid, socket, name, offline);
        send_play(coll, socket);
    });

});

function decrypt_string(socket_id, pw){
    var decrypted = CryptoJS.AES.decrypt(
        pw,socket_id,
        {
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        }
    );

    return decrypted.toString(CryptoJS.enc.Utf8);
}

function left_channel(coll, guid, name, short_id, in_list, socket, change)
{
    if(lists[coll] !== undefined && contains(lists[coll], guid))
    {
        var index = lists[coll].indexOf(guid);
        if(index != -1)
        {
            lists[coll].splice(index, 1);
            socket.leave(coll);
            io.to(coll).emit("viewers", lists[coll].length);
            io.to(coll).emit('chat', {from: name, msg: " left"});
            tot_view -= 1;
        }
        if(!change) {
            remove_from_array(names.names, name);
            delete names[guid];
        }
    }
    if(contains(offline_users, guid))
    {
        var index = offline_users.indexOf(guid);
        if(index != -1){
            offline_users.splice(index, 1);
            tot_view -= 1;
        }
    }

    remove_from_array(unique_ids, short_id);
}

function remove_from_array(array, element){
    if(contains(array, element)){
        var index = array.indexOf(element);
        if(index != -1)
            array.splice(index, 1);
    }
}

function get_name(guid){
    if(names[guid] !== undefined) return names[guid];

    var name = rndName(guid, 8);
    while(contains(names.names, name)){
        name = name + "_";
    }

    names[guid] = name;
    names.names.push(name);
    return name;
}

function change_name(name, guid, oldname){

    if(name.length > 9) return oldname;

    if(names[guid] == name) return false;
    if(contains(names.names, name)){
        return change_name(name + "_", guid, oldname);
    }else{
        return name;
    }
}

function update_frontpage(coll, id, title)
{
    db.collection("frontpage_lists").update(
        {_id: coll},
        {$set:{id: id, title: title, accessed: get_time()}},
        {upsert: true}, function(err, returnDocs){});
}

function del(params, socket, socketid)
{
    if(params.id){
        var coll = emojiStrip(params.channel).toLowerCase();
        //coll = decodeURIComponent(coll);
        coll = coll.replace("_", "");
        coll = encodeURIComponent(coll).replace(/\W/g, '');
        coll = filter.clean(coll);
        db.collection(coll).find({views:{$exists:true}}, function(err, docs){
            if(docs !== null && docs.length !== 0 && docs[0].adminpass == hash_pass(decrypt_string(socketid, params.adminpass)))
            {
                db.collection(coll).find({id:params.id}, function(err, docs){
                    dont_increment = true;
                    if(docs[0]){
                        if(docs[0].type == "suggested"){
                            dont_increment = false;
                        }
                        db.collection(coll).remove({id:params.id}, function(err, docs){
                            socket.emit("toast", "deletesong");
                            io.to(coll).emit("channel", {type:"deleted", value: params.id});
                            if(dont_increment) db.collection("frontpage_lists").update({_id: coll}, {$inc: {count: -1}, $set:{accessed: get_time()}}, {upsert: true});
                        });
                    }
                });

            }
        });
    }
}

function check_inlist(coll, guid, socket, name, offline)
{
    if(!offline && coll != undefined){
        if(lists[coll] === undefined)
        {
            lists[coll] = [];
            lists[coll].push(guid);
            io.to(coll).emit("viewers", lists[coll].length);
            socket.broadcast.to(coll).emit('chat', {from: name, msg: " joined"});

            tot_view += 1;
        }else if(!contains(lists[coll], guid))
        {
            lists[coll].push(guid);
            io.to(coll).emit("viewers", lists[coll].length);
            socket.broadcast.to(coll).emit('chat', {from: name, msg: " joined"});
            tot_view += 1;
        }
    } else {
        if(!contains(offline_users, guid) && coll != undefined)
        {
            offline_users.push(guid);
            tot_view += 1;
        }
    }
}

function hash_pass(adminpass)
{
    return crypto.createHash('sha256').update(adminpass).digest('base64');
}

function vote(coll, id, guid, socket, full_list, last)
{
	db.collection(coll).find({id:id, now_playing: false}, function(err, docs){
		if(docs !== null && docs.length > 0 && !contains(docs[0].guids, guid))
		{
            db.collection(coll).update({id:id}, {$inc:{votes:1}, $set:{added:get_time()}, $push :{guids: guid}}, function(err, docs)
            {
                if((full_list && last) || (!full_list))
                    socket.emit("toast", "voted");
                io.to(coll).emit("channel", {type: "vote", value: id, time: get_time()});
            });
        }else
        {
          socket.emit("toast", "alreadyvoted");
        }
    });
}


function change_song(coll, error, id)
{
    db.collection(coll).find({views:{$exists:true}}, function(err, docs){
        var startTime = docs[0].startTime;
        if(docs !== null && docs.length !== 0)
        {
            db.collection(coll).aggregate([
                {$match:{views:{$exists: false}, type:{$ne: "suggested"}}},
                {$sort:{now_playing: -1, votes:-1, added:1, title: 1}},
                {$limit:2
            }], function(err, now_playing_doc){
                if((id && id == now_playing_doc[0].id) || !id) {
            //db.collection(coll).find({now_playing:true}, function(err, now_playing_doc){
                    if(error){
                        request('http://img.youtube.com/vi/'+now_playing_doc[0].id+'/mqdefault.jpg', function (err, response, body) {
                            if (err || response.statusCode == 404) {
                                db.collection(coll).remove({now_playing:true, id:id}, function(err, docs){
                                    var next_song;
                                    if(now_playing_doc.length == 2) next_song = now_playing_doc[1].id;
                                    change_song_post(coll, next_song);
                                    io.to(coll).emit("channel", {type: "deleted", value: now_playing_doc[0].id, removed: true});
                                    db.collection("frontpage_lists").update({_id: coll}, {$inc: {count: -1}, $set:{accessed: get_time()}}, {upsert: true}, function(err, docs){});
                                });
                            }else{
                                if(skipped[coll] != get_time()){
                                    skipped[coll] = get_time();
                                    db.collection(coll).update({now_playing:true, id:id},
                                        {$set:{
                                        now_playing:false,
                                        votes:0,
                                        guids:[]
                                    }},{multi:true}, function(err, docs){
                                        var next_song;
                                        if(now_playing_doc.length == 2) next_song = now_playing_doc[1].id;
                                        if(docs.n >= 1) change_song_post(coll, next_song);
                                    });
                                }
                            }
                        });

                    } else if(docs[0].removeplay === true){
                        db.collection(coll).remove({now_playing:true, id:id}, function(err, docs){
                            var next_song;
                            if(now_playing_doc.length == 2) next_song = now_playing_doc[1].id;
                            change_song_post(coll, next_song);
                            io.to(coll).emit("channel", {type: "deleted", value: now_playing_doc[0].id, removed: true});
                            db.collection("frontpage_lists").update({_id: coll}, {$inc: {count: -1}, $set:{accessed: get_time()}}, {upsert: true
                            }, function(err, docs){});
                        });
                    } else {
                        if(skipped[coll] != get_time()){
                            //skipped[coll] = get_time();
                            db.collection(coll).update({now_playing:true, id:id},
                                {$set:{
                                now_playing:false,
                                votes:0,
                                guids:[]
                            }},{multi:true}, function(err, docs){
                                var next_song;
                                if(now_playing_doc.length == 2) next_song = now_playing_doc[1].id;
                                if(docs.n >= 1) change_song_post(coll, next_song);
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

function change_song_post(coll, next_song)
{
    db.collection(coll).aggregate([
        {$match:{now_playing:false, type:{$ne: "suggested"}}},
        {$sort:{votes:-1, added:1, title: 1}},
        {$limit:1
    }], function(err, docs){
        if(docs !== null && docs.length > 0){
            var id = docs[0].id;
            if(next_song && next_song != id) {
                return;
            }
            db.collection(coll).update({id:id},
                {$set:{
                now_playing:true,
                votes:0,
                guids:[],
                added:get_time()
            }}, function(err, returnDocs){
                db.collection(coll).update({views:{$exists:true}},
                    {$set:{startTime:get_time(), skips:[]
                }}, function(err, returnDocs){
                    db.collection(coll).find({views:{$exists:true}}, function(err, conf){
                        io.to(coll).emit("channel", {type: "song_change", time: get_time(), remove: conf[0].removeplay});
                        send_play(coll);
                        locks[coll] = false;
                        update_frontpage(coll, docs[0].id, docs[0].title);
                    });
                });
            });
        }
    });
}

function send_list(coll, socket, send, list_send, configs, shuffled)
{
    db.collection(coll).find({views:{$exists:true}}, function(err, conf){
        db.collection(coll).find({views:{$exists:false}, type: {$ne: "suggested"}}, function(err, docs)
        {
            if(docs.length > 0) {
                db.collection(coll).find({now_playing: true}, function(err, np_docs) {
                    if(np_docs.length == 0) {
                        db.collection(coll).aggregate([
                            {$match:{views:{$exists: false}, type:{$ne: "suggested"}}},
                            {$sort:{now_playing: -1, votes:-1, added:1, title: 1}},
                            {$limit:1
                        }], function(err, now_playing_doc){
                            if(now_playing_doc[0].now_playing == false) {
                                db.collection(coll).update({id:now_playing_doc[0].id},
                                    {$set:{
                                    now_playing:true,
                                    votes:0,
                                    guids:[],
                                    added:get_time()
                                }}, function(err, returnDocs){
                                    db.collection(coll).update({views:{$exists:true}},
                                        {$set:{startTime:get_time(), skips:[]
                                    }}, function(err, returnDocs){
                                        update_frontpage(coll, now_playing_doc[0].id, now_playing_doc[0].title);
                                        send_list(coll, socket, send, list_send, configs, shuffled);
                                    });
                                });
                            }
                        });
                    } else {
                        if(list_send)
                            io.to(coll).emit("channel", {type: "list", playlist: docs, shuffled: shuffled});
                        else if(!list_send)
                            socket.emit("channel", {type: "list", playlist: docs, shuffled: shuffled});
                        if(socket === undefined && send)
                            send_play(coll);
                        else if(send)
                            send_play(coll, socket);
                    }
                });
            } else {
                if(list_send)
                    io.to(coll).emit("channel", {type: "list", playlist: docs, shuffled: shuffled});
                else if(!list_send)
                    socket.emit("channel", {type: "list", playlist: docs, shuffled: shuffled});
                if(socket === undefined && send)
                    send_play(coll);
                else if(send)
                    send_play(coll, socket);
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

function send_play(coll, socket)
{
    db.collection(coll).find({now_playing:true}, function(err, np){
        db.collection(coll).find({views:{$exists:true}}, function(err, conf){

            if(err !== null) console.log(err);
            try{
                if(get_time()-conf[0].startTime > np[0].duration){
                    change_song(coll, false, np[0].id);
                }else if(conf !== null && conf !== undefined && conf.length !== 0)
                {
                    if(conf[0].adminpass !== "") conf[0].adminpass = true;
                    if(conf[0].hasOwnProperty("userpass") && conf[0].userpass != "") conf[0].userpass = true;
                    else conf[0].userpass = false;
                    toSend = {np: np, conf: conf, time: get_time()};
                    if(socket === undefined)
                        io.to(coll).emit("np", toSend);
                    else{
                        socket.emit("np", toSend);
                    }
                }
            }catch(e){
                socket.emit("np", {});
            }
        });
    });
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

function rndName(seed, len) {
    var vowels = ['a', 'e', 'i', 'o', 'u'];
    consts =  ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w', 'x', 'y'];
    //len = 8;
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

function uniqueID(seed, minlen){
    var len = minlen;
    var id = rndName(seed, minlen);

    while( contains(unique_ids, id) && len<=8){
        id = rndName(String(len)+id, len);
        len += 0.1;                        // try 10 times at each length
    }
    return id;
}