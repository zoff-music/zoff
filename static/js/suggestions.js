var Suggestions = {

	catchUserSuggests: function(suggested){

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
                    	var duration 	 = song.contentDetails.duration;
                    	var secs 		 = Search.durationToSeconds(duration);
                    	var video_id 	 = song.id;
                    	var video_title  = song.snippet.title;
                    	var suggest_song = $("<div><div class='suggest-songs suggest-"+video_id+"'>" + $(suggest_html).html() + "</div></div>");
                    	
                    	duration = duration.replace("PT","").replace("H","h ").replace("M","m ").replace("S","s")

                    	window.suggest_song = suggest_song;
                    	suggest_song.find(".suggest_thumb").attr("src", "//img.youtube.com/vi/"+video_id+"/mqdefault.jpg")
                    	suggest_song.find(".suggest_title").text(video_title);
                    	suggest_song.find(".duration-song").text(duration);
                    	suggest_song.find(".accept").attr("data-video-id", video_id);
                    	suggest_song.find(".accept").attr("data-video-title", video_title);
                    	suggest_song.find(".accept").attr("data-video-length", secs);
						suggest_song.find(".decline").attr("data-video-id", video_id);

                    	$("#suggest-song-html").append(List.generateSong({id: song.id, title: song.snippet.title, length: secs, duration: duration}, false, false, false));
                    });
          		}
          	});
        }
      });
	}

}