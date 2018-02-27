var express = require('express');
var router = express.Router();
var path = require('path');

router.use(function(req, res, next) {
    next(); // make sure we go to the next routes and don't stop here
});

router.route('/api/frontpages').get(function(req, res) {
    db.collection("frontpage_lists").find({frontpage: true, count: {$gt: 0}}, function(err, docs) {
        db.collection("connected_users").find({"_id": "total_users"}, function(err, tot) {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify({channels: docs, viewers: tot[0].total_users.length}));
        });
    });
});

router.route('/api/generate_name').get(function(req, res) {
    Functions.generate_channel_name(res);
});

router.route('/api/list/:channel_name').get(function(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    var channel_name = req.params.channel_name;
    db.collection(channel_name).find({views: {$exists: false}}, {
        start: 1,
        end: 1,
        added: 1,
        id: 1,
        title: 1,
        votes: 1,
        duration: 1,
        type: 1,
        _id: 0,
        now_playing: 1,
    }, function(err, docs) {
        if(docs.length > 0) {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(docs));
        } else {
            /*res.status(404);
            res.send(404);*/
            res.status(404).redirect("/404");
        }
    });
});

router.route('/api/conf/:channel_name').get(function(req, res) {
    var channel_name = req.params.channel_name;
    db.collection(channel_name + "_settings").find({views: {$exists: true}}, {
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
            /*res.status(404);
            res.send(404);*/
            res.status(404).redirect("/404");
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

var nodemailer = require('nodemailer');
try {
    var mailconfig = require(path.join(__dirname, '../../config/mailconfig.js'));
    var recaptcha_config = require(path.join(__dirname, '../../config/recaptcha.js'));
    var Recaptcha = require('express-recaptcha');
    var RECAPTCHA_SITE_KEY = recaptcha_config.site;
    var RECAPTCHA_SECRET_KEY = recaptcha_config.key;
    var recaptcha = new Recaptcha(RECAPTCHA_SITE_KEY, RECAPTCHA_SECRET_KEY);

    router.route('/api/mail').post(recaptcha.middleware.verify, function(req, res) {
        if(req.recaptcha.error == null) {
            let transporter = nodemailer.createTransport(mailconfig);

            transporter.verify(function(error, success) {
                if (error) {
                    res.sendStatus(500);
                    return;
                } else {
                    var subject = 'ZOFF: Contact form webpage';
                    if(req.body.error_report) {
                        subject = 'ZOFF: Error report';
                    }
                    var from = req.body.from;
                    var message = req.body.message;
                    var msg = {
                        from: mailconfig.from,
                        to: mailconfig.to,
                        subject: subject,
                        text: message,
                        html: message,
                        replyTo: from
                    }
                    transporter.sendMail(msg, (error, info) => {
                        if (error) {
                            res.send("failed");
                            transporter.close();
                            return;
                        }
                        res.send("success");
                        transporter.close();
                    });
                }
            });
        } else {
            res.send("failed");
            return;
        }
    });
} catch(e) {
    console.log("Mail is not configured and wont work");
    console.log("Seems you forgot to create a mailconfig.js in /server/config/. Have a look at the mailconfig.example.js.");
    router.route('/api/mail').post(function(req, res) {
        console.log("Someone tried to send a mail, but the mailsystem hasn't been enabled..")
        res.send("failed");
        return;
    });
}

module.exports = router;
