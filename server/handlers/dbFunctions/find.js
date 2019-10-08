var path = require("path");
var mongojs = require("mongojs");
var db = require(pathThumbnails + "/handlers/db.js");

async function find(collection, searchObject) {
  return new Promise(async (resolve, reject) => {
    db.collection(collection).find(searchObject, (error, result) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(result);
    });
  });
}

module.exports = find;
