var app = require('./index.js');
var path = require('path');
var publicPath = path.join(__dirname, 'public');
var debug = require('debug')('king:server');
var http = require('http');
//var config = require('../config/index');

/**
* Get port from environment and store in Express.
*/
//var env = app.get('env');
var port = 8080;
app.set('port', port);

var cluster = require('cluster');
if (cluster.isMaster) {
    var numWorkers = require('os').cpus().length;
    for (var i = 0; i < numWorkers; i++) cluster.fork();
    console.log('[CLUSTER] Master cluster setting up ' + numWorkers + ' workers...');

    cluster.on('online', function(worker) {
        console.log('[CLUSTER] Worker ' + worker.process.pid + ' is online');
    });
    cluster.on('exit', function(worker, code, signal){
        console.log('[CLUSTER] Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        console.log('[CLUSTER] Starting a new worker');
        cluster.fork();
    });
} else {
    /**
    * Create HTTP server.
    */
    try {
        var cert_config = require(path.join(path.join(__dirname, 'config'), 'cert_config.js'));
    	var fs = require('fs');
    	var privateKey  = fs.readFileSync(cert_config.privateKey).toString();
    	var certificate = fs.readFileSync(cert_config.certificate).toString();
    	var ca          = fs.readFileSync(cert_config.ca).toString();
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
    } catch(err){
    	console.log("Starting without https (probably on localhost)");
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
    var port = 8080;

    /**
    * Listen on provided port, on all network interfaces.
    */
    server.listen(port);
    server.on('error', onError);
    server.on('listening', onListening);

    /**
    * Socket.io
    */
    var io = app.socketIO;
    io.listen(server);
    //socketIO.set('transports', ['websocket']);
}


/**
* Event listener for HTTP server "error" event.
*/

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
        case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
        default:
        throw error;
    }
}

/**
* Event listener for HTTP server "listening" event.
*/

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    debug('Listening on ' + bind);
}
