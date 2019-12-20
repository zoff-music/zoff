var find = require(pathThumbnails + "/handlers/dbFunctions/find.js");
var crypto = require("crypto");
var Inlist = require(pathThumbnails +
  "/handlers/dbFunctions/advancedFunctions/inlistCheck.js");
var SessionHandler = require(pathThumbnails +
  "/handlers/dbFunctions/advancedFunctions/sessionHandler.js");
var Play = require(pathThumbnails +
  "/handlers/dbFunctions/advancedFunctions/play.js");
var Helpers = require(pathThumbnails + "/handlers/helpers.js");

async function getCurrentPosition(channel, guid, offline, socket) {
  var docs = await find(channel + "_settings");
  var sessionAdminUser = await SessionHandler.getSessionAdminUser(
    Helpers.getSession(socket),
    channel
  );
  var userpass = sessionAdminUser.userpass;
  if (userpass != "" || obj.pass == undefined) {
    obj.pass = userpass;
  } else {
    obj.pass = crypto
      .createHash("sha256")
      .update(Helpers.decrypt_string(obj.pass))
      .digest("base64");
  }
  if (
    docs.length > 0 &&
    (docs[0].userpass == undefined ||
      docs[0].userpass == "" ||
      (obj.hasOwnProperty("pass") && docs[0].userpass == obj.pass))
  ) {
    Inlist.check(coll, guid, socket, offline, undefined, "place 10");
    Play.sendPlay(coll, socket);
  } else {
    socket.emit("auth_required");
  }
}

module.exports.getCurrentPosition = getCurrentPosition;
