var path = require('path');
var time_regex = /P((([0-9]*\.?[0-9]*)Y)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)W)?(([0-9]*\.?[0-9]*)D)?)?(T(([0-9]*\.?[0-9]*)H)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)S)?)?/;
var key = require(path.join(__dirname, '../config/api_key.js'));

function get_correct_info(song_generated, channel, broadcast) {
    request({
            type: "GET",
            url: "https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet,id&key="+key+"&id=" + song_generated.id,

    }, function(error, response, body) {
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
                    if(broadcast) {
                        io.to(channel).emit("channel", {type: "changed_values", value: song_generated});
                    }
                });
            }
        }

    });
}

function durationToSeconds(duration) {
    var matches = duration.match(time_regex);
    hours= parseInt(matches[12])||0;
    minutes= parseInt(matches[14])||0;
    seconds= parseInt(matches[16])||0;
    return hours*60*60+minutes*60+seconds;
}

module.exports.get_correct_info = get_correct_info;
