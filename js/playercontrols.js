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
	//elems = Array("volume", "duration", "fullscreen", "q");
	elems = Array("volume", "duration", "fullscreen");
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
	/*elems = Array("medium", "large", "hd1080", "auto");
	newElem = document.createElement("div");
	newElem.id = "qS";
	newElem.className = "hide";

	for(x = 0; x < elems.length; x++)
	{
		var newChild = document.createElement("div");
		newChild.className = "qChange";
		newChild.name = elems[x];
		newChild.innerHTML = elems[x];
		newElem.appendChild(newChild);
	}
	container.appendChild(newElem);*/
	initControls();
	fitToScreen();
	$(window).resize(function(){
		fitToScreen();
	});
}

function initControls()
{
	document.getElementById("playpause").addEventListener("click", playPause);
	//document.getElementById("q").addEventListener("click", settings);
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
	document.getElementById("controls").style.top = document.getElementById("player").offsetTop + $("#player").height() + "px";
	document.getElementById("controls").style.left = document.getElementById("player").offsetLeft + "px";
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
}

function settings()
{
	$("#qS").toggleClass("hide");
}

function changeQuality()
{
	wantedQ = this.getAttribute("name");
	if(ytplayer.getPlaybackQuality != wantedQ)
	{
		ytplayer.setPlaybackQuality(wantedQ);
	}
}

function setVolume(vol)
{
	ytplayer.setVolume(vol);
	/*console.log(vol); //NO LOGS FOR U LOL
	if(vol == 0){
		console.log("no volume");
	}else if(vol < 33){
		console.log("low-volume");
	}else if(vol > 33 && vol < 66){
		console.log("medium-volume");
	}else if(vol > 66){
		console.log("full-volume");
	}*/
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
	minutes = Math.floor(currDurr / 60);
	seconds = currDurr - minutes * 60;
	document.getElementById("duration").innerHTML = pad(minutes)+":"+pad(seconds)+" <span id='dash'>/</span> "+pad(dMinutes)+":"+pad(dSeconds);
}

function pad(n)
{
	return n < 10 ? "0"+Math.floor(n) : Math.floor(n);
}

function volumeOptions()
{
	console.log("volumeOptions");
	button = document.getElementById("volume");
	if(ytplayer.isMuted())
	{
		ytplayer.unMute();
		button.innerHTML = "Mute";
	}
	else
	{
		ytplayer.mute();
		button.innerHTML = "Unmute";
	}
}

function logQ()
{
	console.log(ytplayer.getPlaybackQuality());
}
