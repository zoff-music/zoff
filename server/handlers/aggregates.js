var toShowConfig = {
  addsongs: true,
  adminpass: 1,
  allvideos: 1,
  frontpage: 1,
  longsongs: 1,
  removeplay: 1,
  shuffle: 1,
  skip: 1,
  startTime: 1,
  userpass: 1,
  vote: 1,
  toggleChat: { $ifNull: ["$toggleChat", true] },
  strictSkip: { $ifNull: ["$strictSkip", false] },
  strictSkipNumber: { $ifNull: ["$strictSkipNumber", 10] },
  description: { $ifNull: ["$description", ""] },
  thumbnail: { $ifNull: ["$thumbnail", ""] },
  rules: { $ifNull: ["$rules", ""] },
  _id: 0
};

var project_object = {
  _id: 0,
  id: 1,
  added: 1,
  now_playing: 1,
  title: 1,
  votes: 1,
  start: 1,
  duration: 1,
  end: 1,
  type: 1,
  added_by: { $ifNull: ["$added_by", "Anonymous"] },
  source: { $ifNull: ["$source", "youtube"] },
  thumbnail: {
    $ifNull: [
      "$thumbnail",
      {
        $concat: ["https://img.youtube.com/vi/", "$id", "/mqdefault.jpg"]
      }
    ]
  },
  tags: { $ifNull: ["$tags", []] }
};

var toShowChannel = {
  start: 1,
  end: 1,
  added: 1,
  id: 1,
  title: 1,
  votes: 1,
  duration: 1,
  type: 1,
  _id: 0,
  tags: 1,
  now_playing: 1,
  type: 1,
  source: 1,
  thumbnail: 1
};

module.exports.project_object = project_object;
module.exports.toShowConfig = toShowConfig;
module.exports.toShowChannel = toShowChannel;
