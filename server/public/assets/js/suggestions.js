var Suggestions = {

    catchUserSuggests: function(params, single){
        if(single) {
            number_suggested = number_suggested + 1;
        } else {
            number_suggested = number_suggested + params.length;
        }
        for(var i = 0; i < params.length; i++) {
            if(document.querySelectorAll("#suggested-" + params[i].id).length > 0) {
                number_suggested -= 1;
            }
        }
        var to_display = number_suggested > 9 ? "9+" : number_suggested;
        if(number_suggested > 0 && Admin.logged_in){
            Helper.removeClass(document.querySelector(".suggested-link span.badge.new.white"), "hide");
        }
        document.querySelector(".suggested-link span.badge.new.white").innerText = to_display;
        if(single){
            Suggestions.createSuggested(params);
        }else{
            for(var x in params){
                Suggestions.createSuggested(params[x]);
            }
        }
        Suggestions.checkUserEmpty();
    },

    createSuggested: function(params){
        var duration 	= Helper.secondsToOther(params.duration);
        var video_id 	= params.id;
        var video_title = params.title;
        var song 		= List.generateSong({id: video_id, title: video_title, length: params.duration, duration: duration}, false, false, false, true);
        if(document.querySelectorAll("#" + video_id).length == 0) {
            document.getElementById("user-suggest-html").insertAdjacentHTML("beforeend", song);
        }
    },

    fetchYoutubeSuggests: function(id){
        var get_url 	= "https://www.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId="+id+"&type=video&key="+api_key;
        var video_urls	= "https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet,id&key="+api_key+"&id=";

        Helper.ajax({
            type: "GET",
            url: get_url,
            dataType:"jsonp",
            success: function(response)
            {
                response = JSON.parse(response);
                var this_resp = response.items.slice(0,5);
                for(var i = 0; i < this_resp.length; i++) {
                    var data = this_resp[i];
                    video_urls += data.id.videoId+",";
                }

                Helper.ajax({
                    type: "GET",
                    url: video_urls,
                    dataType: "jsonp",
                    success: function(response)
                    {
                        response = JSON.parse(response);
                        Helper.setHtml("#suggest-song-html", "");
                        for(var i = 0; i < response.items.length; i++) {
                            var song = response.items[i];
                            var duration 	= song.contentDetails.duration;
                            var length 		= Search.durationToSeconds(duration);
                            duration 		= Helper.secondsToOther(Search.durationToSeconds(duration));
                            var video_id 	= song.id;
                            var video_title = song.snippet.title;

                            document.getElementById("suggest-song-html").insertAdjacentHTML("beforeend", List.generateSong({id: video_id, title: video_title, length: length, duration: duration}, false, false, false));
                        }
                    }
                });
            }
        });
    },

    checkUserEmpty: function(){
        var length = document.getElementById("user-suggest-html").children.length;
        if(length === 0){
            Helper.addClass("#user_suggests", "hide");
        } else if(Admin.logged_in){
            Helper.removeClass("#user_suggests", "hide");
        }
    },
};
