function password(inp, coll, guid, offline, socket) {
    if(inp !== undefined && inp !== null && inp !== "")
    {
        pw = inp.password;
        opw = inp.password;
        try {
            coll = inp.channel;
            if(coll.length == 0) return;
            coll = emojiStrip(coll).toLowerCase();
            coll = coll.replace("_", "");
            coll = encodeURIComponent(coll).replace(/\W/g, '');
            coll = filter.clean(coll);
        } catch(e) {
            return;
        }

        if(coll == "" || coll == undefined || coll == null) {
            socket.emit("update_required");
            return;
        }

        uncrypted = pw;
        pw = Functions.decrypt_string(socket.zoff_id, pw);

        Functions.check_inlist(coll, guid, socket, offline);

        if(inp.oldpass)
        {
            opw = inp.oldpass;
        }
        opw = Functions.decrypt_string(socket.zoff_id, opw);

        db.collection(coll + "_settings").find(function(err, docs){
            if(docs !== null && docs.length !== 0)
            {
                if(docs[0].adminpass === "" || docs[0].adminpass == Functions.hash_pass(opw))
                {
                    db.collection(coll + "_settings").update({views:{$exists:true}}, {$set:{adminpass:Functions.hash_pass(pw)}}, function(err, docs){
                        if(inp.oldpass)
                        socket.emit("toast", "changedpass");
                        else
                        socket.emit("toast", "correctpass");
                        socket.emit("pw", true);
                    });
                }else
                socket.emit("toast", "wrongpass");
            }
        });
    } else {
        socket.emit('update_required');
    }
}

function conf_function(params, coll, guid, offline, socket) {
    if(params !== undefined && params !== null && params !== "" &&
    params.hasOwnProperty('voting') &&
    params.hasOwnProperty('addsongs') &&
    params.hasOwnProperty('longsongs') &&
    params.hasOwnProperty('frontpage') &&
    params.hasOwnProperty('allvideos') &&
    params.hasOwnProperty('removeplay') &&
    params.hasOwnProperty('adminpass') &&
    params.hasOwnProperty('skipping') &&
    params.hasOwnProperty('shuffling') &&
    params.hasOwnProperty('channel'))
    {
        if(coll !== undefined) {
            try {
                coll = params.channel;
                if(coll.length == 0) return;
                coll = emojiStrip(coll).toLowerCase();
                coll = coll.replace("_", "");
                coll = encodeURIComponent(coll).replace(/\W/g, '');
                coll = filter.clean(coll);
            } catch(e) {
                return;
            }
        }

        if(coll == "" || coll == undefined || coll == null) {
            socket.emit("update_required");
            return;
        }

        Functions.check_inlist(coll, guid, socket, offline);

        var voting = params.voting;
        var addsongs = params.addsongs;
        var longsongs = params.longsongs;
        var frontpage = params.frontpage;
        var allvideos = params.allvideos;
        var removeplay = params.removeplay;
        var adminpass = params.adminpass;
        var skipping = params.skipping;
        var shuffling = params.shuffling;
        var userpass = Functions.decrypt_string(socket.zoff_id, params.userpass);

        if((!params.userpass_changed && frontpage) || (params.userpass_changed && userpass == "")) {
            userpass = "";
        } else if(params.userpass_changed && userpass != "") {
            frontpage = false;
        }
        var description = "";
        var hash;
        if(params.description) description = params.description;

        if(adminpass !== "") {
            hash = Functions.hash_pass(Functions.decrypt_string(socket.zoff_id, adminpass));
        } else {
            hash = adminpass;
        }
        db.collection(coll + "_settings").find(function(err, docs){
            if(docs !== null && docs.length !== 0 && (docs[0].adminpass === "" || docs[0].adminpass == hash)) {
                var obj = {
                    addsongs:addsongs,
                    allvideos:allvideos,
                    frontpage:frontpage,
                    skip:skipping,
                    vote:voting,
                    removeplay:removeplay,
                    shuffle:shuffling,
                    longsongs:longsongs,
                    adminpass:hash,
                    desc: description,
                };
                if(params.userpass_changed) {
                    obj["userpass"] = userpass;
                } else if (frontpage) {
                    obj["userpass"] = "";
                }
                db.collection(coll + "_settings").update({views:{$exists:true}}, {
                    $set:obj
                }, function(err, docs){
                    db.collection(coll + "_settings").find(function(err, docs){
                        if(docs[0].adminpass !== "") docs[0].adminpass = true;
                        if(docs[0].hasOwnProperty("userpass") && docs[0].userpass != "") docs[0].userpass = true;
                        else docs[0].userpass = false;
                        io.to(coll).emit("conf", docs);
                        socket.emit("toast", "savedsettings");

                        db.collection("frontpage_lists").update({_id: coll}, {$set:{
                            frontpage:frontpage, accessed: Functions.get_time()}
                        },
                        {upsert:true}, function(err, docs){});
                    });
                });
            } else {
                socket.emit("toast", "wrongpass");
            }
        });
    } else {
        socket.emit('update_required');
    }
}

module.exports.password = password;
module.exports.conf_function = conf_function;
