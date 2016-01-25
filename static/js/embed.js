
var song_title 			  = "";
var paused 				  = false;
var player_ready 	   	  = false;
var list_html 			  = $("#list-song-html").html();
var w_p					  = true;
var lazy_load			  = false;
var embed				  = true;
var vol					  = 100;
var adminpass 			  = "";
var embed_code    		  = '<div id="song-title"></div><div id="container" style="display:inline-flex;"><div id="player-container"><div id="player" style="width:300px;height:300px;"></div><div id="controls" class="noselect"><div id="playpause"><i id="play" class="mdi-av-play-arrow hide"></i><i id="pause" class="mdi-av-pause"></i></div><div id="duration">00:00 / 00:00</div><div id="fullscreen"><i class="mdi-navigation-fullscreen"></i></div><div id="volume-button"><i id="v-mute" class="mdi-av-volume-off"></i><i id="v-low" class="mdi-av-volume-mute"></i><i id="v-medium" class="mdi-av-volume-down"></i><i id="v-full" class="mdi-av-volume-up"></i></div><div id="volume"></div><div id="viewers"></div><div id="bar"></div></div></div><div id="playlist"><div id="wrapper" style="height:332px;width:300px;overflow-y:scroll;"><div id="preloader" class="progress channel_preloader"><div class="indeterminate"></div></div><div id="list-song-html"><div id="list-song" class="card left-align list-song"><span class="clickable vote-container" title="Vote!"><a class="clickable center-align votebg"><div class="lazy card-image cardbg list-image" style=""></div></a><span class="card-content"><span class="flow-text truncate list-title"></span><span class="vote-span"><span class="list-votes"></span><span class="highlighted vote-text">&nbsp;votes</span></span></span></span></div></div></div></div></div><script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min.js"></script><script type="text/javascript" src="//cdn.socket.io/socket.io-1.3.5.js"></script>';


var seekTo;
var socket;
var video_id;
var previous_video_id;
var chan = ($("#zoffchannel").html()).toLowerCase();

var connection_options = {
	'sync disconnect on unload':true,
	'secure': true,
	'force new connection': true 
};

$(document).ready(function(){

	$(embed_code).insertAfter($("#zoffchannel"));
	$("head").append('<link type="text/css" rel="stylesheet" href="/static/css/embed.css" />');
	$("head").append('<link type="text/css" rel="stylesheet" href="/static/css/materialize.min.css" />');

	if(window.location.hostname != "zoff.no") add = "https://zoff.no";
	else add = "localhost";
	socket = io.connect(''+add+':8880', connection_options);

	socket.on("get_list", function(){
	    setTimeout(function(){socket.emit('list', chan.toLowerCase())},1000);
	});

	Youtube.setup_youtube_listener(chan);
	List.channel_listener();


	window.onYouTubeIframeAPIReady = Youtube.onYouTubeIframeAPIReady;

	Youtube.loadPlayer();

	Playercontrols.initSlider();
});

$(document).on( "click", ".vote-container", function(e){
	var id = $(this).attr("data-video-id");
	List.vote(id, "pos");
});