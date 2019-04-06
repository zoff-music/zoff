var path = require('path');
var time_regex = /P((([0-9]*\.?[0-9]*)Y)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)W)?(([0-9]*\.?[0-9]*)D)?)?(T(([0-9]*\.?[0-9]*)H)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)S)?)?/;
try {
    var keys = require(path.join(__dirname, '../config/api_key.js'));
    var key = keys.youtube;
    var soundcloudKey = keys.soundcloud;
} catch(e) {
    console.log("Error - missing file");
    console.log("Seems you forgot to create the file api_key.js in /server/config/. Have a look at api_key.example.js.");
    process.exit(1);
}
var request = require('request');
var db = require(pathThumbnails + '/handlers/db.js');

function check_if_error_or_blocked(id, channel, errored, callback) {
    if(!errored) {
        callback(false);
        return;
    }
    db.collection(channel).find({id: id, now_playing: true}, function(err, song) {
        if(song.length == 0) {
            callback(false);
            return;
        }
        var song_info = song[0];
        if(song_info.source != "soundcloud") {
            request({
                type: "GET",
                url: "https://www.googleapis.com/youtube/v3/videos?part=id,status,contentDetails&key="+key+"&id=" + song_info.id,
            }, function(error, response, body) {
                try {
                    var resp = JSON.parse(body);
                    if(resp.pageInfo.totalResults == 0) {
                        callback(true);
                        return;
                    } else if(!resp.status.embeddable) {
                        callback(true);
                        return;
                    }
                    callback(false);
                    return;
                } catch(e){
                    callback(true);
                    return;
                }
            });
        } else {
            request({
                type: "GET",
                url: "http://api.soundcloud.com/tracks/" + song_info.id + "?client_id=" + soundcloudKey,
            }, function(error, response, body) {
                try {
                    var resp = JSON.parse(body);
                    if(resp.sharing != "public" || resp.embeddable_by != "all") {
                        callback(true);
                        return;
                    }
                    callback(false);
                    return;
                } catch(e){
                    callback(true);
                    return;
                }
            });
        }
    });
}

function filterFunction(el) {
    return el != null &&
    el != "" &&
    el != undefined &&
    el.trim() != ''
}

function get_genres_soundcloud(song, channel) {
    request("http://api.soundcloud.com/tracks/" + song.id + "?client_id=" + soundcloudKey, function(err, response, body) {
        if(err) {
            console.log("error start", err, song, "error end");
            return;
        }
        try {
            var object = JSON.parse(body);
            if(!object.hasOwnProperty("genre") || !object.hasOwnProperty("tag_list")) return;
            var genre = object.genre + ",";
            genre = genre.toLowerCase().split(",").concat(object.tag_list.toLowerCase().split('"'));
            genre = genre.filter(filterFunction);

            db.collection(channel).update({"id": song.id}, {
                $set: {
                    "tags": genre
                }
            }, function(e,d) {

            });
        } catch(e) {
            console.log("errored 2", e);
        }
    });
}

function get_genres_list(list, channel) {
    var youtube_array = "";
    var i = 0;
    try {
        for(var i = 0; i < list.length; i++) {

            if(!list[i].hasOwnProperty("id")) continue;
            if(list[i].source == undefined || list[i].source == "youtube") {
                youtube_array += list[i].id + ",";
            }
            else if(list[i].source != undefined && list[i].source == "soundcloud") {
                get_genres_soundcloud(list[i], channel);
            }
        }
        if(youtube_array.length > 0) {
            if(youtube_array > 49) {
                var subList = [];
                for(var i = 0; i < youtube_array.length; i++) {
                    subList.push(youtube_array[i]);
                    if(subList.length > 49) {
                        get_genres_youtube(subList.join(","), channel);
                        subList = [];
                    }
                }
                get_genres_youtube(subList.join(","), channel);
                subList = [];
            } else {
                get_genres_youtube(youtube_array, channel);
            }
        }
    } catch(e) {
        console.log("errored", e);
        return;
    }
}


function start_soundcloud_get(arr, channel, callback) {
    get_genres_soundcloud_recursive(arr, channel, 0, callback);
}

function get_genres_soundcloud_recursive(arr, channel, i, callback) {
    if(i >= arr.length) {
        if(typeof(callback) == "function") callback();
        return;
    }
    var song = arr[i];
    request("http://api.soundcloud.com/tracks/" + song.id + "?client_id=" + soundcloudKey, function(err, response, body) {
        if(err) {
            console.log("error start", err, song, "error end");
            get_genres_soundcloud_recursive(arr, channel, i + 1, callback);
            return;
        }
        try {
            var object = JSON.parse(body);
            if(!object.hasOwnProperty("genre") || !object.hasOwnProperty("tag_list")) {
                get_genres_soundcloud_recursive(arr, channel, i + 1, callback);
                return;
            }
            var genre = object.genre + ",";
            genre = genre.toLowerCase().split(",").concat(object.tag_list.toLowerCase().split('"'));
            genre = genre.filter(filterFunction);

            db.collection(channel).update({"id": song.id}, {
                $set: {
                    "tags": genre
                }
            }, function(e,d) {
                get_genres_soundcloud_recursive(arr, channel, i + 1, callback);
            });
        } catch(e) {
            console.log("errored 2", e);
            get_genres_soundcloud_recursive(arr, channel, i + 1, callback);
        }
    });
}

function get_genres_list_recursive(list, channel, callback) {
    var youtube_array = [];
    var soundcloud_array = [];
    for(var i = 0; i < list.length; i++) {
        if(!list[i].hasOwnProperty("id")) continue;
        if(list[i].source == undefined || list[i].source == "youtube") {
            youtube_array.push(list[i]);
        }
        else if(list[i].source != undefined && list[i].source == "soundcloud") {
            soundcloud_array.push(list[i]);
        }
    }
    start_youtube_get(youtube_array, channel, function() {
        start_soundcloud_get(soundcloud_array, channel, function() {
            if(typeof(callback) == "function") callback();
        })
    })
}

function start_youtube_get(arr, channel, callback) {
    get_genres_youtube_recursive(arr, channel, 0, callback)
}

function get_genres_youtube_recursive(arr, channel, i, callback) {
    if(i >= arr.length) {
        if(typeof(callback) == "function") callback();
        return;
    }
    var ids = [];
    for(var y = i; y < arr.length; y++) {
        if(ids.length >= 48) {
            break;
        }
        ids.push(arr[y].id);
    }
    request({
        type: "GET",
        url: "https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet,id,topicDetails&key="+key+"&id=" + ids.join(","),
    }, function(error, response, body) {
        if(error) {
            get_genres_youtube_recursive(arr, channel, i + ids.length, callback);
            return;
        }
        var resp = JSON.parse(body);
        if(!resp.hasOwnProperty("items")) {
            get_genres_youtube_recursive(arr, channel, i + ids.length, callback);
            return;
        }
        if(resp.items.length > 0) {
            for(var z = 0; z < resp.items.length; z++) {
                if(!resp.items[z].hasOwnProperty("topicDetails")) continue;
                var genre = resp.items[z].topicDetails.topicCategories;
                genre = genre.join(",");
                genre = genre.replace(new RegExp("https://en.wikipedia.org/wiki/", "g"), "");
                genre = genre.replace(/_/g, " ").toLowerCase().split(",");
                genre = genre.filter(filterFunction);
                //console.log(resp.items[i].id + " - ", genre);
                db.collection(channel).update({"id": resp.items[z].id}, {
                    $set: {
                        "tags": genre
                    }
                }, function(e, d) {
                });
            }
            get_genres_youtube_recursive(arr, channel, i + ids.length, callback);
        } else {
            get_genres_youtube_recursive(arr, channel, i + ids.length, callback);
        }
    });
}


function get_genres_youtube(ids, channel) {
    request({
        type: "GET",
        url: "https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet,id,topicDetails&key="+key+"&id=" + ids,
    }, function(error, response, body) {
        if(error) {
            return;
        }
        var resp = JSON.parse(body);
        if(!resp.hasOwnProperty("items")) {
            return;
        }
        if(resp.items.length > 0) {
            for(var i = 0; i < resp.items.length; i++) {
                if(!resp.items[i].hasOwnProperty("topicDetails")) continue;
                var genre = resp.items[i].topicDetails.topicCategories;
                genre = genre.join(",");
                genre = genre.replace(new RegExp("https://en.wikipedia.org/wiki/", "g"), "");
                genre = genre.replace(/_/g, " ").toLowerCase().split(",");
                genre = genre.filter(filterFunction);
                //console.log(resp.items[i].id + " - ", genre);
                db.collection(channel).update({"id": resp.items[i].id}, {
                    $set: {
                        "tags": genre
                    }
                }, function(e, d) {});
            }
        }
    });
}

function get_correct_info(song_generated, channel, broadcast, callback) {
    //channel = channel.replace(/ /g,'');
    request({
        type: "GET",
        url: "https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet,id,topicDetails&key="+key+"&id=" + song_generated.id,

    }, function(error, response, body) {
        try {
            var resp = JSON.parse(body);
            if(resp.items.length == 1) {
                var duration = parseInt(durationToSeconds(resp.items[0].contentDetails.duration));
                var title = resp.items[0].snippet.localized.title;
                var genre = resp.items[0].topicDetails.topicCategories;
                genre = genre.join(",");
                genre = genre.replace(new RegExp("https://en.wikipedia.org/wiki/", "g"), "");
                genre = genre.replace(/_/g, " ").toLowerCase().split(",");
                genre = genre.filter(filterFunction);
                //console.log(genre + " - ", song_generated.id);
                if(title != song_generated.title || duration < parseInt(song_generated.duration)) {
                    if(title != song_generated.title) {
                        song_generated.title = title;
                    }
                    if(duration < parseInt(song_generated.duration)) {
                        song_generated.duration = duration;
                        song_generated.start = 0;
                        song_generated.end = duration;
                    }
                    db.collection(channel).update({"id": song_generated.id}, {
                        $set: {
                            "duration": song_generated.duration,
                            "start": song_generated.start,
                            "end": song_generated.end,
                            "title": song_generated.title,
                            "tags": genre
                        }
                    }, function(err, docs) {
                        if(broadcast && docs.nModified == 1) {
                            song_generated.new_id = song_generated.id;
                            //if(song_generated.type == "video")
                            if(typeof(callback) == "function") {
                                callback(song_generated, true);
                            } else {
                                io.to(channel).emit("channel", {type: "changed_values", value: song_generated});
                            }
                        } else {
                            if(typeof(callback) == "function") {
                                callback(song_generated, true);
                            }
                        }
                    });
                } else {
                    db.collection(channel).update({"id": song_generated.id}, {
                        $set: {
                            "tags": genre
                        }
                    }, function(e,d) {
                        if(typeof(callback) == "function") {
                            callback(song_generated, true);
                        }
                    });
                }
            } else {
                findSimilar(song_generated, channel, broadcast, callback)
            }
        } catch(e){
            if(typeof(callback) == "function") {
                callback({}, false);
            }
        }
    });
}

function check_error_video(msg, channel) {
    if(!msg.hasOwnProperty("id") || !msg.hasOwnProperty("title") ||
    typeof(msg.id) != "string" || typeof(msg.title) != "string") {
        var result = {
            id: {
                expected: "string",
                got: msg.hasOwnProperty("id") ? typeof(msg.id) : undefined,
            },
            title: {
                expected: "string",
                got: msg.hasOwnProperty("title") ? typeof(msg.title) : undefined,
            },
        };
        return;
    }
    if(msg.source == "soundcloud") return;
    //channel = channel.replace(/ /g,'');
    request({
        type: "GET",
        url: "https://www.googleapis.com/youtube/v3/videos?part=id&key="+key+"&id=" + msg.id,

    }, function(error, response, body) {
        try {
            var resp = JSON.parse(body);
            if(resp.pageInfo.totalResults == 0) {
                findSimilar(msg, channel, true, undefined)
            }
        } catch(e){
            console.log(msg.id, key, e, body);
        }
    });
}

function findSimilar(msg, channel, broadcast, callback) {
    //channel = channel.replace(/ /g,'');
    var yt_url = "https://www.googleapis.com/youtube/v3/search?key="+key+"&videoEmbeddable=true&part=id&type=video&order=viewCount&safeSearch=none&maxResults=5&q=" + encodeURIComponent(msg.title);
    request({
        method: "GET",
        url: yt_url,
    }, function(error, response, body){
        var resp = JSON.parse(body);
        if(resp.items.length > 0) {
            var vid_url = "https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet,id&key="+key+"&id=";
            for(var i = 0; i < resp.items.length; i++) {
                vid_url += resp.items[i].id.videoId + ",";
            }
            request({
                type: "GET",
                url: vid_url
            }, function(error, response, body) {
                var resp = JSON.parse(body);
                var found = false;
                var element = {};
                for(var i = 0; i < resp.items.length; i++) {
                    if(similarity(resp.items[i].snippet.localized.title, msg.title) > 0.75) {
                        found = true;
                        element = {
                            title: resp.items[i].snippet.localized.title,
                            duration: parseInt(durationToSeconds(resp.items[i].contentDetails.duration)),
                            id: resp.items[i].id,
                            start: 0,
                            end: parseInt(durationToSeconds(resp.items[i].contentDetails.duration)),
                        }
                        break;
                    }
                }
                if(found) {
                    db.collection(channel).update({"id": msg.id}, {
                        $set: element
                    }, function(err, docs) {
                        if(docs && docs.hasOwnProperty("nModified") && docs.nModified == 1 && broadcast) {
                            element.new_id = element.id;
                            element.id = msg.id;
                            if(!callback) {
                                io.to(channel).emit("channel", {type: "changed_values", value: element});
                            }
                        }
                        if(typeof(callback) == "function") {
                            msg.title = element.title;
                            msg.id = element.id;
                            msg.duration = element.duration;
                            msg.start = element.start;
                            msg.end = element.end;
                            callback(msg, true);
                        }
                    });
                } else if(typeof(callback) == "function") {
                    callback({}, false);
                }
            });
        }
    });
}

function similarity(s1, s2) {
    var longer = s1;
    var shorter = s2;
    if (s1.length < s2.length) {
        longer = s2;
        shorter = s1;
    }
    var longerLength = longer.length;
    if (longerLength == 0) {
        return 1.0;
    }
    return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    var costs = new Array();
    for (var i = 0; i <= s1.length; i++) {
        var lastValue = i;
        for (var j = 0; j <= s2.length; j++) {
            if (i == 0)
            costs[j] = j;
            else {
                if (j > 0) {
                    var newValue = costs[j - 1];
                    if (s1.charAt(i - 1) != s2.charAt(j - 1))
                    newValue = Math.min(Math.min(newValue, lastValue),
                    costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0)
        costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}

function durationToSeconds(duration) {
    var matches = duration.match(time_regex);
    hours= parseInt(matches[12])||0;
    minutes= parseInt(matches[14])||0;
    seconds= parseInt(matches[16])||0;
    return hours*60*60+minutes*60+seconds;
}

module.exports.check_if_error_or_blocked = check_if_error_or_blocked;
module.exports.get_genres_list_recursive = get_genres_list_recursive;
module.exports.get_genres_soundcloud = get_genres_soundcloud;
module.exports.get_genres_youtube = get_genres_youtube;
module.exports.get_genres_list = get_genres_list;
module.exports.check_error_video = check_error_video;
module.exports.get_correct_info = get_correct_info;
