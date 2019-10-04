var path = require("path");
var mongojs = require("mongojs");
var db = require(pathThumbnails + "/handlers/db.js");

function find(collection, searchObject) {
  return new Promise((resolve, reject) => {
    db.collection(collection).find(searchObject, (error, result) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(result);
    });
  });
}

module.exports.find = find;
