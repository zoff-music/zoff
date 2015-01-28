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

$(document).ready(function()
{
	window.mobilecheck = function() {
	var check = false;
	(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true;})(navigator.userAgent||navigator.vendor||window.opera);
	//(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
	return check; };

	updateList();
	wasPaused = false;
	beginning = true;
	diffVideo = false;
	interval = false;
	response = $.ajax({ type: "GET",   
		url: "php/change.php",   
		async: false
	}).responseText;
	//console.log(response);
	response = $.parseJSON(response);
	console.log(response.nowPlaying.length);
	conf = response.conf;
	console.log(conf);
	try{	
		for(var first in response.nowPlaying) break;
		console.log(first);
		response = first;
	}catch(err){
		response = "1";
	}
	
	
	$.ajax({
		type: 'get',
		url: 'php/timedifference.php',
		data: "abcde",
		async: false,
		success: function(data) {
			timeDifference = $.parseJSON(data);
		}
	});
	console.log("timediff:"+timeDifference[0]);

	

	tag = document.createElement('script');
	tag.src = "https://www.youtube.com/iframe_api";
	firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
	if(window.mobilecheck()){
		//syncInterval = setInterval(getTime, 50000);
		//listInterval = setInterval(updateList, 50000);
		mobileSync = setInterval(function(){getTime();updateList();}, 10000);
		//listKillInterval = setInterval(ks, 50000);
		document.getElementById("search").blur();
	}else{
		syncInterval = setInterval(getTime, 5000);
		listInterval = setInterval(updateList, 10000);
		//listKillInterval = setInterval(ks, 50000);
	}
});

function onYouTubeIframeAPIReady() {
	ytplayer = new YT.Player('player', {
		height: window.height*0.75,
		width: window.width*0.6,
		videoId: response,
		playerVars: { rel:"0", wmode:"transparent", controls: "0" , iv_load_policy: "3", theme:"light", color:"white"},
		events: {
			'onReady': onPlayerReady,
			'onStateChange': onPlayerStateChange,
			'onError': errorHandler,
			'onPlaybackQualityChange': logQ
		}
	});
}

function onPlayerStateChange(newState) {
	console.log("new state: "+newState.data);
	console.log("beginning: "+beginning);
	//ytplayer.seekTo(15);
	if(newState.data === 0)
	{
		quickFixCountdown = setTimeout(function(){
			console.log("trying quickfix");
			if(ytplayer.getPlayerState() === 0 && wasPaused){
				console.log("quickfixPlay");
				startNextSong();
				wasPaused = false;
			}
		},5000);
	}
	if((newState.data === 0 && checkEnd()) || (newState.data == 1 && checkEnd())) 
	{
		console.log("nummer 1");
		startNextSong();
		ytplayer.pauseVideo();
		wasPaused = false;
	}else if(newState.data == 1 && (wasPaused && !beginning))
	{
		console.log("unpaused");
		beginning = false;
		wasPaused = false;
		syncInterval = setInterval(getTime, 5000);
		getTime();
	}else if(newState.data == 2)
	{
		clearInterval(syncInterval);
		interval = true;
		wasPaused = true;
		beginning = false;
	}
	if(newState.data == 1 || newState.data == 2)
	{
		activeButton = document.getElementById("playpause").className;
		console.log(activeButton);
		if((newState.data == 2 && activeButton == "pause") || (newState.data == 1 && activeButton == "play"))
		{
			$("#playpause").toggleClass("play");
			$("#playpause").toggleClass("pause");
		}
	}
}

function checkEnd()
{
	console.log("sjekker om brukeren spolte");
	$.ajax({
		type: 'get',
		url: 'php/timedifference.php',
		data: "abcde",
		async: false,
		success: function(data) {
			timeDifference = $.parseJSON(data);
		}
	});
	if(parseInt(timeDifference[0]) > ytplayer.getDuration())
	{
		return true;
	}
	return false;
}

function startNextSong()
{

		//console.log(getTime());
		if(checkEnd() && !changed)
		{
			setTimeout(function(){
				response = $.ajax({
					type: "POST",
					url: "php/change.php",
					async: false,
					data: "thisUrl="+response+"&act=save",

					success: function() {
						console.log("saved song-switch - "+response);
					}
				}).responseText;
				
				console.log("next video: "+response);
				getTitle(response);
				if(!window.mobilecheck())
				{
					ytplayer.loadVideoById(response);
				}
				beginning = true;
				setBGimage(response);
				
			},2500);
			updateList();
			changed = true;

			setTimeout(function() {
				changed = false;
				syncInterval = setInterval(getTime, 5000);
				interval = true;
				console.log("starter intervallen. Interval: " + interval);
			}, 2500);
		}
		
}

function getTime()
{
	console.log("utenfor if test" + wasPaused);
	if(ytplayer.getCurrentTime() > 2 && ytplayer.getPlayerState() == 1) wasPaused = false;
	if(!wasPaused)
	{
		console.log("sjekker om brukeren spolte");

		$.ajax({
			type: 'get',
			url: 'php/timedifference.php',
			data: "abcde",
			async: false,
			success: function(data) {
				timeDifference = $.parseJSON(data);
			}
		});
		console.log("current song: "+response);
		console.log("song in database: "+timeDifference[1]);
		if(!window.mobilecheck()){ 								//Added so the mobileversion will change banner
			if(parseInt(timeDifference[2]) + 1> ytplayer.getCurrentTime() + parseInt(timeDifference[3]) && ytplayer.getPlayerState() === 0)
			{
				return true;
			}else if(ytplayer.getCurrentTime() + parseInt(timeDifference[3]) > parseInt(timeDifference[2]) + 5 || (ytplayer.getCurrentTime() + parseInt(timeDifference[3]) < parseInt(timeDifference[2]) - 5 && ytplayer.getPlayerState() !== 0 && ytplayer.getPlayerState() != 3))
			{
				if(parseInt(timeDifference[0]) > ytplayer.getDuration())
				{
					console.log("burde ikke søke, men hoppe til neste sang");
				}
				ytplayer.seekTo(timeDifference[0]);
				ytplayer.pauseVideo();
				if(!window.mobilecheck())
				{
					ytplayer.playVideo();
				}
				getTitle();
				return false;
			}
		}
			//if(interval){syncInterval = setInterval(getTime, 5000);interval = false;}
			
		if(response != timeDifference[1])
		{
			clearInterval(syncInterval);
			console.log("forskjellige videoer!!");
			ytplayer.pauseVideo();
			if(!window.mobilecheck())
			{
				ytplayer.loadVideoById(timeDifference[1]);
			}
			setBGimage(timeDifference[1]);
			setTimeout(function(){
				//console.log(response);
				diffVideo = true;
				beginning = true;
				$.ajax({
					type: "POST",
					url: "php/change.php",
					async: false,
					data: "thisUrl=123abcprompeprompe&act=save",
					success: function(data)
					{
						response = timeDifference[1];
						getTitle();
					}
				});
				syncInterval = setInterval(getTime, 5000);
			},2500);
		}
	}
}

function getTitle()
{

    $.ajax({ type: "GET",   
		url: "php/timedifference.php",   
		async: false,
		success: function(data) {
			viewers = $.parseJSON(data);
			var outPutWord = viewers[5].length > 1 ? "viewers" : "viewer";
			var title= viewers[4].replace(/\\\'/g, "'").replace(/&quot;/g,"'").replace(/&amp;/g,"&");
			document.title = title + " • Zöff";
			document.getElementsByName('v')[0].placeholder = title + " • " + viewers[5].length + " " + outPutWord;
		}
	});

}

function errorHandler(newState)		
{
	setTimeout(function(){
		response = $.ajax({
			type: "POST",
			url: "php/change.php",
			async: false,
			data: "thisUrl="+response+"&act=empty",

			success: function() {
				console.log("error! deleted video");
			}
		}).responseText;
		if(!window.mobilecheck())
		{
			ytplayer.loadVideoById(response);
		}
		setBGimage(response);
	},2500);
/*
	setTimeout(function(){
		response = $.ajax({ type: "GET",   
			url: "change.php",   
			async: false
		}).responseText;
		var url = $.parseJSON(response);
		response = url[0][0];
		
		ytplayer.loadVideoById(response);
	},2500);*/
}
function onPlayerReady(event) {	
	  //ytplayer = document.getElementById("myytplayer");
	 // ytplayer.addEventListener("onStateChange", "onytplayerStateChange");	
	  //ytplayer.addEventListener("onError", "errorHandler");
		getTime();
		if(!window.mobilecheck())
		{
			ytplayer.playVideo();
		}
		initYoutubeControls(ytplayer);
		getTitle();
		setBGimage(response);
		initSlider();
		//durationFixer = setInterval(durationSetter, 1000);
	}

function setBGimage(id){
	if(window.mozInnerScreenX == null && !window.mobilecheck()){
		$("#bgimage").css("background-image", "url(http://img.youtube.com/vi/"+id+"/0.jpg)");
	}else if(window.mobilecheck()){
		$("#mobile-banner").css("background-image", "url(http://img.youtube.com/vi/"+id+"/hqdefault.jpg)");
		$("#mobile-banner").css("width",$(window).width());
	}

}