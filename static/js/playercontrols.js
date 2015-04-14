function initYoutubeControls(player)
{
	fitToScreen();
	setInterval(durationSetter, 1000);
	initControls();
	$(window).resize(function(){
		fitToScreen();
	});
}

function initControls()
{
	document.getElementById("volume-button").addEventListener("click", mute_video);
	document.getElementById("playpause").addEventListener("click", play_pause);
	document.getElementById("fullscreen").addEventListener("click", fullscreen);
}

function fitToScreen()
{
	if(peis)
	{
		player_name = "#jplayer";
	}else player_name = "#player";
	//document.getElementById("controls").style.top = document.getElementById("player").offsetTop + $("#player").height() + "px";
	document.getElementById("controls").style.top = $(player_name).height() + "px";
	//document.getElementById("controls").style.left = document.getElementById("player").offsetLeft + "px";
	//document.getElementById("controls").style.left = $(player_name).position()["left"] + "px";
	//document.getElementById("controls").style.left = "10px";
	$("#controls").width($(player_name).width());
	//document.getElementById("qS").style.top = "-80px";
	//document.getElementById("qS").style.left =  $("#controls").width()-125+"px";

}

function initSlider()
{
	if(localStorage.getItem("volume") !== undefined)
	{
		vol = localStorage.getItem("volume");
	}else
		vol = 100;
	$("#volume").slider({
	    min: 0,
	    max: 100,
	    value: vol,
			range: "min",
			animate: true,
	    slide: function(event, ui) {
	      setVolume(ui.value);
				localStorage.setItem("volume", ui.value);
	    }
	});
	choose_button(vol, false);
	//$("#volume").slider("value", ytplayer.getVolume());
}

function fullscreen()
{
	var playerElement = document.getElementById("player");
	var requestFullScreen = playerElement.requestFullScreen || playerElement.mozRequestFullScreen || playerElement.webkitRequestFullScreen;
  if (requestFullScreen) {
    requestFullScreen.bind(playerElement)();
  }
}

function play_pause()
{
	if(ytplayer.getPlayerState() == 1)
	{
		ytplayer.pauseVideo();
	}else if(ytplayer.getPlayerState() == 2 || ytplayer.getPlayerState() == 0)
	{
		ytplayer.playVideo();
	}
}

function settings()
{
	$("#qS").toggleClass("hide");
}

function changeQuality(wantedQ)
{
	//wantedQ = this.getAttribute("name");
	//console.log("Change quality");
	//console.log(wantedQ);
	if(ytplayer.getPlaybackQuality != wantedQ)
	{
		ytplayer.setPlaybackQuality(wantedQ);
		ytplayer.getPlaybackQuality();
	}
	$("#qS").toggleClass("hide");
}

function mute_video()
{
	choose_button(0, true);
	ytplayer.mute();
}

function setVolume(vol)
{
	ytplayer.setVolume(vol);
	choose_button(vol, false);
	//console.log(vol); //NO LOGS FOR U LOL
	if(ytplayer.isMuted())
		ytplayer.unMute();
	/*if(vol == 0){
		$("#mute").css("background","no-repeat url(static/player.webp) -0px -403px");
	}else if(vol < 33){
		$("#mute").css("background","no-repeat url(static/player.webp) -0px -1457px");
	}else if(vol > 33 && vol < 66){
		$("#mute").css("background","no-repeat url(static/player.webp) -0px -806px");
	}else if(vol > 66){
		$("#mute").css("background","no-repeat url(static/player.webp) -0px -1829px");
	}*/
}

function choose_button(vol, mute)
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
}

function playPause()
{
	console.log("playPause");
	state = ytplayer.getPlayerState();
	console.log("state: "+state);
	button = document.getElementById("playpause");
	if(state == 1)
	{
		ytplayer.pauseVideo();
		//button.innerHTML = "Resume";
	}else if(state == 2)
	{
		ytplayer.playVideo();
		//button.innerHTML = "Pause";
	}
}

function durationSetter()
{
	duration = ytplayer.getDuration();
	dMinutes = Math.floor(duration / 60);
	dSeconds = duration - dMinutes * 60;
	currDurr = ytplayer.getCurrentTime();
	if(currDurr > duration)
		currDurr = duration;
	minutes = Math.floor(currDurr / 60);
	seconds = currDurr - minutes * 60;
	document.getElementById("duration").innerHTML = pad(minutes)+":"+pad(seconds)+" <span id='dash'>/</span> "+pad(dMinutes)+":"+pad(dSeconds);
	per = (100 / duration) * currDurr;
	if(per >= 100)
		per = 100;
	else if(duration == 0)
		per = 0;
	$("#bar").width(per+"%");
}

function pad(n)
{
	return n < 10 ? "0"+Math.floor(n) : Math.floor(n);
}

function volumeOptions()
{
	//console.log("volumeOptions");
	//button = document.getElementById("volume");
	if(ytplayer.isMuted())
	{
		ytplayer.unMute();
		vol = ytplayer.getVolume();
		$("#volume").slider("value", ytplayer.getVolume());
		/*if(vol == 0){
			$("#mute").css("background","no-repeat url(static/player.webp) -0px -93px");
		}else if(vol < 33){
			$("#mute").css("background","no-repeat url(static/player.webp) -0px -1395px");
		}else if(vol > 33 && vol < 66){
			$("#mute").css("background","no-repeat url(static/player.webp) -0px -1767px");
		}else if(vol > 66){
			$("#mute").css("background","no-repeat url(static/player.webp) -0px -2604px");
		}*/
	}
	else
	{
		ytplayer.mute();
		$("#volume").slider("value", 0);
		//$("#mute").css("background","no-repeat url(static/player.webp) -0px -93px");
	}
}

function hoverMute(foo)
{
	vol = ytplayer.getVolume();
	console.log(vol);
	/*if(foo)
	{
		if(vol == 0 || ytplayer.isMuted()){
			$("#mute").css("background","no-repeat url(static/player.webp) -0px -93px");
		}else if(vol < 33){
			$("#mute").css("background","no-repeat url(static/player.webp) -0px -1395px");
		}else if(vol > 33 && vol < 66){
			$("#mute").css("background","no-repeat url(static/player.webp) -0px -1767px");
		}else if(vol > 66){
			$("#mute").css("background","no-repeat url(static/player.webp) -0px -2604px");
		}
	}else
	{
		if(vol == 0 || ytplayer.isMuted()){
			$("#mute").css("background","no-repeat url(static/player.webp) -0px -403px");
		}else if(vol < 33){
			$("#mute").css("background","no-repeat url(static/player.webp) -0px -1457px");
		}else if(vol > 33 && vol < 66){
			$("#mute").css("background","no-repeat url(static/player.webp) -0px -806px");
		}else if(vol > 66){
			$("#mute").css("background","no-repeat url(static/player.webp) -0px -1829px");
		}
	}*/
}
//url(http://localhost/Kasperrt/static/player.webp) 0px -94px no-repeat

function logQ()
{
	console.log(ytplayer.getPlaybackQuality());
}
