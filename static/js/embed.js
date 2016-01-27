
var song_title 			  = "";
var paused 				  = false;
var player_ready 	   	  = false;
var list_html 			  = $("#list-song-html").html();
var w_p					  = true;
var lazy_load			  = false;
var embed				  = true;
var vol					  = 100;
var adminpass 			  = "";

var seekTo;
var socket;
var video_id;
var previous_video_id;
var chan = window.location.hash.substring(1);

var connection_options = {
	'sync disconnect on unload':true,
	'secure': true,
	'force new connection': true 
};

$(document).ready(function(){

	$("head").append('<link type="text/css" rel="stylesheet" href="/static/css/embed.css" />');
	$("head").append('<link type="text/css" rel="stylesheet" href="/static/css/materialize.min.css" />');

	console.log(document);
	console.log(window.location.hash)

	add = "https://zoff.no";
	//add = "localhost";
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

$(document).on( "click", "#zoffbutton", function(e){
	window.open("https://zoff.no/" + chan.toLowerCase() + "/", '_blank');
});

$(document).on( "click", ".vote-container", function(e){
	var id = $(this).attr("data-video-id");
	List.vote(id, "pos");
});