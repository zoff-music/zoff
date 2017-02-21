var Suggestions = {

	catchUserSuggests: function(params, single){
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
		/*var minutes 	= Math.floor(secs / 60);
		var seconds 	= secs - minutes * 60;

		duration 		= Helper.pad(minutes) + ":" + Helper.pad(seconds);*/

		var song 		= List.generateSong({id: video_id, title: video_title, duration: duration}, false, false, false, true);
		$("#user-suggest-html").append(song);
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
                    	duration 		   = Helper.secondsToOther(Search.durationToSeconds(duration));
                    	var video_id 	 = song.id;
                    	var video_title  = song.snippet.title;

                    	//duration = duration.replace("PT","").replace("H","h ").replace("M","m ").replace("S","s");

                    	$("#suggest-song-html").append(List.generateSong({id: video_id, title: video_title, duration: duration}, false, false, false));
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
