var List = {

    empty: false,

    channel_listener: function()
    {
    	socket.on("channel", function(msg){
    		List.channel_function(msg);
    	});
    },

    channel_function: function(msg)
    {

        switch(msg[0])
        {
            case "list":
                List.populate_list(msg[1]);
                break;
            case "added":
                List.added_song(msg[1]);
                break;
            case "deleted":
                List.deleted_song(msg[1]);
                break;
            case "vote":
                List.voted_song(msg[1], msg[2]);
                break;
            case "song_change":
                List.song_change(msg[1]);
                break;
        }
    },

    populate_list: function(msg)
    {

        full_playlist = msg;

        List.sortList();
		$("#wrapper").empty();

        if(full_playlist.length > 1){
    		$.each(full_playlist, function(j, current_song){
    			if(!current_song.now_playing){ //check that the song isnt playing
                    $("#wrapper").append(List.generateSong(current_song, false, lazy_load, true));
    			}
    		});


            if(lazy_load){
                if(window.mobilecheck()) $(".list-image").lazyload({});
                else $(".list-image").lazyload({container: $("#wrapper")}).removeClass("lazy");
            }
        }else{
            List.empty = true;
            $("#wrapper").append("<span id='empty-channel-message'>The playlist is empty.</span>");
        }
		$("#settings").css("visibility", "visible");
		$("#settings").css("opacity", "1");
		$("#wrapper").css("opacity", "1");

    },

    added_song: function(added){
        full_playlist.push(added);
        List.sortList();
        $("#suggested-"+added.id).remove();
        if(List.empty){
            $("#empty-channel-message").remove();
            List.empty = false;
        }
        List.insertAtIndex(added, true);
    },

    deleted_song: function(deleted){

        var index              = List.getIndexOfSong(deleted);
        var to_delete          = $("#wrapper").children()[index];
        try{
            to_delete.style.height = 0;

            setTimeout(function()
            {
                $("#"+deleted).remove();
                full_playlist.splice(List.getIndexOfSong(deleted), 1);
            }, 305);

            document.getElementById('wrapper').scrollTop += 1;
            document.getElementById('wrapper').scrollTop += -1;
        }catch(err){
            full_playlist.splice(List.getIndexOfSong(deleted), 1);
            if(!List.empty)
                $("#wrapper").children()[$("#wrapper").children().length-1].remove();
        }
        if(full_playlist.length <= 2){
            List.empty = true;
            $("#wrapper").append("<span id='empty-channel-message'>The playlist is empty.</span>");
        }
        $("#suggested-"+deleted).remove();
        Suggestions.checkUserEmpty();
    },

    voted_song: function(voted, time){
        var index_of_song = List.getIndexOfSong(voted);
        var song_voted_on = full_playlist[index_of_song];

        full_playlist[index_of_song].votes += 1;
        full_playlist[index_of_song].added = time;

        List.sortList();
        $("#"+voted).remove();
        List.insertAtIndex(song_voted_on, false);
    },

    song_change: function(time){
        var length = full_playlist.length-1;

        full_playlist[0].now_playing        = true;
        full_playlist[0].votes              = 0;
        full_playlist[0].guids              = [];
        full_playlist[0].added              = time;
        full_playlist[length].now_playing   = false;

        try{
            full_playlist.push(full_playlist.shift());
            if(!List.empty)
                $("#wrapper").children()[0].remove();

            List.insertAtIndex(full_playlist[length-1], false);
            document.getElementById('wrapper').scrollTop += 1;
            document.getElementById('wrapper').scrollTop += -1;
        }catch(e){}
    },

    vote: function(id, vote){
    	socket.emit('vote', [chan, id, vote, adminpass]);
    	return true;
    },

    skip: function(){
    	socket.emit('skip', {pass: adminpass, id:video_id});
    	return true;
    },

    importOldList: function(chan){
        var ids="";
        var num=0;

    	playlist_url = "lists/"+chan+".json";

    	list = $.parseJSON($.ajax({
    		      type: "GET",
    		      url: playlist_url,
    		      async: false
    	       }).responseText);

    	$.each(list.songs, function(i,data)
    	{
    		ids+=data.id+",";

    		if(num>45){
    			Search.addVideos(ids);

    			ids = "";
    			num = 0;
    		}
    		num++;
    	});

    	Search.addVideos(ids);
    	document.getElementById("search").value = "";
    },

    sortList: function()
    {
        full_playlist.sort(Helper.predicate({
           name: 'votes',
           reverse: true
        }, 'added'));
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

    insertAtIndex: function(song_info, transition) {
        i = List.getIndexOfSong(song_info.id);

        if(i === 0) 
         	$("#wrapper").prepend(List.generateSong(song_info, transition, false, true, false));
        else
            $("#wrapper > div:nth-child(" + (i) + ")").after(List.generateSong(song_info, transition, false, true, false));
        
        if(transition)
        {
            setTimeout(function(){
                var added = $("#wrapper").children()[i];
                $(added).css("height", 66);
            },5);
        }
    },

    generateSong: function(song_info, transition, lazy, list, user)
    {
    	var video_id    = song_info.id;
    	var video_title = song_info.title;
    	var video_votes = song_info.votes;
    	var video_thumb = "background-image:url('//img.youtube.com/vi/"+video_id+"/mqdefault.jpg');";
        var song        = $("<div>"+list_html+"</div>");
        var image_attr  = "style";

        var attr;
        var del_attr;

        if(transition) song.find("#list-song").css("height", 0);
        if(!w_p) song.find(".card-action").removeClass("hide");
        if(video_votes == 1)song.find(".vote-text").text("vote");
        if(lazy){
            video_thumb = "//img.youtube.com/vi/"+video_id+"/mqdefault.jpg";
            image_attr  = "data-original";
        } 

        if(list){
            song.find(".list-votes").text(video_votes);
            song.find("#list-song").attr("id", video_id);
            song.find(".vote-container").attr("title", video_title);

            attr     = ".vote-container";
            del_attr = "del";
        }else if(!list){

            song.find(".vote-text").text(song_info.duration);

            attr     = ".add-suggested";
            if(user)
                del_attr = "del_user_suggested";
            else
                del_attr = "del_suggested";

            song.find(".vote-container").attr("class", "clickable add-suggested");
            song.find(".add-suggested").attr("title", video_title);
            song.find("#del").attr("id", del_attr);
            song.find(attr).attr("data-video-title", video_title);
            song.find(attr).attr("data-video-length", song_info.length);
            song.find("#list-song").attr("id", "suggested-" + video_id);
            song.find(".list-image").attr("class", song.find(".list-image").attr("class").replace("list-image", "list-suggested-image"));

        }

    	song.find(".list-title").text(video_title);
    	song.find(".list-title").attr("title", video_title);
    	//song.find(".vote-container").attr("onclick", "vote('"+video_id+"','pos')");
        song.find(attr).attr("data-video-id", video_id);
    	song.find(".list-image").attr(image_attr,video_thumb);
        song.find(".list-suggested-image").attr(image_attr,video_thumb);
        song.find("#"+del_attr).attr("data-video-id", video_id);
    	//song.find("#del").attr("onclick", "vote('"+video_id+"', 'del')");

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
    },

    scrollTop: function(){
        $("#wrapper").scrollTop(0);
    },

    scrollBottom: function(){
        $("#wrapper").scrollTop($("#wrapper")[0].scrollHeight);
    }
}