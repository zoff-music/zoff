var express = require('express');
var router = express.Router();
const path = require('path');
var nodemailer = require('nodemailer');
var mailconfig = require('./mailconfig.js');

router.use(function(req, res, next) {
    next(); // make sure we go to the next routes and don't stop here
});

router.route('/:channel_name').get(function(req, res, next){
    try{
        var url = req.headers['x-forwarded-host'] ? req.headers['x-forwarded-host'] : req.headers.host.split(":")[0];
        var subdomain = req.headers['x-forwarded-host'] ? req.headers['x-forwarded-host'].split(".") : req.headers.host.split(":")[0].split(".");
        if(url != "zoff.me" && url != "remote.zoff.me" && url != "remote.localhost" && url != "localhost") {
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
                res.sendFile(path.join(__dirname, '/public/assets/html/embed.html'));
            } else if(req.params.channel_name == "o_callback") {
                res.sendFile(path.join(__dirname, '/public/assets/html/callback.html'));
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
});

router.route('/api/imageblob').post(function(req, res) {
    var Jimp = require("jimp");
    Jimp.read('https://img.youtube.com/vi/' + req.body.id + '/mqdefault.jpg', function (err, image) {
        if (err) throw err;
        image.blur(50)
             .write(path.join(__dirname, '/public/assets/images/thumbnails/' + req.body.id + '.jpg'), function(e, r) {
                 res.send(req.body.id + ".jpg");
             });
    });
});

/*
 *
 * TODO:
 *
 * Add custom userplaylists, only visible for those with that specific cookie
 *
 *
router.route('/:user_name/:channel_name').get(function(req, res, next){
    var protocol = req.protocol;
    var subdomain = req.headers['x-forwarded-host'].split(".");

    if((subdomain[0] != 'localhost' && !(subdomain.length >= 2 && subdomain[1] == 'localhost')) && protocol != "https") {
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
            res.sendFile(path.join(__dirname, '/public/assets/html/embed.html'));
        } else if(req.params.channel_name == "o_callback") {
            res.sendFile(path.join(__dirname, '/public/assets/html/callback.html'));
        } else {
            var data = {
                list_name: capitalizeFirstLetter(req.params.channel_name),
                year: 2017,
                javascript_file: "main.min.js"
            }
            res.render('layouts/channel', data);
        }
    }
});
*/

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
    try{
        var url = req.headers['x-forwarded-host'] ? req.headers['x-forwarded-host'] : req.headers.host.split(":")[0];
        var subdomain = req.headers['x-forwarded-host'] ? req.headers['x-forwarded-host'].split(".") : req.headers.host.split(":")[0].split(".");
        if(url != "zoff.me" && url != "remote.zoff.me" && url != "remote.localhost" && url != "localhost") {
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
                javascript_file: "main.min.js"
            }
            res.render('layouts/frontpage', data);
        }
    } catch(e) {
        console.log(e);
        //res.redirect("https://zoff.me");
    }
});

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = router;
