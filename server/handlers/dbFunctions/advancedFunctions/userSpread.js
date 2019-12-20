var find = require(pathThumbnails + "/handlers/dbFunctions/find.js");

async function getSpread() {
    return new Promise((resolve) => {
        var tot = await find("connected_users", { _id: "total_users" });
        var off = await find("connected_users", { _id: "offline_users" });
        var users_list = await find("connected_users", {
            _id: { $ne: "total_users" },
            _id: { $ne: "offline_users" }
        });

        if (tot.length > 0 && off.length == 0) {
            resolve({
                offline: 0,
                total: tot[0].total_users.length,
                online_users: users_list
            });
        } else if (tot.length > 0 && off.length > 0) {
            resolve( {
                offline: off[0].users.length,
                total: tot[0].total_users.length,
                online_users: users_list
            })
        }
    });
}

module.exports.getSpread = getSpread;
