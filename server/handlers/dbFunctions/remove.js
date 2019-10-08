var path = require("path");
var mongojs = require("mongojs");
var db = require(pathThumbnails + "/handlers/db.js");

function remove(collection, removeObject) {
  return new Promise(async (resolve, reject) => {
    db.collection(collection).remove(removeObject, (error, result) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(result);
    });
  });
}

module.exports = remove;
