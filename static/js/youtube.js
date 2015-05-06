var url;
var tag;
var firstScriptTag;
var ytplayer;
var title;
var viewers;
var video_id;
var conf = [];
var adminvote = 0;
var adminadd = 0;
var adminskip = 0;
var music = 0;
var longS = 0;
var frontpage = 1;
var adminpass = "";
var filesadded="";
var chan = $("#chan").html();
var player_ready = false;
var seekTo;
var song_title;
var viewers = 1;
var paused = false;
var playing = false;

//play new song
socket.on(chan.toLowerCase()+",np", function(obj)
{
	console.log(obj);
	if(obj[0].length == 0){
		console.log("Empty list");
		document.getElementById('song-title').innerHTML = "Empty channel. Add some songs!";
		$("#player_overlay").height($("#player").height());
		if(!window.mobilecheck())
			$("#player_overlay").toggleClass("hide");
		importOldList(chan.toLowerCase());
	}
	else{
		console.log("gotten new song");
		$("#player_overlay").addClass("hide");
		video_id = obj[0][0]["id"];
		conf = obj[1][0];
		time = obj[2];
		seekTo = time - conf["startTime"];
		song_title = obj[0][0]["title"];
		getTitle(song_title, viewers);
		if(player_ready && !window.mobilecheck())
		{
			if(ytplayer.getVideoUrl().split('v=')[1] != video_id)
			{
				ytplayer.loadVideoById(video_id);
				setBGimage(video_id);
				notifyUser(video_id, song_title);
				if(paused)
					ytplayer.pauseVideo();
			}else
				console.log("like");
			if(!paused)
				ytplayer.playVideo();
			if(ytplayer.getDuration() > seekTo)
				ytplayer.seekTo(seekTo);
		}
		else
			getTitle(song_title, viewers);
	}
});

socket.on(chan.toLowerCase()+",viewers", function(view)
{
	viewers = view;
	if(song_title !== undefined)
		getTitle(song_title, viewers);
});

$(document).ready(function()
{
	$("#settings").sideNav({
      menuWidth: 300, // Default is 240
      edge: 'right', // Choose the horizontal origin
      closeOnClick: false // Closes side-nav on <a> clicks, useful for Angular/Meteor
    });
	$('#settings-close').sideNav('hide');

	if(!window.mobilecheck() && !msieversion())
	{
		Notification.requestPermission();
	}

	if(window.mobilecheck()){
		document.getElementById("search").blur();
		readyLooks();
	}else{
		tag = document.createElement('script');
		tag.src = "https://www.youtube.com/iframe_api";
		firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

		if(localStorage[chan.toLowerCase()])
		{
			socket.emit("password", [localStorage[chan.toLowerCase()], chan.toLowerCase(), guid]);
		}

		if($("#chan").html().toLowerCase() == "jazz")
		{
			//loadjsfile("static/js/jazzscript.js");
			//peis = true;
		}
	}
});

function loadjsfile(filename)
{
	if (filesadded.indexOf("["+filename+"]")==-1){
	    var fileref=document.createElement('script');
	    fileref.setAttribute("type","text/javascript");
	    fileref.setAttribute("src", filename);
	    document.getElementsByTagName("head")[0].appendChild(fileref);
	    filesadded+="["+filename+"]";
	}else jazz_setup();
}

function msieversion() {

        var ua = window.navigator.userAgent;
        var msie = ua.indexOf("MSIE ");

        if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))      // If Internet Explorer, return version number
            return true;
        else                 // If another browser, return 0
            return false;

   return false;
}

function onYouTubeIframeAPIReady() {
	ytplayer = new YT.Player('player', {
		height: window.height*0.75,
		width: window.width*0.6,
		videoId: video_id,
		playerVars: { rel:"0", wmode:"transparent", controls: "0" , iv_load_policy: "3", theme:"light", color:"white"},
		events: {
			'onReady': onPlayerReady,
			'onStateChange': onPlayerStateChange,
			'onError': errorHandler
		}
	});
	if(peis)
	{
		//jazz_setup();
	}

}

function onPlayerStateChange(newState) {
	switch(newState.data)
	{
		case -1:
			break;
		case 0:
			console.log("end");
			socket.emit("end", video_id);
			playing = false;
			paused = false;
			break;
		case 1:
			playing = true;
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
}

function getTitle(titt, v)
{
	var outPutWord = v > 1 ? "viewers" : "viewer";
	var title= decodeURIComponent(titt);
	var elem = document.getElementById('song-title');

	document.title = title + " • Zöff / "+chan;
		elem.innerHTML = title;
		document.getElementById('viewers').innerHTML = v + " " + outPutWord;
		elem.title = title + " • " + v + " " + outPutWord;

}

function errorHandler(newState)
{
	var failsafe = ytplayer.getVideoUrl().split("https://www.youtube.com/watch");
	if(newState.data == 5 || newState.data == 100 || newState.data == 101 || newState.data == 150)
	{
			socket.emit("skip");
	}
}

function onPlayerReady(event) {
  	player_ready = true;
		if(!window.mobilecheck())
		{
			$("#player").css("opacity", "1");
			$("#controls").css("opacity", "1");
			$(".playlist").css("opacity", "1");
			ytplayer.loadVideoById(video_id);
			ytplayer.playVideo();
			ytplayer.seekTo(seekTo);
		}
		readyLooks();
		initYoutubeControls(ytplayer);
		initSlider();
		ytplayer.setVolume(localStorage.getItem("volume"));
}

function readyLooks()
{
	setBGimage(video_id);
}

function setBGimage(id){
	var hsl=[getRandomInt(0,360), getRandomInt(60,80)]
	var colorTxt = "hsl("+hsl[0]+", "+hsl[1]+"%, 40%);";
	$("body").css("background-color", colorTxt);
}

function notifyUser(id, title) {
	title= title.replace(/\\\'/g, "'").replace(/&quot;/g,"'").replace(/&amp;/g,"&");
  	if (Notification.permission === "granted" && document.hidden && id != "30H2Z8Lr-4c" && !window.mobilecheck()) {
	    var notification = new Notification("Now Playing", {body: title, icon: "http://i.ytimg.com/vi/"+id+"/mqdefault.jpg", iconUrl: "http://i.ytimg.com/vi/"+id+"/mqdefault.jpg"});
	    setTimeout(function(){
	    	notification.close();
	    },5000);
  	}
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function rgbToHsl(r, g, b){
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h*360, s*100, l*100];
}
