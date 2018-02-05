var cluster = require('cluster'),
    net = require('net'),
    path = require('path'),
    publicPath = path.join(__dirname, 'public'),
    http = require('http'),
    port = 8080,
    num_processes = require('os').cpus().length;

try {
    var redis = require("redis");
    var client = redis.createClient({host: "localhost", port: 6379});
    client.quit();
    startClustered();
} catch(e) {
    console.log("Couldn't connect to redis-server, assuming non-clustered run");
    startSingle(false);
}

function startClustered() {
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
        startSingle(true);
    }
}

function startSingle(clustered) {
    var app = require('./index.js');
    var cors_options = {};
    var cors_proxy = require('cors-anywhere');
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

        cors_options = {
            requireHeader: ['origin', 'x-requested-with'],
            removeHeaders: ['cookie', 'cookie2'],
            httpsOptions: credentials
        };

    } catch(err){
        console.log("Starting without https (probably on localhost)");
        cors_options = {
            requireHeader: ['origin', 'x-requested-with'],
            removeHeaders: ['cookie', 'cookie2'],
        };
        var http = require('http');
        server = http.Server(app);
        //add = ",http://localhost:80*,http://localhost:8080*,localhost:8080*, localhost:8082*,http://zoff.dev:80*,http://zoff.dev:8080*,zoff.dev:8080*, zoff.dev:8082*";
    }

    cors_proxy.createServer(cors_options).listen(8081, function() {
        console.log('Running CORS Anywhere on :' + 8081 + " [" + process.pid + "]");
    });

    if(clustered) {
        server.listen(onListen);
    } else {
        server.listen(port, onListen);
    }

    var socketIO = app.socketIO;

    socketIO.listen(server);

    if(clustered) {
        var redis = require('socket.io-redis');
        try {
            socketIO.adapter(redis({ host: 'localhost', port: 6379 }));
        } catch(e) {
            console.log("No redis-server to connect to..");
        }
        socketIO.listen(server);
        process.on('message', function(message, connection) {
            if (message !== 'sticky-session:connection') {
                return;
            }
            server.emit('connection', connection);

            connection.resume();
        });
    }
}

function onListen() {
    console.log("Started with pid [" + process.pid + "]");
}
