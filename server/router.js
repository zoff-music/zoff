var express = require('express');
var router = express.Router();
const path = require('path');
var sendmail = require('sendmail')();

router.use(function(req, res, next) {
    next(); // make sure we go to the next routes and don't stop here
});

router.route('/:channel_name').get(function(req, res, next){
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
            res.sendFile(path.join(__dirname, '/views/assets/html/embed.html'));
        } else if(req.params.channel_name == "o_callback") {
            res.sendFile(path.join(__dirname, '/views/assets/html/callback.html'));
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

router.route('/api/imageblob').post(function(req, res) {
    var Jimp = require("jimp");
    Jimp.read('https://img.youtube.com/vi/' + req.body.id + '/mqdefault.jpg', function (err, image) {
        if (err) throw err;
        image.blur(50)
             .write(path.join(__dirname, '/views/assets/images/thumbnails/' + req.body.id + '.jpg'), function(e, r) {
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
            res.sendFile(path.join(__dirname, '/views/assets/html/embed.html'));
        } else if(req.params.channel_name == "o_callback") {
            res.sendFile(path.join(__dirname, '/views/assets/html/callback.html'));
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
    var from = req.body.from;
    var message = req.body.message;
    sendmail({
        from: from,
        to: 'contact@zoff.no',
        subject: 'ZOFF: Contact form webpage',
        html: message,
      }, function(err, reply) {
          if(err) {
              res.sendStatus(500);
          } else {
              res.sendStatus(200);
          }
    });
});

router.route('/').get(function(req, res, next){
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
        var data = {
            year: 2017,
            javascript_file: "main.min.js"
        }
        res.render('layouts/frontpage', data);
    }
});

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = router;
