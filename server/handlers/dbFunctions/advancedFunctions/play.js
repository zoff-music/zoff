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

module.exports.getNowPlaying = getNowPlaying;
