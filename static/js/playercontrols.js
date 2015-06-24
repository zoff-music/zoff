var Playercontrols = {

    initYoutubeControls: function(player)
    {
        setInterval(Playercontrols.durationSetter, 1000);
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
    	if(localStorage.volume)
    	{
    		vol = localStorage.getItem("volume");
    	}else{
    		vol = 100;
    		localStorage.setItem("volume", vol);
    	}
    	$("#volume").slider({
    	    min: 0,
    	    max: 100,
    	    value: vol,
    			range: "min",
    			animate: true,
    	    slide: function(event, ui) {
            Playercontrols.setVolume(ui.value);
    				localStorage.setItem("volume", ui.value);
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
    	if(ytplayer.getPlayerState() == 1)
    	{
    		ytplayer.pauseVideo();
    	}else if(ytplayer.getPlayerState() == 2 || ytplayer.getPlayerState() == 0)
    	{
    		ytplayer.playVideo();
    	}
    },

    settings: function()
    {
    	$("#qS").toggleClass("hide");
    },

    changeQuality: function(wantedQ)
    {
    	if(ytplayer.getPlaybackQuality != wantedQ)
    	{
    		ytplayer.setPlaybackQuality(wantedQ);
    		ytplayer.getPlaybackQuality();
    	}
    	$("#qS").toggleClass("hide");
    },

    mute_video: function()
    {
    	if(!ytplayer.isMuted())
    	{
        Playercontrols.choose_button(0, true);
    		ytplayer.mute();
    	}else
    	{
    		ytplayer.unMute();
        Playercontrols.choose_button(ytplayer.getVolume(), false);
    	}
    },

    setVolume: function(vol)
    {
    	ytplayer.setVolume(vol);
      Playercontrols.choose_button(vol, false);
    	if(ytplayer.isMuted())
    		ytplayer.unMute();
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
    	state = ytplayer.getPlayerState();
    	button = document.getElementById("playpause");
    	if(state == 1)
    	{
    		ytplayer.pauseVideo();
    	}else if(state == 2)
    	{
    		ytplayer.playVideo();
    	}
    },

    durationSetter: function()
    {
    	duration = ytplayer.getDuration();
    	dMinutes = Math.floor(duration / 60);
    	dSeconds = duration - dMinutes * 60;
    	currDurr = ytplayer.getCurrentTime();
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
    },

    volumeOptions: function()
    {
    	if(ytplayer.isMuted())
    	{
    		ytplayer.unMute();
    		vol = ytplayer.getVolume();
    		$("#volume").slider("value", ytplayer.getVolume());
    	}
    	else
    	{
    		ytplayer.mute();
    		$("#volume").slider("value", 0);
    	}
    },

    hoverMute: function(foo)
    {
    	vol = ytplayer.getVolume();

    }

}