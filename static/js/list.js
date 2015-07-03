var List = {

    channel_listener: function()
    {
    	socket.on("channel", function(msg){
    		List.channel_function(msg);
    	});
    },

    channel_function: function(msg)
    {
    	if(msg[0] == "list")
    	{
    		full_playlist = msg[1];
    		full_playlist.sort(Helper.predicate({
    	       name: 'votes',
    	       reverse: true
      		}, 'added'));
    		List.populate_list(full_playlist);
    	}else if(msg[0] == "added")
    	{
    		full_playlist.push(msg[1]);
    		full_playlist.sort(Helper.predicate({
    	    name: 'votes',
    	    reverse: true
      		}, 'added'));

    		List.insertAtIndex(List.getIndexOfSong(msg[1].id), msg[1], true);
            var test = $("#wrapper").children()[List.getIndexOfSong(msg[1].id)];
    		setTimeout(function(){
    			$(test).css("height", 66);
    		},5);

    	}else if(msg[0] == "deleted")
    	{
    		var to_delete = $("#wrapper").children()[List.getIndexOfSong(msg[1])];
    		to_delete.style.height = 0;
    		setTimeout(function()
    		{
    			$("#"+msg[1]).remove();
    			full_playlist.splice(List.getIndexOfSong(msg[1]), 1);
    		}, 305);
            document.getElementById('wrapper').scrollTop += 1;
            document.getElementById('wrapper').scrollTop += -1;
    	}else if(msg[0] == "vote")
    	{
    		var index_of_song = List.getIndexOfSong(msg[1]);
            var song_voted_on = full_playlist[index_of_song];
    		full_playlist[index_of_song].votes += 1;
    		full_playlist[index_of_song].added = msg[2];
    		full_playlist.sort(Helper.predicate({
    	       name: 'votes',
    	       reverse: true
      		}, 'added'));
            $("#"+msg[1]).remove();
            console.log(msg[1]);
            List.insertAtIndex(List.getIndexOfSong(msg[1]), song_voted_on, false);

    		//List.populate_list(full_playlist, false);
    	}else if(msg[0] == "song_change")
    	{

    		full_playlist[0].now_playing = true;
    		full_playlist[0].votes = 0;
    		full_playlist[0].guids = [];
    		full_playlist[0].added = msg[1];
    		full_playlist[full_playlist.length-1].now_playing = false;
    		/*full_playlist.sort(predicate({
    	    name: 'votes',
    	    reverse: true
      		}, 'added'));
    		*/
    		full_playlist.push(full_playlist.shift());
    		$("#wrapper").children()[0].remove();
    		List.insertAtIndex($("#wrapper").children().length, full_playlist[full_playlist.length-2], false);
            document.getElementById('wrapper').scrollTop += 1;
            document.getElementById('wrapper').scrollTop += -1;
    		//populate_list(full_playlist);
    	}
    },

    skipping_listener: function(){
    	socket.on("skipping", function(obj)
    	{
    		document.getElementById("pBar").innerHTML = "Vote registrated! "+obj[0]+" of "+obj[1]+" has skipped. "+(Math.ceil(obj[1]/2))+" or more is needed!";
    		$("#pBar").addClass("opacityFull");
    		setTimeout(function(){
    			$("#pBar").removeClass("opacityFull");
    		},1500);
    	});
    },

    populate_list: function(msg)
    {
		$("#wrapper").empty();

		$.each(msg, function(j, listeID){
			if(!listeID.now_playing){ //check that the song isnt playing

				var video_title=decodeURIComponent(listeID.title);
				var video_id = listeID.id;
				var video_thumb = "//img.youtube.com/vi/"+video_id+"/mqdefault.jpg";
				//var delsong = ""; if(pass_corr=="correct");
				var video_votes = listeID.votes;
				$("#wrapper").append(list_html);
				var song = $("#list-song");
				song.find(".list-title").text(video_title);
				song.find(".list-title").attr("title", video_title);
				song.find(".list-votes").text(video_votes);
				song.find(".vote-container").attr("onclick", "vote('"+video_id+"','pos')");
				song.find(".list-image").attr("data-original",video_thumb);
				song.attr("id",video_id);
				song.find("#del").attr("onclick", "vote('"+video_id+"', 'del')");
				if(!w_p) $(".card-action").removeClass("hide");
				if(video_votes==1)song.find(".vote-text").text("vote");
			}
		});

        if(window.mobilecheck()) $(".list-image").lazyload({});
        else $(".list-image").lazyload({container: $("#wrapper")}).removeClass("lazy");
		$("#settings").css("visibility", "visible");
		$("#settings").css("opacity", "1");
		$("#wrapper").css("opacity", "1");

    },

    vote: function(id, vote){
    	socket.emit('vote', [chan, id, vote, adminpass]);
    	return true;
    },

    skip: function(){
    	socket.emit('skip', [chan, localStorage[chan.toLowerCase()]]);
    	return true;
    },

    importOldList: function(chan){
    	playlist_url = "lists/"+chan+".json";

    	list = $.ajax({
    		type: "GET",
    		url: playlist_url,
    		async: false
    	}).responseText;
    	list = $.parseJSON(list);
    	var ids="";
    	var num=0;
    	$.each(list.songs, function(i,data)
    	{
    		ids+=data.id+",";
    		if(num>45){
    			Search.addVideos(ids);
    			ids="";
    			num=0;
    		}
    		num++;
    	});

    	Search.addVideos(ids);
    	document.getElementById("search").value = "";
    },

    show: function(){
    	if(!window.mobilecheck())
    	{
    		if(showToggle){
    	    	showToggle=false;
    	    	$("#toptitle").empty();
    	        $("#chan").addClass("bigChan");
    	        //$("#chan").html("zoff.no/"+encodeURI(chan));
    	        $("#chan").html("zoff.no/"+chan.toLowerCase());
    	    }else{
    	    	showToggle=true;
    	    	$("#toptitle").html("Zöff");
    	    	$("#chan").removeClass("bigChan");
    	    	$("#chan").html(chan);
    	   }
    	}
    },

    insertAtIndex: function(i, song_info, transition) {
        if(i === 0) {
         	$("#wrapper").prepend(List.generateSong(song_info, transition));
    			return;
        }

        $("#wrapper > div:nth-child(" + (i) + ")").after(List.generateSong(song_info, transition));

    },

    generateSong: function(song_info, transition)
    {
    	var video_id = song_info.id;
    	var video_title = song_info.title;
    	var video_votes = song_info.votes;
    	var video_thumb = "background-image:url('//img.youtube.com/vi/"+video_id+"/mqdefault.jpg');";

    	var song = $("<div>"+list_html+"</div>");
    	if(transition) song.find("#list-song").css("height", 0);
    	song.find(".list-title").text(video_title);
    	song.find(".list-title").attr("title", video_title);
    	song.find(".list-votes").text(video_votes);
    	song.find(".vote-container").attr("onclick", "vote('"+video_id+"','pos')");
    	song.find(".list-image").attr("style",video_thumb);
    	song.find("#list-song").attr("id", video_id);
    	song.find("#del").attr("onclick", "vote('"+video_id+"', 'del')");
    	if(!w_p) song.find(".card-action").removeClass("hide");
    	if(video_votes == 1)song.find(".vote-text").text("vote");

/*
        $(".lazy").lazyload({
            container: $("#wrapper")
        }).removeClass("lazy"); 
*/
    	return song.html();
    },

    getIndexOfSong: function(id)
    {
    	indexes = $.map(full_playlist, function(obj, index) {
    	    if(obj.id == id) {
    	        return index;
    	    }
    	});
    	return indexes[0];
    }
}