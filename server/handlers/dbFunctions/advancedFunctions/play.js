var path = require("path");
var mongojs = require("mongojs");
var db = require(pathThumbnails + "/handlers/db.js");
var find = require(pathThumbnails + "/handlers/dbFunctions/find.js");
var aggregate = require(pathThumbnails + "/handlers/dbFunctions/aggregate.js");

var Helpers = require(pathThumbnails + "/handlers/helpers.js");
var sIO = require(pathThumbnails + "/apps/client.js").socketIO;
var nextSongAggregate = [
  {
    $match: {
      views: {
        $exists: false
      },
      type: {
        $ne: "suggested"
      }
    }
  },
  {
    $sort: {
      now_playing: 1,
      votes: -1,
      added: 1,
      title: 1
    }
  },
  {
    $limit: 1
  }
];

async function getNowPlaying(list, socket) {
  return new Promise(async (resolve, reject) => {
    if (typeof list !== "string" || typeof fn !== "function") {
      socket.emit("update_required");
      return;
    }
    var docs = await find(list, { now_playing: true });
    if (docs.length === 0) {
      resolve("No song currently playing");
      return;
    }
    var title = docs[0].title;
    if (title === undefined) resolve("No song currently playing");
    else resolve(title);
  });
}

async function sendPlay(coll, socket, broadcast) {
  //coll = coll.replace(/ /g,'');
  var np = await find(coll, { now_playing: true });
  var conf = await find(coll + "_settings");
  console.log(np);
  try {
    if (Helpers.get_time() - conf[0].startTime > np[0].duration) {
      changeSong(coll, false, np[0].id, conf);
    } else if (conf !== null && conf !== undefined && conf.length !== 0) {
      if (conf[0].adminpass !== "") conf[0].adminpass = true;
      if (conf[0].hasOwnProperty("userpass") && conf[0].userpass != "")
        conf[0].userpass = true;
      else conf[0].userpass = false;
      if (!np.hasOwnProperty("start")) np.start = 0;
      if (!np.hasOwnProperty("end")) np.end = np.duration;
      toSend = { np: np, conf: conf, time: Helpers.get_time() };
      if (socket === undefined) {
        io.to(coll).emit("np", toSend);
        //
        getNextSong(coll, undefined);
        var url = "https://img.youtube.com/vi/" + np[0].id + "/mqdefault.jpg";
        if (np[0].source == "soundcloud") url = np[0].thumbnail;
        Helpers.sendColor(coll, false, url);
      } else {
        var url = "https://img.youtube.com/vi/" + np[0].id + "/mqdefault.jpg";
        if (np[0].source == "soundcloud") url = np[0].thumbnail;
        Helpers.sendColor(coll, socket, url);
        if (broadcast) {
          socket.to(coll).emit("np", toSend);
          return;
        }
        socket.emit("np", toSend);
      }
    }
  } catch (e) {
    console.log(e);
    if (socket) {
      if (broadcast) {
        socket.to(coll).emit("np", {});
        return;
      }
      socket.emit("np", {});
    } else {
      io.to(coll).emit("np", {});
    }
  }
}

async function getNextSong(coll, socket) {
  //coll = coll.replace(/ /g,'');
  return new Promise(async (resolve, reject) => {
    var doc = await aggregate(coll, nextSongAggregate);
    if (doc.length == 1) {
      var thumbnail = "";
      var source = "youtube";
      if (doc[0].source && doc[0].source == "soundcloud") {
        source = "soundcloud";
        thumbnail = doc[0].thumbnail;
      }
      if (socket != undefined) {
        socket.emit("next_song", {
          videoId: doc[0].id,
          title: doc[0].title,
          source: source,
          thumbnail: thumbnail
        });
      } else {
        io.to(coll).emit("next_song", {
          videoId: doc[0].id,
          title: doc[0].title,
          source: source,
          thumbnail: thumbnail
        });
      }
    }
    resolve();
  });
}

module.exports.getNowPlaying = getNowPlaying;
module.exports.getNextSong = getNextSong;
module.exports.sendPlay = sendPlay;
