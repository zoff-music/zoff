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
var nodemailer = require("nodemailer");
var mailconfig = require(path.join(__dirname, "../config/mailconfig.js"));

let transporter = nodemailer.createTransport(mailconfig);

transporter.verify(function(error, success) {
  if (error) {
    return;
  } else {
    var message = "Testmail";
    var msg = {
      from: mailconfig.from,
      to: mailconfig.notify_mail,
      subject: "ZOFF: Requested new ",
      text: message,
      html: message
    };
    transporter.sendMail(msg, (error, info) => {
      console.log(error);
      if (error) {
        transporter.close();
        return;
      }
      transporter.close();
    });
  }
});
