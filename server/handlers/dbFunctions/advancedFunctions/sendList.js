var path = require("path");
var mongojs = require("mongojs");
var db = require(pathThumbnails + "/handlers/db.js");
var find = require(pathThumbnails + "/handlers/dbFunctions/find.js");
var remove = require(pathThumbnails + "/handlers/dbFunctions/remove.js");
var update = require(pathThumbnails + "/handlers/dbFunctions/update.js");
var aggregate = require(pathThumbnails + "/handlers/dbFunctions/aggregate.js");
var sort = require(pathThumbnails + "/handlers/dbFunctions/sort.js");

async function sendList(coll, socket, send, list_send, configs, shuffled) {
  //coll = coll.replace(/ /g,'');
  var conf = await aggregate(coll + "_settings", [
    {
      $match: {
        id: "config"
      }
    },
    {
      $project: projects.toShowConfig
    }
  ]);
  var conf = _conf;
  if (conf.length == 0) {
    var conf = {
      id: "config",
      addsongs: false,
      adminpass: "",
      allvideos: true,
      frontpage: true,
      longsongs: false,
      removeplay: false,
      shuffle: true,
      skip: false,
      skips: [],
      startTime: Functions.get_time(),
      views: [],
      vote: false,
      description: "",
      thumbnail: "",
      rules: "",
      toggleChat: true,
      userpass: ""
    };
    await update(coll + "_settings", { id: "config" }, conf, { upsert: true });
    send_list(coll, socket, send, list_send, configs, shuffled);
  } else {
    var docs = await aggregate(coll, [
      {
        $match: { type: { $ne: "suggested" } }
      },
      {
        $project: projects.project_object
      },
      { $sort: { now_playing: -1, votes: -1, added: 1 } }
    ]);
    if (docs.length > 0) {
      var np_docs = await find(coll, { now_playing: true });
      if (np_docs.length == 0) {
        var now_playing_doc = await aggregate(coll, [
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
            $limit: 1
          }
        ]);
        if (now_playing_doc[0].now_playing == false) {
          await update(
            coll,
            { id: now_playing_doc[0].id, now_playing: false },
            {
              $set: {
                now_playing: true,
                votes: 0,
                guids: [],
                added: Functions.get_time()
              }
            }
          );
          await update(
            coll + "_settings",
            { id: "config" },
            {
              $set: {
                startTime: Functions.get_time(),
                skips: []
              }
            }
          );
          Frontpage.update_frontpage(
            coll,
            now_playing_doc[0].id,
            now_playing_doc[0].title,
            now_playing_doc[0].thumbnail,
            now_playing_doc[0].source
          );
          sendList(coll, socket, send, list_send, configs, shuffled);
        }
      } else if (np_docs.length > 1) {
        var docs = await aggregate(coll, [
          {
            $match: {
              now_playing: true
            }
          },
          {
            $sort: {
              now_playing: -1,
              votes: -1,
              added: 1,
              title: 1
            }
          }
        ]);
        var real_now_playing = docs[docs.length - 1];
        await update(
          coll,
          { now_playing: true, id: { $ne: real_now_playing.id } },
          { $set: { now_playing: false } },
          { multi: true }
        );
        send_list(coll, socket, send, list_send, configs, shuffled);
      } else {
        if (Functions.get_time() - conf[0].startTime > np_docs[0].duration) {
          await changeSong(coll, false, np_docs[0].id, conf, socket);
          send_list(coll, socket, send, list_send, configs, shuffled);
        } else {
          if (list_send) {
            io.to(coll).emit("channel", {
              type: "list",
              playlist: docs,
              shuffled: shuffled
            });
          } else if (!list_send) {
            socket.emit("channel", {
              type: "list",
              playlist: docs,
              shuffled: shuffled
            });
          }
          if (socket === undefined && send) {
            send_play(coll);
          } else if (send) {
            send_play(coll, socket);
          }
        }
      }
    } else {
      if (list_send) {
        io.to(coll).emit("channel", {
          type: "list",
          playlist: docs,
          shuffled: shuffled
        });
      } else if (!list_send) {
        socket.emit("channel", {
          type: "list",
          playlist: docs,
          shuffled: shuffled
        });
      }
      if (socket === undefined && send) {
        send_play(coll);
      } else if (send) {
        send_play(coll, socket);
      }
    }
    if (configs) {
      if (conf.length > 0) {
        if (conf[0].adminpass !== "") conf[0].adminpass = true;
        if (conf[0].hasOwnProperty("userpass") && conf[0].userpass != "")
          conf[0].userpass = true;
        else conf[0].userpass = false;
        io.to(coll).emit("conf", conf);
      } else if (conf.length == 0 && docs.length > 0) {
        var conf = {
          id: "config",
          addsongs: false,
          adminpass: "",
          allvideos: true,
          frontpage: true,
          longsongs: false,
          removeplay: false,
          shuffle: true,
          skip: false,
          skips: [],
          startTime: Functions.get_time(),
          views: [],
          vote: false,
          desc: "",
          userpass: ""
        };
        await update(coll + "_settings", { id: "config" }, conf, {
          upsert: true
        });
        io.to(coll).emit("conf", conf);
      }
    }
  }
  if (socket) {
    var sugg = await sort(coll, { type: "suggested" }, { added: 1 });
    socket.emit("suggested", sugg);
  }
}

module.exports.sendList = sendList;
