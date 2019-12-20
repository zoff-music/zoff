var update = require(pathThumbnails + "/handlers/dbFunctions/update.js");

async function pullConnectedUser(document, id, pullFrom, toPull) {
  var pullElement = {};
  pullElement[pullFrom] = toPull;
  return await update(document, { _id: id }, { $pull: pullElement });
}

async function addToSet(document, id, addTo, toAdd) {
  var addElement = {};
  addElement[addTo] = toAdd;
  return await update(
    document,
    { _id: id },
    { $addToSet: addElement },
    { upsert: true }
  );
}

module.exports.pullConnectedUser = pullConnectedUser;
module.exports.addToSet = addToSet;
