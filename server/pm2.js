var cluster = require("cluster"),
  net = require("net"),
  path = require("path"),
  //publicPath = path.join(__dirname, 'public'),
  http = require("http"),
  port = 8080,
  //farmhash = require('farmhash'),
  uniqid = require("uniqid"),
  num_processes = require("os").cpus().length;

publicPath = path.join(__dirname, "public");
pathThumbnails = __dirname;

var redis = require("redis");
var client = redis.createClient({ host: "localhost", port: 6379 });

startSingle(true, true);

function startSingle(clustered, redis_enabled) {
  var server;
  var client = require("./apps/client.js");
  try {
    var cert_config = require(path.join(
      path.join(__dirname, "config"),
      "cert_config.js"
    ));
    var fs = require("fs");
    var privateKey = fs.readFileSync(cert_config.privateKey).toString();
    var certificate = fs.readFileSync(cert_config.certificate).toString();
    var ca = fs.readFileSync(cert_config.ca).toString();
    var credentials = {
      key: privateKey,
      cert: certificate,
      ca: ca
    };
    var https = require("https");
    server = https.Server(credentials, routingFunction);
  } catch (err) {
    console.log("Starting without https (probably on localhost)");
    server = http.createServer(routingFunction);
  }

  server.listen(port, onListen);

  var socketIO = client.socketIO;

  var redis = require("socket.io-redis");
  try {
    socketIO.adapter(redis({ host: "localhost", port: 6379 }));
  } catch (e) {
    console.log("No redis-server to connect to..");
  }
  socketIO.listen(server);
}

function onListen() {
  console.log("Started with pid [" + process.pid + "]");
}

function routingFunction(req, res, next) {
  var client = require("./apps/client.js");
  var admin = require("./apps/admin.js");
  try {
    var url = req.headers["x-forwarded-host"]
      ? req.headers["x-forwarded-host"]
      : req.headers.host.split(":")[0];
    var subdomain = req.headers["x-forwarded-host"]
      ? req.headers["x-forwarded-host"].split(".")
      : req.headers.host.split(":")[0].split(".");

    if (subdomain.length > 1 && subdomain[0] == "admin") {
      admin(req, res, next);
    } else {
      client(req, res, next);
    }
  } catch (e) {
    console.log("Bad request for " + req.headers.host + req.url, e);
    res.statusCode = 500;
    res.write("Bad request"); //write a response to the client
    res.end(); //end the response
  }
}
