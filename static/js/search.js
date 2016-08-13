var Search = {

    showSearch: function(){
    	$("#search-wrapper").toggleClass("hide");
    	if(Helper.mobilecheck())
    	{
    		$(".search_input").focus();
    	}
    	$("#song-title").toggleClass("hide");
    	$("#results").toggleClass("hide");
    	$("#results").empty();
    	$("#search-btn i").toggleClass("mdi-navigation-close");
    	$("#search-btn i").toggleClass("mdi-action-search");
    	$("#search").focus();

    },

    search: function(search_input){
      if(result_html === undefined || empty_results_html === undefined) {
        result_html         = $("#temp-results-container");
        empty_results_html    = $("#empty-results-container").html();
      }
      $(".search_results").html('');
      if(window.search_input !== ""){
        searching = true;
        var keyword= encodeURIComponent(window.search_input);
        //response= x
        var yt_url = "https://www.googleapis.com/youtube/v3/search?key="+api_key+"&videoEmbeddable=true&part=id&fields=items(id)&type=video&order=viewCount&safeSearch=none&maxResults=25";
        yt_url+="&q="+keyword;
        if(music)yt_url+="&videoCategoryId=10";

        var vid_url = "https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet,id&key="+api_key+"&id=";

        if(Helper.contains($("#search_loader").attr("class").split(" "), "hide"))
          $("#search_loader").removeClass("hide");

        if(Helper.contains($("#results").attr("class").split(" "), "hide"))
          $("#results").removeClass("hide");

        $.ajax({
          type: "GET",
          url: yt_url,
          dataType:"jsonp",
          success: function(response){
            if(response.items.length === 0)
            {

              $("<div style='display:none;' id='mock-div'>"+empty_results_html+"</div>").appendTo($("#results")).show("blind", 83.33);
              if(!Helper.contains($("#search_loader").attr("class").split(" "), "hide"))
                $("#search_loader").addClass("hide");

            }else if(response.items){
            //get list of IDs and make new request for video info
              $.each(response.items, function(i,data)
              {
                vid_url += data.id.videoId+",";
              });

              $.ajax({
                type: "GET",
                url: vid_url,
                dataType:"jsonp",
                success: function(response){

                  var output = "";
                  var pre_result = $(result_html);

                  //$("#results").append(result_html);

                  $.each(response.items, function(i,song)
                  {
                    var duration=song.contentDetails.duration;
                    secs=Search.durationToSeconds(duration);
                    if(!longsongs || secs<720){
                      title=song.snippet.title;
                      enc_title=title;//encodeURIComponent(title).replace(/'/g, "\\\'");
                      id=song.id;
                      duration = duration.replace("PT","").replace("H","h ").replace("M","m ").replace("S","s");
                      thumb=song.snippet.thumbnails.medium.url;

                      //$("#results").append(result_html);
                      var songs = pre_result;

                      songs.find(".search-title").text(title);
                      songs.find(".result_info").text(duration);
                      songs.find(".thumb").attr("data-original", thumb);
                      //songs.find(".add-many").attr("onclick", "submit('"+id+"','"+enc_title+"',"+secs+");");
                      songs.find("#add-many").attr("data-video-id", id);
                      songs.find("#add-many").attr("data-video-title", enc_title);
                      songs.find("#add-many").attr("data-video-length", secs);
                      //$($(songs).find("div")[0]).attr("onclick", "submitAndClose('"+id+"','"+enc_title+"',"+secs+");");
                      songs.find("#temp-results").attr("data-video-id", id);
                      songs.find("#temp-results").attr("data-video-title", enc_title);
                      songs.find("#temp-results").attr("data-video-length", secs);
                      //$($(songs).find("div")[0]).attr("id", id)
                      output += songs.html();

                    }
                  });

                  $("<div style='display:none;' id='mock-div'>"+output+"</div>").appendTo($("#results")).show("blind", (response.items.length-1) * 83.33);

                  setTimeout(function(){$(".thumb").lazyload({container: $("#results")});}, 250);

                  if(!Helper.contains($("#search_loader").attr("class").split(" "), "hide"))
                    $("#search_loader").addClass("hide");

                  $(".add-many").click(function(e) {
                      e.preventDefault();
                      e.stopPropagation();
                      return false;
                  });
                }
              });
            }
          }
        });

      }else{
        $(".main").removeClass("blurT");
        $("#controls").removeClass("blurT");
        $(".main").removeClass("clickthrough");
      }
    },

    submitAndClose: function(id,title,duration){
    	Search.submit(id,title, duration, false, 0, 1);
    	$("#results").html('');
    	Search.showSearch();
    	document.getElementById("search").value = "";
    	$("#results").html = "";
    	$(".main").removeClass("blurT");
    	$("#controls").removeClass("blurT");
    	$(".main").removeClass("clickthrough");
    },

    importPlaylist: function(pId,pageToken){
      token = "";
      if(pageToken !== undefined)
        token = "&pageToken="+pageToken;
      playlist_url = "https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=49&key="+api_key+"&playlistId="+pId+token;
      $.ajax({
        type: "GET",
        url: playlist_url,
        dataType:"jsonp",
        success: function(response)
        {
          var ids="";
          //Search.addVideos(response.items[0].contentDetails.videoId);
          //response.items.shift();
          $.each(response.items, function(i,data)
          {
            ids+=data.contentDetails.videoId+",";
          });
          Search.addVideos(ids, true);
          if(response.nextPageToken) Search.importPlaylist(pId, response.nextPageToken);
          document.getElementById("import").value = "";
        }
      });
    },

    addVideos: function(ids, playlist){
    	var request_url="https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet,id&key=***REMOVED***&id=";
    	request_url += ids;

    	$.ajax({
    	type: "POST",
    	url: request_url,
    	dataType:"jsonp",
    	success: function(response){
            var x = 0;
            var to_add = [];
    		$.each(response.items, function(i,song)
    		{
    			var duration=Search.durationToSeconds(song.contentDetails.duration);
    			if(!longsongs || duration<720){
    				enc_title= song.snippet.title;//encodeURIComponent(song.snippet.title);
    				//Search.submit(song.id, enc_title, duration, playlist, i);
                    x += 1;
                    to_add.push({id: song.id, enc_title: enc_title, duration: duration, playlist: playlist});
    			}
    		});
            $.each(to_add, function(i, item){
                Search.submit(item.id, item.enc_title, item.duration, item.playlist, i, x);
            });

    	}
    	});
    },

    submit: function(id,title,duration, playlist, num, full_num){
    	socket.emit("add", {id: id, title: decodeURIComponent(title), adminpass: adminpass, list: chan.toLowerCase(), duration: duration, playlist: playlist, num: num, total: full_num});
        //[id, decodeURIComponent(title), adminpass, duration, playlist]);
    },

    durationToSeconds: function(duration) {
        var matches = duration.match(time_regex);
        hours= parseInt(matches[12])||0;
        minutes= parseInt(matches[14])||0;
        seconds= parseInt(matches[16])||0;
        return hours*60*60+minutes*60+seconds;
    }

};
