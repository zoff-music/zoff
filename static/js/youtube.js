/*
This is the youtube player sync and control file.

Fetcher sangen som spilles fra JSON filen

*/

var timeDifference;
var wasPaused;
var beginning;
var diffVideo;
var serverTime;
var url;
var response;
var url;
var tag;
var firstScriptTag;
var ytplayer;
var syncInterval;
var title;
var interval;
var viewers;
var video_id;
var changed = false;
var conf = [];
var adminvote = 0;
var adminadd = 0;
var adminskip = 0;
var music = 0;
var longS = 0;
var frontpage = 1;
var adminpass = "";
var notified = false;
var peis = false;
var filesadded="";
var colorThief;
var chan = $("#chan").html();
var player_ready = false;
var seekTo;
var arr = []
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
		document.getElementById('song-title').innerHTML = "Empty channel. Add some songs!"
	}
	else{
		console.log("gotten new song");
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

	colorThief = new ColorThief();
	window.mobilecheck = function() {
	var check = false;
	(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true;})(navigator.userAgent||navigator.vendor||window.opera);
	return check; };

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
			socket.emit("password", localStorage[chan.toLowerCase()]);
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

	document.title = title + " • Zöff";
		elem.innerHTML = title;
		document.getElementById('viewers').innerHTML = v + " " + outPutWord;
		elem.title = title + " • " + v + " " + outPutWord;

}

function errorHandler(newState)
{
	if(video_id !== undefined)
	{
		console.log(video_id);
		console.log("errorskip");
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
	if(!window.mobilecheck()){
		/*var bg = $(".thumb.lthumb")[0]; //new Image();
		bg.src = "http://i.ytimg.com/vi/"+id+"/mqdefault.jpg";
		var color = colorThief.getColor(bg, 10);
		var hsl = rgbToHsl(color);*/
		var hsl=[getRandomInt(0,360), getRandomInt(20,50)]
		var colorTxt = "hsla("+hsl[0]+", "+hsl[1]+"%, 20%, 1);";
		$("body").css("background-color", colorTxt);
	}else if(window.mobilecheck()){
		$("#mobile-banner").css("background-image", "url(http://img.youtube.com/vi/"+id+"/hqdefault.jpg)");
		$("#mobile-banner").css("width",$(window).width());
	}

}

function notifyUser(id, title) {
	title= title.replace(/\\\'/g, "'").replace(/&quot;/g,"'").replace(/&amp;/g,"&");
  	if (Notification.permission === "granted" && !notified && document.hidden && id != "30H2Z8Lr-4c" && !window.mobilecheck()) {
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
