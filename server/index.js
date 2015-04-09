
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

//db
var mongojs = require('mongojs');
var db = mongojs.connect('mydb');

var port = 3000;
var lists = [];

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});


io.on('connection', function(socket){

  var coll;
  var guid;
  
  socket.on('list', function(list)
  {
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
    		db.collection(coll).find().sort({votes:-1}, function(err, docs) {
		    	console.log(docs);
		    	socket.emit(coll, docs);
		    	db.collection(coll).find({now_playing:true}, function(err, np){
		    		console.log("sending now_playing to " + coll+",np");
		    		db.collection(coll).find({views:{$exists:true}}, function(err, conf){
		    			var d = new Date();
		  				var time = Math.floor(d.getTime() / 1000);
		  				toSend = [np,conf,time];
		  				console.log(toSend);
		    			socket.emit(coll+",np", toSend);
		    		});
		    	});
		    });
    	}else
    	{
    		db.createCollection(coll, function(err, docs){
    			var d = new Date();
		  		var time = Math.floor(d.getTime() / 1000);
    			db.collection(coll).insert({"added":time,"guids":[],"id":"30H2Z8Lr-4c","now_playing":true,"title":"Empty Playlist","votes":0}, function(err, docs){
    				db.collection(coll).insert({"addsongs":false, "adminpass":"", "allvideos":true, "frontpage":true, "longsongs":true, "removeplay": false, "shuffle": false, "skip": true, "skips": [], "startTime":time, "views": [], "vote": false}, function(err, docs)
    				{
    					socket.emit(coll, docs);
    				})
    			});
    		})
    	}
    }); 
  });

  socket.on('end', function(arg)
  {
  	db.collection(coll).find({now_playing:true}, function(err, docs){
  		if(docs[0]["id"] == arg){
  			db.collection(coll).update({now_playing:true},
  					{$set:{
  						now_playing:false,
  						votes:0,
  						guids:[]
  					}}, function(err, docs)
  					{
  						db.collection(coll).findAndModify({
  							query: {now_playing:false, id: {$ne: arg}},
  							sort: {votes:-1},
  							update: 
  							{$set:{
  								now_playing:true,
  								votes:0,
  								guids:[]
  							}}
  						}, function(err, docs)
  						{
  							var d = new Date();
						  	var time = Math.floor(d.getTime() / 1000);
  							db.collection(coll).update({views:{$exists:true}},
  								{$set:{startTime:time}}, function(err, docs){
  									db.collection(coll).find().sort({votes:-1}, function(err, docs)
  									{
  										io.sockets.emit(coll, docs);
	  									db.collection(coll).find({now_playing:true}, function(err, np){
								    		console.log("sending now_playing to " + coll+",np");
								    		db.collection(coll).find({views:{$exists:true}}, function(err, conf){
								    			var d = new Date();
								  				var time = Math.floor(d.getTime() / 1000);
								  				toSend = [np,conf,time];
								  				console.log(toSend);
								    			io.sockets.emit(coll+",np", toSend);
								    		});
								    	});
  									});
  								});
  						});
  					});
  		}
  	})
  });

  socket.on('add', function(arr)
  {
  	console.log("add songs");
  	var id = arr[0];
  	var title = arr[1];
  	db.collection(coll).find({id:id}, function(err, docs){
  		if(docs.length < 1)
  		{
  			var d = new Date();
		  	var time = Math.floor(d.getTime() / 1000);
		  	var guids = [guid];
		  	var votes = 1;
		  	db.collection(coll).find({id:"30H2Z8Lr-4c"}, function(err, docs){
		  		if(docs.length == 0){
		  			db.collection(coll).insert({"added":time,"guids":guids,"id":id,"now_playing":false,"title":title,"votes":votes}, function(err, docs){
				  		db.collection(coll).find().sort({votes:-1}, function(err, docs){
					  		io.sockets.emit(coll, docs);
					  	});
				  	}); 
		  		}else{
		  			db.collection(coll).update({id:"30H2Z8Lr-4c"},
	  				{"added":time,"guids":guids,"id":id,"now_playing":false,"title":title,"votes":votes}, function(err, docs){
	  					db.collection(coll).find().sort({votes:-1}, function(err, docs){
					  		io.sockets.emit(coll, docs);
					  	});
	  				});
		  		}
		  	});	
  		}
  	});
  });

  socket.on('vote', function(msg)
  {
  	console.log("vote on list: " + msg[0].toLowerCase());
  	var id = msg[1];
  	guid = msg[3];


  	db.collection(coll).find({id:id}, function(err, docs){
  		if(!contains(docs[0]["guids"], guid))
  		{
	  		db.collection(coll).update({id:id}, {$inc:{votes:1}}, function(err, docs)
	  		{
	  			/*db.collection(coll).update({id:id}, {$push :{guids: guid}}, function(err, docs)
	  			{
	  				db.collection(coll).find().sort({votes:-1}, function(err, docs)
	  				{
	  					console.log(docs);
	  					for(x in lists[coll])
	  					{
	  						lists[coll][x].emit(coll, docs);
	  					}
	  				});
	  			});*/
	  			db.collection(coll).find().sort({votes:-1}, function(err, docs)
  				{
  					console.log(docs);
  					io.sockets.emit(coll, docs);
  					/*for(x in lists[coll])
  					{
  						lists[coll][x].emit(coll, docs);
  					}*/
  				});
	  		});
  		}
  	});
  	
  });

  socket.on('pos', function()
  {

  });

  socket.on('skip', function(list)
  {
  	console.log("skip on list: " + list);
  	var coll = list[0].toLowerCase();
  	db.collection(coll).find({skip: true}, function(err, docs){
  		if(docs.length == 1)
  		{
  			console.log(lists[coll]);
  			if(lists[coll].length/2 <= docs[0]["skips"]+1)
  			{
  				db.collection(coll).update({now_playing:true},
  					{$set:{
  						now_playing:false,
  						votes:0,
  						guids:[]
  					}}, function(err, docs)
  					{
  						db.collection(coll).findAndModify({
  							query: {now_playing:false},
  							sort: {votes:-1},
  							update: 
  							{$set:{
  								now_playing:true,
  								votes:0,
  								guids:[]
  							}}
  						}, function(err, docs)
  						{
  							var d = new Date();
						  	var time = Math.floor(d.getTime() / 1000);
  							db.collection(coll).update({views:{$exists:true}},
  								{$set:{startTime:time}}, function(err, docs){
  									db.collection(coll).find().sort({votes:-1}, function(err, docs)
  									{
	  									io.sockets.emit(coll, docs);
										db.collection(coll).find({now_playing:true}, function(err, np){
								    		console.log("sending now_playing to " + coll+",np");
								    		db.collection(coll).find({views:{$exists:true}}, function(err, conf){
								    			var d = new Date();
								  				var time = Math.floor(d.getTime() / 1000);
								  				toSend = [np,conf,time];
								  				console.log(toSend);
								    			io.sockets.emit(coll+",np", toSend);
								    		});
								    	});
  									});
  								});
  						});
  					});
  			}else{
  				db.collection(coll).update({views:{$exists:true}}, {$push:{guids:guid}}, function(err, coll){
  					//reply with skips or something
  					console.log("skipped without effect");
  				});
  			}
  		}
  	});
  });

  socket.on('disconnect', function()
  {
  	try
  	{
	  	var index = lists[coll].indexOf(guid);
	  	lists.splice(index, 1);
	  	io.sockets.emit(coll+",viewers", lists[coll].length);
  	}catch(err){}
  	/*db.collection(coll).update({guids: guid},{$pull: {guids: guid}}, {multi: true}, function(err, docs)
  	{});
  	db.collection(coll).update({skips: guid},{$pull: {skips: guid}}, {multi: true}, function(err, docs)
  	{});*/
  });

});

function contains(a, obj) {
    var i = a.length;
    while (i--) {
       if (a[i] === obj) {
           return true;
       }
    }
    return false;
}