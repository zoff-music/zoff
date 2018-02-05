var express = require('express'),
    cluster = require('cluster'),
    net = require('net'),
    socketio = require('socket.io'),
    socket_redis = require('socket.io-redis');

    var path = require('path');
    var publicPath = path.join(__dirname, 'public');

    var http = require('http');

var port = 8080,
    num_processes = require('os').cpus().length;

if (cluster.isMaster) {
    // This stores our workers. We need to keep them to be able to reference
    // them based on source IP address. It's also useful for auto-restart,
    // for example.
    var workers = [];

    // Helper function for spawning worker at index 'i'.
    var spawn = function(i) {
        workers[i] = cluster.fork();

        // Optional: Restart worker on exit
        workers[i].on('exit', function(code, signal) {
            console.log('respawning worker', i);
            spawn(i);
        });
    };

    // Spawn workers.
    for (var i = 0; i < num_processes; i++) {
        spawn(i);
    }

    // Helper function for getting a worker index based on IP address.
    // This is a hot path so it should be really fast. The way it works
    // is by converting the IP address to a number by removing non numeric
  // characters, then compressing it to the number of slots we have.
    //
    // Compared against "real" hashing (from the sticky-session code) and
    // "real" IP number conversion, this function is on par in terms of
    // worker index distribution only much faster.
    var worker_index = function(ip, len) {
        var s = '';
        for (var i = 0, _len = ip.length; i < _len; i++) {
            if (!isNaN(ip[i])) {
                s += ip[i];
            }
        }

        return Number(s) % len;
    };

    // Create the outside facing server listening on our port.
    var server = net.createServer({ pauseOnConnect: true }, function(connection) {
        // We received a connection and need to pass it to the appropriate
        // worker. Get the worker for this connection's source IP and pass
        // it the connection.
        var worker = workers[worker_index(connection.remoteAddress, num_processes)];
        worker.send('sticky-session:connection', connection);
    }).listen(port);
} else {
    // Note we don't use a port here because the master listens on it for us.
    var app = require('./index.js');

    // Here you might use middleware, attach routes, etc

    // Don't expose our internal server to the outside.
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
    	//add = ",http://localhost:80*,http://localhost:8080*,localhost:8080*, localhost:8082*,http://zoff.dev:80*,http://zoff.dev:8080*,zoff.dev:8080*, zoff.dev:8082*";
    }

    server.listen();

    var socketIO = app.socketIO;
    var redis = require('socket.io-redis');
    socketIO.adapter(redis({ host: 'localhost', port: 6379 }));
    //socketIO.set( 'origins', '*localhost:8080' );
    socketIO.listen(server);

    // Tell Socket.IO to use the redis adapter. By default, the redis
    // server is assumed to be on localhost:6379. You don't have to
    // specify them explicitly unless you want to change them.
    //io.adapter(socket_redis({ host: 'localhost', port: 6379 }));

    // Here you might use Socket.IO middleware for authorization etc.

    /*io.on('connection', function(socket) {
        console.log('New client connection detected on process ' + process.pid);

        socket.emit('welcome', {message: 'Welcome to BlueFrog Chat Room'});
        socket.on('new.message', function(message) {
            socket.emit('new.message', message);
        })

    });*/


    // Listen to messages sent from the master. Ignore everything else.
    process.on('message', function(message, connection) {
        if (message !== 'sticky-session:connection') {
            return;
        }

        // Emulate a connection event on the server by emitting the
        // event with the connection the master sent us.
        server.emit('connection', connection);

        connection.resume();
    });
}
