var path = require("path");
var mongojs = require("mongojs");
var db = require(pathThumbnails + "/handlers/db.js");
var find = require(pathThumbnails + "/handlers/dbFunctions/find.js");
var aggregate = require(pathThumbnails + "/handlers/dbFunctions/aggregate.js");

async function frontpageLists(msg, socket) {
  if (
    msg == undefined ||
    !msg.hasOwnProperty("version") ||
    msg.version != VERSION ||
    msg.version == undefined
  ) {
    var result = {
      version: {
        expected: VERSION,
        got: msg.hasOwnProperty("version") ? msg.version : undefined
      }
    };
    socket.emit("update_required", result);
    return;
  }

  var docs = await find("frontpage_lists", { frontpage: true });
  var tot = await find("connected_users", { _id: "total_users" });
  socket.compress(true).emit("playlists", {
    channels: docs,
    viewers: tot[0].total_users.length
  });
}

async function getFrontpageLists(callback) {
  return new Promise(async (resolve, reject) => {
    var project_object = {
      _id: 1,
      count: 1,
      frontpage: 1,
      id: 1,
      title: 1,
      viewers: 1,
      accessed: 1,
      pinned: { $ifNull: ["$pinned", 0] },
      description: {
        $ifNull: [
          {
            $cond: {
              if: {
                $or: [
                  { $eq: ["$description", ""] },
                  { $eq: ["$description", null] },
                  { $eq: ["$description", undefined] }
                ]
              },
              then: "This list has no description",
              else: "$description"
            }
          },
          "This list has no description"
        ]
      },
      thumbnail: {
        $ifNull: [
          {
            $cond: {
              if: {
                $or: [
                  { $eq: ["$thumbnail", ""] },
                  { $eq: ["$thumbnail", null] },
                  { $eq: ["$thumbnail", undefined] }
                ]
              },
              then: {
                $concat: [
                  "https://img.youtube.com/vi/",
                  "$id",
                  "/mqdefault.jpg"
                ]
              },
              else: "$thumbnail"
            }
          },
          { $concat: ["https://img.youtube.com/vi/", "$id", "/mqdefault.jpg"] }
        ]
      }
    };
    var docs = await aggregate("frontpage_lists", [
      {
        $match: {
          frontpage: true,
          count: { $gt: 3 }
        }
      },
      {
        $project: project_object
      },
      {
        $sort: {
          pinned: -1,
          viewers: -1,
          accessed: -1,
          count: -1,
          title: 1
        }
      }
    ]);

    resolve(docs);
  });
}

module.exports.frontpageLists = frontpageLists;
module.exports.getFrontpageLists = getFrontpageLists;
