var crypto = require("crypto");
var ColorThief = require("color-thief-jimp");
var Jimp = require("jimp");
var sIO = require(pathThumbnails + "/apps/client.js").socketIO;

function encodeChannelName(str) {
  var _fn = encodeURIComponent;
  str = filter.clean(str);
  var toReturn = _fn(str);
  toReturn = toReturn.replace(/_/g, "%5F");
  toReturn = toReturn.replace(/'/g, "%27");
  toReturn = toReturn.replace(/%26amp%3B/g, "%26").replace(/%26amp%3b/g, "%26");
  toReturn = toReturn.toLowerCase();
  return toReturn;
}

function decodeChannelName(str) {
  var _fn = decodeURIComponent;
  str = str.toUpperCase();
  var toReturn = _fn(str.replace(/%5F/g, "_").replace(/%27/g, "'"));
  toReturn = filter.clean(toReturn);
  return toReturn.toLowerCase();
}

function contains(a, obj) {
  try {
    var i = a.length;
    while (i--) {
      if (a[i] === obj) {
        return true;
      }
    }
    return false;
  } catch (e) {
    return false;
  }
}

function getSession(socket) {
  try {
    /*var cookieParser = require("cookie-parser");
        var cookie = require("cookie");
        var parsedCookies = cookie.parse(socket.handshake.headers.cookie);
        return parsedCookies["_uI"];*/
    if (socket.cookie_id == undefined) throw "Undefined error";
    return socket.cookie_id;
  } catch (e) {
    // Returning "sessiong"-based on place of connection
    return hash_pass(
      socket.handshake.headers["user-agent"] +
        socket.handshake.address +
        socket.handshake.headers["accept-language"]
    );
    //return "empty";
  }
}

function hash_pass(adminpass, hex) {
  if (adminpass == undefined || adminpass == "") return "";
  if (hex)
    return crypto
      .createHash("sha256")
      .update(adminpass)
      .digest("hex");
  return crypto
    .createHash("sha256")
    .update(adminpass)
    .digest("base64");
}

function decrypt_string(pw) {
  try {
    return Buffer.from(pw, "base64").toString("ascii");
  } catch (e) {
    return "";
  }
}

function removeEmojis(string) {
  //https://stackoverflow.com/a/41164278/4266467
  var regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
  return string.replace(regex, "");
}

function get_time() {
  var d = new Date();
  var time = Math.floor(d.getTime() / 1000);
  return time;
}

function sendColor(coll, socket, url, ajax, res) {
  if (coll != undefined && typeof coll == "string") {
    //coll = coll.replace(/ /g,'');
  }
  if (url.indexOf("://") == -1)
    url = "https://img.youtube.com/vi/" + url + "/mqdefault.jpg";
  //var url = 'https://img.youtube.com/vi/'+id+'/mqdefault.jpg';

  Jimp.read(url)
    .then(function(image) {
      var c = ColorThief.getColor(image);
      if (ajax) {
        res.header({ "Content-Type": "application/json" });
        res.status(200).send(c);
        return;
      } else {
        if (socket) {
          socket.emit("color", { color: c, only: true });
        } else {
          io.to(coll).emit("color", { color: c, only: false });
        }
      }
    })
    .catch(function(err) {
      console.log("Crashed on fetching image, url is " + url);
      console.log("Is ajax: " + ajax);
      if (ajax) {
        res.header({ "Content-Type": "application/json" });
        res.status(404);
        return;
      }
    });
}

function rndName(seed, len) {
  var vowels = ["a", "e", "i", "o", "u"];
  consts = [
    "b",
    "c",
    "d",
    "f",
    "g",
    "h",
    "j",
    "k",
    "l",
    "m",
    "n",
    "p",
    "r",
    "s",
    "t",
    "v",
    "w",
    "x",
    "y"
  ];
  len = Math.floor(len);
  word = "";
  is_vowel = false;
  var arr;
  try {
    for (var i = 0; i < len; i++) {
      if (is_vowel) arr = vowels;
      else arr = consts;
      is_vowel = !is_vowel;
      word += arr[(seed[i % seed.length].charCodeAt() + i) % (arr.length - 1)];
    }
  } catch (e) {
    return rndName(uniqid.time().toLowerCase(), len);
  }
  return word;
}

module.exports.rndName = rndName;
module.exports.contains = contains;
module.exports.sendColor = sendColor;
module.exports.encodeChannelName = encodeChannelName;
module.exports.decodeChannelName = decodeChannelName;
module.exports.getSession = getSession;
module.exports.hash_pass = hash_pass;
module.exports.decrypt_string = decrypt_string;
module.exports.removeEmojis = removeEmojis;
module.exports.get_time = get_time;
