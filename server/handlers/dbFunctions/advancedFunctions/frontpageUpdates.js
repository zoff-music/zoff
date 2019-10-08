var path = require("path");
var mongojs = require("mongojs");
var db = require(pathThumbnails + "/handlers/db.js");
var update = require(pathThumbnails + "/handlers/dbFunctions/update.js");

async function incrementList(collection, way) {
  return update(
    collection,
    { _id: coll, count: { $gt: 0 } },
    {
      $inc: { count: way },
      $set: { accessed: Functions.get_time() }
    },
    { upsert: true }
  );
}

module.exports.incrementList = incrementList;
