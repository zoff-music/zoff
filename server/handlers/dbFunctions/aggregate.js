var path = require("path");
var mongojs = require("mongojs");
var db = require(pathThumbnails + "/handlers/db.js");

function aggregate(collection, aggregateObject) {
  return new Promise((resolve, reject) => {
    db.collection(coll).aggregate(aggregateObject, function(error, results) {
      if (error) {
        reject(error);
        return;
      }
      resolve(results);
    });
  });
}

module.exports.aggregate = aggregate;
