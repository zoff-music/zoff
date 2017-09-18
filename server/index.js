var mongo_db_cred = {config: 'mydb'};
var mongojs = require('mongojs');
var db = mongojs(mongo_db_cred.config);

db.on('connected', function(err) {
	console.log("connected");
})

db.on('error',function(err) {
	console.log("\n" + new Date().toString() + "\n Database error: ", err);
});

VERSION = 3;

var server;
var add = "";
const path = require('path');
const publicPath = path.join(__dirname, 'public');
pathThumbnails = __dirname;
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
//app.enable('view cache');
app.set('views', publicPath);

try{
	var fs = require('fs');
	var privateKey  = fs.readFileSync('/etc/letsencrypt/live/zoff.me-0002/privkey.pem').toString();
	var certificate = fs.readFileSync('/etc/letsencrypt/live/zoff.me-0002/cert.pem').toString();
	var ca          = fs.readFileSync('/etc/letsencrypt/live/zoff.me-0002/chain.pem').toString();
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
	add = ",http://localhost:80*,http://localhost:8080*,localhost:8080*, localhost:8082*,http://zoff.dev:80*,http://zoff.dev:8080*,zoff.dev:8080*, zoff.dev:8082*";
}

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	extended: true
}));
app.use(cookieParser());

/* Starting DB and socketio */
var io = require('socket.io')(server, {
	pingTimeout: 25000,
}); //, "origins": ("https://zoff.me:443*,https://zoff.me:8080*,zoff.me:8080*,https://remote.zoff.me:443*,https://remote.zoff.me:8080*,https://fb.zoff.me:443*,https://fb.zoff.me:8080*,https://admin.zoff.me:443*,https://admin.zoff.me:8080*" + add)});
var request = require('request');
var uniqid = require('uniqid');

var crypto = require('crypto');
var node_cryptojs = require('node-cryptojs-aes');
var CryptoJS = node_cryptojs.CryptoJS;
var emojiStrip = require('emoji-strip');
var Filter = require('bad-words');
var filter = new Filter({ placeHolder: 'x'});

var router = require('./routing/router.js');
var port = 8080;

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

db.on('error',function(err) {
	console.log("\n" + new Date().toString() + "\n Database error: ", err);
});

/* Resetting usernames, and connected users */
db.collection("unique_ids").update({"_id": "unique_ids"}, {$set: {unique_ids: []}}, {multi: true, upsert: true}, function(err, docs){});
db.collection("user_names").remove({"guid": {$exists: true}}, {multi: true, upsert: true}, function(err, docs){});
db.collection("user_names").update({"_id": "all_names"}, {$set: {names: []}}, {multi: true, upsert: true}, function(err, docs){});
db.collection("connected_users").update({users: {$exists: true}}, {$set: {users: []}}, {multi: true, upsert: true}, function(err, docs){});
db.collection("connected_users").update({"_id": "total_users"}, {$set: {total_users: 0}}, {multi: true, upsert: true}, function(err, docs) {});
db.collection("frontpage_lists").update({viewers: {$ne: 0}}, {$set: {"viewers": 0}}, {multi: true, upsert: true}, function(err, docs) {});

io.on('connection', function(socket){
	socket.zoff_id = socket.id;
	socket.emit("get_list");

	var guid = hash_pass(socket.handshake.headers["user-agent"] + socket.handshake.address + socket.handshake.headers["accept-language"]);

	socket.on('close', function() {
		console.log("closing socket");
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
	get_name(guid, {announce: false});
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
		/*if(name != "") {
			db.collection("user_names").update({"_id": "all_names"}, {$addToSet: {names: name}}, {upsert: true}, function(err, updated) {
				if(updated.nModified == 1) {
					db.collection("user_names").update({"guid": guid}, {$set: {name: name}}, {upsert:true}, function(err, update){});
				}
			});
		}*/
		db.collection("connected_users").update({"_id": "total_users"}, {$inc: {total_users: 1}}, {upsert: true}, function(err, docs){});
	});

	socket.on('chromecast', function(msg) {
		try {
			if(typeof(msg) == "object" && msg.hasOwnProperty("guid") && msg.hasOwnProperty("socket_id") && msg.hasOwnProperty("channel")) {
				db.collection("connected_users").find({"_id": msg.channel}, function(err, connected_users_channel) {
					if(connected_users_channel.length > 0 && connected_users_channel[0].users.indexOf(msg.guid) > -1) {
						guid = msg.guid;
						socketid = msg.socket_id;
						socket.zoff_id = socketid;
						coll = msg.channel;
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

	socket.on("get_spread", function(){
		db.collection("connected_users").find({"_id": "total_users"}, function(err, tot) {
            db.collection("connected_users").find({"_id": "offline_users"}, function(err, off) {
				db.collection("connected_users").find({"_id": {$ne: "total_users"}, "_id": {$ne: "offline_users"}}, function(err, users_list) {
                    if(tot.length > 0 && off.length == 0) {
                        socket.emit("spread_listeners", {offline: 0, total: tot[0].total_users, online_users: users_list});
                    } else if(tot.length > 0 && off.length > 0){
						socket.emit("spread_listeners", {offline: off[0].users.length, total: tot[0].total_users, online_users: users_list});
					}
				});
            });
		});
	});

	socket.on('suggest_thumbnail', function(msg){
		thumbnail(msg, coll, guid, offline, socket);
	});

	socket.on('suggest_description', function(msg){
		description(msg, coll, guid, offline, socket);
	});

	socket.on("offline", function(msg){
		if(!msg.hasOwnProperty('status') && !msg.hasOwnProperty('channel')) {
			socket.emit("update_required");
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
				}, function(err, updated) {
					if(updated.nModified > 0) {
						io.to(coll).emit("viewers", updated.users);
						db.collection("connected_users").update({"_id": "total_users"}, {$inc: {total_users: -1}}, function(err, docs){});
					}
					remove_name_from_db(guid, name);
				});
			}

			remove_unique_id(short_id);

			db.collection("connected_users").update({"_id": "offline_users"}, {$addToSet: {users: guid}}, function(err, docs) {});
			db.collection("connected_users").update({"_id": "total_users"}, {$inc: {total_users: 1}}, function(err, docs) {});
		} else {
			offline = false;
			db.collection("connected_users").update({"_id": "offline_users"}, {$pull: {users: guid}}, function(err, docs) {
				check_inlist(coll, guid, socket, offline);
			});
		}
	});

	/*socket.on('namechange', function(msg)
	{
        if(coll == undefined) {
            coll = msg.channel;
        }
		namechange(msg.name, guid, coll, function(new_name) {
			name = new_name;
		});
	});

	socket.on('removename', function()
	{
		removename(guid, coll);
		name = "";
	});*/

	socket.on('chat', function (msg) {
		chat(msg, guid, offline, socket);
	});

	socket.on("all,chat", function(data)
	{
		all_chat(data, guid, offline, socket);
	});

	socket.on('frontpage_lists', function(msg)
	{
        console.log("First gotten", get_time());
		/*Frontpage.frontpage_lists(msg, socket);*/
		if(!msg.hasOwnProperty('version') || msg.version != VERSION || msg.version == undefined) {
		    socket.emit("update_required");
		  }

		console.log("gotten second ", get_time());
		  db.collection("frontpage_lists").find({frontpage:true}, function(err, docs){
		    console.log("gotten third ", get_time());
		        db.collection("connected_users").find({"_id": "total_users"}, function(err, tot){
		        console.log("sending frontpage ", get_time());
		        socket.compress(true).emit("playlists", {channels: docs, viewers: tot[0].total_users});
		        console.log("sent frontpage ", get_time());
		         });
		  });
	});

	socket.on('now_playing', function(list, fn)
	{
		now_playing(list, fn, socket);
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
		list(msg, guid, coll, offline, socket);
		get_short_id(socket);
	});

	socket.on('end', function(obj)
	{
		if(coll === undefined) {
      try {
        coll = obj.channel;
        if(coll.length == 0) return;
        coll = emojiStrip(coll).toLowerCase();
        coll = coll.replace("_", "");
        coll = encodeURIComponent(coll).replace(/\W/g, '');
        coll = filter.clean(coll);
      } catch(e) {
        return;
      }
    }
		end(obj, coll, guid, offline, socket);
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
		add_function(arr, coll, guid, offline, socket);
	});

	socket.on('delete_all', function(msg) {
		if(coll !== undefined) {
			try {
				coll = msg.channel;
				if(coll.length == 0) return;
				coll = emojiStrip(coll).toLowerCase();
				coll = coll.replace("_", "");
				coll = encodeURIComponent(coll).replace(/\W/g, '');
				coll = filter.clean(coll);
			} catch(e) {
				return;
			}
		}

		delete_all(msg, coll, guid, offline, socket);
	});

	socket.on('vote', function(msg)
	{
		if(coll !== undefined) {
      try {
        coll = msg.channel;
        if(coll.length == 0) return;
        coll = emojiStrip(coll).toLowerCase();
        coll = coll.replace("_", "");
        coll = encodeURIComponent(coll).replace(/\W/g, '');
        coll = filter.clean(coll);
      } catch(e) {
        return;
      }
    }
		voteUndecided(msg, coll, guid, offline, socket);
	});

	socket.on('password', function(inp)
	{
		password(inp, coll, guid, offline, socket);
	});

	socket.on('skip', function(list)
	{
		if(coll !== undefined) {
      try {
        coll = list.channel;
        if(coll.length == 0) return;
        coll = emojiStrip(coll).toLowerCase();
        coll = coll.replace("_", "");
        coll = encodeURIComponent(coll).replace(/\W/g, '');
        coll = filter.clean(coll);
      } catch(e) {
        return;
      }
    }
		skip(list, guid, coll, offline, socket);
	});

	socket.on('conf', function(params)
	{
		conf_function(params, coll, guid, offline, socket);
	});

	socket.on('shuffle', function(msg)
	{
		if(coll !== undefined) {
      try {
        coll = msg.channel;
        if(coll.length == 0) return;
        coll = emojiStrip(coll).toLowerCase();
        coll = coll.replace("_", "");
        coll = encodeURIComponent(coll).replace(/\W/g, '');
        coll = filter.clean(coll);
      } catch(e) {
        return;
      }
    }
		shuffle(msg, coll, guid, offline, socket);
	});

	socket.on('change_channel', function(obj)
	{
		if(coll === undefined && obj !== undefined && obj.channel !== undefined){
			try {
				coll = obj.channel;
				if(coll.length == 0) return;
				coll = emojiStrip(coll).toLowerCase();
				coll = coll.replace("_", "");
				coll = encodeURIComponent(coll).replace(/\W/g, '');
				coll = filter.clean(coll);
			} catch(e) {
				return;
			}
		}
		left_channel(coll, guid, short_id, in_list, socket, true);
		in_list = false;
	});

	socket.on('disconnect', function()
	{
		left_channel(coll, guid, short_id, in_list, socket, false);
	});

	socket.on('disconnected', function()
	{
		left_channel(coll, guid, short_id, in_list, socket, false);
	});

	socket.on('reconnect_failed', function()
	{
		left_channel(coll, guid, short_id, in_list, socket, false);
	});

	socket.on('connect_timeout', function()
	{
		left_channel(coll, guid, short_id, in_list, socket, false);
	});

	socket.on('error', function()
	{
		left_channel(coll, guid, short_id, in_list, socket, false);
	});

	socket.on('pos', function(obj)
	{

		if(coll !== undefined) {
			try {
				coll = obj.channel;
				if(coll.length == 0) return;
				coll = emojiStrip(coll).toLowerCase();
				coll = coll.replace("_", "");
				coll = encodeURIComponent(coll).replace(/\W/g, '');
				coll = filter.clean(coll);
			} catch(e) {
				return;
			}
		}

		if(coll == "" || coll == undefined || coll == null) {
			socket.emit("update_required");
			return;
		}

		db.collection(coll).find({views: {$exists: true}}, function(err, docs) {
			if(docs.length > 0 && (docs[0].userpass == undefined || docs[0].userpass == "" || (obj.hasOwnProperty('pass') && docs[0].userpass == decrypt_string(socketid, obj.pass)))) {
				check_inlist(coll, guid, socket, offline);
				send_play(coll, socket);
			} else {
				socket.emit("auth_required");
			}
		});
	});
});

send_ping();

function send_ping() {
	db.collection("connected_users").update({users: {$exists: true}}, {$set: {users: []}}, {multi: true}, function(err, docs){
		db.collection("connected_users").update({"_id": "total_users"}, {$set: {total_users: 0}}, {multi: true}, function(err, docs){
			db.collection("frontpage_lists").update({viewers: {$ne: 0}}, {$set: {"viewers": 0}}, {multi: true}, function(err, docs) {
				io.emit("self_ping");
				setTimeout(send_ping, 25000);
			});
		});
	});
}

function frontpage_lists(msg, socket) {
  if(!msg.hasOwnProperty('version') || msg.version != VERSION || msg.version == undefined) {
    socket.emit("update_required");
  }

console.log("gotten second ", get_time());
  db.collection("frontpage_lists").find({frontpage:true}, function(err, docs){
    console.log("gotten third ", get_time());
        db.collection("connected_users").find({"_id": "total_users"}, function(err, tot){
        console.log("sending frontpage ", get_time());
        socket.compress(true).emit("playlists", {channels: docs, viewers: tot[0].total_users});
        console.log("sent frontpage ", get_time());
         });
  });
}

function update_frontpage(coll, id, title) {
        db.collection("frontpage_lists").update({_id: coll}, {$set: {
                id: id,
                title: title,
                accessed: get_time()}
        },{upsert: true}, function(err, returnDocs){});
}


function remove_unique_id(short_id) {
	db.collection("unique_ids").update({"_id": "unique_ids"}, {$pull: {unique_ids: short_id}}, function(err, docs) {});
}

function remove_name_from_db(guid, name) {
	db.collection("user_names").update({"_id": "all_names"}, {$pull: {names: name}}, function(err, updated) {
		db.collection("user_names").remove({"guid": guid}, function(err, removed) {	});
	});
}

function remove_from_array(array, element){
	if(contains(array, element)){
		var index = array.indexOf(element);
		if(index != -1)
		array.splice(index, 1);
	}
}

function get_short_id(socket) {
	var new_short_id = uniqid.time().toLowerCase();

	socket.join(new_short_id);
	socket.emit("id", new_short_id);
}

function check_inlist(coll, guid, socket, offline)
{
	if(!offline && coll != undefined){
		db.collection("connected_users").update({"_id": coll}, {$addToSet:{users: guid}}, {upsert: true}, function(err, updated) {
			if(updated.nModified > 0) {
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

						db.collection("connected_users").update({"_id": "total_users"}, {$inc: {total_users: 1}}, function(err, docs){});
					});
				});
			}
		});

	} else {
		db.collection("connected_users").update({"_id": coll}, {$addToSet: {users: guid}}, function(err, docs){});
		db.collection("connected_users").update({"_id": "total_users"}, {$inc: {total_users: 1}}, function(err, docs) {});
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

function decrypt_string(socket_id, pw){
	try {
		var input = pw.split("$");
		pw = input[0];
		var testKey = ((new Buffer(socket_id).toString('base64')) + (new Buffer(socket_id).toString('base64'))).substring(0,32);
		var keyNew = (new Buffer(testKey)).toString('base64');
		var encrypted = CryptoJS.enc.Base64.parse(pw);
		var key = CryptoJS.enc.Base64.parse(keyNew);
		var iv = CryptoJS.enc.Base64.parse(input[1]);
		var decrypted = CryptoJS.enc.Utf8.stringify(
			CryptoJS.AES.decrypt({
				ciphertext: encrypted
			},
    	key,
     // edit: changed to Pkcs5
    	{
				mode: CryptoJS.mode.CBC,
				padding: CryptoJS.pad.Pkcs7,
				iv: iv,
			}));
			return decrypted;
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

function hash_pass(adminpass) {
	return crypto.createHash('sha256').update(adminpass).digest('base64');
}


function chat(msg, guid, offline, socket) {
  if(typeof(msg) !== 'object' && !msg.hasOwnProperty('data') && !msg.hasOwnProperty('channel') && !msg.hasOwnProperty('pass')) {
    socket.emit('update_required');
    return;
  }
  var coll = msg.channel;
  db.collection(coll).find({views:{$exists:true}}, function(err, docs){
    if(docs.length > 0 && (docs[0].userpass == undefined || docs[0].userpass == "" || (msg.hasOwnProperty('pass') && docs[0].userpass == decrypt_string(socket.zoff_id, msg.pass)))) {
      var data = msg.data;
      check_inlist(coll, guid, socket, offline);
      if(data !== "" && data !== undefined && data !== null &&
      data.length < 151 && data.replace(/\s/g, '').length){
        db.collection("user_names").find({"guid": guid}, function(err, docs) {
          if(docs.length == 1) {
            io.to(coll).emit('chat', {from: docs[0].name, msg: ": " + data});
          } else if(docs.length == 0){
            get_name(guid, {announce: false, channel: coll, message: data, all: false});
          }
        });
      }
    } else {
      socket.emit('auth_required');
    }
  });
}

function all_chat(msg, guid, offline, socket) {
  if(typeof(msg) !== 'object' || !msg.hasOwnProperty("channel") || !msg.hasOwnProperty("data")) {
    socket.emit('update_required');
    return;
  }
  var coll = msg.channel;
  var data = msg.data;

  check_inlist(coll, guid, socket, offline);
  if(data !== "" && data !== undefined && data !== null &&
  data.length < 151 && data.replace(/\s/g, '').length){
    db.collection("user_names").find({"guid": guid}, function(err, docs) {
      if(docs.length == 1) {
        io.sockets.emit('chat.all', {from: docs[0].name, msg: ": " + data, channel: coll});
      } else if(docs.length == 0) {
        get_name(guid, {announce: false, channel: coll, message: data, all: true});
      }
    });
  }
}

function namechange(data, guid, coll) {
  if(typeof(data) !== "string" || coll == undefined) return;
  data = encodeURIComponent(data).replace(/\W/g, '').replace(/[^\x00-\x7F]/g, "");
  db.collection("user_names").find({"guid": guid}, function(err, docs) {
    if(docs.length == 1) {
      if(docs[0].name == data) return;
      var change_name = function(new_name, guid, old_name) {
        if(new_name.length > 9) {
          return;
        } else {
          db.collection("user_names").update({"_id": "all_names"}, {$addToSet: {names: new_name}}, function(err, updated) {
            if(updated.nModified == 1) {
              db.collection("user_names").update({"guid": guid}, {$set: {name: new_name}}, function(err, updated) {
                db.collection("user_names").update({"_id": "all_names"}, {$pull: {names: old_name}}, function(err, updated) {});
                name = new_name;
                io.to(coll).emit('chat', {from: old_name, msg: " changed name to " + name});
                io.sockets.emit('chat.all', {from: old_name , msg: " changed name to " + name, channel: coll});
              });
            } else {
              change_name(new_name + "_", guid, old_name);
            }
          });
        }
      }

      var old_name = docs[0].name;
      change_name(data, guid, old_name);

    }
  });
}

function removename(guid, coll) {
  db.collection("user_names").find({"guid": guid}, function(err, docs) {
    if(docs.length == 1) {
      var old_name = docs[0].name;
      db.collection("user_names").update({"_id": "all_names"}, {$pull: {names: old_name}}, function(err, updated) {
        db.collection("user_names").remove({"guid": guid}, function(err, removed) {
          get_name(guid, {announce: true, old_name: old_name, channel: coll});
        });
      });
    }
  });
}

function generate_name(guid, announce_payload) {
  var tmp_name = rndName(guid, 8);
  db.collection("user_names").update({"_id": "all_names"}, {$addToSet: {names: tmp_name}}, {upsert: true}, function(err, updated) {
    if(updated.nModified == 1 || (updated.hasOwnProperty("upserted") && n == 1)) {
      db.collection("user_names").update({"guid": guid}, {$set: {name: tmp_name}}, {upsert: true}, function(err, update){
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
      generate_name(tmp_name, announce_payload);
    }
  })
}

function get_name(guid, announce_payload) {
  db.collection("user_names").find({"guid": guid}, function(err, docs) {
    if(docs.length == 0) {
      generate_name(guid, announce_payload);
    } else {
      name = docs[0].name;
    }
  })
}

function add_function(arr, coll, guid, offline, socket) {
  var socketid = socket.zoff_id;
  if(typeof(arr) === 'object' && arr !== undefined && arr !== null && arr !== "" && !isNaN(parseInt(arr.duration)))
  {

    if(coll == "" || coll == undefined || coll == null) {
      socket.emit("update_required");
      return;
    }

    db.collection(coll).find({views:{$exists:true}}, function(err, docs){
      if(docs.length > 0 && (docs[0].userpass == undefined || docs[0].userpass == "" || (arr.hasOwnProperty('pass') && docs[0].userpass == decrypt_string(socketid, arr.pass)))) {

        check_inlist(coll, guid, socket, offline);

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
                  } else {
                    np = false;
                  }
                  db.collection(coll).update({id: id}, {"added": added,"guids":guids,"id":id,"now_playing":np,"title":title,"votes":votes, "duration":duration}, {upsert: true}, function(err, docs){
                    if(np)
                    {
                      send_list(coll, undefined, false, true, false);
                      db.collection(coll).update({views:{$exists:true}}, {$set:{startTime: get_time()}});
                      send_play(coll, undefined);
                      update_frontpage(coll, id, title);
                    } else {
                      io.to(coll).emit("channel", {type: "added", value: {"_id": "asd", "added":added,"guids":guids,"id":id,"now_playing":np,"title":title,"votes":votes, "duration":duration}});
                    }
                    db.collection("frontpage_lists").update({_id:coll}, {$inc:{count:1}, $set:{accessed: get_time()}}, {upsert:true}, function(err, docs){});
                    getNextSong(coll);
                  });
                  if(!full_list) {
                    socket.emit("toast", "addedsong");
                  } else if(full_list && last) {
                    socket.emit("toast", "addedplaylist");
                  }
                });
              } else if(!full_list) {
                vote(coll, id, guid, socket, full_list, last);
                if(full_list && last) {
                  socket.emit("toast", "addedplaylist");
                }
              } else if(full_list && last) {
                socket.emit("toast", "addedplaylist");
              }
            });
          } else if(!full_list) {
            db.collection(coll).find({id: id}, function(err, docs) {
              if(docs.length === 0) {
                db.collection(coll).update({id: id}, {$set:{
                  "added":get_time(),
                  "guids": [guid],
                  "id":id,
                  "now_playing": false,
                  "title":title,
                  "votes":1,
                  "duration":duration,
                  "type":"suggested"}
                },
                {upsert:true}, function(err, docs){
                  socket.emit("toast", "suggested");
                  io.to(coll).emit("suggested", {id: id, title: title, duration: duration});
                });
              } else if(docs[0].now_playing === true){
                socket.emit("toast", "alreadyplay");
              } else{
                if(conf[0].vote === false) vote(coll, id, guid, socket, full_list, last);
                else socket.emit("toast", "listhaspass");
              }
            });
          } else if (full_list){
            if(arr.num == 0) {
              socket.emit("toast", "listhaspass");
            }
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

function voteUndecided(msg, coll, guid, offline, socket) {
  var socketid = socket.zoff_id;
  if(typeof(msg) === 'object' && msg !== undefined && msg !== null){

    if(coll == "" || coll == undefined || coll == null || !msg.hasOwnProperty("adminpass") || !msg.hasOwnProperty("pass") || !msg.hasOwnProperty("id")) {
      socket.emit("update_required");
      return;
    }

    db.collection(coll).find({views:{$exists:true}}, function(err, docs){
      if(docs.length > 0 && (docs[0].userpass == undefined || docs[0].userpass == "" || (msg.hasOwnProperty('pass') && docs[0].userpass == decrypt_string(socketid, msg.pass)))) {

        check_inlist(coll, guid, socket, offline);

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
      } else {
        socket.emit("auth_required");
      }
    });
  } else {
    socket.emit('update_required');
  }
}

function shuffle(msg, coll, guid, offline, socket) {
  var socketid = socket.zoff_id;
  if(msg.hasOwnProperty('adminpass') && msg.adminpass !== undefined && msg.adminpass !== null)
  {
    if(coll == "" || coll == undefined || coll == null) {
      socket.emit("update_required");
      return;
    }

    check_inlist(coll, guid, socket, offline);
    var hash;
    if(msg.adminpass === "") hash = msg.adminpass;
    else hash = hash_pass(decrypt_string(socketid, msg.adminpass));
    db.collection(coll).find({views:{$exists:true}}, function(err, docs){
      if(docs.length > 0 && (docs[0].userpass == undefined || docs[0].userpass == "" || (msg.hasOwnProperty('pass') && docs[0].userpass == decrypt_string(socketid, msg.pass)))) {
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
      } else {
        socket.emit("auth_required");
      }
    });

    var complete = function(tot, curr){
      if(tot == curr)
      {
        send_list(coll, undefined, false, true, false);
        getNextSong(coll);
      }
    };

  }else
  socket.emit("toast", "wrongpass");
}

function del(params, socket, socketid) {
	if(params.id){
		var coll = emojiStrip(params.channel).toLowerCase();
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
							if(dont_increment) db.collection("frontpage_lists").update({_id: coll}, {$inc: {count: -1}, $set:{accessed: get_time()}}, {upsert: true}, function(err, docs){});
						});
					}
				});

			}
		});
	}
}

function delete_all(msg, coll, guid, offline, socket) {
  var socketid = socket.zoff_id;
  if(typeof(msg) == 'object' && msg.hasOwnProperty('channel') && msg.hasOwnProperty('adminpass') && msg.hasOwnProperty('pass')) {
    var hash = hash_pass(decrypt_string(socketid, msg.adminpass));
    var hash_userpass = decrypt_string(socketid, msg.pass);

    db.collection(coll).find({views: {$exists: true}}, function(err, conf) {
      if(conf.length == 1 && conf) {
        conf = conf[0];
        if(conf.adminpass == hash && conf.adminpass != "" && (conf.userpass == "" || conf.userpass == undefined || (conf.userpass != "" && conf.userpass != undefined && conf.pass == hash_userpass))) {
          db.collection(coll).remove({views: {$exists: false}}, {multi: true}, function(err, succ) {
            send_list(coll, false, true, true, true);
            db.collection("frontpage_lists").update({_id: coll}, {$set: {count: 0, accessed: get_time()}}, {upsert: true}, function(err, docs) {});
            socket.emit("toast", "deleted_songs");
          });
        } else {
          socket.emit("toast", "listhaspass");
        }
      }
    });
  } else {
    socket.emit("update_required");
    return;
  }
}

function vote(coll, id, guid, socket, full_list, last) {
	db.collection(coll).find({id:id, now_playing: false}, function(err, docs){
		if(docs !== null && docs.length > 0 && !contains(docs[0].guids, guid))
		{
			db.collection(coll).update({id:id}, {$inc:{votes:1}, $set:{added:get_time()}, $push :{guids: guid}}, function(err, docs)
			{
				if((full_list && last) || (!full_list))
				socket.emit("toast", "voted");
				io.to(coll).emit("channel", {type: "vote", value: id, time: get_time()});

				getNextSong(coll);
			});
		}else
		{
			socket.emit("toast", "alreadyvoted");
		}
	});
}

function password(inp, coll, guid, offline, socket) {
  if(inp !== undefined && inp !== null && inp !== "")
  {
    pw = inp.password;
    opw = inp.password;
    try {
      coll = inp.channel;
      if(coll.length == 0) return;
      coll = emojiStrip(coll).toLowerCase();
      coll = coll.replace("_", "");
      coll = encodeURIComponent(coll).replace(/\W/g, '');
      coll = filter.clean(coll);
    } catch(e) {
      return;
    }

    if(coll == "" || coll == undefined || coll == null) {
      socket.emit("update_required");
      return;
    }

    uncrypted = pw;
    pw = decrypt_string(socket.zoff_id, pw);

    check_inlist(coll, guid, socket, offline);

    if(inp.oldpass)
    {
      opw = inp.oldpass;
    }
    opw = decrypt_string(socket.zoff_id, opw);

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
            socket.emit("pw", true);
          });
        }else
        socket.emit("toast", "wrongpass");
      }
    });
  } else {
    socket.emit('update_required');
  }
}

function conf_function(params, coll, guid, offline, socket) {
  if(params !== undefined && params !== null && params !== "" &&
  params.hasOwnProperty('voting') &&
  params.hasOwnProperty('addsongs') &&
  params.hasOwnProperty('longsongs') &&
  params.hasOwnProperty('frontpage') &&
  params.hasOwnProperty('allvideos') &&
  params.hasOwnProperty('removeplay') &&
  params.hasOwnProperty('adminpass') &&
  params.hasOwnProperty('skipping') &&
  params.hasOwnProperty('shuffling') &&
  params.hasOwnProperty('channel'))
  {
    if(coll !== undefined) {
      try {
        coll = params.channel;
        if(coll.length == 0) return;
        coll = emojiStrip(coll).toLowerCase();
        coll = coll.replace("_", "");
        coll = encodeURIComponent(coll).replace(/\W/g, '');
        coll = filter.clean(coll);
      } catch(e) {
        return;
      }
    }

    if(coll == "" || coll == undefined || coll == null) {
      socket.emit("update_required");
      return;
    }

    check_inlist(coll, guid, socket, offline);

    var voting = params.voting;
    var addsongs = params.addsongs;
    var longsongs = params.longsongs;
    var frontpage = params.frontpage;
    var allvideos = params.allvideos;
    var removeplay = params.removeplay;
    var adminpass = params.adminpass;
    var skipping = params.skipping;
    var shuffling = params.shuffling;
    var userpass = decrypt_string(socket.zoff_id, params.userpass);

    if((!params.userpass_changed && frontpage) || (params.userpass_changed && userpass == "")) {
      userpass = "";
    } else if(params.userpass_changed && userpass != "") {
      frontpage = false;
    }
    var description = "";
    var hash;
    if(params.description) description = params.description;

    if(adminpass !== "") {
      hash = hash_pass(decrypt_string(socket.zoff_id, adminpass));
    } else {
      hash = adminpass;
    }
    db.collection(coll).find({views:{$exists:true}}, function(err, docs){
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
        db.collection(coll).update({views:{$exists:true}}, {
          $set:obj
        }, function(err, docs){
          db.collection(coll).find({views:{$exists:true}}, function(err, docs){
            if(docs[0].adminpass !== "") docs[0].adminpass = true;
            if(docs[0].hasOwnProperty("userpass") && docs[0].userpass != "") docs[0].userpass = true;
            else docs[0].userpass = false;
            io.to(coll).emit("conf", docs);
            socket.emit("toast", "savedsettings");

            db.collection("frontpage_lists").update({_id: coll}, {$set:{
              frontpage:frontpage, accessed: get_time()}
            },
            {upsert:true}, function(err, docs){});
          });
        });
      } else {
        socket.emit("toast", "wrongpass");
      }
    });
  } else {
    socket.emit('update_required');
  }
}


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
    var pass = decrypt_string(socketid, msg.pass);
    db.collection('frontpage_lists').find({"_id": coll}, function(err, frontpage_lists){
      if(frontpage_lists.length == 1)
      {
        db.collection(coll).find({views: {$exists: true}}, function(err, docs) {
          if(docs.length == 0 || (docs.length > 0 && (docs[0].userpass == undefined || docs[0].userpass == "" || docs[0].userpass == pass))) {
            if(docs.length > 0 && docs[0].hasOwnProperty('userpass') && docs[0].userpass != "" && docs[0].userpass == pass) {
              socket.emit("auth_accepted", {value: true});
            }
            in_list = true;
            socket.join(coll);
            check_inlist(coll, guid, socket, offline);

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
      } else{
        db.createCollection(coll, function(err, docs){
          db.collection(coll).insert({"addsongs":false, "adminpass":"", "allvideos":true, "frontpage":true, "longsongs":false, "removeplay": false, "shuffle": true, "skip": false, "skips": [], "startTime":get_time(), "views": [], "vote": false, "desc": ""}, function(err, docs){
            send_list(coll, socket, true, false, true);
            db.collection("frontpage_lists").insert({"_id": coll, "count" : 0, "frontpage": true, "accessed": get_time()});
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

    db.collection(coll).find({views:{$exists:true}}, function(err, docs){
      if(docs.length > 0 && (docs[0].userpass == undefined || docs[0].userpass == "" || (list.hasOwnProperty('userpass') && docs[0].userpass == decrypt_string(socketid, list.userpass)))) {

        check_inlist(coll, guid, socket, offline);

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
              db.collection("frontpage_lists").find({"_id": coll}, function(err, frontpage_viewers){
                if((frontpage_viewers[0].viewers/2 <= docs[0].skips.length+1 && !contains(docs[0].skips, guid) && frontpage_viewers[0].viewers != 2) ||
                (frontpage_viewers[0].viewers == 2 && docs[0].skips.length+1 == 2 && !contains(docs[0].skips, guid)) ||
                (docs[0].adminpass == hash && docs[0].adminpass !== "" && docs[0].skip))
                {
                  change_song(coll, error, video_id);
                  socket.emit("toast", "skip");
                  io.to(coll).emit('chat', {from: name, msg: " skipped"});
                }else if(!contains(docs[0].skips, guid)){
                  db.collection(coll).update({views:{$exists:true}}, {$push:{skips:guid}}, function(err, d){
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

function change_song(coll, error, id) {
	db.collection(coll).find({views:{$exists:true}}, function(err, docs){
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
									change_song_post(coll, next_song);
									io.to(coll).emit("channel", {type: "deleted", value: now_playing_doc[0].id, removed: true});
									db.collection("frontpage_lists").update({_id: coll}, {$inc: {count: -1}, $set:{accessed: get_time()}}, {upsert: true}, function(err, docs){});
								});
							} else {
								if((docs[0].skipped_time != undefined && docs[0].skipped_time != get_time()) || docs[0].skipped_time == undefined) {
									db.collection(coll).update({views: {$exists: true}}, {$set: {skipped_time: get_time()}}, function(err, updated){
										db.collection(coll).update({now_playing:true, id:id}, {
											$set:{
												now_playing:false,
												votes:0,
												guids:[]
											}
										},{multi:true}, function(err, docs){
											var next_song;
											if(now_playing_doc.length == 2) next_song = now_playing_doc[1].id;
											if(docs.n >= 1) change_song_post(coll, next_song);
										});
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
							db.collection("frontpage_lists").update({_id: coll}, {$inc: {count: -1}, $set:{accessed: get_time()}}, {upsert: true}, function(err, docs){});
						});
					} else {
						if((docs[0].skipped_time != undefined && docs[0].skipped_time != get_time()) || docs[0].skipped_time == undefined) {
							db.collection(coll).update({now_playing:true, id:id}, {
								$set:{
									now_playing:false,
									votes:0,
									guids:[]
								}
							},{multi:true}, function(err, docs){
								var next_song;
								if(now_playing_doc.length == 2) next_song = now_playing_doc[1].id;
								change_song_post(coll, next_song);
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
					added:get_time()
				}
			}, function(err, returnDocs){
				db.collection(coll).update({views:{$exists:true}},{
					$set:{
						startTime:get_time(),
						skips:[]
					}
				}, function(err, returnDocs){
					db.collection(coll).find({views:{$exists:true}}, function(err, conf){
						io.to(coll).emit("channel", {type: "song_change", time: get_time(), remove: conf[0].removeplay});
						send_play(coll);
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
										added:get_time()
									}
								}, function(err, returnDocs){
									db.collection(coll).update({views:{$exists:true}}, {
										$set:{
											startTime: get_time(),
											skips:[]
										}
									}, function(err, returnDocs){
										update_frontpage(coll, now_playing_doc[0].id, now_playing_doc[0].title);
										send_list(coll, socket, send, list_send, configs, shuffled);
									});
								});
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
  if(typeof(obj) !== 'object') {
    return;
  }
  id = obj.id;
  if(id !== undefined && id !== null && id !== "") {

    if(coll == "" || coll == undefined || coll == null) {
      socket.emit("update_required");
      return;
    }

    db.collection(coll).find({views:{$exists:true}}, function(err, docs){
      if(docs.length > 0 && (docs[0].userpass == undefined || docs[0].userpass == "" || (obj.hasOwnProperty('pass') && docs[0].userpass == decrypt_string(socketid, obj.pass)))) {

        check_inlist(coll, guid, socket, offline);
        db.collection(coll).find({now_playing:true}, function(err, np){
          if(err !== null) console.log(err);
          if(np !== null && np !== undefined && np.length == 1 && np[0].id == id){
            db.collection(coll).find({views:{$exists:true}}, function(err, docs){
              var startTime = docs[0].startTime;
              if(docs[0].removeplay === true && startTime+parseInt(np[0].duration)<=get_time()+5)
              {
                db.collection(coll).remove({now_playing:true}, function(err, docs){
                  change_song_post(coll);
                  db.collection("frontpage_lists").update({_id:coll}, {$inc:{count:-1}, $set:{accessed: get_time()}}, {upsert:true}, function(err, docs){});
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
					if(socket === undefined) {
						io.to(coll).emit("np", toSend);
						getNextSong(coll)
					} else {
						socket.emit("np", toSend);
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
				db.collection("connected_users").update({"_id": "total_users"}, {$inc: {total_users: -1}}, function(err, updated){});

				if(!change) {
					remove_name_from_db(guid, name);
				}
			});
		}
	});
	remove_unique_id(short_id);
}

function thumbnail(msg, coll, guid, offline, socket) {
  if(msg.thumbnail && msg.channel && msg.adminpass && msg.thumbnail.indexOf("i.imgur.com") > -1){
    msg.thumbnail = msg.thumbnail.replace(/^https?\:\/\//i, "");
    if(msg.thumbnail.substring(0,2) != "//") msg.thumbnail = "//" + msg.thumbnail;
    var channel = msg.channel.toLowerCase();
    var hash = hash_pass(decrypt_string(socket.zoff_id, msg.adminpass));
    db.collection(channel).find({views:{$exists:true}}, function(err, docs){
      if(docs.length > 0 && (docs[0].userpass == undefined || docs[0].userpass == "" || (msg.hasOwnProperty('pass') && docs[0].userpass == decrypt_string(socketid, msg.pass)))) {
        if(docs !== null && docs.length !== 0 && docs[0].adminpass !== "" && docs[0].adminpass == hash){
          db.collection("suggested_thumbnails").update({channel: channel}, {$set:{thumbnail: msg.thumbnail}}, {upsert:true}, function(err, docs){
            socket.emit("toast", "suggested_thumbnail");
          });
        }
      } else {
        socket.emit("auth_required");
      }
    });
  } else {
    socket.emit("toast", "thumbnail_denied");
  }
}

function description(msg, coll, guid, offline, socket) {
  if(msg.description && msg.channel && msg.adminpass && msg.description.length < 100){
    var channel = msg.channel.toLowerCase();
    var hash = hash_pass(decrypt_string(socket.zoff_id, msg.adminpass));
    db.collection(channel).find({views:{$exists:true}}, function(err, docs){
      if(docs.length > 0 && (docs[0].userpass == undefined || docs[0].userpass == "" || (msg.hasOwnProperty('pass') && docs[0].userpass == decrypt_string(socketid, msg.pass)))) {
        if(docs !== null && docs.length !== 0 && docs[0].adminpass !== "" && docs[0].adminpass == hash){
          db.collection("suggested_descriptions").update({channel: channel}, {$set:{description: msg.description}}, {upsert:true}, function(err, docs){
            socket.emit("toast", "suggested_description");
          });
        }
      } else {
        socket.emit("auth_required");
      }
    });
  } else {
    socket.emit("toast", "description_denied");
  }
}
