function initYoutubeControls(player)
{
	if(player !== undefined)
	{
		ytplayer = player;
		//initSlider();
		durationFixer = setInterval(durationSetter, 1000);
	}else
	{	
		tag = document.createElement('script');
		tag.src = "https://www.youtube.com/iframe_api";
		firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
	}
	elems = Array("volume", "duration", "mute", "fullscreen", "q");
	//elems = Array("volume", "duration", "fullscreen");
	var container = document.getElementById("controls");
	var newElem = document.createElement("div");
	newElem.id = "playpause";
	newElem.className = "play";
	container.appendChild(newElem);
	for(x = 0; x < elems.length; x++)
	{
		var newElemFor = document.createElement("div");
		newElemFor.id = elems[x];
		container.appendChild(newElemFor);
	}
	elems = Array("medium", "large", "hd1080", "auto");
	elemName = Array("Low", "Medium", "High", "Auto");
	newElem = document.createElement("div");
	newElem.id = "qS";
	newElem.className = "hide";

	for(x = 0; x < elems.length; x++)
	{
		var newChild = document.createElement("div");
		newChild.className = "qChange";
		newChild.name = elems[x];
		newChild.setAttribute("onclick", "changeQuality('"+elems[x]+"');");
		newChild.innerHTML = elemName[x];
		newElem.appendChild(newChild);
	}
	container.appendChild(newElem);

	newElem = document.createElement("div");
	newElem.id = "bar";

	container.appendChild(newElem);

	initControls();
	fitToScreen();
	$("#mute").hover(function(){hoverMute(true)}, function(){hoverMute(false)});
	$(window).resize(function(){
		fitToScreen();
	});
}

function initControls()
{
	document.getElementById("playpause").addEventListener("click", playPause);
	document.getElementById("q").addEventListener("click", settings);
	document.getElementById("mute").addEventListener("click", volumeOptions);
	document.getElementById("fullscreen").addEventListener("click", function()
	{
		document.getElementById("player").webkitRequestFullscreen();
	});
	//document.getElementById("controls").style.width= $(window).width()*0.6+"px";
	var classname = document.getElementsByClassName("qChange");
	/*for(var i=0; i< classname.length;i++)
	{
		classname[i].addEventListener("click", changeQuality);
	}*/
}

function fitToScreen()
{
	if(peis)
	{
		player_name = "#jplayer";
	}else player_name = "#player";
	//document.getElementById("controls").style.top = document.getElementById("player").offsetTop + $("#player").height() + "px";
	document.getElementById("controls").style.top = $(player_name).position()["top"] + $(player_name).height() + "px";
	//document.getElementById("controls").style.left = document.getElementById("player").offsetLeft + "px";
	document.getElementById("controls").style.left = $(player_name).position()["left"] + "px";
	//document.getElementById("controls").style.left = "10px";
	$("#controls").width($(player_name).width());
	document.getElementById("qS").style.top = "-80px";
	document.getElementById("qS").style.left =  $("#controls").width()-125+"px";

}

function initSlider()
{
	$("#volume").slider({
	    min: 0,
	    max: 100,
	    value: ytplayer.getVolume(),
		range: "min",
		animate: true,
	    slide: function(event, ui) {
	      setVolume(ui.value);
	    }
	});
	$("#volume").slider("value", ytplayer.getVolume());
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

function setVolume(vol)
{
	ytplayer.setVolume(vol);
	//console.log(vol); //NO LOGS FOR U LOL
	if(ytplayer.isMuted())
		ytplayer.unMute();
	if(vol == 0){
		$("#mute").css("background","no-repeat url(static/player.webp) -0px -403px");
	}else if(vol < 33){
		$("#mute").css("background","no-repeat url(static/player.webp) -0px -1457px");
	}else if(vol > 33 && vol < 66){
		$("#mute").css("background","no-repeat url(static/player.webp) -0px -806px");
	}else if(vol > 66){
		$("#mute").css("background","no-repeat url(static/player.webp) -0px -1829px");
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
		if(vol == 0){
			$("#mute").css("background","no-repeat url(static/player.webp) -0px -93px");
		}else if(vol < 33){
			$("#mute").css("background","no-repeat url(static/player.webp) -0px -1395px");
		}else if(vol > 33 && vol < 66){
			$("#mute").css("background","no-repeat url(static/player.webp) -0px -1767px");
		}else if(vol > 66){
			$("#mute").css("background","no-repeat url(static/player.webp) -0px -2604px");
		}
	}
	else
	{
		ytplayer.mute();
		$("#volume").slider("value", 0);
		$("#mute").css("background","no-repeat url(static/player.webp) -0px -93px");
	}
}

function hoverMute(foo)
{
	vol = ytplayer.getVolume();
	console.log(vol);
	if(foo)
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
	}
}
//url(http://localhost/Kasperrt/static/player.webp) 0px -94px no-repeat

function logQ()
{
	console.log(ytplayer.getPlaybackQuality());
}
