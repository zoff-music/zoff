var server;

try{
  var fs = require('fs');
  var privateKey  = fs.readFileSync('/etc/apache2/ssl/private.key', 'utf8');
  var certificate = fs.readFileSync('/etc/apache2/ssl/ssl.crt', 'utf8');
  var credentials = {key: privateKey, cert: certificate};
  var https = require('https');
  server = https.createServer(credentials, handler);

  var cors_proxy = require('cors-anywhere');

  cors_proxy.createServer({
      requireHeader: ['origin', 'x-requested-with'],
      removeHeaders: ['cookie', 'cookie2'],
      httpsOptions: credentials
  }).listen(8080, function() {
      console.log('Running CORS Anywhere on :' + 8080);
  });
}
catch(err){
  console.log("Starting without https (probably on localhost)");
  if(err["errno"] != 34)console.log(err);
  
  var http = require('http');
  server = http.createServer(handler);
}

var io = require('socket.io')(server);

//db
var mongojs = require('mongojs');
var db = mongojs.connect('mydb');

//crypto
var crypto = require('crypto');

var emojiStrip = require('emoji-strip');

var port = 3000;
var lists = {};
var unique_ids = [];

function handler (req, res) {
  res.writeHead(302, {'Location': 'http://'+req.headers.host.split(":")[0]});
  return res.end('Wrong port');
}

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

process.on('uncaughtException', function(e){
  console.log("\n" + new Date().toString() + "\n", e.stack || e);
  process.exit(1);
})

db.on('error',function(err) {
    console.log("\n" + new Date().toString() + "\n Database error: ", err);
});

io.on('connection', function(socket){
  socket.emit("get_list");

  var guid = hash_pass(socket.handshake.headers["user-agent"] + socket.handshake.address + socket.handshake.headers["accept-language"]);

  socket.on('close', function() {
    console.log("closing socket");
  })

  socket.on('ping', function() {
    socket.emit("ok");
  });

  var coll;
  var tot_lists = [];
  var in_list = false;
  var name = rndName(guid,8);
  var short_id = uniqueID(socket.id,4);
  unique_ids.push(short_id);


  socket.on('namechange', function(data)
  {
    if(name.length < 9 && name.indexOf(" ") == -1)
    {
      io.to(coll).emit('chat', [name, " changed name to " + data]);
      io.sockets.emit('chat.all', [name ," changed name to " + data, coll]);
      name = data;
    }
  });

  socket.on('chat', function (data) {
    check_inlist(coll, guid, socket, name);
    if(data != "" && data !== undefined && data !== null && data.length < 151 && data.replace(/\s/g, '').length)
      io.to(coll).emit('chat', [name, ": " + data]);
  });

  socket.on("all,chat", function(data)
  {
    check_inlist(coll, guid, socket, name);
    if(data != "" && data !== undefined && data !== null && data.length < 151 && data.replace(/\s/g, '').length)
      io.sockets.emit('chat.all', [name, ": " + data, coll]);
  });

  socket.on('frontpage_lists', function()
  {
    var playlists_to_send = [];
    var i = 0;
    var playlists_to_send = [];
    in_list = false;

    db.getCollectionNames(function(err, colNames){
        colNames.forEach(function(name){
          if(name != "system.indexes")
          {
            db.collection(name).find({views:{$exists:true}}, function(err, conf){
                db.collection(name).count(function(err, num){
                  db.collection(name).find({now_playing:true}, function(err, np){
                    complete(np, i, colNames.length-2, name, num-1, conf);
                    i++;
                  });
                });
            });
          }
      });
    });

    var complete = function(list, curr, tot, name, count, conf)
    {
      if(list.length > 0)
      {
        var id = list[0]["id"];
        var title = list[0]["title"];
        try{
          var viewers = lists[name].length;
        }catch(err){var viewers = 0;}
        var to_push = [viewers, id, title, name, count];
        if(conf[0]["frontpage"])
          playlists_to_send.push(to_push);
      }
      if(curr == tot)
      {
        socket.emit("playlists", playlists_to_send);
      }
    }
  });

  socket.on('now_playing', function(list)
  {
    db.collection(list).find({now_playing:true}, function(err, docs)
    {
      var title = docs[0]["title"];
      socket.emit("title", title);
    });
  });

  socket.on('id', function(arr)
  {

    if(arr.length == 3)
      io.to(arr[0]).emit(arr[0], [arr[1], arr[2]]);
  });

  socket.on('list', function(list)
  {
    if(list !== undefined && list !== null && list != "")
    {
      in_list = true;
    	coll = emojiStrip(list).toLowerCase();
      coll = decodeURIComponent(coll);
      coll = coll.replace(/\W/g, '');
      socket.join(coll);
      socket.join(short_id);
      socket.emit("id", short_id);

      check_inlist(coll, guid, socket, name);

      io.to(coll).emit("viewers", lists[coll].length);

      db.getCollectionNames(function(err, docs){

      	if(contains(docs, coll))
      	{
      		send_list(coll, socket, true, false, true);
      	}else
      	{
      		db.createCollection(coll, function(err, docs){
    				db.collection(coll).insert({"addsongs":false, "adminpass":"", "allvideos":false, "frontpage":true, "longsongs":false, "removeplay": false, "shuffle": true, "skip": false, "skips": [], "startTime":get_time(), "views": [], "vote": false, "desc": ""}, function(err, docs)
    				{
              send_list(coll, socket, true, false, true);

    				});
      		});
      	}
      });
    }
  });

  socket.on('end', function(id)
  {
    if(id !== undefined && id !== null && id != "")
    {
      check_inlist(coll, guid, socket, name);

    	db.collection(coll).find({now_playing:true}, function(err, np){
        if(err !== null) console.log(err);
    		if(np !== null && np !== undefined && np.length == 1 && np[0]["id"] == id){
          db.collection(coll).find({views:{$exists:true}}, function(err, docs){
            var startTime = docs[0]["startTime"];
            if(docs[0]["removeplay"] == true)
            {
              db.collection(coll).remove({now_playing:true}, function(err, docs)
              {
                change_song_post(coll);
              })
            }else
            {
                if(startTime+parseInt(np[0]["duration"])<=get_time()+2)
                {
                  db.collection(coll).update({now_playing:true, id:id},
                    {$set:{
                      now_playing:false,
                      votes:0,
                      guids:[]
                    }}, function(err, docs)
                    {
                      if(docs["n"] == 1)
                      {
                        db.collection(coll).aggregate([
                          {$match:{now_playing:false}},
                          {$sort:{votes:-1, added:1}},
                          {$limit:1}], function(err, docs){
                            if(docs !== null && docs.length > 0){
                              db.collection(coll).update({id:docs[0]["id"]},
                              {$set:{
                                now_playing:true,
                                votes:0,
                                guids:[],
                                added:get_time()}}, function(err, docs){
                                  db.collection(coll).update({views:{$exists:true}},
                                    {$set:{startTime:get_time(), skips:[]}}, function(err, docs){
                                      io.to(coll).emit("channel", ["song_change", get_time()]);
                                      send_play(coll);
                                  });
                                });
                            }
                      });
                      }

                  });

                }
            }
          });
    		}
    	});
    }
  });

  socket.on('add', function(arr)
  {
    if(arr !== undefined && arr !== null && arr != "")
    {
      if(arr.length == 5) coll = arr[4];
      else check_inlist(coll, guid, socket, name);

    	var id = arr[0];
    	var title = arr[1];
      var hash = hash_pass(arr[2]);
      var duration = parseInt(arr[3]);
      db.collection(coll).find({views:{$exists:true}}, function(err, docs)
      {
        if(docs !== null && docs.length != 0 && ((docs[0]["addsongs"] == true && (hash == docs[0]["adminpass"] || docs[0]["adminpass"] == ""))
          || docs[0]["addsongs"] == false))
        {
          db.collection(coll).find({id:id}, function(err, docs){
            if(docs !== null && docs.length == 0)
            {
              var guids = [guid];
      		  	var votes = 1;

              db.collection(coll).find({now_playing:true}, function(err, docs){
                if(docs !== null && docs.length == 0)
                  np = true;
                else
                  np = false;
          			db.collection(coll).insert({"added":get_time(),"guids":guids,"id":id,"now_playing":np,"title":title,"votes":votes, "duration":duration}, function(err, docs){
                  io.to(coll).emit("channel", ["added", {"_id": "asd", "added":get_time(),"guids":guids,"id":id,"now_playing":np,"title":title,"votes":votes, "duration":duration}]);
                  if(np)
                  {
                    send_play(coll, undefined);
                    io.to(coll).emit("channel", ["song_change", get_time()]);
                  }
        		  	});
              });
            }else{
              vote(coll, id, guid, socket);
            }
          });
        }else
          socket.emit("toast", "listhaspass");
      });
    }
  });

  socket.on('vote', function(msg)
  {
    if(msg !== undefined && msg !== null)
    {
      check_inlist(coll, guid, socket, name);

      if(msg[2] == "del")
        del(msg, socket);
      else
      {
      	var id = msg[1];
        var hash = hash_pass(msg[3]);
        db.collection(coll).find({views:{$exists:true}}, function(err, docs)
        {
          if(docs !== null && docs.length != 0 && ((docs[0]["vote"] == true && (hash == docs[0]["adminpass"] || docs[0]["adminpass"] == ""))
            || docs[0]["vote"] == false))
          {
            vote(coll, id, guid, socket);
          }else{
            socket.emit("toast", "listhaspass");
          }
        });
      }
    }
  });

  socket.on('password', function(inp)
  {
    if(inp !== undefined && inp !== null && inp != "")
    {
      pw = inp[0];
      opw = inp[0];
      coll = inp[1];

      check_inlist(coll, guid, socket, name);

      if(inp.length == 3)
      {
        opw = inp[2];
      }

      db.collection(coll).find({views:{$exists:true}}, function(err, docs){
        if(docs !== null && docs.length != 0)
        {
          if(docs[0]["adminpass"] == "" || docs[0]["adminpass"] == hash_pass(opw))
          {
            db.collection(coll).update({views:{$exists:true}}, {$set:{adminpass:hash_pass(pw)}}, function(err, docs)
            {
              if(inp.length == 3)
                socket.emit("toast", "changedpass");
              else
                socket.emit("toast", "correctpass");
              socket.emit("pw", pw);
            })
          }else
            socket.emit("toast", "wrongpass");
        }
      });
    }
  });

  socket.on('skip', function(list)
  {
    if(list !== undefined && list !== null && list != "")
    {
      check_inlist(coll, guid, socket, name);

      adminpass = "";

      var error = false;
      if(list != "5" && list != "100" && list != "101" && list != "150" && list !== undefined)
      {
        adminpass = list[1];
      }else if(list == "5" || list == "100" || list == "101" || list == "150"){
        error = true;
      }

      if(adminpass !== undefined && adminpass !== null && adminpass != "")
        var hash = hash_pass(adminpass);
      else
        var hash = "";

    	db.collection(coll).find({views: {$exists:true}}, function(err, docs){
        if(docs !== null && docs.length != 0)
        {
      		if(!docs[0]["skip"] || (docs[0]["adminpass"] == hash && docs[0]["adminpass"] != "") || error)
      		{
      			if((lists[coll].length/2 <= docs[0]["skips"].length+1 && !contains(docs[0]["skips"], guid) && lists[coll].length != 2)
              || (lists[coll].length == 2 && docs[0]["skips"].length+1 == 2 && !contains(docs[0]["skips"], guid))
              || (docs[0]["adminpass"] == hash && docs[0]["adminpass"] != "" && docs[0]["skip"]))
      			{
      				change_song(coll);
              socket.emit("toast", "skip");
              io.to(coll).emit('chat', [name, " skipped"]);
      			}else if(!contains(docs[0]["skips"], guid)){
      				db.collection(coll).update({views:{$exists:true}}, {$push:{skips:guid}}, function(err, d){
                if(lists[coll].length == 2)
                  to_skip = 1;
                else
                  to_skip = (Math.ceil(lists[coll].length/2) - docs[0]["skips"].length-1);
                socket.emit("toast", to_skip + " more are needed to skip!");
                socket.broadcast.to(coll).emit('chat', [name, " voted to skip"]);
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
    if(params !== undefined && params !== null && params != "")
    {
      check_inlist(coll, guid, socket,name);

      var voting = params[0];
    	var addsongs = params[1];
    	var longsongs = params[2];
    	var frontpage = params[3];
    	var allvideos = params[4];
    	var removeplay = params[5];
    	var adminpass = params[6];
    	var skipping = params[7];
    	var shuffling = params[8];
      var description = "";
      if(params.length == 10) description = params[9];

      if(adminpass != "")
        var hash = hash_pass(adminpass);
      else
        var hash = adminpass;

      db.collection(coll).find({views:{$exists:true}}, function(err, docs){
        if(docs !== null && docs.length != 0 && docs[0]["adminpass"] == "" || docs[0]["adminpass"] == hash)
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
              desc: description}}, function(err, docs){
              db.collection(coll).find({views:{$exists:true}}, function(err, docs)
              {
                io.to(coll).emit("conf", docs);
                socket.emit("toast", "savedsettings");
              });
            });

        }else
        {
          socket.emit("toast", "wrongpass");
        }
      });
    }
  });

  socket.on('shuffle', function(pass)
  {
    if(pass !== undefined && pass !== null)
    {
      check_inlist(coll, guid, socket, name);

      if(pass == "") var hash = pass;
      else var hash = hash_pass(pass);
      db.collection(coll).find({views:{$exists:true}}, function(err, docs){
        if(docs !== null && docs.length != 0 && ((docs[0]["adminpass"] == hash || docs[0]["adminpass"] == "") || docs[0]["shuffle"] == false))
        {
          db.collection(coll).find({now_playing:false}).forEach(function(err, docs){
            if(!docs){
              send_list(coll, undefined, false, true, false);
              socket.emit("toast", "shuffled");
              return;
            }else{
              num = Math.floor(Math.random()*1000000);
              db.collection(coll).update({id:docs["id"]}, {$set:{added:num}});
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

  socket.on('change_channel', function()
  {
    if(in_list)
    {
        if(contains(lists[coll], guid))
        {
    	  	var index = lists[coll].indexOf(guid);
          if(index != -1)
          {
      	  	lists[coll].splice(index, 1);
            io.to(coll).emit("viewers", lists[coll].length);
            io.to(coll).emit('chat', [name, " left"]);
            socket.leave(coll);
          }
        }

    }
  });

  socket.on('disconnect', function()
  {
    left_channel(coll, guid, name, short_id);
  });

  socket.on('reconnect_failed', function()
  {
    left_channel(coll, guid, name, short_id);
  });

  socket.on('connect_timeout', function()
  {
    left_channel(coll, guid, name, short_id);
  });

  socket.on('error', function()
  {
    left_channel(coll, guid, name, short_id);
  });

  socket.on('pos', function()
  {
    check_inlist(coll, guid, socket, name);
    send_play(coll, socket);
  });
});

function left_channel(coll, guid, name, short_id)
{
  if(lists[coll] !== undefined && contains(lists[coll], guid))
  {
    var index = lists[coll].indexOf(guid);
    if(index != -1)
    {
      lists[coll].splice(index, 1);
      io.to(coll).emit("viewers", lists[coll].length);
      io.to(coll).emit('chat', [name, " left"]);
    }
  }

  if(contains(unique_ids, short_id))
  {
    var index = unique_ids.indexOf(guid);
    if(index != -1)
      lists[coll].splice(index, 1);
  }

}

function del(params, socket)
{
  var coll = emojiStrip(params[0]).toLowerCase();
  coll = decodeURIComponent(coll);
  coll = coll.replace(/\W/g, '');
  db.collection(coll).find({views:{$exists:true}}, function(err, docs){
    if(docs !== null && docs.length != 0 && docs[0]["adminpass"] == hash_pass(params[3]))
    {
      db.collection(coll).remove({id:params[1]}, function(err, docs){
        socket.emit("toast", "deletesong");
        io.to(coll).emit("channel", ["deleted", params[1]]);
      });
    }
  });
}

function check_inlist(coll, guid, socket, name)
{
  if(lists[coll] == undefined)
  {
    lists[coll] = [];
    lists[coll].push(guid);
    io.to(coll).emit("viewers", lists[coll].length);
    socket.broadcast.to(coll).emit('chat', [name, " joined"]);
  }else if(!contains(lists[coll], guid))
  {
    lists[coll].push(guid);
    io.to(coll).emit("viewers", lists[coll].length);
    socket.broadcast.to(coll).emit('chat', [name, " joined"]);
  }
}

function hash_pass(adminpass)
{
  return crypto.createHash('sha256').update(adminpass).digest('base64');
}

function vote(coll, id, guid, socket)
{
	db.collection(coll).find({id:id}, function(err, docs){
		if(docs !== null && docs.length > 0 && !contains(docs[0]["guids"], guid))
		{
  		db.collection(coll).update({id:id}, {$inc:{votes:1}, $set:{added:get_time()}, $push :{guids: guid}}, function(err, docs)
  		{
          socket.emit("toast", "voted");
          io.to(coll).emit("channel", ["vote", id, get_time()]);
  		});
		}else
    {
      socket.emit("toast", "alreadyvoted");
    }
	});
}


function change_song(coll, id, np_id)
{
  db.collection(coll).find({views:{$exists:true}}, function(err, docs){
    var startTime = docs[0]["startTime"];
    if(docs !== null && docs.length != 0)
    {
      if(docs[0]["removeplay"] == true)
      {
        db.collection(coll).remove({now_playing:true}, function(err, docs)
        {
          change_song_post(coll);
        })
      }else
      {
          db.collection(coll).update({now_playing:true},
            {$set:{
              now_playing:false,
              votes:0,
              guids:[]
            }},{multi:true}, function(err, docs)
            {
                change_song_post(coll);
          });
      }
    }
  });
}

function change_song_post(coll)
{
    db.collection(coll).aggregate([
      {$match:{now_playing:false}},
      {$sort:{votes:-1, added:1}},
      {$limit:1}], function(err, docs){
         if(docs !== null && docs.length > 0){
          db.collection(coll).update({id:docs[0]["id"]},
          {$set:{
            now_playing:true,
            votes:0,
            guids:[],
            added:get_time()}}, function(err, docs){
              db.collection(coll).update({views:{$exists:true}},
                {$set:{startTime:get_time(), skips:[]}}, function(err, docs){
                  io.to(coll).emit("channel", ["song_change", get_time()]);
                  send_play(coll);
              });

            });
        }
  });
}

function send_list(coll, socket, send, list_send, configs)
{
  db.collection(coll).find({views:{$exists:false}}, function(err, docs)
  {
    if(list_send)
      io.to(coll).emit("channel", ["list", docs]);
    else if(!list_send)
      socket.emit("channel",["list", docs]);
    if(socket === undefined && send)
      send_play(coll);
    else if(send)
      send_play(coll, socket);
  });

  if(configs)
  {
    db.collection(coll).find({views:{$exists:true}}, function(err, conf){ 
      if(conf[0].desc === undefined)
        db.collection(coll).update({views:{$exists:true}}, {$set:{"desc":""}});
      //db.collection(coll).update({views:{$exists:true}}, {$set:{"desc":""}}, function(err, d){console.log(d)});
      io.to(coll).emit("conf", conf);
    });
  }

}

function send_play(coll, socket)
{
  db.collection(coll).find({now_playing:true}, function(err, np){
      db.collection(coll).find({views:{$exists:true}}, function(err, conf){
        if(err !== null) console.log(err);
        if(conf !== null && conf !== undefined && conf.length != 0)
        {
          toSend = [np,conf,get_time()];
          if(socket === undefined)
            io.to(coll).emit("np", toSend);
          else
            socket.emit("np", toSend);
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
    var i = a.length;
    while (i--) {
       if (a[i] === obj) {
           return true;
       }
    }
    return false;
}

function rndName(seed, endlen) {
  var vowels = ['a', 'e', 'i', 'o', 'u'];
  consts =  ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z', 'tt', 'ch', 'sh'];
  len = 8;
  word = '';
  is_vowel = false;
  var arr;
  for (var i = 0; i < len; i++) {
    if (is_vowel) arr = vowels
    else arr = consts
    is_vowel = !is_vowel;
    word += arr[(seed[i%seed.length].charCodeAt()+i) % arr.length-1];
  }
  return word.substring(0, Math.ceil(endlen))
}

function uniqueID(seed, minlen){
  var len = minlen;
  var id = rndName(seed, len);

  while( contains(unique_ids, id) && len<=8){
    id = rndName(String(len)+id, len);
    len += 0.1;                        // try 10 times at each length
  }

  return id;
}
