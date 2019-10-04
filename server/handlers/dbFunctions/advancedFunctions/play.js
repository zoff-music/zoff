var path = require("path");
var mongojs = require("mongojs");
var db = require(pathThumbnails + "/handlers/db.js");
var find = require(pathThumbnails + "/handlers/dbFunctions/find.js");

async function getNowPlaying(list, socket) {
  return new Promise((resolve, reject) => {
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

function send_play(coll, socket, broadcast) {
  //coll = coll.replace(/ /g,'');
  db.collection(coll).find({ now_playing: true }, function(err, np) {
    db.collection(coll + "_settings").find(function(err, conf) {
      if (err !== null) console.log(err);
      try {
        if (Functions.get_time() - conf[0].startTime > np[0].duration) {
          change_song(coll, false, np[0].id, conf);
        } else if (conf !== null && conf !== undefined && conf.length !== 0) {
          if (conf[0].adminpass !== "") conf[0].adminpass = true;
          if (conf[0].hasOwnProperty("userpass") && conf[0].userpass != "")
            conf[0].userpass = true;
          else conf[0].userpass = false;
          if (!np.hasOwnProperty("start")) np.start = 0;
          if (!np.hasOwnProperty("end")) np.end = np.duration;
          toSend = { np: np, conf: conf, time: Functions.get_time() };
          if (socket === undefined) {
            io.to(coll).emit("np", toSend);
            //
            getNextSong(coll, undefined);
            var url =
              "https://img.youtube.com/vi/" + np[0].id + "/mqdefault.jpg";
            if (np[0].source == "soundcloud") url = np[0].thumbnail;
            sendColor(coll, false, url);
          } else {
            var url =
              "https://img.youtube.com/vi/" + np[0].id + "/mqdefault.jpg";
            if (np[0].source == "soundcloud") url = np[0].thumbnail;
            sendColor(coll, socket, url);
            if (broadcast) {
              socket.to(coll).emit("np", toSend);
              return;
            }
            socket.emit("np", toSend);
          }
        }
      } catch (e) {
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
    });
  });
}

function getNextSong(coll, socket, callback) {
  //coll = coll.replace(/ /g,'');
  db.collection(coll).aggregate(
    [
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
    ],
    function(err, doc) {
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
      if (typeof callback == "function") callback();
    }
  );
}

module.exports.getNowPlaying = getNowPlaying;
