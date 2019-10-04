var path = require("path");
var mongojs = require("mongojs");
var db = require(pathThumbnails + "/handlers/db.js");

async function find(collection, searchObject, sortObject) {
  return new Promise((resolve, reject) => {
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

module.exports.find = find;
