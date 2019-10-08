var path = require("path");
var mongojs = require("mongojs");
var db = require(pathThumbnails + "/handlers/db.js");

async function findAndModify(collection, query) {
  return new Promise(async (resolve, reject) => {
    db.collection(collection).findAndModify(query, function(err, docs) {
      if (err) {
        reject(err);
        return;
      }
      resolve(docs);
    });
  });
}

module.exports = findAndModify;
