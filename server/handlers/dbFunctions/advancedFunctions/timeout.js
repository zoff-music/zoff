var path = require("path");
var mongojs = require("mongojs");
var db = require(pathThumbnails + "/handlers/db.js");
var find = require(pathThumbnails + "/handlers/dbFunctions/find.js");
var create = require(pathThumbnails + "/handlers/dbFunctions/create.js");
var insert = require(pathThumbnails + "/handlers/dbFunctions/insert.js");

function checkTimeout(
  type,
  timeout,
  channel,
  guid,
  conf_pass,
  this_pass,
  socket,
  error_message
) {
  return new Promise((resolve, reject) => {
    if (conf_pass != "" && conf_pass == this_pass) {
      resolve();
      return;
    }
    var docs = await find("timeout_api",
    {
      type: type,
      guid: guid
    });
    if (docs.length > 0) {
      var date = new Date(docs[0].createdAt);
      date.setSeconds(date.getSeconds() + timeout);
      var now = new Date();

      var retry_in = (date.getTime() - now.getTime()) / 1000;
      if (retry_in > 0) {
        if (typeof error_callback == "function") {
          reject();
          return;
        } else if (error_message) {
          var sOrNot =
          Math.ceil(retry_in) > 1 || Math.ceil(retry_in) == 0 ? "s" : "";
          socket.emit(
            "toast",
            error_message + Math.ceil(retry_in) + " second" + sOrNot + "."
          );
        } else {
          socket.emit("toast", "wait_longer");
        }
        return;
      }
    }
    var now_date = new Date();
    await update("timeout_api",
    { type: type, guid: guid },
    {
      $set: {
        createdAt: now_date,
        type: type,
        guid: guid
      }
    },
    { upsert: true });
    resolve();
  });
}

module.exports.checkTimeout = checkTimeout;
