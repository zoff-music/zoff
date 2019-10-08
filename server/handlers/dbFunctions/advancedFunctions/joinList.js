var path = require("path");
var mongojs = require("mongojs");
var db = require(pathThumbnails + "/handlers/db.js");
var find = require(pathThumbnails + "/handlers/dbFunctions/find.js");
var create = require(pathThumbnails + "/handlers/dbFunctions/create.js");
var insert = require(pathThumbnails + "/handlers/dbFunctions/insert.js");

var sendList = require(pathThumbnails +
  "/handlers/dbFunctions/advancedFunctions/sendList.js");

var crypto = require("crypto");
var SessionHandler = require(pathThumbnails +
  "/handlers/dbFunctions/advancedFunctions/sessionHandler.js");
var Inlist = require(pathThumbnails +
  "/handlers/dbFunctions/advancedFunctions/inlistCheck.js");
var Play = require(pathThumbnails +
  "/handlers/dbFunctions/advancedFunctions/play.js");
var Helpers = require(pathThumbnails + "/handlers/helpers.js");

var sIO = require(pathThumbnails + "/apps/client.js").socketIO;
async function joinSilent(msg, socket) {
  if (typeof msg === "object" && msg !== undefined && msg !== null) {
    var channelName = msg.channel;
    var tryingPassword = false;
    var password = "";
    if (msg.password != "") {
      tryingPassword = true;
      password = Helpers.decrypt_string(msg.password);
      password = crypto
        .createHash("sha256")
        .update(password)
        .digest("base64");
    }

    channelName = channelName.toLowerCase(); //.replace(/ /g,'');
    channelName = Helpers.removeEmojis(channelName).toLowerCase();
    var docs = await find(channelName + "_settings");
    if (docs.length == 0) {
      socket.emit("join_silent_declined", "");
      return;
    }
    if (
      docs[0].userpass == "" ||
      docs[0].userpass == undefined ||
      docs[0].userpass == password
    ) {
      socket.join(channelName);
      socket.emit("join_silent_accepted", "");

      Play.sendPlay(channelName, socket);
    } else {
      socket.emit("join_silent_declined", "");
    }
  } else {
    return;
  }
}

async function joinList(msg, guid, coll, offline, socket) {
  var socketid = socket.zoff_id;
  if (typeof msg === "object" && msg !== undefined && msg !== null) {
    var sessionAdminUser = await SessionHandler.getSessionAdminUser(
      Helpers.getSession(socket),
      coll
    );
    var userpass = sessionAdminUser.userpass;
    var adminpass = sessionAdminUser.adminpass;
    var gotten = sessionAdminUser.gotten;
    if (gotten && userpass != "" && !msg.hasOwnProperty("pass")) {
      msg.pass = userpass;
    } else {
      msg.pass = crypto
        .createHash("sha256")
        .update(Helpers.decrypt_string(msg.pass))
        .digest("base64");
    }
    adminpass = Helpers.hash_pass(adminpass);
    if (
      !msg.hasOwnProperty("version") ||
      !msg.hasOwnProperty("channel") ||
      msg.version != VERSION ||
      msg.version == undefined ||
      typeof msg.channel != "string"
    ) {
      var result = {
        channel: {
          expected: "string",
          got: msg.hasOwnProperty("channel") ? typeof msg.channel : undefined
        },
        version: {
          expected: VERSION,
          got: msg.version
        },
        pass: {
          expected: "string",
          got: msg.hasOwnProperty("pass") ? typeof msg.pass : undefined
        }
      };
      socket.emit("update_required", result);
      return;
    }
    coll = msg.channel.toLowerCase(); //.replace(/ /g,'');
    coll = Helpers.removeEmojis(coll).toLowerCase();
    //coll = filter.clean(coll);
    var pass = msg.pass;
    var frontpage_lists = await find("frontpage_lists", { _id: coll });
    if (frontpage_lists.length == 1) {
      var docs = await find(coll + "_settings");
      if (
        docs.length == 0 ||
        (docs.length > 0 &&
          (docs[0].userpass == undefined ||
            docs[0].userpass == "" ||
            docs[0].userpass == pass))
      ) {
        if (
          docs.length > 0 &&
          docs[0].hasOwnProperty("userpass") &&
          docs[0].userpass != "" &&
          docs[0].userpass == pass
        ) {
          SessionHandler.setSessionUserPass(
            Helpers.getSession(socket),
            msg.pass,
            coll
          );
          socket.emit("auth_accepted", { value: true });
        }
        if (docs.length > 0 && docs[0].userpass != pass) {
          SessionHandler.setSessionUserPass(
            Helpers.getSession(socket),
            "",
            coll
          );
        }
        if (
          docs.length > 0 &&
          docs[0].hasOwnProperty("adminpass") &&
          docs[0].adminpass != "" &&
          docs[0].adminpass == adminpass
        ) {
          socket.emit("pw", true);
        }
        in_list = true;
        socket.join(coll);
        Inlist.check(coll, guid, socket, offline, undefined, "place 10");

        if (frontpage_lists[0].viewers != undefined) {
          io.to(coll).emit("viewers", frontpage_lists[0].viewers);
        } else {
          io.to(coll).emit("viewers", 1);
        }

        sendList(coll, socket, true, false, true);
      } else {
        socket.emit("auth_required");
      }
    } else {
      var docs = await create.collection(coll);
      var index = await create.index(coll, { id: 1 }, { unique: true });

      var configs = {
        addsongs: false,
        adminpass: "",
        allvideos: true,
        frontpage: true,
        longsongs: false,
        removeplay: false,
        shuffle: true,
        skip: false,
        skips: [],
        startTime: Helpers.get_time(),
        views: [],
        vote: false,
        description: "",
        thumbnail: "",
        rules: "",
        userpass: "",
        id: "config",
        toggleChat: true
      };
      await insert(coll + "_settings", configs);
      socket.join(coll);
      sendList(coll, socket, true, false, true);
      insert("frontpage_lists", {
        _id: coll,
        count: 0,
        frontpage: true,
        accessed: Helpers.get_time(),
        viewers: 1
      });
      Inlist.check(coll, guid, socket, offline, undefined, "place 11");
    }
  } else {
    var result = {
      msg: {
        expected: "object",
        got: typeof msg
      }
    };
    socket.emit("update_required", result);
  }
}

module.exports.joinSilent = joinSilent;
module.exports.joinList = joinList;
