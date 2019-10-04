var path = require("path");
var mongojs = require("mongojs");
var db = require(pathThumbnails + "/handlers/db.js");

async function insert(collection, insertObject) {
  return new Promise((resolve, reject) => {
    db.collection(collection).insert(insertObject, function(err, docs) {
      if (err) {
        reject(err);
        return;
      }
      resolve(docs);
    });
  });
}

module.exports.insert = insert;
