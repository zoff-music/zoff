var readline = require('readline');
var mongojs = require('mongojs');
var db = mongojs.connect('mydb');


var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("Channel to pin: ", function(coll) {
  // TODO: Log the answer in a database
  db.collection("frontpage_lists").update({pinned:1}, {$set:{pinned:0}}, function(err, resp){
  	db.collection("frontpage_lists").update({_id:coll}, {$set:{pinned:1}}, function(err, resp){
  		console.log("Changed pinned channel to: " + coll);
  		process.exit();
  	});
  });
  rl.close();
});