var findAndModify = require(pathThumbnails +
  "/handlers/dbFunctions/findAndModify.js");
var Frontpage = require(pathThumbnails +
  "/handlers/dbFunctions/advancedFunctions/frontpageLists.js");
var ConnectedUsers = require(pathThumbnails +
  "/handlers/dbFunctions/advancedFunctions/connectedUsers.js");

async function handleOfflineUpdate(msg) {
  var status = msg.status;
  var channel = msg.channel; //.replace(/ /g,'');
  if (status) {
    in_list = false;
    offline = true;
    if (channel != "") coll = channel;
    if (coll === undefined) {
      Functions.remove_unique_id(short_id);
    }
    //coll = filter.clean(coll);
    var updated = await findAndModify("connected_users", {
      query: { _id: coll },
      update: { $pull: { users: guid } },
      upsert: true
    });

    if (!updated) {
      return;
    }

    var num = 0;
    if (updated && updated.users) {
      num = updated.users.length;
    }
    io.to(coll).emit("viewers", num);

    Frontpage.incrementList("frontpage_lists", -1);
    await ConnectedUsers.pullConnectedUser(
      "connected_users",
      "total_users",
      "total_users",
      guid + coll
    );

    var docs = await ConnectedUsers.addToSet(
      "connected_users",
      "offline_users",
      "users",
      guid
    );

    if (docs.nModified == 1 && coll != undefined && coll != "") {
      ConnectedUsers.addToSet(
        "connected_users",
        "total_users",
        "total_users",
        guid + coll
      );
    }

    Functions.remove_name_from_db(guid, coll);
  } else {
    offline = false;
    await ConnectedUsers.pullConnectedUser(
      "connected_users",
      "offline_users",
      "users",
      guid
    );
    Functions.check_inlist(coll, guid, socket, offline, undefined, "place 3");
  }
}

module.exports.handleOfflineUpdate = handleOfflineUpdate;
