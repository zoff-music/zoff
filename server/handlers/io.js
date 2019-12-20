var cookie = require("cookie");

var Functions = require(pathThumbnails + "/handlers/functions.js");
var ListChange = require(pathThumbnails + "/handlers/list_change.js");
var Chat = require(pathThumbnails + "/handlers/chat.js");
var List = require(pathThumbnails + "/handlers/list.js");
var Suggestions = require(pathThumbnails + "/handlers/suggestions.js");
var ListSettings = require(pathThumbnails + "/handlers/list_settings.js");
var Frontpage = require(pathThumbnails +
  "/handlers/dbFunctions/advancedFunctions/frontpageLists.js");
var Search = require(pathThumbnails + "/handlers/search.js");
var Offline = require(pathThumbnails +
  "/handlers/dbFunctions/advancedFunctions/offline.js");
var Join = require(pathThumbnails +
  "/handlers/dbFunctions/advancedFunctions/joinList.js");
var Skip = require(pathThumbnails +
  "/handlers/dbFunctions/advancedFunctions/skip.js");
var ConnectedUsers = require(pathThumbnails +
  "/handlers/dbFunctions/advancedFunctions/connectedUsers.js");
var Position = require(pathThumbnails +
  "/handlers/dbFunctions/advancedFunctions/position.js");
var crypto = require("crypto");
var db = require(pathThumbnails + "/handlers/db.js");

module.exports = function() {
  io.on("connection", function(socket) {
    try {
      var parsedCookies = cookie.parse(socket.handshake.headers.cookie);
      socket.cookie_id = parsedCookies["_uI"];
      //return socket.guid;
    } catch (e) {
      socket.cookie_id = "empty";
    }
    socket.zoff_id = socket.id;
    socket.emit("get_list");
    var guid = socket.cookie_id;
    if (guid == "empty" || guid == null || guid == undefined)
      guid = Functions.hash_pass(
        socket.handshake.headers["user-agent"] +
          socket.handshake.address +
          socket.handshake.headers["accept-language"]
      );

    socket.guid = guid;
    socket.on("close", function() {});

    socket.on("pinging", function() {
      socket.emit("ok");
    });

    db.collection("zoff_motd").find(function(error, motd) {
      if (motd.length > 0 && !error) {
        setTimeout(function() {
          socket.emit("toast", motd[0].message);
        }, 1500);
      }
    });

    var socketid = socket.zoff_id;
    var coll;
    var in_list = false;
    var short_id;
    Chat.get_name(guid, { announce: false, socket: socket });
    var offline = false;

    socket.emit("guid", guid);

    socket.on("self_ping", async function(msg) {
      msg = middleware(msg);
      var channel = msg.channel;
      //channel = channel.replace(/ /g,'');
      if (offline) {
        ConnectedUsers.addToSet(
          "connected_users",
          "offline_users",
          "users",
          guid
        );
      } else {
        await ConnectedUsers.addToSet(
          "connected_users",
          channel,
          "users",
          guid
        );

        Frontpage.incrementList("frontpage_lists", 1);
      }
      if (channel != "" && channel != undefined) {
        ConnectedUsers.addToSet(
          "connected_users",
          "total_users",
          "total_users",
          guid + channel
        );
      }
    });

    socket.on("logout", function() {
      Functions.removeSessionAdminPass(
        Functions.getSession(socket),
        coll,
        function() {}
      );
    });

    socket.on("next_song", function(obj) {
      if (obj == undefined || !obj.hasOwnProperty("channel")) return;
      db.collection(obj.channel + "_settings").find(function(e, docs) {
        if (docs.length == 0) return;
        var pass = "";
        if (obj.hasOwnProperty("pass")) {
          pass = crypto
            .createHash("sha256")
            .update(Functions.decrypt_string(obj.pass))
            .digest("base64");
        }
        if (
          docs.length > 0 &&
          (docs[0].userpass == undefined ||
            docs[0].userpass == "" ||
            docs[0].userpass == pass)
        ) {
          List.getNextSong(obj.channel, socket);
        }
      });
    });

    socket.on("chromecast", async function(msg) {
      try {
        msg = middleware(msg);
        coll = msg.channel;
        var validated = input_validate_middleware(
          obj,
          [
            { key: "guid", expected: "string" },
            { key: "socket_id", expected: "string" },
            { key: "channel", expected: "string" }
          ],
          socket
        );
        if (!validated) {
          return;
        }

        var connected_users_channel = await find("connected_users", {
          _id: msg.channel
        });
        if (
          connected_users_channel.length < 1 ||
          connected_users_channel[0].users.indexOf(msg.guid) == -1
        ) {
          return;
        }

        coll = msg.channel;
        Functions.setChromecastHost(
          socket.cookie_id,
          msg.socket_id,
          msg.channel,
          function() {}
        );
        //socket.cookie_id = msg.guid;
        guid = msg.guid;
        socketid = msg.socket_id;
        socket.zoff_id = socketid;

        in_list = true;
        chromecast_object = true;
        socket.join(coll);
      } catch (e) {
        return;
      }
    });

    socket.on("get_id", function() {
      socket.emit("id_chromecast", {
        cookie_id: Functions.getSession(socket),
        guid: guid
      });
    });

    socket.on("error_video", function(msg) {
      msg = middleware(msg);
      coll = msg.channel;
      Search.check_error_video(msg, coll);
    });

    socket.on("get_spread", async function() {
      var spread = await UserSpread.getSpread();
      if (!spread) {
        return;
      }
      socket.emit("spread_listeners", spread);
    });

    socket.on("suggest_thumbnail", function(msg) {
      msg = middleware(msg);
      coll = msg.channel;
      Suggestions.thumbnail(msg, coll, guid, offline, socket);
    });

    socket.on("suggest_description", function(msg) {
      msg = middleware(msg);
      coll = msg.channel;
      Suggestions.description(msg, coll, guid, offline, socket);
    });

    socket.on("suggest_rules", function(msg) {
      msg = middleware(msg);
      coll = msg.channel;
      Suggestions.rules(msg, coll, guid, offline, socket);
    });

    socket.on("namechange", function(msg) {
      msg = middleware(msg);
      coll = msg.channel;
      Chat.namechange(msg, guid, socket);
    });

    socket.on("removename", function(msg) {
      msg = middleware(msg);
      coll = msg.channel;

      var validated = input_validate_middleware(
        msg,
        [{ key: "channel", expected: "string" }],
        socket
      );
      if (!validated) {
        return;
      }

      Chat.removename(guid, msg.channel, socket);
    });

    socket.on("offline", function(msg) {
      msg = middleware(msg);
      coll = msg.channel;

      var validated = input_validate_middleware(
        obj,
        [
          { key: "status", expected: "boolean" },
          { key: "channel", expected: "string" }
        ],
        socket
      );

      if (!validated) {
        return;
      }

      if (status) {
        offline = true;
      } else {
        offline = false;
      }

      Offline.handleOfflineUpdate(msg);
    });

    socket.on("get_history", function(msg) {
      msg = middleware(msg);
      coll = msg.channel;

      var validated = input_validate_middleware(
        msg,
        [
          { key: "channel", expected: "string" },
          { key: "all", expected: "boolean" }
        ],
        socket
      );

      if (!validated) {
        return;
      }

      Chat.get_history(msg.channel, msg.all, socket);
    });

    socket.on("chat", function(msg) {
      msg = middleware(msg);
      coll = msg.channel;
      Chat.chat(msg, guid, offline, socket);
    });

    socket.on("all,chat", function(msg) {
      msg = middleware(msg);
      coll = msg.channel;
      Chat.all_chat(msg, guid, offline, socket);
    });

    socket.on("frontpage_lists", function(msg) {
      msg = middleware(msg);
      coll = msg.channel;
      Frontpage.frontpageLists(msg, socket);
    });

    socket.on("import_zoff", function(msg) {
      msg = middleware(msg);
      coll = msg.channel;
      ListChange.addFromOtherList(msg, guid, offline, socket);
    });

    socket.on("now_playing", function(list, fn) {
      List.now_playing(list, fn, socket);
    });

    socket.on("id", function(msg) {
      msg = middleware(msg);
      coll = msg.channel;
      if (typeof msg == "object")
        io.to(msg.id).emit(msg.id.toLowerCase(), {
          type: msg.type,
          value: msg.value
        });
    });

    socket.on("join_silent", function(msg) {
      msg = middleware(msg);
      coll = msg.channel;
      List.join_silent(msg, socket);
    });

    socket.on("list", function(msg) {
      msg = middleware(msg);
      coll = msg.channel;

      if (msg.hasOwnProperty("offline") && msg.offline) {
        offline = true;
      }
      Join.joinList(msg, guid, coll, offline, socket);
      Functions.get_short_id(socket);
    });

    socket.on("end", function(obj) {
      obj = middleware(obj);
      coll = obj.channel;

      List.end(obj, coll, guid, offline, socket);
    });

    socket.on("addPlaylist", function(msg) {
      msg = middleware(msg);
      coll = msg.channel;
      ListChange.addPlaylist(msg, guid, offline, socket);
    });

    socket.on("add", function(arr) {
      arr = middleware(arr, "list");
      if (arr.hasOwnProperty("offsiteAdd") && arr.offsiteAdd) {
        coll = arr.list;
      }
      ListChange.add_function(arr, coll, guid, offline, socket);
    });

    socket.on("delete_all", function(msg) {
      msg = middleware(msg);
      coll = msg.channel;

      ListChange.delete_all(msg, coll, guid, offline, socket);
    });

    socket.on("vote", function(msg) {
      msg = middleware(msg);
      coll = msg.channel;

      ListChange.voteUndecided(msg, coll, guid, offline, socket);
    });

    socket.on("password", function(msg) {
      msg = middleware(msg);
      coll = msg.channel;
      //if(coll != undefined) coll.replace(/ /g,'');
      ListSettings.password(msg, coll, guid, offline, socket);
    });

    socket.on("skip", function(msg) {
      msg = middleware(msg);
      coll = msg.channel;
      //if(coll != undefined) coll.replace(/ /g,'');
      Skip.skip(msg, guid, coll, offline, socket);
    });

    socket.on("conf", function(msg) {
      msg = middleware(msg);
      coll = msg.channel;
      //if(coll != undefined) coll.replace(/ /g,'');
      ListSettings.conf_function(conf, coll, guid, offline, socket);
    });

    socket.on("shuffle", function(msg) {
      msg = middleware(msg);
      coll = msg.channel;

      ListChange.shuffle(msg, coll, guid, offline, socket);
    });

    socket.on("change_channel", function(obj) {
      obj = middleware(obj);
      coll = obj.channel;
      Functions.left_channel(
        coll,
        guid,
        short_id,
        in_list,
        socket,
        true,
        "left 1"
      );
      in_list = false;
    });

    socket.on("disconnect", function() {
      Functions.left_channel(
        coll,
        guid,
        short_id,
        in_list,
        socket,
        false,
        "left 2"
      );
    });

    socket.on("disconnected", function() {
      Functions.left_channel(
        coll,
        guid,
        short_id,
        in_list,
        socket,
        false,
        "left 3"
      );
    });

    socket.on("left_channel", function(msg) {
      msg = middleware(msg);
      if (
        !msg.hasOwnProperty("channel") ||
        msg.channel == "" ||
        typeof msg.channel != "string"
      ) {
        return;
      }
      coll = msg.channel; //.replace(/ /g,'');
      coll = Functions.removeEmojis(coll).toLowerCase();
      //coll = filter.clean(coll);
      Functions.left_channel(
        coll,
        guid,
        short_id,
        in_list,
        socket,
        false,
        "left 4"
      );
    });

    socket.on("reconnect_failed", function() {
      Functions.left_channel(
        coll,
        guid,
        short_id,
        in_list,
        socket,
        false,
        "left 5"
      );
    });

    socket.on("connect_timeout", function() {
      Functions.left_channel(
        coll,
        guid,
        short_id,
        in_list,
        socket,
        false,
        "left 6"
      );
    });

    socket.on("error", function() {
      Functions.left_channel(
        coll,
        guid,
        short_id,
        in_list,
        socket,
        false,
        "left 7"
      );
    });

    socket.on("pos", function(obj) {
      obj = middleware(obj);
      coll = obj.channel;

      var validated = input_validate_middleware(
        obj,
        [
          { key: "channel", expected: "string" },
          { key: "pass", expected: "string" }
        ],
        socket
      );

      if (!validated) {
        return;
      }

      if (coll == undefined) return;

      Position.getCurrentPosition(coll, guid, offline, socket);
    });
  });
};

function middleware(msg, selector) {
  if (selector == undefined) {
    selector = "channel";
  }
  if (msg.hasOwnProperty(selector) && msg[selector].indexOf("?") > -1) {
    var _list = list[selector].substring(0, msg[selector].indexOf("?"));
    msg[selector] = _list;
  }
  if (msg.hasOwnProperty(selector)) {
    msg[selector] = Functions.encodeChannelName(msg[selector]);
  }
  return msg;
}

function input_validate_middleware(data, validate, socket) {
  var missing = {};
  for (var i = 0; i < validate.length; i++) {
    if (!data.hasOwnProperty(validate[i].key)) {
      missing[validate[i].key] = {
        expected: validate[i].expected,
        got: undefined
      };
    } else if (
      data.hasOwnProperty(validate[i].key) &&
      typeof data[validate[i].key] != validate[i].expected
    ) {
      missing[validate[i].key] = {
        expected: validate[i].expected,
        got: typeof data[validate[i].key]
      };
    }
  }

  if (Object.keys(missing).length > 0) {
    socket.emit("update_required", missing);
    return false;
  }

  return true;
}
