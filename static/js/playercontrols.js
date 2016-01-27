var Playercontrols = {

    stopInterval: false,

    initYoutubeControls: function()
    {
        if(window.mobilecheck() && !/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream){
            $("#controls").appendTo("#playbar");
        }
        Playercontrols.initControls();
    },

    initControls: function()
    {
    	document.getElementById("volume-button").addEventListener("click", Playercontrols.mute_video);
    	document.getElementById("playpause").addEventListener("click", Playercontrols.play_pause);
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
    	//$("#volume").slider("value", ytplayer.getVolume());
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

    	if(Youtube.ytplayer.getPlayerState() == 1)
    	{
    		Youtube.ytplayer.pauseVideo();
            if(window.mobilecheck() && !/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream)
                document.getElementById("player").style.display = "none";
    	}else if(Youtube.ytplayer.getPlayerState() == 2 || Youtube.ytplayer.getPlayerState() == 0)
    	{
    		Youtube.ytplayer.playVideo();
            if(window.mobilecheck() && !/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream)
                document.getElementById("player").style.display = "block";
    	}
    },

    play_pause_show: function()
    {
        if(document.getElementById("pause").className.split(" ").length == 1)
            $("#pause").toggleClass("hide");
        if(document.getElementById("play").className.split(" ").length == 2)
            $("#play").toggleClass("hide");
    },

    settings: function()
    {
    	$("#qS").toggleClass("hide");
    },

    changeQuality: function(wantedQ)
    {
    	if(Youtube.ytplayer.getPlaybackQuality != wantedQ)
    	{
    		Youtube.ytplayer.setPlaybackQuality(wantedQ);
    		Youtube.ytplayer.getPlaybackQuality();
    	}
    	$("#qS").toggleClass("hide");
    },

    mute_video: function()
    {
    	if(!Youtube.ytplayer.isMuted())
    	{
        Playercontrols.choose_button(0, true);
    		Youtube.ytplayer.mute();
    	}else
    	{
    		Youtube.ytplayer.unMute();
        Playercontrols.choose_button(Youtube.ytplayer.getVolume(), false);
    	}
    },

    setVolume: function(vol)
    {
    	Youtube.ytplayer.setVolume(vol);
        Playercontrols.choose_button(vol, false);
    	if(Youtube.ytplayer.isMuted())
    		Youtube.ytplayer.unMute();
    },

    choose_button: function(vol, mute)
    {  
    	if(!mute){
    		if(vol >= 0 && vol <= 33){
    			if(document.getElementById("v-full").className.split(" ").length == 1)
    				$("#v-full").toggleClass("hide");
    			if(document.getElementById("v-medium").className.split(" ").length == 1)
    				$("#v-medium").toggleClass("hide");
    			if(document.getElementById("v-low").className.split(" ").length == 2)
    				$("#v-low").toggleClass("hide");
    			if(document.getElementById("v-mute").className.split(" ").length == 1)
    				$("#v-mute").toggleClass("hide");
    		}else if(vol >= 34 && vol <= 66){
    			if(document.getElementById("v-full").className.split(" ").length == 1)
    				$("#v-full").toggleClass("hide");
    			if(document.getElementById("v-medium").className.split(" ").length == 2)
    				$("#v-medium").toggleClass("hide");
    			if(document.getElementById("v-low").className.split(" ").length == 1)
    				$("#v-low").toggleClass("hide");
    			if(document.getElementById("v-mute").className.split(" ").length == 1)
    				$("#v-mute").toggleClass("hide");
    		}else if(vol >= 67 && vol <= 100){
    			if(document.getElementById("v-full").className.split(" ").length == 2)
    				$("#v-full").toggleClass("hide");
    			if(document.getElementById("v-medium").className.split(" ").length == 1)
    				$("#v-medium").toggleClass("hide");
    			if(document.getElementById("v-low").className.split(" ").length == 1)
    				$("#v-low").toggleClass("hide");
    			if(document.getElementById("v-mute").className.split(" ").length == 1)
    				$("#v-mute").toggleClass("hide");
    		}
    	}else
    	{
    		if(document.getElementById("v-full").className.split(" ").length == 1)
    			$("#v-full").toggleClass("hide");
    		if(document.getElementById("v-medium").className.split(" ").length == 1)
    			$("#v-medium").toggleClass("hide");
    		if(document.getElementById("v-low").className.split(" ").length == 1)
    			$("#v-low").toggleClass("hide");
    		if(document.getElementById("v-mute").className.split(" ").length == 2)
    			$("#v-mute").toggleClass("hide");
    	}
    },

    playPause: function()
    {
    	state = Youtube.ytplayer.getPlayerState();
    	button = document.getElementById("playpause");
    	if(state == 1)
    	{
    		Youtube.ytplayer.pauseVideo();
    	}else if(state == 2)
    	{
    		Youtube.ytplayer.playVideo();
    	}
    },

    volumeOptions: function()
    {
    	if(Youtube.ytplayer.isMuted())
    	{
    		Youtube.ytplayer.unMute();
    		vol = Youtube.ytplayer.getVolume();
    		$("#volume").slider("value", Youtube.ytplayer.getVolume());
    	}
    	else
    	{
    		Youtube.ytplayer.mute();
    		$("#volume").slider("value", 0);
    	}
    },

    hoverMute: function(foo)
    {
    	vol = Youtube.ytplayer.getVolume();

    }

}