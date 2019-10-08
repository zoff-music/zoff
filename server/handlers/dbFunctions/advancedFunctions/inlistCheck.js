var find = require(pathThumbnails + "/handlers/dbFunctions/find.js");
var update = require(pathThumbnails + "/handlers/dbFunctions/update.js");

var SessionHandler = require(pathThumbnails +
  "/handlers/dbFunctions/advancedFunctions/sessionHandler.js");
var Helpers = require(pathThumbnails + "/handlers/helpers.js");
var Chat = require(pathThumbnails +
  "/handlers/dbFunctions/advancedFunctions/chat.js");
var sIO = require(pathThumbnails + "/apps/client.js").socketIO;

async function check(coll, guid, socket, offline, callback, double_check) {
  return new Promise(async (resolve, reject) => {
    if (coll == undefined) {
      resolve();
      return;
    }
    //coll = coll.replace(/ /g,'');
    if (!offline && coll != undefined) {
      var updated = await update(
        "connected_users",
        { _id: coll },
        { $addToSet: { users: guid } },
        { upsert: true }
      );
      if (updated.nModified > 0 || updated.upserted != undefined) {
        var new_doc = await find("connected_users", { _id: coll });
        await update(
          "frontpage_lists",
          { _id: coll },
          { $set: { viewers: new_doc[0].users.length } }
        );
        if (
          new_doc[0].users == undefined ||
          new_doc[0].users.length == undefined
        ) {
          io.to(coll).emit("viewers", 1);
        } else {
          io.to(coll).emit("viewers", new_doc[0].users.length);
        }
        var enabled = await Chat.namechange(
          { initial: true, first: true, channel: coll },
          guid,
          socket,
          false
        );
        var docs = await find("user_names", { guid: guid });
        if (docs.length == 1) {
          var icon = "";
          if (docs[0].icon != undefined) icon = docs[0].icon;
          update(
            "user_names",
            { guid: guid },
            { $addToSet: { channels: coll } }
          );
          if (enabled) {
            socket.broadcast.to(coll).emit("chat", {
              from: docs[0].name,
              icon: icon,
              msg: " joined"
            });
          }
        } else if (docs.length == 0) {
          //console.log("User doesn't have a name for some reason.");
          //console.log("guid", guid);
          //console.log("channel", coll);
          //console.log("Trying to get a chat-name");
          Chat.get_name(guid, {
            announce: false,
            socket: socket,
            channel: coll
          });
        }
        update(
          "connected_users",
          { _id: "total_users" },
          { $addToSet: { total_users: guid + coll } }
        );
        resolve();
      } else {
        var new_doc = await find("connected_users", { _id: coll });
        io.to(coll).emit("viewers", new_doc[0].users.length);
        resolve();
      }
    } else {
      if (offline) {
        update(
          "connected_users",
          { _id: "offline_users" },
          { $addToSet: { users: guid } }
        );
      } else {
        update(
          "connected_users",
          { _id: coll },
          { $addToSet: { users: guid } }
        );
      }
      //
      if (coll != undefined && coll != "") {
        update(
          "connected_users",
          { _id: "total_users" },
          { $addToSet: { total_users: guid + coll } }
        );
      }
      resolve();
    }
  });
}

module.exports.check = check;
