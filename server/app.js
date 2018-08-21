var cluster = require('cluster'),
    net = require('net'),
    path = require('path'),
    http = require('spdy'),
    port = 8080,
    fs = require('fs'),
    uniqid = require('uniqid'),
    num_processes = require('os').cpus().length;

publicPath = path.join(__dirname, 'public');
pathThumbnails = __dirname;

var main_client = fs.readFileSync(publicPath + '/assets/dist/main.min.js');

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
            //console.log(ip);
            var s = '';
            if(ip == undefined) ip = uniqid.time();
	    for (var i = 0, _len = ip.length; i < _len; i++) {
                if(!isNaN(ip[i])) {
                    s += ip[i];
                }
            }
            return Number(s)%len;
            //eturn farmhash.fingerprint32(ip) % len;
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
    var options = {
        spdy: {
            protocols: [ 'h2', 'spdy/3.1', 'http/1.1' ],
            plain: true,
            'x-forwarded-for': true,

        }
    };
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
        options.spdy.key = credentials.key;
        options.spdy.cert = credentials.cert;
        options.spdy.ca = credentials.ca;
        options.spdy.secure = true;
        options.ssl = true;
        options.secure = false;
        //var https = require('https');
        //server = https.Server(credentials, routingFunction);
    } catch(err){
        console.log("Starting without https (probably on localhost)");
        options.ssl = false;
        options.secure = false;
        options.spdy.secure = false;
        //server = http.createServer(routingFunction);
    }

    server = http.createServer(options, routingFunction);
    console.log(server);
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
    try {
        var url = req.headers['x-forwarded-host'] ? req.headers['x-forwarded-host'] : req.headers.host.split(":")[0];
        var subdomain = req.headers['x-forwarded-host'] ? req.headers['x-forwarded-host'].split(".") : req.headers.host.split(":")[0].split(".");

        if(subdomain.length > 1 && subdomain[0] == "admin") {
            admin(req, res, next);
        } else {
            console.log("this other place");
            /*res.push('/assets/dist/main.min.js', headers, function(err, stream){
                console.log("this place");
                if (err) return;

                stream.end(main_client);
            });*/
            client(req, res, next);
        }
    } catch(e) {
        res.status(500);
    }
}
