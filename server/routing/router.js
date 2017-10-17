var express = require('express');
var router = express.Router();
const path = require('path');
var nodemailer = require('nodemailer');
var mailconfig = require('../mailconfig.js');
var mongo_db_cred = {config: 'mydb'};
var mongojs = require('mongojs');
var db = mongojs(mongo_db_cred.config);

router.use(function(req, res, next) {
    next(); // make sure we go to the next routes and don't stop here
});

router.route('/:channel_name').get(function(req, res, next){
    channel(req, res, next);
});

router.route('/api/frontpages').get(function(req, res) {
    db.collection("frontpage_lists").find({frontpage: true, count: {$gt: 0}}, function(err, docs) {
        db.collection("connected_users").find({"_id": "total_users"}, function(err, tot) {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({channels: docs, viewers: tot[0].total_users}));
        });
    });
});

router.route('/api/list/:channel_name').get(function(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    var channel_name = req.params.channel_name;
    db.collection(channel_name).find({views: {$exists: false}}, {added: 1, id: 1, title: 1, votes: 1, duration: 1, type: 1, _id: 0}, function(err, docs) {
        if(docs.length > 0) {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(docs));
        } else {
            res.status(404);
            res.send(404);
        }
    });
});

router.route('/api/conf/:channel_name').get(function(req, res) {
    var channel_name = req.params.channel_name;
    db.collection(channel_name).find({views: {$exists: true}},
        {
            addsongs: 1,
            adminpass: 1,
            allvideos: 1,
            frontpage: 1,
            longsongs: 1,
            removeplay: 1,
            shuffle: 1,
            skip: 1,
            startTime: 1,
            userpass: 1,
            vote: 1,
            _id: 0
        }, function(err, docs) {
        if(docs.length > 0) {
            var conf = docs[0];
            if(conf.adminpass != "") {
                conf.adminpass = true;
            } else {
                conf.adminpass = false;
            }
            if(conf.userpass != "") {
                conf.userpass = true;
            } else {
                conf.userpass = false;
            }
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(conf));
        } else {
            res.status(404);
            res.send(404);
        }
    });
});

router.route('/api/imageblob').post(function(req, res) {
    var Jimp = require("jimp");
    Jimp.read('https://img.youtube.com/vi/' + req.body.id + '/mqdefault.jpg', function (err, image) {
        if (err) console.log(err);
        image.blur(50)
             .write(path.join(pathThumbnails, '/public/assets/images/thumbnails/' + req.body.id + '.jpg'), function(e, r) {
                 res.send(req.body.id + ".jpg");
             });
    });
});

router.route('/api/mail').post(function(req, res) {
   let transporter = nodemailer.createTransport(mailconfig);

   transporter.verify(function(error, success) {
      if (error) {
           res.sendStatus(500);
           return;
      } else {
         var from = req.body.from;
         var message = req.body.message;
         var msg = {
             from: 'no-reply@zoff.no',
             to: 'contact@zoff.no',
             subject: 'ZOFF: Contact form webpage',
             text: message,
             html: message,
             replyTo: from
          }
          transporter.sendMail(msg, (error, info) => {
              if (error) {
                  res.send("failed");
                  return;
              }
              res.send("success");
              transporter.close();
          });
      }
   });
});

router.route('/').get(function(req, res, next){
    root(req, res, next);
});


router.route('/').post(function(req, res, next){
    root(req, res, next);
});

function root(req, res, next) {
    try{
        var url = req.headers['x-forwarded-host'] ? req.headers['x-forwarded-host'] : req.headers.host.split(":")[0];
        var subdomain = req.headers['x-forwarded-host'] ? req.headers['x-forwarded-host'].split(".") : req.headers.host.split(":")[0].split(".");
        if(url != "zoff.me" && url != "remote.zoff.me" && url != "fb.zoff.me" && url != "remote.localhost" && url != "localhost") {
            res.redirect("https://zoff.me");
            return;
        }
        if(subdomain[0] == "remote") {
            var data = {
                year: 2017,
                javascript_file: "remote.min.js"
            }
            res.render('layouts/remote', data);
        } else if(subdomain[0] == "www") {
            res.redirect("https://zoff.me");
        } else {
            var data = {
                year: 2017,
                javascript_file: "main.min.js",
            }
            res.render('layouts/frontpage', data);
        }
    } catch(e) {
        //console.log(e);
        //res.redirect("https://zoff.me");
    }
}

function channel(req, res, next) {
    try{
        var url = req.headers['x-forwarded-host'] ? req.headers['x-forwarded-host'] : req.headers.host.split(":")[0];
        var subdomain = req.headers['x-forwarded-host'] ? req.headers['x-forwarded-host'].split(".") : req.headers.host.split(":")[0].split(".");
        if(url != "zoff.me" && url != "remote.zoff.me" && url != "fb.zoff.me" && url != "remote.localhost" && url != "localhost") {
            res.redirect("https://zoff.me");
            return;
        }
        if(subdomain[0] == "remote") {
            var data = {
                year: 2017,
                javascript_file: "remote.min.js"
            }
            res.render('layouts/remote', data);
        } else if(subdomain.length >= 2 && subdomain[0] == "www") {
            res.redirect("https://zoff.me");
        } else {
            if(req.params.channel_name == "_embed") {
                res.sendFile(path.join(pathThumbnails, '/public/assets/html/embed.html'));
            } else if(req.params.channel_name == "o_callback") {
                res.sendFile(path.join(pathThumbnails, '/public/assets/html/callback.html'));
            } else {
                var data = {
                    list_name: capitalizeFirstLetter(req.params.channel_name),
                    year: 2017,
                    javascript_file: "main.min.js"
                }
                res.render('layouts/channel', data);
            }
        }
    } catch(e) {
      res.redirect("https://zoff.me");
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = router;
