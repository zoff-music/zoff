var Playercontrols = {

    stopInterval: false,

    initYoutubeControls: function()
    {
        //if(Helper.mobilecheck() && !/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream){
        if(Helper.mobilecheck() && !window.MSStream){
            $("#controls").appendTo("#playbar");
        }
        Playercontrols.initControls();
    },

    initControls: function()
    {
    	document.getElementById("volume-button").addEventListener("click", Playercontrols.mute_video);
    	document.getElementById("playpause").addEventListener("click", Playercontrols.play_pause);
        document.getElementById("volume-button-overlay").addEventListener("click", Playercontrols.mute_video);
    	document.getElementById("playpause-overlay").addEventListener("click", Playercontrols.play_pause);
    	document.getElementById("fullscreen").addEventListener("click", Playercontrols.fullscreen);

    },

    initSlider: function()
    {
        try{
            vol = (Crypt.get_volume());
        }catch(e){}
    	$("#volume").slider({
    	    min: 0,
    	    max: 100,
    	    value: vol,
    			range: "min",
    			animate: true,
    	    slide: function(event, ui) {

                Playercontrols.setVolume(ui.value);
    				//localStorage.setItem("volume", ui.value);
                try{Crypt.set_volume(ui.value);}catch(e){}
    	    }
    	});
        Playercontrols.choose_button(vol, false);
    	//$("#volume").slider("value", player.getVolume());
    },

    fullscreen: function()
    {
    	var playerElement = document.getElementById("player");
    	var requestFullScreen = playerElement.requestFullScreen || playerElement.mozRequestFullScreen || playerElement.webkitRequestFullScreen;
      if (requestFullScreen) {
        requestFullScreen.bind(playerElement)();
      }
    },

    play_pause: function()
    {
        if(!chromecastAvailable){
        	if(Player.player.getPlayerState() == 1)
        	{
        		Player.pauseVideo();
                if(Helper.mobilecheck() && !window.MSStream){
                //if(Helper.mobilecheck() && !/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream){
                    document.getElementById("player").style.display = "none";
                    $(".video-container").toggleClass("click-through");
                    $(".page-footer").toggleClass("padding-bottom-extra");
                }
        	} else if(Player.player.getPlayerState() == 2 || Player.player.getPlayerState() === 0 || (Player.player.getPlayerState() === 5 && Helper.mobilecheck())){
        		Player.playVideo();
                //if(Helper.mobilecheck() && !/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream){
                if(Helper.mobilecheck() && !window.MSStream){
                    document.getElementById("player").style.display = "block";
                    $(".video-container").toggleClass("click-through");
                    $(".page-footer").toggleClass("padding-bottom-extra");
                }
        	}
        } else {
            Playercontrols.play_pause_show();
        }
    },

    play_pause_show: function()
    {
        if(chromecastAvailable){
            if($("#play").hasClass("hide")){
                Player.pauseVideo();
            } else if($("#pause").hasClass("hide")){
                Player.playVideo();
            }
        } else {

            if(document.getElementById("pause").className.split(" ").length == 1){
                $("#pause").toggleClass("hide");
                $("#pause-overlay").toggleClass("hide");
            }
            if(document.getElementById("play").className.split(" ").length == 2){
                $("#play").toggleClass("hide");
                $("#play-overlay").toggleClass("hide");
            }
        }
    },

    settings: function()
    {
    	$("#qS").toggleClass("hide");
    },

    changeQuality: function(wantedQ)
    {
    	if(Player.player.getPlaybackQuality != wantedQ)
    	{
    		Player.player.setPlaybackQuality(wantedQ);
    		Player.player.getPlaybackQuality();
    	}
    	$("#qS").toggleClass("hide");
    },

    mute_video: function()
    {
    	if(!Player.player.isMuted())
    	{
            if(chromecastAvailable) castSession.sendMessage("urn:x-cast:zoff.me", {type: "mute"});
        Playercontrols.choose_button(0, true);
    		Player.player.mute();
    	}else
    	{
            if(chromecastAvailable)castSession.sendMessage("urn:x-cast:zoff.me", {type: "unMute"});
    		Player.player.unMute();
        Playercontrols.choose_button(Player.player.getVolume(), false);
    	}
    },

    setVolume: function(vol)
    {
    	Player.setVolume(vol);
        Playercontrols.choose_button(vol, false);
    	if(Player.player.isMuted())
    		Player.player.unMute();
    },

    choose_button: function(vol, mute)
    {
    	if(!mute){
    		if(vol >= 0 && vol <= 33){
    			if(document.getElementById("v-full").className.split(" ").length == 1){
    				$("#v-full").toggleClass("hide");
                    $("#v-full-overlay").toggleClass("hide");
                }
    			if(document.getElementById("v-medium").className.split(" ").length == 1){
    				$("#v-medium").toggleClass("hide");
                    $("#v-medium-overlay").toggleClass("hide");
                }
    			if(document.getElementById("v-low").className.split(" ").length == 2){
    				$("#v-low").toggleClass("hide");
                    $("#v-low-overlay").toggleClass("hide");
                }
    			if(document.getElementById("v-mute").className.split(" ").length == 1){
    				$("#v-mute").toggleClass("hide");
                    $("#v-mute-overlay").toggleClass("hide");
                }
    		}else if(vol >= 34 && vol <= 66){
    			if(document.getElementById("v-full").className.split(" ").length == 1){
    				$("#v-full").toggleClass("hide");
                    $("#v-full-overlay").toggleClass("hide");
                }
    			if(document.getElementById("v-medium").className.split(" ").length == 2){
    				$("#v-medium").toggleClass("hide");
                    $("#v-medium-overlay").toggleClass("hide");
                }
    			if(document.getElementById("v-low").className.split(" ").length == 1){
    				$("#v-low").toggleClass("hide");
                    $("#v-low-overlay").toggleClass("hide");
                }
    			if(document.getElementById("v-mute").className.split(" ").length == 1){
    				$("#v-mute").toggleClass("hide");
                    $("#v-mute-overlay").toggleClass("hide");
                }
    		}else if(vol >= 67 && vol <= 100){
    			if(document.getElementById("v-full").className.split(" ").length == 2){
    				$("#v-full").toggleClass("hide");
                    $("#v-full-overlay").toggleClass("hide");
                }
    			if(document.getElementById("v-medium").className.split(" ").length == 1){
    				$("#v-medium").toggleClass("hide");
                    $("#v-medium-overlay").toggleClass("hide");
                }
    			if(document.getElementById("v-low").className.split(" ").length == 1){
    				$("#v-low").toggleClass("hide");
                    $("#v-low-overlay").toggleClass("hide");
                }
    			if(document.getElementById("v-mute").className.split(" ").length == 1){
    				$("#v-mute").toggleClass("hide");
                    $("#v-mute-overlay").toggleClass("hide");
                }
    		}
    	}else
    	{
    		if(document.getElementById("v-full").className.split(" ").length == 1){
    			$("#v-full").toggleClass("hide");
                $("#v-full-overlay").toggleClass("hide");
            }
    		if(document.getElementById("v-medium").className.split(" ").length == 1){
    			$("#v-medium").toggleClass("hide");
                $("#v-medium-overlay").toggleClass("hide");
            }
    		if(document.getElementById("v-low").className.split(" ").length == 1){
    			$("#v-low").toggleClass("hide");
                $("#v-low-overlay").toggleClass("hide");
            }
    		if(document.getElementById("v-mute").className.split(" ").length == 2){
    			$("#v-mute").toggleClass("hide");
                $("#v-mute-overlay").toggleClass("hide");
            }
    	}
    },

    playPause: function()
    {
    	state = Player.player.getPlayerState();
    	button = document.getElementById("playpause");
    	if(state == 1)
    	{
    		Player.pauseVideo();
    	}else if(state == 2)
    	{
    		Player.playVideo();
    	}
    },

    volumeOptions: function()
    {
        if(!chromecastAvailable){
        	if(Player.player.isMuted())
        	{
        		Player.player.unMute();
        		vol = Player.player.getVolume();
        		$("#volume").slider("value", Player.player.getVolume());
        	}
        	else
        	{
        		Player.player.mute();
        		$("#volume").slider("value", 0);
        	}
        }
    },

    hoverMute: function(foo)
    {
    	vol = Player.player.getVolume();

    }

};
