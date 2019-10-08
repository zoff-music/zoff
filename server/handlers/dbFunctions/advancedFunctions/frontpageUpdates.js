var path = require("path");
var mongojs = require("mongojs");
var db = require(pathThumbnails + "/handlers/db.js");
var update = require(pathThumbnails + "/handlers/dbFunctions/update.js");

var Helpers = require(pathThumbnails + "/handlers/helpers.js");
async function incrementList(collection, way) {
  return update(
    collection,
    { _id: coll, count: { $gt: 0 } },
    {
      $inc: { count: way },
      $set: { accessed: Helpers.get_time() }
    },
    { upsert: true }
  );
}

async function updateFrontpage(coll, id, title, thumbnail, source) {
  //coll = coll.replace(/ /g,'');
  return new Promise(async (resolve, reject) => {
    var doc = await find("frontpage_lists", { _id: coll });
    var updateObject = {
      id: id,
      title: title,
      accessed: Helpers.get_time()
    };
    if (
      doc.length > 0 &&
      ((doc[0].thumbnail != "" &&
        doc[0].thumbnail != undefined &&
        (doc[0].thumbnail.indexOf("https://i1.sndcdn.com") > -1 ||
          doc[0].thumbnail.indexOf("https://w1.sndcdn.com") > -1 ||
          doc[0].thumbnail.indexOf("https://img.youtube.com") > -1)) ||
        (doc[0].thumbnail == "" || doc[0].thumbnail == undefined))
    ) {
      updateObject.thumbnail = thumbnail;
      if (thumbnail == undefined) updateObject.thumbnail = "";
    }
    await update(
      "frontpage_lists",
      { _id: coll },
      { $set: updateObject },
      { upsert: true }
    );
    resolve();
  });
}

module.exports.updateFrontpage = updateFrontpage;
module.exports.incrementList = incrementList;
