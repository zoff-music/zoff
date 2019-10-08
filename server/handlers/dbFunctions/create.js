var path = require("path");
var mongojs = require("mongojs");
var db = require(pathThumbnails + "/handlers/db.js");

async function collection(collection) {
  return new Promise(async (resolve, reject) => {
    db.createCollection(coll, function(err, docs) {
      if (err) {
        reject(err);
        return;
      }
      resolve(docs);
    });
  });
}

async function index(collection, indexObject, extraObject) {
  return new Promise(async (resolve, reject) => {
    db.collection(collection).createIndex(indexObject, extraObject, function(
      err,
      docs
    ) {
      if (err) {
        reject(err);
        return;
      }
      resolve(docs);
    });
  });
}

module.exports.collection = collection;
module.exports.index = index;
