var path = require("path");
var mongojs = require("mongojs");
var db = require(pathThumbnails + "/handlers/db.js");
var find = require(pathThumbnails + "/handlers/dbFunctions/find.js");
var remove = require(pathThumbnails + "/handlers/dbFunctions/remove.js");
var update = require(pathThumbnails + "/handlers/dbFunctions/update.js");

async function setSessionAdminPass(id, adminpass, list) {
  return new Promise((resolve, reject) => {
    try {
      if (id == "empty" || id == undefined) {
        resolve();
        return;
      }

      var docs = update(
        id,
        { _id: list },
        { $set: { adminpass: hash_pass(decrypt_string(adminpass), true) } },
        { upsert: true }
      );
      resolve();
    } catch (e) {
      reject();
    }
  });
}

async function setSessionChatPass(id, name, pass) {
  return new Promise((resolve, reject) => {
    try {
      if (id == "empty" || id == undefined) {
        resolve();
        return;
      }
      var docs = await update(
        id,
        { _id: "_chat_" },
        { $set: { password: pass, name: name } },
        { upsert: true }
      );
      resolve();
    } catch (e) {
      reject();
      return;
    }
  });
}

async function getSessionChatPass(id) {
  return new Promise((resolve, reject) => {
    try {
      if (id == "empty" || id == undefined) {
        resolve({ name: "", pass: "", gotten: false });
        return;
      }

      var d = await find(id, { _id: "_chat_" });
      if (d.length > 0) {
        var name = "";
        var pass = "";
        if (d[0].name != undefined) name = d[0].name;
        if (d[0].password != undefined) pass = d[0].password;
        resolve({ name: name, pass: pass, gotten: false });
        return;
      } else {
        resolve({ name: "", pass: "", gotten: false });
        return;
      }
    } catch (e) {
      reject();
      return;
    }
  });
}

async function setChromecastHost(id, other_id, list) {
  return new Promise((resolve, reject) => {
    try {
      if (
        id == "empty" ||
        id == undefined ||
        other_id == "empty" ||
        other_id == undefined
      ) {
        resolve(false);
        return;
      }
      await update(
        id,
        { _id: list },
        { chromecast: true, id: other_id },
        { upsert: true }
      );
      resolve(true);
      return;
    } catch (e) {
      resolve(false);
    }
  });
}

async function setSessionUserPass(id, userpass, list) {
  return new Promise((resolve, reject) => {
    try {
      if (id == "empty" || id == undefined || userpass == undefined) {
        reject();
        return;
      }

      update(
        id,
        { _id: list },
        { $set: { userpass: userpass } },
        { upsert: true }
      );
      resolve();
      return;
    } catch (e) {
      reject();
    }
  });
}

async function getSessionAdminUser(id, list) {
  return new Promise((resolve, reject) => {
    try {
      if (id == "empty" || id == undefined) {
        resolve({ userpass: "", adminpass: "", gotten: false });
        return;
      }
      var d = await find(id, { _id: list });
      var userpass = "";
      var adminpass = "";
      if (d.length > 0) {
        if (d[0].hasOwnProperty("chromecast") && d[0].chromecast) {
          return await getSessionAdminUser(d[0].id, list);
        } else {
          if (d[0].userpass != undefined) userpass = d[0].userpass;
          if (d[0].adminpass != undefined) adminpass = d[0].adminpass;
          resolve({ userpass: userpass, adminpass: adminpass, gotten: true });
        }
      } else {
        resolve({ userpass: userpass, adminpass: adminpass, gotten: true });
      }
    } catch (e) {
      resolve({ userpass: "", adminpass: "", gotten: false });
    }
  });
}

async function removeSessionChatPass(id) {
  return new Promise((resolve, reject) => {
    if (id == "empty" || id == undefined) {
      resolve();
      return;
    }
    await remove(id, { _id: "_chat_" });
    resolve();
    return;
  });
}

async function removeSessionAdminPass(id, channel) {
  return new Promise((resolve, reject) => {
    if (id == "empty" || id == undefined) {
      resolve();
      return;
    }
    await update(id, { _id: channel }, { $set: { adminpass: "" } });
    resolve();
  });
}

function sendColor(coll, socket, url, ajax, res) {
  if (coll != undefined && typeof coll == "string") {
    //coll = coll.replace(/ /g,'');
  }
  if (url.indexOf("://") == -1)
    url = "https://img.youtube.com/vi/" + url + "/mqdefault.jpg";
  //var url = 'https://img.youtube.com/vi/'+id+'/mqdefault.jpg';

  Jimp.read(url)
    .then(function(image) {
      var c = ColorThief.getColor(image);
      if (ajax) {
        res.header({ "Content-Type": "application/json" });
        res.status(200).send(c);
        return;
      } else {
        if (socket) {
          socket.emit("color", { color: c, only: true });
        } else {
          io.to(coll).emit("color", { color: c, only: false });
        }
      }
    })
    .catch(function(err) {
      console.log("Crashed on fetching image, url is " + url);
      console.log("Is ajax: " + ajax);
      if (ajax) {
        res.header({ "Content-Type": "application/json" });
        res.status(404);
        return;
      }
    });
}

module.exports.setSessionAdminPass = setSessionAdminPass;
module.exports.setSessionChatPass = setSessionChatPass;
module.exports.getSessionChatPass = getSessionChatPass;
module.exports.setChromecastHost = setChromecastHost;
module.exports.setSessionUserPass = setSessionUserPass;
module.exports.getSessionAdminUser = getSessionAdminUser;
module.exports.removeSessionChatPass = removeSessionChatPass;
module.exports.removeSessionAdminPass = removeSessionAdminPass;
module.exports.sendColor = sendColor;
