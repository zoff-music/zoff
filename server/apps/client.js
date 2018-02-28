VERSION = require(pathThumbnails + '/VERSION.js');

var add = "";
var path = require('path');
var express = require('express');
var app = express();
var exphbs = require('express-handlebars');

var hbs = exphbs.create({
	defaultLayout: publicPath + '/layouts/client/main',
	layoutsDir: publicPath + '/layouts/client',
	partialsDir: publicPath + '/partials'
});
uniqid = require('uniqid');


app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.enable('view cache');
app.set('views', publicPath);

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	extended: true
}));
app.use(cookieParser());

/* Starting DB and socketio */
io = require('socket.io')({
	pingTimeout: 25000,
	//path: '/zoff',
	//"origins": ("https://zoff.me:443*,https://zoff.me:8080*,zoff.me:8080*,https://remote.zoff.me:443*,https://remote.zoff.me:8080*,https://fb.zoff.me:443*,https://fb.zoff.me:8080*,https://admin.zoff.me:443*,https://admin.zoff.me:8080*, http://localhost:8080*")});
});
db = require(pathThumbnails + '/handlers/db.js');
var socketIO = require(pathThumbnails +'/handlers/io.js');
socketIO();

app.socketIO = io;

request = require('request');

/* Globally needed "libraries" and files */
Functions = require(pathThumbnails + '/handlers/functions.js');
ListChange = require(pathThumbnails + '/handlers/list_change.js');
Chat = require(pathThumbnails + '/handlers/chat.js');
List = require(pathThumbnails + '/handlers/list.js');
Suggestions = require(pathThumbnails + '/handlers/suggestions.js');
ListSettings = require(pathThumbnails + '/handlers/list_settings.js');
Frontpage = require(pathThumbnails + '/handlers/frontpage.js');
Notifications = require(pathThumbnails + '/handlers/notifications.js');
Search = require(pathThumbnails + '/handlers/search.js');
crypto = require('crypto');
node_cryptojs = require('node-cryptojs-aes');
CryptoJS = node_cryptojs.CryptoJS;
emojiStrip = require('emoji-strip');
Filter = require('bad-words');
filter = new Filter({ placeHolder: 'x'});

var router = require(pathThumbnails + '/routing/client/router.js');
var api = require(pathThumbnails + '/routing/client/api.js');
var ico_router = require(pathThumbnails + '/routing/client/icons_routing.js');

app.get('/robots.txt', function (req, res) {
	res.type('text/plain');
	res.send("User-agent: *\nAllow: /$\nDisallow: /");
});

app.use(function (req, res, next) {
	var cookie = req.cookies._uI;
	if (cookie === undefined) {
		var user_name = Functions.rndName(uniqid.time(), 15);
		res.cookie('_uI',user_name, { maxAge: 365 * 10000 * 3600000 });
	}
	res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.use('/service-worker.js', function(req, res) {
	res.sendFile(publicPath + '/service-worker.js');
});

app.use('/', ico_router);
app.use('/', api);
app.use('/', router);

app.use('/assets/js', function(req, res, next) {
    res.sendStatus(403);
    return;
});

app.use('/assets/admin', function(req, res, next) {
    res.sendStatus(403);
    return;
});

app.use('/assets', express.static(publicPath + '/assets'));

app.use(function (req, res, next) {
  res.status(404);
  res.redirect("/404");
})

db.on('error',function(err) {
	console.log("\n" + new Date().toString() + "\n Database error: ", err);
});

/* Resetting usernames, and connected users */
db.collection("unique_ids").update({"_id": "unique_ids"}, {$set: {unique_ids: []}}, {multi: true, upsert: true}, function(err, docs){});
db.collection("user_names").remove({"guid": {$exists: true}}, {multi: true, upsert: true}, function(err, docs){});
db.collection("user_names").update({"_id": "all_names"}, {$set: {names: []}}, {multi: true, upsert: true}, function(err, docs){});
db.collection("connected_users").update({users: {$exists: true}}, {$set: {users: []}}, {multi: true, upsert: true}, function(err, docs){});
db.collection("connected_users").update({"_id": "total_users"}, {$set: {total_users: []}}, {multi: true, upsert: true}, function(err, docs) {});
db.collection("frontpage_lists").update({viewers: {$ne: 0}}, {$set: {"viewers": 0}}, {multi: true, upsert: true}, function(err, docs) {});

module.exports = app;
