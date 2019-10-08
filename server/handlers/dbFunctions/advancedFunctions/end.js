async function end(obj, coll, guid, offline, socket) {
  var socketid = socket.zoff_id;
  if (typeof obj !== "object") {
    return;
  }
  id = obj.id;

  if (id !== undefined && id !== null && id !== "") {
    if (
      !obj.hasOwnProperty("id") ||
      !obj.hasOwnProperty("channel") ||
      (typeof obj.id != "string" && typeof obj.id != "number") ||
      typeof obj.channel != "string"
    ) {
      var result = {
        channel: {
          expected: "string",
          got: obj.hasOwnProperty("channel") ? typeof obj.channel : undefined
        },
        pass: {
          expected: "string",
          got: obj.hasOwnProperty("pass") ? typeof obj.pass : undefined
        },
        id: {
          expected: "string || number",
          got: obj.hasOwnProperty("id") ? typeof obj.id : undefined
        }
      };
      socket.emit("update_required", result);
      return;
    }
    obj.id = obj.id + "";
    id = id + "";
    var callback_function = function() {
      for (var i = 0; i < arguments.length; i++) {
        if (typeof arguments[i] == "function") {
          arguments[i]();
        }
      }
    };
    var docs = await find(coll + "_settings");
    var authentication_needed = false;

    if (
      docs.length > 0 &&
      (docs[0].userpass != undefined && docs[0].userpass != "")
    ) {
      callback_function = Functions.getSessionAdminUser;
      authentication_needed = true;
      var sessionAdminUser = await Functions.getSessionAdminUser(Functions.getSession(socket), coll);
      obj.userpass = sessionAdminUser.userpass;
    }

    if (userpass != "" || obj.pass == undefined) {
      obj.pass = userpass;
    } else {
      obj.pass = crypto
      .createHash("sha256")
      .update(Functions.decrypt_string(obj.pass))
      .digest("base64");
    }
    if (
      !authentication_needed ||
      (authentication_needed &&
        obj.hasOwnProperty("pass") &&
        docs[0].userpass == obj.pass)
      ) {
        Functions.check_inlist(
          coll,
          guid,
          socket,
          offline,
          undefined,
          "place 13"
        );
        var np = await find(coll, { now_playing: true });
        if (err !== null) console.log(err);
        if (
          np !== null &&
          np !== undefined &&
          np.length == 1 &&
          np[0].id == id
        ) {
          var startTime = docs[0].startTime;
          if (
            startTime + parseInt(np[0].duration) <=
            Functions.get_time() + 5
          ) {
            changeSong(coll, false, id, docs);
          }
        }
      } else {
        socket.emit("auth_required");
      }
    } else {
      var result = {
        msg: {
          expected: "object",
          got: typeof obj
        }
      };
      socket.emit("update_required", result);
    }
  }

  module.exports.end = end;
