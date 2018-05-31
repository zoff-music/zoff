var path = require('path');

function requested_change(type, string, channel) {
    try {
        //channel = channel.replace(/ /g,'');
        var nodemailer = require('nodemailer');
        var mailconfig = require(path.join(__dirname, '../config/mailconfig.js'));

        let transporter = nodemailer.createTransport(mailconfig);

        transporter.verify(function(error, success) {
            if (error) {
                return;
            } else {
                var message = "A " + type + " change was requested on <b>" + channel + "</b><br><br>New supposed value is: <br><br><b>" + string + "</b><br><br><br> \
                Go to <a href='https://admin.zoff.me/'>https://admin.zoff.me/</a> to accept or decline the request.";
                var msg = {
                    from: mailconfig.from,
                    to: mailconfig.notify_mail,
                    subject: 'ZOFF: Requested new ' + type,
                    text: message,
                    html: message,
                }
                transporter.sendMail(msg, (error, info) => {
                    if (error) {
                        transporter.close();
                        return;
                    }
                    transporter.close();
                });
            }
        });
    } catch(e) {
        console.log("Mail is not configured and wont work");
        console.log("Seems you forgot to create a mailconfig.js in /server/config/. Have a look at the mailconfig.example.js.");
    }
}

module.exports.requested_change = requested_change;
