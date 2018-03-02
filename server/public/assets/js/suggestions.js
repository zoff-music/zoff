var Suggestions = {

    catchUserSuggests: function(params, single){
        if(single) {
            number_suggested = number_suggested + 1;
        } else {
            number_suggested = number_suggested + params.length;
        }
        for(var i = 0; i < params.length; i++) {
            if($("#suggested-" + params[i].id).length > 0) {
                number_suggested -= 1;
            }
        }
        var to_display = number_suggested > 9 ? "9+" : number_suggested;
        if($(".suggested-link span.badge.new.white").hasClass("hide") && number_suggested > 0){
            $(".suggested-link span.badge.new.white").removeClass("hide");
        }
        $(".suggested-link span.badge.new.white").text(to_display);
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
        if($("#" + $(song).attr("id")).length == 0) {
            $("#user-suggest-html").append(song);
        }
    },

    fetchYoutubeSuggests: function(id){
        var get_url 	= "https://www.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId="+id+"&type=video&key="+api_key;
        var video_urls	= "https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet,id&key="+api_key+"&id=";

        $.ajax({
            type: "GET",
            url: get_url,
            dataType:"jsonp",
            success: function(response)
            {
                $.each(response.items.slice(0,5), function(i,data){
                    video_urls += data.id.videoId+",";
                });

                $.ajax({
                    type: "GET",
                    url: video_urls,
                    dataType: "jsonp",
                    success: function(response)
                    {
                        $("#suggest-song-html").empty();

                        $.each(response.items, function(i,song)
                        {
                            var duration 	= song.contentDetails.duration;
                            var length 		= Search.durationToSeconds(duration);
                            duration 		= Helper.secondsToOther(Search.durationToSeconds(duration));
                            var video_id 	= song.id;
                            var video_title = song.snippet.title;

                            $("#suggest-song-html").append(List.generateSong({id: video_id, title: video_title, length: length, duration: duration}, false, false, false));
                        });
                    }
                });
            }
        });
    },

    checkUserEmpty: function(){
        var length = $("#user-suggest-html").children().length;
        if(length === 0){
            if(!Helper.contains($("#user_suggests").attr("class").split(" "), "hide"))
            $("#user_suggests").addClass("hide");
        }else{
            $("#user_suggests").removeClass("hide");
        }
    },
};
