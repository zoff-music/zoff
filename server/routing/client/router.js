var express = require('express');
var router = express.Router();
var path = require('path');
var year = new Date().getYear()+1900;
var path = require('path');

try {
    var Recaptcha = require('express-recaptcha');
    var recaptcha_config = require(path.join(path.join(__dirname, '../../config/'), 'recaptcha.js'));
    var RECAPTCHA_SITE_KEY = recaptcha_config.site;
    var RECAPTCHA_SECRET_KEY = recaptcha_config.key;
    var recaptcha = new Recaptcha(RECAPTCHA_SITE_KEY, RECAPTCHA_SECRET_KEY);
} catch(e) {
    console.log("Error - missing file");
    console.log("Seems you forgot to create the file recaptcha.js in /server/config/. Have a look at recaptcha.example.js.");
    var recaptcha = {
        middleware: {
            render: (req, res, next) => {
                res.recaptcha = ""
                next()
            }
        }
    }
}



router.use(recaptcha.middleware.render, function(req, res, next) {
    next(); // make sure we go to the next routes and don't stop here
});

router.route('/:channel_name').get(function(req, res, next){
    channel(req, res, next);
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
        if(url != "zoff.me" && url != "admin.localhost" && url != "admin.zoff.me" && url != "remote.zoff.me" && url != "fb.zoff.me" && url != "remote.localhost" && url != "localhost") {
            res.redirect("https://zoff.me");
            return;
        }
        if(subdomain[0] == "remote") {
            var data = {
                year: year,
                javascript_file: "remote.min.js",
                captcha: res.recaptcha
            }
            res.render('layouts/client/remote', data);
        } else if(subdomain[0] == "www") {
            res.redirect("https://zoff.me");
        } else {
            var data = {
                year: year,
                javascript_file: "main.min.js",
                captcha: res.recaptcha
            }
            res.render('layouts/client/frontpage', data);
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
        if(url != "zoff.me" && url != "admin.localhost" && url != "admin.zoff.me" && url != "remote.zoff.me" && url != "fb.zoff.me" && url != "remote.localhost" && url != "localhost") {
            res.redirect("https://zoff.me");
            return;
        }
        if(subdomain[0] == "remote") {
            var data = {
                year: year,
                javascript_file: "remote.min.js",
                captcha: res.recaptcha
            }
            res.render('layouts/client/remote', data);
        } else if(subdomain.length >= 2 && subdomain[0] == "www") {
            res.redirect("https://zoff.me");
        } else {
            if(req.params.channel_name == "_embed") {
                res.sendFile(path.join(pathThumbnails, '/public/assets/html/embed.html'));
            } else if(req.params.channel_name == "o_callback") {
                res.sendFile(path.join(pathThumbnails, '/public/assets/html/callback.html'));
            } else {
                var data = {
                    title: "404: File Not Found",
                    list_name: capitalizeFirstLetter(req.params.channel_name),
                    year: year,
                    javascript_file: "main.min.js",
                    captcha: res.recaptcha,
                }


                if(req.params.channel_name == "404") {
                    res.status(404);
                }

                res.render('layouts/client/channel', data);
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
