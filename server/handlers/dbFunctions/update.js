var path = require("path");
var mongojs = require("mongojs");
var db = require(pathThumbnails + "/handlers/db.js");

function update(collection, searchObject, updateObject, extraObject) {
  return new Promise((resolve, reject) => {
    db.collection(collection).update(
      searchObject,
      updateObject,
      extraObject,
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      }
    );
  });
}

module.exports.update = update;
