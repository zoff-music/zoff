var cluster = require('cluster'),
    net = require('net'),
    path = require('path'),
    publicPath = path.join(__dirname, 'public'),
    http = require('http'),
    port = 8080,
    num_processes = require('os').cpus().length,
    express = require('express'),
    vhost = require('vhost'),
    app = express();

try {
    var redis = require("redis");
    var client = redis.createClient({host: "localhost", port: 6379});
    client.quit();
    startClustered(true);
} catch(e) {
    console.log("Couldn't connect to redis-server, assuming non-clustered run");
    startClustered(false);
}

function startClustered(redis_enabled) {
    //Found https://stackoverflow.com/questions/40885592/use-node-js-cluster-with-socket-io-chat-application
    if (cluster.isMaster) {
        var workers = [];
        var spawn = function(i) {
            workers[i] = cluster.fork();
            workers[i].on('exit', function(code, signal) {
                console.log('respawning worker', i);
                spawn(i);
            });
        };

        for (var i = 0; i < num_processes; i++) {
            spawn(i);
        }

        var worker_index = function(ip, len) {
            var s = '';
            for (var i = 0, _len = ip.length; i < _len; i++) {
                if (!isNaN(ip[i])) {
                    s += ip[i];
                }
            }
            return Number(s) % len;
        };

        var server = net.createServer({ pauseOnConnect: true }, function(connection) {
            var worker = workers[worker_index(connection.remoteAddress, num_processes)];
            worker.send('sticky-session:connection', connection);
        }).listen(port);
    } else {
        startSingle(true, redis_enabled);
    }
}

function startSingle(clustered, redis_enabled) {
    var client = require('./client.js');
    var admin = require('./admin.js');
    var server;
    var admin_server;
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
        server = https.Server(credentials, client);
        admin_server = https.Server(credentials, admin);

    } catch(err){
        console.log("Starting without https (probably on localhost)");
        server = http.Server(client);
        admin_server = http.Server(admin);
        //add = ",http://localhost:80*,http://localhost:8080*,localhost:8080*, localhost:8082*,http://zoff.dev:80*,http://zoff.dev:8080*,zoff.dev:8080*, zoff.dev:8082*";
    }



    if(clustered) {
        app
        .use( vhost('*', function(req, res) {
            server.emit("request", req, res);
        }) )
        .use( vhost('remote.*', function(req, res) {
            server.emit("request", req, res);
        }) )
        .use( vhost('admin.*', function(req, res) {
            admin_server.emit("request", req, res);
        }) )
        .listen(onListen);
        //server.listen(onListen);
    } else {
        app
        .use( vhost('*', function(req, res) {
            server.emit("request", req, res);
        }) )
        .use( vhost('remote.*', function(req, res) {
            server.emit("request", req, res);
        }) )
        .use( vhost('admin.*', function(req, res) {
            admin_server.emit("request", req, res);
        }) )
        .listen(port, onListen);
        //server.listen(port, onListen);
    }

    var socketIO = client.socketIO;

    if(redis_enabled) {
        var redis = require('socket.io-redis');
        try {
            socketIO.adapter(redis({ host: 'localhost', port: 6379 }));
        } catch(e) {
            console.log("No redis-server to connect to..");
        }
        socketIO.listen(server);
    } else {
        socketIO.listen(server);
    }

    process.on('message', function(message, connection) {
        if (message !== 'sticky-session:connection') {
            return;
        }
        server.emit('connection', connection);

        connection.resume();
    });
}

function onListen() {
    console.log("Started with pid [" + process.pid + "]");
}
