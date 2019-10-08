var path = require("path");
var mongojs = require("mongojs");
var db = require(pathThumbnails + "/handlers/db.js");
var find = require(pathThumbnails + "/handlers/dbFunctions/find.js");
var update = require(pathThumbnails + "/handlers/dbFunctions/update.js");

var Helpers = require(pathThumbnails + "/handlers/helpers.js");
var SessionHandler = require(pathThumbnails +
  "/handlers/dbFunctions/advancedFunctions/sessionHandler.js");
var Inlist = require(pathThumbnails +
  "/handlers/dbFunctions/advancedFunctions/inlistCheck.js");
var Timeout = require(pathThumbnails +
  "/handlers/dbFunctions/advancedFunctions/timeout.js");
var changeSong = require(pathThumbnails +
  "/handlers/dbFunctions/advancedFunctions/changeSong.js");
var Play = require(pathThumbnails +
  "/handlers/dbFunctions/advancedFunctions/play.js");
var sIO = require(pathThumbnails + "/apps/client.js").socketIO;

async function skip(list, guid, coll, offline, socket, callback) {
  var socketid = socket.zoff_id;

  if (list === undefined || list === null || list === "") {
    var result = {
      msg: {
        expected: "object",
        got: typeof list
      }
    };
    socket.emit("update_required", result);
    return;
  }
  if (coll == undefined && list.hasOwnProperty("channel"))
    coll = list.channel.toLowerCase();
  if (coll !== undefined) {
    try {
      coll = list.channel.toLowerCase(); //.replace(/ /g,'');
      if (coll.length == 0) return;
      coll = Helpers.removeEmojis(coll).toLowerCase();
      //coll = coll.replace(/_/g, "");

      //coll = filter.clean(coll);
    } catch (e) {
      return;
    }
  }
  if (!list.hasOwnProperty("id") || list.id == undefined) {
    socket.emit("toast", "The list is empty.");
    return;
  }
  if (
    !list.hasOwnProperty("id") ||
    !list.hasOwnProperty("channel") ||
    (typeof list.id != "string" && typeof list.id != "number") ||
    typeof list.channel != "string"
  ) {
    var result = {
      channel: {
        expected: "string",
        got: list.hasOwnProperty("channel") ? typeof list.channel : undefined
      },
      pass: {
        expected: "string",
        got: list.hasOwnProperty("pass") ? typeof list.pass : undefined
      },
      userpass: {
        expected: "string",
        got: list.hasOwnProperty("userpass") ? typeof list.userpass : undefined
      },
      id: {
        expected: "string",
        got: list.hasOwnProperty("id") ? typeof list.id : undefined
      }
    };
    socket.emit("update_required", result);
    return;
  }
  list.id = list.id + "";
  var sessionAdminUser = await SessionHandler.getSessionAdminUser(
    Helpers.getSession(socket),
    coll
  );
  var userpass = sessionAdminUser.userpass;
  var adminpass = sessionAdminUser.adminpass;
  var gotten = sessionAdminUser.gotten;
  if (adminpass != "" || list.pass == undefined) {
    list.pass = Helpers.hash_pass(adminpass);
  } else if (list.pass != "") {
    list.pass = Helpers.hash_pass(
      Helpers.hash_pass(Helpers.decrypt_string(list.pass), true)
    );
  } else {
    list.pass = "";
  }
  if (userpass != "" || list.userpass == undefined) {
    list.userpass = userpass;
  } else {
    list.userpass = crypto
      .createHash("sha256")
      .update(Helpers.decrypt_string(list.userpass))
      .digest("base64");
  }

  var docs = await find(coll + "_settings");
  if (
    docs.length > 0 &&
    (docs[0].userpass == undefined ||
      docs[0].userpass == "" ||
      (list.hasOwnProperty("userpass") && docs[0].userpass == list.userpass))
  ) {
    Inlist.check(coll, guid, socket, offline, undefined, "place 12");

    var video_id;
    adminpass = "";
    video_id = list.id;
    var err = list.error;
    var trueError = false;
    if (err) {
      trueError = await Search.check_if_error_or_blocked(
        video_id,
        coll,
        err == "5" ||
          err == "100" ||
          err == "101" ||
          err == "150" ||
          err == 5 ||
          err == 100 ||
          err == 101 ||
          err == 150
      );
    }
    var error = false;
    if (!trueError) {
      adminpass = list.pass;
    } else if (trueError) {
      error = true;
    }
    hash = adminpass;
    //db.collection(coll + "_settings").find(function(err, docs){
    var strictSkip = false;
    var strictSkipNumber = 10;
    if (docs[0].strictSkip) strictSkip = docs[0].strictSkip;
    if (docs[0].strictSkipNumber) strictSkipNumber = docs[0].strictSkipNumber;
    if (docs !== null && docs.length !== 0) {
      if (
        !docs[0].skip ||
        (docs[0].adminpass == hash && docs[0].adminpass !== "") ||
        error
      ) {
        var frontpage_viewers = await find("frontpage_lists", { _id: coll });
        if (
          error ||
          ((strictSkip &&
            ((docs[0].adminpass == hash && docs[0].adminpass !== "") ||
              docs[0].skips.length + 1 >= strictSkipNumber)) ||
            (!strictSkip &&
              ((frontpage_viewers[0].viewers / 2 <= docs[0].skips.length + 1 &&
                !Helpers.contains(docs[0].skips, guid) &&
                frontpage_viewers[0].viewers != 2) ||
                (frontpage_viewers[0].viewers == 2 &&
                  docs[0].skips.length + 1 == 2 &&
                  !Helpers.contains(docs[0].skips, guid)) ||
                (docs[0].adminpass == hash &&
                  docs[0].adminpass !== "" &&
                  docs[0].skip))))
        ) {
          console.log("here");
          var canContinue = await Timeout.check(
            "skip",
            1,
            coll,
            coll,
            error,
            true,
            socket,
            "The channel is skipping too often, please wait "
          );
          console.log("canSkip", canContinue);
          if (!canContinue) {
            return;
          }

          try {
            await changeSong(coll, error, video_id, docs);
          } catch (e) {
            socket.emit("toast", "Something went wrong.. Please try again");
            return;
          }

          Play.sendPlay(coll);
          socket.emit("toast", "skip");
          var docs = await find("user_names", { guid: guid });
          if (docs.length == 1) {
            var n = await find("registered_users", { _id: docs[0].name });
            var icon = false;
            if (n.length > 0 && n[0].icon) {
              icon = n[0].icon;
            }
            io.to(coll).emit("chat", {
              from: docs[0].name,
              icon: icon,
              msg: " skipped"
            });
          }
        } else if (!Helpers.contains(docs[0].skips, guid)) {
          await update(
            coll + "_settings",
            { id: "config" },
            { $push: { skips: guid } }
          );
          if (frontpage_viewers[0].viewers == 2 && !strictSkip) {
            to_skip = 1;
          } else if (strictSkip) {
            to_skip = strictSkipNumber - docs[0].skips.length - 1;
          } else {
            to_skip =
              Math.ceil(frontpage_viewers[0].viewers / 2) -
              docs[0].skips.length -
              1;
          }
          socket.emit("toast", to_skip + " more are needed to skip!");
          var docs = await find("user_names", { guid: guid });
          if (docs.length == 1) {
            var n = await find("registered_users", { _id: docs[0].name });
            var icon = false;
            if (n.length > 0 && n[0].icon) {
              icon = n[0].icon;
            }
            socket.to(coll).emit("chat", {
              from: docs[0].name,
              msg: " voted to skip"
            });
          }
        } else {
          socket.emit("toast", "alreadyskip");
        }
      } else socket.emit("toast", "noskip");
    }

    //});
  } else {
    socket.emit("auth_required");
  }
}

module.exports.skip = skip;
