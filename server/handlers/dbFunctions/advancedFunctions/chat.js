var path = require("path");
var mongojs = require("mongojs");
var db = require(pathThumbnails + "/handlers/db.js");
var find = require(pathThumbnails + "/handlers/dbFunctions/find.js");
var update = require(pathThumbnails + "/handlers/dbFunctions/update.js");
var findAndModify = require(pathThumbnails +
  "/handlers/dbFunctions/findAndModify.js");

var Helpers = require(pathThumbnails + "/handlers/helpers.js");
var SessionHandler = require(pathThumbnails +
  "/handlers/dbFunctions/advancedFunctions/sessionHandler.js");
async function checkIfChatEnabled(channel, socket, callback) {
  return new Promise(async (resolve, reject) => {
    if (channel == "" || channel == undefined) resolve();
    else {
      var docs = await find(channel + "_settings");
      if (
        docs.length > 0 &&
        (docs[0].hasOwnProperty("toggleChat") && !docs[0].toggleChat)
      ) {
        socket.emit("chat", {
          from: "System",
          msg: ": Chat for this channel has been disabled.",
          icon: "https://zoff.me/assets/images/favicon-32x32.png"
        });
        resolve(false);
      } else {
        resolve(true);
      }
    }
  });
}

async function checkIfUserIsBanned(channel, socket, guid) {
  return new Promise(async (resolve, reject) => {
    var connection_id = Helpers.hash_pass(
      socket.handshake.headers["user-agent"] +
        socket.handshake.address +
        socket.handshake.headers["accept-language"]
    );
    var docs = await find(channel + "_banned_chat", {
      $or: [{ connection_id: connection_id }, { connection_id: guid }]
    });
    if (docs.length == 0) resolve();
    else {
      var d = await findAndModify("user_names", {
        query: { guid, guid },
        update: { $addToSet: { channels: channel } }
      });
      socket.emit("chat", {
        from: "System",
        msg:
          ": You can't chat in this channel, you are banned. The reason is: " +
          docs[0].reason,
        icon: "https://zoff.me/assets/images/favicon-32x32.png"
      });
      reject();
    }
  });
}

async function namechange(data, guid, socket, tried) {
  return new Promise(async (resolve, reject) => {
    var enabled = await checkIfChatEnabled(data.channel, socket);
    if (!enabled) {
      resolve(false);
      return;
    }
    try {
      await checkIfUserIsBanned(data.channel, socket, guid);
    } catch (e) {
      return;
    }
    var pw = "";
    var new_password;
    var first = false;
    var sessionObject = await SessionHandler.getSessionChatPass(
      Helpers.getSession(socket)
    );
    var name = sessionObject.name;
    var pass = sessionObject.pass;
    var fetched = false;
    if (data.hasOwnProperty("first") && data.first) {
      pw = pass;
      name = name;
      data.name = name;
      data.password = pass;
      new_password = false;
      if (name == "" || pass == "") {
        resolve(true);
        return;
      }
      fetched = true;
      password = pw;
    } else {
      var name = data.name;
      if (data.hasOwnProperty("first")) {
        first = data.first;
      }
      if (data.hasOwnProperty("password")) {
        pw = data.password;
        new_password = false;
      } else if (
        data.hasOwnProperty("new_password") &&
        data.hasOwnProperty("old_password")
      ) {
        pw = data.old_password;
        new_password = Helpers.decrypt_string(data.new_password);
      }
      password = Helpers.decrypt_string(pw);
      password = Helpers.hash_pass(password);
      doubled = true;
    }

    if (name == "") {
      resolve(true);
      return;
    }

    var docs = await find("registered_users", { _id: name.toLowerCase() });
    var accepted_password = false;
    var icon = false;
    if (docs.length == 0) {
      if (new_password) {
        resolve(true);
        return;
      }
      accepted_password = true;
      await SessionHandler.setSessionChatPass(
        Functions.getSession(socket),
        name.toLowerCase(),
        data.password
      );
      update(
        "registered_users",
        { _id: name.toLowerCase() },
        { $set: { password: password } },
        { upsert: true }
      );
    } else if (docs[0].password == password) {
      if (docs[0].icon) {
        icon = docs[0].icon;
      }
      accepted_password = true;
      if (new_password) {
        await SessionHandler.setSessionChatPass(
          Helpers.getSession(socket),
          name.toLowerCase(),
          data.new_password
        );
        update(
          "registered_users",
          { _id: name.toLowerCase(), password: password },
          {
            $set: { password: Helpers.hash_pass(new_password) }
          }
        );
      } else {
        await SessionHandler.setSessionChatPass(
          Helpers.getSession(socket),
          name.toLowerCase(),
          fetched
            ? data.password
            : Helpers.hash_pass(Helpers.decrypt_string(data.password))
        );
      }
    }
    if (accepted_password) {
      var names = await find("user_names", { guid: guid });
      if (
        names.length > 0 ||
        (docs.length != 0 && docs[0].password == password)
      ) {
        var no_name = false;
        if (names.length == 0) no_name = true;
        if (!no_name) {
          var old_name = names[0].name;
          update(
            "user_names",
            { _id: "all_names" },
            { $pull: { names: old_name } }
          );
        }
        var connection_id = Helpers.hash_pass(
          socket.handshake.headers["user-agent"] +
            socket.handshake.address +
            socket.handshake.headers["accept-language"]
        );
        var updateElement = {
          $set: {
            name: name,
            icon: icon,
            connection_id: connection_id
          }
        };
        if (data.hasOwnProperty("channel") && data.channel != "") {
          updateElement["$addToSet"] = { channels: data.channel };
        }
        await update("user_names", { guid: guid }, updateElement, {
          upsert: true
        });
        await update(
          "user_names",
          { _id: "all_names" },
          { $addToSet: { names: name } }
        );
        //socket.emit('name', {type: "name", accepted: true});
        if (old_name != name && !first && !no_name) {
          if (
            data.hasOwnProperty("channel") &&
            typeof data.channel == "string"
          ) {
            io.to(data.channel).emit("chat", {
              from: old_name,
              msg: " changed name to " + name
            });
            io.sockets.emit("chat.all", {
              from: old_name,
              msg: " changed name to " + name,
              channel: data.channel
            });
          }
        }

        resolve(true);
      } else {
        if (tried < 3 || tried == undefined) {
          if (tried == undefined) {
            tried = 1;
          }
          namechange(data, guid, socket, tried + 1);
        }
      }
    } else {
      await SessionHandler.removeSessionChatPass(Functions.Helpers(socket));
      socket.emit("name", { type: "name", accepted: false });
    }
  });
}

async function get_name(guid, announce_payload, first) {
  return new Promise(async (resolve, reject) => {
    if (
      !announce_payload.announce &&
      announce_payload.hasOwnProperty("socket")
    ) {
      var sessionObject = await SessionHandler.getSessionChatPass(
        Helpers.getSession(announce_payload.socket)
      );
      var name = sessionObject.name;
      var pass = sessionObject.pass;
      if (name == "" || pass == "") {
        get_name_generate(
          guid,
          announce_payload,
          first,
          announce_payload.channel
        );
        return;
      }
      var docs = find("registered_users", { _id: name.toLowerCase() });
      if (docs[0].password == Helpers.hash_pass(Helpers.decrypt_string(pass))) {
        var icon = false;
        if (docs[0].icon) {
          icon = docs[0].icon;
        }
        SessionHandler.setSessionChatPass(
          Functions.getSession(announce_payload.socket),
          name.toLowerCase(),
          pass
        );
        var connection_id = Helpers.hash_pass(
          announce_payload.socket.handshake.headers["user-agent"] +
            announce_payload.socket.handshake.address +
            announce_payload.socket.handshake.headers["accept-language"]
        );
        var updateElement = {
          $set: { name: name, icon: icon, connection_id: connection_id }
        };
        if (
          announce_payload.hasOwnProperty("channel") &&
          announce_payload.channel != ""
        )
          updateElement["$addToSet"] = {
            channel: announce_payload.channel
          };
        await update("user_names", { guid: guid }, updateElement, {
          upsert: true
        });
        await update(
          "user_names",
          { _id: "all_names" },
          { $addToSet: { names: name } }
        );
        name = name;
        resolve();
      }
    } else {
      get_name_generate(
        guid,
        announce_payload,
        first,
        announce_payload.channel
      );
      resolve();
    }
  });
}

async function get_name_generate(guid, announce_payload, first, channel) {
  return new Promise(async (resolve, reject) => {
    var docs = await find("user_names", { guid: guid });
    if (docs.length == 0) {
      generate_name(guid, announce_payload, undefined);
    } else {
      name = docs[0].name;
    }
  });
}

async function generate_name(guid, announce_payload, second, round, channel) {
  if (round == undefined) round = 0;
  var tmp_name = Helpers.rndName(second ? second : guid, Math.floor(8 + round));
  var docs = await find("registered_users", { _id: tmp_name });
  if (docs.length == 0) {
    var updated = await update(
      "user_names",
      { _id: "all_names" },
      { $addToSet: { names: tmp_name } },
      { upsert: true }
    );
    if (
      updated.nModified == 1 ||
      (updated.hasOwnProperty("upserted") &&
        updated.hasOwnProperty("n") &&
        updated.n == 1)
    ) {
      var connection_id = Helpers.hash_pass(
        announce_payload.socket.handshake.headers["user-agent"] +
          announce_payload.socket.handshake.address +
          announce_payload.socket.handshake.headers["accept-language"]
      );
      var updateElement = {
        $set: {
          name: tmp_name,
          icon: false,
          connection_id: connection_id
        }
      };
      if (channel != undefined && channel != "") {
        updateElement["$addToSet"] = { channels: channel };
      }
      if (
        announce_payload.hasOwnProperty("channel") &&
        announce_payload.channel != ""
      ) {
        updateElement["$addToSet"] = {
          channels: announce_payload.channel
        };
      }
      var updateElement = await update(
        "user_names",
        { guid: guid },
        updateElement,
        { upsert: true }
      );
      name = tmp_name;
      if (announce_payload.announce) {
        io.to(announce_payload.channel).emit("chat", {
          from: announce_payload.old_name,
          msg: " changed name to " + name
        });
        io.sockets.emit("chat.all", {
          from: announce_payload.old_name,
          msg: " changed name to " + name,
          channel: announce_payload.channel
        });
      } else if (announce_payload.message && !announce_payload.all) {
        io.to(announce_payload.channel).emit("chat", {
          from: name,
          msg: ": " + announce_payload.message
        });
      } else if (announce_payload.message && announce_payload.all) {
        io.sockets.emit("chat.all", {
          from: name,
          msg: ": " + announce_payload.message,
          channel: announce_payload.channel
        });
      }
    } else {
      generate_name(guid, announce_payload, tmp_name, round + 0.25, channel);
    }
  } else {
    generate_name(guid, announce_payload, tmp_name, round + 0.25, channel);
  }
}

module.exports.get_name = get_name;
module.exports.checkIfChatEnabled = checkIfChatEnabled;
module.exports.checkIfUserIsBanned = checkIfUserIsBanned;
module.exports.namechange = namechange;
module.exports.get_name_generate = get_name_generate;
