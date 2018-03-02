var path = require('path');
var time_regex = /P((([0-9]*\.?[0-9]*)Y)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)W)?(([0-9]*\.?[0-9]*)D)?)?(T(([0-9]*\.?[0-9]*)H)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)S)?)?/;
try {
    var key = require(path.join(__dirname, '../config/api_key.js'));
} catch(e) {
    console.log("Error - missing file");
    console.log("Seems you forgot to create the file api_key.js in /server/config/. Have a look at api_key.example.js.");
    process.exit();
}

function get_correct_info(song_generated, channel, broadcast, callback) {
    request({
            type: "GET",
            url: "https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet,id&key="+key+"&id=" + song_generated.id,

    }, function(error, response, body) {
        try {
            var resp = JSON.parse(body);
            if(resp.items.length == 1) {
                var duration = parseInt(durationToSeconds(resp.items[0].contentDetails.duration));
                var title = resp.items[0].snippet.localized.title;
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
                            callback(song_generated, true);
                        }
                    });
                }
            } else {
                findSimilar(song_generated, channel, broadcast, callback)
            }
        } catch(e){
            callback({}, false);
        }
    });
}

function check_error_video(msg, channel) {
    if(!msg.hasOwnProperty("id") || !msg.hasOwnProperty("title")) {
        socket.emit("update_required");
        return;
    }

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
            console.log(e);
        }
    });
}

function findSimilar(msg, channel, broadcast, callback) {
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
                        if(docs.nModified == 1 && broadcast) {
                            element.new_id = element.id;
                            element.id = msg.id;
                            if(!callback) {
                                io.to(channel).emit("channel", {type: "changed_values", value: element});
                            }
                        }
                        if(callback) {
                            msg.title = element.title;
                            msg.id = element.id;
                            msg.duration = element.duration;
                            msg.start = element.start;
                            msg.end = element.end;
                            callback(msg, true);
                        }
                    });
                } else if(callback) {
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

module.exports.check_error_video = check_error_video;
module.exports.get_correct_info = get_correct_info;
