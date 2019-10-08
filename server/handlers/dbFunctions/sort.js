var path = require("path");
var mongojs = require("mongojs");
var db = require(pathThumbnails + "/handlers/db.js");

async function sort(collection, searchObject, sortObject) {
  return new Promise(async (resolve, reject) => {
    db.collection(collection)
      .find(searchObject)
      .sort(sortObject, (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      });
  });
}

module.exports = sort;
