var path = require("path");
var mongojs = require("mongojs");
var db = require(pathThumbnails + "/handlers/db.js");

async function update(collection, searchObject, updateObject, extraObject) {
  return new Promise(async (resolve, reject) => {
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

module.exports = update;
