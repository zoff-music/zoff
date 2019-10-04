var path = require("path");
var db = require(pathThumbnails + "/handlers/db.js");
var aggregate = require(pathThumbnails + "/handlers/dbFunctions/aggregate.js");
var remove = require(pathThumbnails + "/handlers/dbFunctions/remove.js");
var frontpage = require(pathThumbnails +
  "/handlers/dbFunctions/frontpageUpdates.js");
var findAggregate = [
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
      now_playing: -1,
      votes: -1,
      added: 1,
      title: 1
    }
  },
  {
    $limit: 2
  }
];

var verifyAggregate = [
  {
    $match: {
      now_playing: false,
      type: {
        $ne: "suggested"
      }
    }
  },
  {
    $sort: {
      votes: -1,
      added: 1,
      title: 1
    }
  },
  {
    $limit: 2
  }
];

async function changeSong(coll, error, id, conf, socket) {
  return pre(coll, error, id, conf, socket);
}

async function pre(coll, error, id, conf, socket) {
  return new Promise((resolve, reject) => {
    var startTime = conf[0].startTime;
    if (conf === null || conf.length == 0) {
      return;
    }

    var now_playing_doc = await aggregate(coll, findAggregate);
    if (
      now_playing_doc.length > 0 &&
      ((id && id == now_playing_doc[0].id) || !id)
    ) {
      if (error) {
        var docs = await remove(coll, { now_playing: true, id: id });
        var next_song;
        if (now_playing_doc.length == 2) {
          next_song = now_playing_doc[1].id;
        }
        await post(coll, next_song, conf, socket, error);
        /*if (!callback) {
          io.to(coll).emit("channel", {
            type: "deleted",
            value: now_playing_doc[0].id,
            removed: true
          });
        }*/
        if (docs.deletedCount == 1) {
          frontpage.incrementList("frontpage_lists", -1);
        }
        resolve();
        return;
      } else if (conf[0].removeplay === true) {
        var docs = await remove(coll, { now_playing: true, id: id });
        var next_song;
        if (now_playing_doc.length == 2) next_song = now_playing_doc[1].id;
        await post(coll, next_song, conf, socket, error);
        if (docs.deletedCount == 1) {
          frontpage.incrementList("frontpage_lists", -1);
        }
        resolve();
        return;
      } else {
        if (
          (conf[0].skipped_time != undefined &&
            conf[0].skipped_time != Functions.get_time()) ||
          conf[0].skipped_time == undefined
        ) {
          var docs = await update(
            coll,
            { now_playing: true, id: id },
            {
              $set: {
                now_playing: false,
                votes: 0,
                guids: []
              }
            },
            { multi: true }
          );
          var next_song;
          if (now_playing_doc.length == 2) next_song = now_playing_doc[1].id;
          await post(coll, next_song, conf, socket, error);

          resolve();
          return;
        }
      }
    }
    if (
      now_playing_doc.length > 0 &&
      now_playing_doc[0].now_playing == true &&
      now_playing_doc.length > 1 &&
      now_playing_doc[1].id == id
    ) {
      var docs = await update(
        coll,
        { id: now_playing_doc[0].id },
        { $set: { now_playing: false } },
        {}
      );
      return await pre(coll, error, id, conf, socket, error);
    }
    resolve();
  });
}

async function post(coll, next_song, conf, socket, removed) {
  return new Promise((resolve, reject) => {
    var docs = await aggregate(coll, verifyAggregate);
    if (docs === null || docs.length == 0) {
      reject();
      return;
    }
    var id = docs[0].id;
    if (next_song && next_song != id) {
      if (docs.length == 2 && next_song == docs[1].id) {
        id = docs[1].id;
      } else {
        reject();
        return;
      }
    }
    var returnDocs = await update(
      coll,
      { id: id, now_playing: false },
      {
        $set: {
          now_playing: true,
          votes: 0,
          guids: [],
          added: Functions.get_time()
        }
      },
      {}
    );
    if (
      (returnDocs.hasOwnProperty("nModified") && returnDocs.nModified == 0) ||
      (returnDocs.hasOwnProperty("n") && returnDocs.n == 0)
    ) {
      resolve();
      return;
    }
    returnDocs = await update(
      coll + "_settings",
      { id: "config" },
      {
        $set: {
          startTime: Functions.get_time(),
          skips: []
        }
      },
      {}
    );
    resolve();
  });
}

module.exports.changeSong = changeSong;
module.exports.pre = pre;
module.exports.post = post;
