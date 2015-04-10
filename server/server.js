
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

//db
var mongojs = require('mongojs');
var db = mongojs.connect('mydb');

//crypto
var crypto = require('crypto');

var port = 3000;
var lists = [];

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});


io.on('connection', function(socket){

  var coll;
  var guid;
  var tot_lists = [];
  var in_list = false;

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
            db.collection(name).find({now_playing:true}, function(err, np){
              complete(np, i, colNames.length-2, name);
              i++;
            });
          }
      });
    });

    var complete = function(list, curr, tot, name)
    {
      console.log("inside");
      if(list.length > 0)
      {
        var id = list[0]["id"];
        var title = list[0]["title"];
        try{
          var viewers = lists[name].length;
        }catch(err){console.log("no viewers"); var viewers = 0;}
        var to_push = [viewers, id, title, name];
        playlists_to_send.push(to_push);
      }
      if(curr == tot)
      {
        socket.emit("playlists", playlists_to_send);
      }
    }

  });

  socket.on('list', function(list)
  {
    in_list = true;
  	list = list.split(',');
  	coll = list[0].toLowerCase();
  	guid = list[1];

  	console.log("user connected to list: " + list[0]);
    if(lists[coll] == undefined)
    {
    	lists[coll] = [];
    	lists[coll].push(guid);
    }else lists[coll].push(guid);

    io.sockets.emit(coll+",viewers", lists[coll].length);

    db.getCollectionNames(function(err, docs){
    	if(contains(docs, coll))
    	{
    		sort_list(coll, socket, true);
    	}else
    	{
    		db.createCollection(coll, function(err, docs){
  				db.collection(coll).insert({"addsongs":false, "adminpass":"", "allvideos":true, "frontpage":true, "longsongs":true, "removeplay": false, "shuffle": false, "skip": true, "skips": [], "startTime":get_time(), "views": [], "vote": false}, function(err, docs)
  				{
            db.collection(coll).find().sort({votes:-1}, function(err, docs) {
    		    	console.log(docs);
    		    	socket.emit(coll, docs);
    		    	//send_play(coll, socket);
    		    });
  				});
    		});
    	}
    });
  });

  socket.on('end', function(arg)
  {
  	db.collection(coll).find({now_playing:true}, function(err, docs){
  		if(docs.length > 0 && docs[0]["id"] == arg){
  			change_song(coll);
  		}
  	})
  });

  socket.on('add', function(arr)
  {
  	console.log("add songs");
  	var id = arr[0];
  	var title = arr[1];
    var hash = hash_pass(arr[2]);
    db.collection(coll).find({views:{$exists:true}}, function(err, docs)
    {
      if((docs[0]["addsongs"] == "true" && (hash == docs[0]["adminpass"] || docs[0]["adminpass"] == "")) || docs[0]["addsongs"] == "false")
      {
        db.collection(coll).find({id:id}, function(err, docs){
          if(docs.length == 0)
          {
    		  	var guids = [guid];
    		  	var votes = 1
            db.collection(coll).find({now_playing:true}, function(err, docs){
              if(docs.length == 0)
                np = true;
              else
                np = false;
        			db.collection(coll).insert({"added":get_time(),"guids":guids,"id":id,"now_playing":np,"title":title,"votes":votes}, function(err, docs){
      		  		sort_list(coll, undefined, np);
      		  	});
            });
          }else{
            vote(coll, id, guid);
          }
        });
      }else
        socket.emit("error_settings", "Password Protected List!");
    });
  });

  socket.on('vote', function(msg)
  {
  	console.log("vote on list: " + msg[0].toLowerCase());
    if(msg[2] == "del")
      del(msg);
    else
    {
    	var id = msg[1];
    	guid = msg[3];
      var hash = hash_pass(msg[4]);
      db.collection(coll).find({views:{$exists:true}}, function(err, docs)
      {
        if((docs[0]["vote"] == "true" && (hash == docs[0]["adminpass"] || docs[0]["adminpass"] == "")) || docs[0]["vote"] == "false")
        {
          vote(coll, id, guid);
        }else{
          socket.emit("error_settings", "Password Protected List!");
        }
      });
    }
  });

  socket.on('skip', function(list)
  {
  	console.log("skip on list: " + list);
  	db.collection(coll).find({skip: "true"}, function(err, docs){
  		if(docs.length == 1)
  		{
  			console.log(lists[coll]);
  			if(lists[coll].length/2 <= docs[0]["skips"]+1)
  			{
  				change_song(coll);
  			}else{
  				db.collection(coll).update({views:{$exists:true}}, {$push:{guids:guid}}, function(err, d){
  					//reply with skips or something
  					console.log("skipped without effect");
            socket.emit("skipping", [docs[0]["skips"]+1, lists[coll].length])
  				});
  			}
  		}else
        socket.emit("error_settings", "No Skipping!");
  	});
  });

  socket.on('conf', function(params)
  {
    var voting = params[0];
  	var addsongs = params[1];
  	var longsongs = params[2];
  	var frontpage = params[3];
  	var allvideos = params[4];
  	var removeplay = params[5];
  	var adminpass = params[6];
  	var skipping = params[7];
  	var shuffling = params[8];

    var hash = hash_pass(adminpass);

    db.collection(coll).find({views:{$exists:true}}, function(err, docs){
      console.log(docs[0]["adminpass"]);
      console.log(params);
      if(docs[0]["adminpass"] == "" || docs[0]["adminpass"] == hash)
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
            adminpass:hash}}, function(err, docs){
            socket.emit("success_settings", "Successfully applied settings!");
            sort_list(coll,undefined,false);
          });

      }else
      {
        socket.emit("error_settings", "Wrong Password!");
      }
    });
  });

  socket.on('shuffle', function(pass){
    var hash = hash_pass(pass);
    db.collection(coll).find({views:{$exists:true}}, function(err, docs){
      if((docs[0]["adminpass"] == hash || docs[0]["adminpass"] == "") || docs[0]["shuffle"] == "true")
      {
        db.collection(coll).find({now_playing:false}).forEach(function(err, docs){
          if(!docs){
            sort_list(coll, undefined, false);
            return;
          }else{
            console.log(docs);
            num = Math.floor(Math.random()*1000000);
            db.collection(coll).update({id:docs["id"]}, {$set:{added:num}}, function(err, d)
            {});
          }
        });
      }
    });
  });

  socket.on('disconnect', function()
  {
    if(in_list)
    {
    	try
    	{
  	  	var index = lists[coll].indexOf(guid);
  	  	lists[coll].splice(index, 1);
  	  	io.sockets.emit(coll+",viewers", lists[coll].length);
    	}catch(err){}
    }
  });

  socket.on('pos', function()
  {
    console.log("EMITTED");
    send_play(coll, socket);
  });
});

function del(params)
{
  var coll = params[0].toLowerCase();
  db.collection(coll).find({views:{$exists:true}}, function(err, docs){
    console.log(docs);
    if(docs[0]["adminpass"] == hash_pass(params[4]))
    {
      console.log("del");
      db.collection(coll).remove({id:params[1]}, function(err, docs){
        sort_list(coll, undefined, false);
      })
    }
  })
}

function hash_pass(adminpass)
{
  return crypto.createHash('sha256').update(adminpass).digest('base64');
}

function vote(coll, id, guid)
{
	db.collection(coll).find({id:id}, function(err, docs){
		if(!contains(docs[0]["guids"], guid))
		{
  		db.collection(coll).update({id:id}, {$inc:{votes:1}, $set:{added:get_time()}}, function(err, docs)
  		{
  			db.collection(coll).update({id:id}, {$push :{guids: guid}}, function(err, docs)
  			{
          sort_list(coll, undefined, false);
  			});
  			//sort_list(coll, undefined, false);
  		});
		}
	});
}


function change_song(coll)
{
  db.collection(coll).find({views:{$exists:true}}, function(err, docs){
    if(docs[0]["removeplay"] == "true")
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
        }}, function(err, docs)
        {
            change_song_post(coll);
      });
    }
  })
}

function change_song_post(coll)
{
    db.collection(coll).aggregate([
      {$match:{now_playing:false}},
      {$sort:{votes:-1, added:1}},
      {$limit:1}], function(err, docs){
        db.collection(coll).update({id:docs[0]["id"]},
        {$set:{
          now_playing:true,
          votes:0,
          guids:[],
          added:get_time()}}, function(err, docs){
            db.collection(coll).update({views:{$exists:true}},
              {$set:{startTime:get_time()}}, function(err, docs){
                sort_list(coll,undefined,true);
            });

    });
  });
}

function sort_list(coll, socket, send)
{
  db.collection(coll).aggregate([{$sort:{votes:-1, added:1}}], function(err, docs)
  {
    io.sockets.emit(coll, docs);
    if(socket === undefined && send)
      send_play(coll);
    else if(send)
      send_play(coll, socket);
  });
}

function send_play(coll, socket)
{
  db.collection(coll).find({now_playing:true}, function(err, np){
    console.log("sending now_playing to " + coll+",np");
    db.collection(coll).find({views:{$exists:true}}, function(err, conf){
      toSend = [np,conf,get_time()];
      console.log(toSend);
      if(socket === undefined)
        io.sockets.emit(coll+",np", toSend);
      else
        socket.emit(coll+",np", toSend);
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
