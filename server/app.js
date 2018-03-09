var cluster = require('cluster'),
    net = require('net'),
    path = require('path'),
    //publicPath = path.join(__dirname, 'public'),
    http = require('http'),
    port = 8080,
    num_processes = require('os').cpus().length;

publicPath = path.join(__dirname, 'public');
pathThumbnails = __dirname;

try {
    var redis = require("redis");
    var client = redis.createClient({host: "localhost", port: 6379});
    client.on("error", function (err) {
        console.log("Couldn't connect to redis-server, assuming non-clustered run");
        num_processes = 1;
        startClustered(false);
        client.quit();
    });
    client.on("connect", function() {
        startClustered(true);
        client.quit();
    });
} catch(e) {
    console.log("Couldn't connect to redis-server, assuming non-clustered run");
    num_processes = 1;
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

        var server = net.createServer({ pauseOnConnect: true }, function(connection, a) {
            var worker = workers[worker_index(connection.remoteAddress, num_processes)];
            worker.send('sticky-session:connection', connection);
        }).listen(port);
    } else {
        startSingle(true, redis_enabled);
    }
}

function startSingle(clustered, redis_enabled) {
    var server;
    var client = require('./apps/client.js');
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
        server = https.Server(credentials, routingFunction);
    } catch(err){
        console.log("Starting without https (probably on localhost)");
        server = http.createServer(routingFunction);
    }

    if(clustered) {
        server.listen(onListen);
    } else {
        server.listen(port, onListen);
    }

    var socketIO = client.socketIO;

    if(redis_enabled) {
        var redis = require('socket.io-redis');
        try {
            socketIO.adapter(redis({ host: 'localhost', port: 6379 }));
        } catch(e) {
            console.log("No redis-server to connect to..");
        }
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

function onListen() {
    console.log("Started with pid [" + process.pid + "]");
}

function routingFunction(req, res, next) {
    var client = require('./apps/client.js');
    var admin = require('./apps/admin.js');
    var url = req.headers['x-forwarded-host'] ? req.headers['x-forwarded-host'] : req.headers.host.split(":")[0];
    var subdomain = req.headers['x-forwarded-host'] ? req.headers['x-forwarded-host'].split(".") : req.headers.host.split(":")[0].split(".");

    if(subdomain.length > 1 && subdomain[0] == "admin") {
        admin(req, res, next);
    } else {
        client(req, res, next);
    }
}
