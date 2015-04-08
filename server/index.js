
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

//db
var mongojs = require('mongojs');
var db = mongojs.connect('mydb', ['kasper']);

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
    if(lists[list[0]] == undefined)
    {
    	lists[list[0]] = [];
    	lists[list[0]].push(socket);
    }else lists[list[0]].push(socket);
    console.log(lists[list[0]].length);

    db.collection(coll).find({views:{$exists : true}}, function(err, docs){
    	if(!contains(docs[0]["views"], guid))
    	{
    		db.collection(coll).update({views:{$exists : true}}, {$push:{views:guid}}, function(err, docs){
    			db.collection(list[0]).find().sort({added:-1}, function(err, docs) {
			    	console.log(docs);
			    	socket.emit(list[1], docs);
			    });
    		});
    	}else
    	{
    		db.collection(list[0]).find().sort({added:-1}, function(err, docs) {
		    	console.log(docs);
		    	socket.emit(list[1], docs);
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
  		if(contains(docs[0]["guids"], guid))
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
  					for(x in lists[coll])
  					{
  						lists[coll][x].emit(coll, docs);
  					}
  				});
	  		});
  		}
  	});
  	
  });

  socket.on('skip', function(list)
  {
  	console.log("skip on list: " + list);
  	var coll = list[0].toLowerCase();
  	db.collection(coll).find({skip: "true"}, function(err, docs){
  		if(docs.length == 1)
  		{
  			if(docs[0]["views"].length/2 <= docs[0]["skips"]+1)
  			{
  				//aggregationfunction to update now playing and the next boolean values
  				//Also flush skips array so its length = 0
  			}
  		}
  	});
  });

  socket.on('disconnect', function()
  {
  	try
  	{
	  	var index = lists[coll].indexOf(socket);
	  	lists.splice(index, 1);
  	}catch(err){}
  	/*db.collection(coll).update({guids: guid},{$pull: {guids: guid}}, {multi: true}, function(err, docs)
  	{});
  	db.collection(coll).update({skips: guid},{$pull: {skips: guid}}, {multi: true}, function(err, docs)
  	{});*/
  	db.collection(coll).update({views: guid},{$pull: {views: guid}}, {multi: true}, function(err, docs)
  	{});
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