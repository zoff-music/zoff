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
app.enable('view cache');
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
	add = ",http://localhost:80*,http://localhost:8080*,localhost:8080*, localhost:8082*,,http://zoff.dev:80*,http://zoff.dev:8080*,zoff.dev:8080*, zoff.dev:8082*";
}

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	extended: true
}));
app.use(cookieParser());

/* Starting DB and socketio */
io = require('socket.io')(server, {
	pingTimeout: 25000,
}); //, "origins": ("https://zoff.me:443*,https://zoff.me:8080*,zoff.me:8080*,https://remote.zoff.me:443*,https://remote.zoff.me:8080*,https://fb.zoff.me:443*,https://fb.zoff.me:8080*,https://admin.zoff.me:443*,https://admin.zoff.me:8080*" + add)});
db = require('./handlers/db.js');
var socketIO = require('./handlers/io.js');
socketIO();

request = require('request');

/* Globally needed "libraries" and files */
Functions = require('./handlers/functions.js');
ListChange = require('./handlers/list_change.js');
Chat = require('./handlers/chat.js');
List = require('./handlers/list.js');
Suggestions = require('./handlers/suggestions.js');
ListSettings = require('./handlers/list_settings.js');
Frontpage = require('./handlers/frontpage.js');
crypto = require('crypto');
node_cryptojs = require('node-cryptojs-aes');
CryptoJS = node_cryptojs.CryptoJS;
emojiStrip = require('emoji-strip');
Filter = require('bad-words');
filter = new Filter({ placeHolder: 'x'});

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
		var user_name = Functions.rndName(uniqid.time(), 15);
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
db.collection("connected_users").update({users: {$exists: true}}, {$set: {users: []}}, {multi: true, upsert: true}, function(err, docs){});
db.collection("connected_users").update({"_id": "total_users"}, {$set: {total_users: 0}}, {multi: true, upsert: true}, function(err, docs) {});
db.collection("frontpage_lists").update({viewers: {$ne: 0}}, {$set: {"viewers": 0}}, {multi: true, upsert: true}, function(err, docs) {});
