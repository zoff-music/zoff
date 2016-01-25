var Youtube = {

    loaded: true,
    before_load: "",
    after_load: "",
    ytplayer: "",
    stopInterval: false,

    setup_youtube_listener: function(channel)
    {
    	socket.on("np", function(obj)
    	{
            Youtube.loaded      = false;

    		if(obj[0].length == 0){

    			document.getElementById('song-title').innerHTML = "Empty channel. Add some songs!";
    			$("#player_overlay").height($("#player").height());

    			if(!/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) $("#player_overlay").toggleClass("hide");
                try{
                    Youtube.ytplayer.stopVideo();
                }catch(e){}
    			//List.importOldList(channel.toLowerCase());
    		}
    		else{
    			//console.log("gotten new song");
                if(previous_video_id == undefined) 
                    previous_video_id = obj[0][0]["id"];
                else if(previous_video_id != video_id)
                    previous_video_id = video_id;

                video_id   = obj[0][0]["id"];
                conf       = obj[1][0];
                time       = obj[2];
                seekTo     = time - conf["startTime"];
                song_title = obj[0][0]["title"];

    			$("#player_overlay").addClass("hide");

                try{
                    Suggestions.fetchYoutubeSuggests(video_id);
                }catch(e){}
          		Youtube.getTitle(song_title, viewers);
    			Youtube.setBGimage(video_id);
    			//if(player_ready && !window.mobilecheck())
                if(player_ready && !/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream)
    			{

    				try{
                        if(Youtube.ytplayer.getVideoUrl().split('v=')[1] != video_id)
        				{
        					Youtube.ytplayer.loadVideoById(video_id);
        					Youtube.notifyUser(video_id, song_title);
        					Youtube.ytplayer.seekTo(seekTo);
        					if(paused)
        						Youtube.ytplayer.pauseVideo();
        				}

        				if(!paused){
        					Youtube.ytplayer.playVideo();
                            Youtube.durationSetter();
                        }
        				if(Youtube.ytplayer.getDuration() > seekTo || Youtube.ytplayer.getDuration() == 0)
        					Youtube.ytplayer.seekTo(seekTo);
                        Youtube.after_load  = video_id;
                        setTimeout(function(){Youtube.loaded = true;},500);
                    }catch(e){Youtube.durationSetter();}
    			}
    			else
            		Youtube.getTitle(song_title, viewers);
    		}
    	});

    	socket.on("viewers", function(view)
    	{
    		viewers = view;

    		if(song_title !== undefined)
    			Youtube.getTitle(song_title, viewers);
    	});
    },

    onPlayerStateChange: function(newState) {
    	switch(newState.data)
    	{
    		case -1:
    			break;
    		case 0:
                playing = false;
                paused  = false;

    			socket.emit("end", video_id);
    			break;
    		case 1:
    			playing = true;
                if(beginning && window.mobilecheck()){
                    Youtube.ytplayer.pauseVideo();
                    beginning = false;
                }
    			if(document.getElementById("play").className.split(" ").length == 1)
    				$("#play").toggleClass("hide");
    			if(document.getElementById("pause").className.split(" ").length == 2)
    				$("#pause").toggleClass("hide");
    			if(paused)
    			{
    				socket.emit('pos');
    				paused = false;
    			}
    			break;
    		case 2:
    			paused = true;

    			if(document.getElementById("pause").className.split(" ").length == 1)
    				$("#pause").toggleClass("hide");
    			if(document.getElementById("play").className.split(" ").length == 2)
    				$("#play").toggleClass("hide");
    			break;
    		case 3:
    			break;
    	}
    },

    getTitle: function(titt, v)
    {
    	var outPutWord    = v > 1 ? "viewers" : "viewer";
    	var title         = decodeURIComponent(titt);
    	var elem          = document.getElementById('song-title');
        var viewers       = document.getElementById('viewers');

    	document.title    = title + " • Zöff / "+chan;
		elem.innerHTML    = title;
		viewers.innerHTML = v + " " + outPutWord;
		elem.title        = title + " • " + v + " " + outPutWord;

    },

    errorHandler: function(newState)
    {
    	if(newState.data == 5 || newState.data == 100 
            || newState.data == 101 || newState.data == 150)
        {
            /*if(Youtube.count == 2){
                Youtube.count = 0;*/
            /*console.log("Before: " + Youtube.before_load);
            console.log("Now: " + video_id);
            console.log("After: " + Youtube.after_load);
            console.log(Youtube.before_load == Youtube.ytplayer.getVideoUrl);*/
            curr_playing = Youtube.ytplayer.getVideoUrl().replace("https://www.youtube.com/watch?v=", "");

            
                socket.emit("skip", {error: newState.data, id: video_id, pass: adminpass});
                //console.log(video_id, Youtube.ytplayer.getVideoUrl(), Youtube.ytplayer.getPlayerState());
            
            /*}else{
                setTimeout(function(){
                Youtube.ytplayer.loadVideoById(video_id);
                Youtube.count ++;
                }, Math.floor((Math.random() * 100) + 1));
            }*/
    	}else if(video_id !== undefined)
    		Youtube.ytplayer.loadVideoById(video_id);
    },

    onPlayerReady: function(event) {
        $("#channel-load").css("display", "none");
        try{
        beginning = true;
      	player_ready = true;
		if(!/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream)
		{
			$("#player").css("opacity", "1");
			$("#controls").css("opacity", "1");
			$(".playlist").css("opacity", "1");
            window.ytplayer = Youtube.ytplayer;
			Youtube.ytplayer.loadVideoById(video_id);
			Youtube.ytplayer.playVideo();
            Youtube.durationSetter();
			Youtube.ytplayer.seekTo(seekTo);
		}
		Youtube.readyLooks();
		Playercontrols.initYoutubeControls(Youtube.ytplayer);
		Playercontrols.initSlider();
		Youtube.ytplayer.setVolume(Crypt.get_volume());
        }catch(e){}
    },

    readyLooks: function()
    {
    	Youtube.setBGimage(video_id);
    },

    setBGimage: function(id){

    	if(id !== undefined && !embed)
    	{
    		var img    = new Image();
    		img.onload = function ()
            {

    		    var colorThief = new ColorThief();
                var color      = colorThief.getColor(img);

    		    document.getElementsByTagName("body")[0].style.backgroundColor = Helper.rgbToHsl(color);
                $("meta[name=theme-color]").attr("content", Helper.rgbToHex(color[0], color[1], color[2]));
    		};

    		img.crossOrigin = 'Anonymous';
    		img.src         = 'https://zoff.no:8080/https://img.youtube.com/vi/'+id+'/mqdefault.jpg';
    	}
    },

    set_width: function(val){
        $(".video-container").width(val);
    },

    notifyUser: function(id, title) {
    	title = title.replace(/\\\'/g, "'").replace(/&quot;/g,"'").replace(/&amp;/g,"&");
      	if (Notification.permission === "granted" && document.hidden) {
    	    var notification = new Notification("Now Playing", {body: title, icon: "http://i.ytimg.com/vi/"+id+"/mqdefault.jpg", iconUrl: "http://i.ytimg.com/vi/"+id+"/mqdefault.jpg"});
    	    notification.onclick = function(x) { window.focus(); this.cancel(); };
    			setTimeout(function(){
    	    	notification.close();
    	    },5000);
      	}
    },

    setup_all_listeners: function()
    {
    	socket.on("get_list", function(){
    			socket.emit('list', chan.toLowerCase());
    	});
    	Youtube.setup_youtube_listener(chan);
    	Admin.admin_listener();
    	Chat.setup_chat_listener(chan);
    	Chat.allchat_listener();
    	List.channel_listener();
    	List.skipping_listener();
    },

    onYouTubeIframeAPIReady: function() {
      Youtube.ytplayer = new YT.Player('player', {
        videoId: "asd",
        playerVars: { rel:"0", wmode:"transparent", controls: "0" , iv_load_policy: "3", theme:"light", color:"white"},
        events: {
          'onReady': Youtube.onPlayerReady,
          'onStateChange': Youtube.onPlayerStateChange,
          'onError': Youtube.errorHandler
        }
      });
      //Youtube.durationSetter();
    },

    durationSetter: function()
    {
        try{
            duration = Youtube.ytplayer.getDuration();
        }catch(e){duration = 0};
        if(duration != undefined){
            try{
                dMinutes = Math.floor(duration / 60);
                dSeconds = duration - dMinutes * 60;
                currDurr = Youtube.ytplayer.getCurrentTime();
                if(currDurr > duration)
                    currDurr = duration;
                minutes = Math.floor(currDurr / 60);
                seconds = currDurr - minutes * 60;
                document.getElementById("duration").innerHTML = Helper.pad(minutes)+":"+Helper.pad(seconds)+" <span id='dash'>/</span> "+Helper.pad(dMinutes)+":"+Helper.pad(dSeconds);
                per = (100 / duration) * currDurr;
                if(per >= 100)
                    per = 100;
                else if(duration == 0)
                    per = 0;
                $("#bar").width(per+"%");
            }catch(e){
                
            }
        }
        if(!Youtube.stopInterval) setTimeout(Youtube.durationSetter, 1000);
    },

    loadPlayer: function() {
        if($("script[src='https://www.youtube.com/iframe_api']")["length"] == 1){
            Youtube.onYouTubeIframeAPIReady();
        }else{
        tag            = document.createElement('script');
        tag.src        = "https://www.youtube.com/iframe_api";
        firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }
    }

}