var chan 				  = window.chan == undefined ? $("#chan").html() : window.chan;
var w_p 				  = true;
var hasadmin			  = 0;
var showToggle 			  = true;
var list_html 			  = $("#list-song-html").html();
var blink_interval_exists = false;
var unseen 			   	  = false;
//var timer 			   	  = 0;
var api_key 		   	  = "***REMOVED***";
var searching 		   	  = false
var time_regex 		   	  = /P((([0-9]*\.?[0-9]*)Y)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)W)?(([0-9]*\.?[0-9]*)D)?)?(T(([0-9]*\.?[0-9]*)H)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)S)?)?/
var conf 			   	  = [];
var music 			   	  = 0;
var frontpage 		   	  = 1;
var adminpass 		   	  = "";
var filesadded		   	  = "";
var player_ready 	   	  = false;
var viewers 			  = 1;
var paused 				  = false;
var playing 			  = false;
var SAMPLE_RATE 		  = 6000; // 6 seconds
var lastSample 			  = Date.now();
var began 				  = false;
var i 					  = -1;
var lazy_load    		  = true;
var embed				  = false;
var autoplay			  = true;
var durationBegun 	      = false;
var chat_active 		  = false;
var chat_unseen 		  = false;
var blinking 			  = false;

var result_html;
var empty_results_html;
var mobile_beginning;
var timeout_search;
var id;
var full_playlist;
var conf;
var blink_interval;
var tag;
var firstScriptTag;
var title;
var viewers;
var video_id;
var list;
var seekTo;
var song_title;
var previous_video_id;
var socket;
var connection_options = {
	'sync disconnect on unload':true,
	'secure': true,
	'force new connection': true 
};

/*
if (navigator.serviceWorker) {
    navigator.serviceWorker.register('/service-worker.js', {scope: '/'})
        .then(function (registration) {
            console.log(registration);
        })
        .catch(function (e) {
            console.error(e);
        })
} else {
    console.log('Service Worker is not supported in this browser.');
}
*/
$().ready(function(){
	if(!window.fromFront && window.location.pathname != "/") init();
});


function init(){

	chan = $("#chan").html();
	mobile_beginning = window.mobilecheck();
	var side = window.mobilecheck() ? "left" : "right";

	window.onpopstate = function(e){
		onepage_load();
	}

	share_link_modifier_channel();

	if(window.location.hostname == "zoff.no") add = "https://zoff.no";
	else add = window.location.hostname;
	

	//setTimeout(function(){
	if(Player != undefined) Player.stopInterval= false;
	//window.vote 		  = List.vote;
	//window.submit 		  = Search.submit;
	//window.submitAndClose = Search.submitAndClose;



	$('ul.playlist-tabs').tabs();
	$('ul.playlist-tabs-loggedIn').tabs();
	$('.chatTabs').tabs();
	$("#settings").sideNav({
      menuWidth: 300, // Default is 240
      edge: side, // Choose the horizontal origin
      closeOnClick: false // Closes side-nav on <a> clicks, useful for Angular/Meteor
    });
    $('.collapsible').collapsible({
      accordion : true // A setting that changes the collapsible behavior to expandable instead of the default accordion style
    });
    result_html 	   	  = $("#temp-results-container");
	empty_results_html 	  = $("#empty-results-container").html();

    //awdwad
    $(".video-container").resizable({
    	start: function(event, ui) {
        	$('iframe').css('pointer-events','none');
        },
    	stop: function(event, ui) {
        	$('iframe').css('pointer-events','auto');
        	Crypt.set_width($(this).width());
      	},
        handles: "e",
        minWidth: 350
    });
    
    /*
	if(localStorage[chan.toLowerCase()])
	{
		if(localStorage[chan.toLowerCase()].length != 64)
			localStorage.removeItem(chan.toLowerCase());
		else
			socket.emit("password", [localStorage[chan.toLowerCase()], chan.toLowerCase()]);
	}*/


	socket = io.connect(''+add+':8880', connection_options);
	Player.setup_youtube_listener(chan);
	    
	    Admin.admin_listener();
		List.channel_listener();

	socket.on("get_list", function(){
	    //setTimeout(function(){
	    	socket.emit('list', chan.toLowerCase());
	    	/*if(Crypt.get_pass(chan.toLowerCase()) != undefined){
	    		socket.emit("password", [Crypt.crypt_pass(Crypt.get_pass(chan.toLowerCase())), chan.toLowerCase()]);
	    	}*/
	});

	socket.on("suggested", function(params){
		var single = true;
		if(params.id == undefined)
			single = false;
		//setTimeout(function(){
			Suggestions.catchUserSuggests(params, single);
			//}, 1000);
	});

	socket.on("viewers", function(view)
	{
		viewers = view;

		if(song_title !== undefined)
			Player.getTitle(song_title, viewers);
	});


	if(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream){
		document.getElementById("search").blur();
		$("#channel-load").css("display", "none");
 	} else {
 		window.onYouTubeIframeAPIReady = Player.onYouTubeIframeAPIReady;
 		Player.loadPlayer();
 	}

 	if(window.mobilecheck()) Mobile_remote.initiate_volume();

	Chat.setup_chat_listener(chan);
	Chat.allchat_listener();
	if(!window.mobilecheck()) Hostcontroller.host_listener();

	if(!Helper.msieversion()) Notification.requestPermission();
	
	$(".search_input").focus();
	

	git_info = $.ajax({ type: "GET",
			url: "https://api.github.com/repos/zoff-music/zoff/commits",
			async: false
	}).responseText;

	git_info = $.parseJSON(git_info);
	$("#latest-commit").html("Latest Commit: <br>"
			+ git_info[0].commit.author.date.substring(0,10)
			+ ": " + git_info[0].committer.login
			+ "<br><a href='"+git_info[0].html_url+"'>"
			+ git_info[0].sha.substring(0,10) + "</a>: "
			+ git_info[0].commit.message+"<br");

	Helper.sample();

  	$( "#results" ).hover( function() { $("div.result").removeClass("hoverResults"); i = 0; }, function(){ });
	$("#search").focus();

		/*setInterval(function(){
			timer--;
			if(timer===0){
				Search.search($(".search_input").val());
			}
		}, 1);*/
	//}, 1000);
	
	$("#embed-button").css("display", "inline-block");
	$("#embed-area").val('<embed src="https://zoff.no/embed.html#' + chan.toLowerCase() + '&autplay" width="600px" height="300px">');
	$("#search").attr("placeholder", "Find song on YouTube...");
	
}

window.init = init;

$(document).keyup(function(e) {
  	if(event.keyCode == 27){
    	$("#results").html("");
    	if(!Helper.contains($("#search-wrapper").attr("class").split(" "), "hide"))
      		$("#search-wrapper").toggleClass("hide");
    	if(Helper.contains($("#song-title").attr("class").split(" "), "hide"))
      		$("#song-title").toggleClass("hide");

    	if($("#search-btn i").attr('class') == "mdi-navigation-close")
    	{
      		$("#search-btn i").toggleClass("mdi-navigation-close");
      		$("#search-btn i").toggleClass("mdi-action-search");
    	}
    	$("#results").toggleClass("hide");
  	}
});

$('input[class=conf]').change(function()
{
    Admin.save();
});

$("#clickme").click(function(){
	Player.ytplayer.playVideo();
});

$(document).on("submit", "#listImport", function(){
	Search.importPlaylist(document.getElementById("import").value);
});

$(window).focus(function(){
    $("#favicon").attr("href", "static/images/favicon.png");
    unseen = false;
});

$(document).on("change", "#autoplay", function() {
	if(this.checked) {
		$("#embed-area").val('<embed src="https://zoff.no/embed.html#' + chan.toLowerCase() + '&autplay" width="600px" height="300px">');
	} else {
		$("#embed-area").val('<embed src="https://zoff.no/embed.html#' + chan.toLowerCase() + '" width="600px" height="300px">');
	}
});

$(document).on("click", "#playbutton_remote", function(e) {
	e.preventDefault();
	Mobile_remote.play_remote();
});

$(document).on("click", "#pausebutton_remote", function(e) {
	e.preventDefault();
	Mobile_remote.pause_remote();
});

$(document).on("click", "#skipbutton_remote", function(e) {
	e.preventDefault();
	Mobile_remote.skip_remote();
});

$(document).on("submit", "#remoteform", function(e) {
	e.preventDefault();
	Mobile_remote.get_input($("#remote_channel").val());
});

$(document).on("click", "#chat-btn", function(){
	$("#text-chat-input").focus();
    //$("#chat-btn").css("color", "white");
    $("#chat-btn i").css("opacity", 1);
    clearInterval(blink_interval);
    blink_interval_exists = false;
    unseen = false;
    $("#favicon").attr("href", "static/images/favicon.png");
});

function searchTimeout(event) {
	search_input = $(".search_input").val();

	code = event.keyCode || event.which;

	if (code != 40 && code != 38 && code != 13 && code != 39 && code != 37 &&
		code != 17 && code != 16 && code != 225 && code != 18) {
		clearTimeout(timeout_search);
		if(search_input.length < 3){$("#results").html("");}
		if(code == 13){
		 	Search.search(search_input);
		}else{
			timeout_search = setTimeout(function(){
				Search.search(search_input);
			}, 1000);
			/*i = 0;
			timer=100;*/
		}
	}
}

if(/iPad|iPhone|iPod/.test(navigator.userAgent)){
	$(document).on('keydown', '.search_input', function(event) {
		searchTimeout(event);
	});
} else {
	$(document).on('keyup', ".search_input", function(event) {
		searchTimeout(event);
	});
}

$(document).on("click", ".chat-tab", function(){
    $("#text-chat-input").focus();
});


$(document).on("click", "#skip", function(e){
	e.preventDefault();
  	List.skip();
});

$(document).on("click", "#chan", function(e){
	e.preventDefault();
  	List.show();
});

$(document).on("submit", "#adminForm", function(e){
	e.preventDefault();
  	Admin.pass_save();
});

$(document).on("click", ".chat-link", function(e){
	chat_active = true;
	unseen = false;
	chat_unseen = false;
	$(".chat-link").attr("style", "color: white !important;");
	blinking = false;
	$("#favicon").attr("href", "static/images/favicon.png");
	$("#chatPlaylist").css("display", "block");
	$("#wrapper").css("display", "none");
	$("#suggestions").css("display", "none");
	$("#text-chat-input").focus();
});

$(document).on("click", ".playlist-link", function(e){
	chat_active = false;
	$("#chatPlaylist").css("display", "none");
	$("#wrapper").css("display", "block");
	$("#suggestions").css("display", "none");
});

$(document).on("click", ".suggested-link", function(e){
	chat_active = false;
	$("#chatPlaylist").css("display", "none");
	$("#wrapper").css("display", "none");
	$("#suggestions").css("display", "block");
});

$(document).on("submit", "#chatForm", function(e){
	e.preventDefault();
  Chat.chat(document.getElementById("chatForm").input);
});

$(document).on("click", "#shuffle", function(e)
{
	e.preventDefault();
  	Admin.shuffle();
});

$(document).on("click", "#search-btn", function(e)
{
	e.preventDefault();
 	Search.showSearch();
});

$(document).on("click", "#song-title", function(e)
{
	e.preventDefault();
  	Search.showSearch();
});

$(document).on("click", "#admin-lock", function(e)
{
	e.preventDefault();
  	Admin.log_out();
});

$(document).on("click", "#closeSettings", function(e)
{
	e.preventDefault();
  	Admin.hide_settings();
});

$(document).on( "click", ".result-object", function(e){
	var $html  = $(e.target);
	var substr = $html.prop('outerHTML').substring(0,4);
	if(substr != "<i c"){
		var id 		= $(this).attr("data-video-id");
		var title 	= $(this).attr("data-video-title");
		var length 	= $(this).attr("data-video-length");
		
		Search.submitAndClose(id, title, length);
	}
});

$(document).on( "click", "#add-many", function(e){
	var id 		= $(this).attr("data-video-id");
	var title 	= $(this).attr("data-video-title");
	var length 	= $(this).attr("data-video-length");

	Search.submit(id, title, length);
});

$(document).on( "click", ".vote-container", function(e){
	var id = $(this).attr("data-video-id");
	List.vote(id, "pos");
});

$(document).on( "click", "#del", function(e){
	var id = $(this).attr("data-video-id");
	List.vote(id, "del");
});

$(document).on( "click", ".add-suggested", function(e){
	var id 		= $(this).attr("data-video-id");
	var title 	= $(this).attr("data-video-title");
	var length 	= $(this).attr("data-video-length");


	Search.submit(id, title, length);
	$("#suggested-" + id).remove();
});

$(document).on( "click", "#del_suggested", function(e){
	var id = $(this).attr("data-video-id");

	$("#suggested-" + id).remove();
});

$(document).on( "click", "#del_user_suggested", function(e){
	var id = $(this).attr("data-video-id");
	$("#suggested-" + id).remove();
	List.vote(id, "del");
});

$(document).on('click', '#toast-container', function(){
  $(this).fadeOut(function(){
        $(this).remove();
    });
});

$(document).on("click", "#embed-area", function(){
	this.select();	
});

$(document).on("click", ".brand-logo-navigate", function(e){
	e.preventDefault();

	window.history.pushState("to the frontpage!", "Title", "/");
	onepage_load();
});

$(document).on("mousemove", "#playlist", function(e)
{
    var y = e.pageY - this.offsetTop;
	if(((y <= 27 && adminpass == "") || (y <= 80 && y >= 48 && adminpass != "")) && $("#wrapper").scrollTop() > 0){
		$("#top-button").removeClass("hide");
		Helper.addClass("#bottom-button", "hide");
	}else if(y >= $("#playlist").height() - 18 && $("#wrapper").scrollTop() < $("#wrapper")[0].scrollHeight - $("#wrapper").height() - 1){
		$("#bottom-button").removeClass("hide");
		Helper.addClass("#top-button", "hide");
	}else{
		Helper.addClass("#bottom-button", "hide");
		Helper.addClass("#top-button", "hide");
	}
});

$(document).on("mouseleave", "#playlist", function(){
	Helper.addClass("#bottom-button", "hide");
	Helper.addClass("#top-button", "hide");
});

$(document).on("click", "#top-button", function(){
	List.scrollTop();
});

$(document).on("click", "#bottom-button", function(){
	List.scrollBottom();
});

function share_link_modifier_channel(){
	$("#facebook-code-link").attr("href", "https://www.facebook.com/sharer/sharer.php?u=https://zoff.no/" + chan.toLowerCase());
    $("#facebook-code-link").attr("onclick", "window.open('https://www.facebook.com/sharer/sharer.php?u=https://zoff.no/" + chan.toLowerCase() + "', 'Share Playlist','width=600,height=300'); return false;");
    $("#twitter-code-link").attr("href", "http://twitter.com/intent/tweet?url=https://zoff.no/" + chan.toLowerCase() + "&amp;text=Check%20out%20this%20playlist%20" + chan.toLowerCase() + "%20on%20Zöff!&amp;via=zoffmusic")
    $("#twitter-code-link").attr("onclick", "window.open('http://twitter.com/intent/tweet?url=https://zoff.no/" + chan.toLowerCase() + "/&amp;text=Check%20out%20this%20playlist%20" + chan.toLowerCase() + "%20on%20Zöff!&amp;via=zoffmusic','Share Playlist','width=600,height=300'); return false;");
    $("#qr-code-link").attr("href", "//chart.googleapis.com/chart?chs=500x500&cht=qr&chl=https://zoff.no/" + chan.toLowerCase() + "&choe=UTF-8&chld=L%7C1");
    $("#qr-code-image-link").attr("src", "//chart.googleapis.com/chart?chs=150x150&cht=qr&chl=https://zoff.no/" + chan.toLowerCase() + "&choe=UTF-8&chld=L%7C1");
}

function onepage_load(){

	var url_split = window.location.href.split("/");

	if(url_split[3].substr(0,1) != "#!" && url_split[3] != "" && !(url_split.length == 5 && url_split[4].substr(0,1) == "#")){
		socket.emit("change_channel");
	    Admin.beginning = true;

	    chan = url_split[3].replace("#", "");
	    $("#chan").html(Helper.upperFirst(chan));

	    w_p = true;
	    socket.emit("list", chan.toLowerCase());
	}else if(url_split[3] == ""){
		$("#channel-load").css("display", "block");
		window.scrollTo(0, 0);

		Player.stopInterval = true;
		Admin.display_logged_out();
		Admin.beginning 	 = true;
		chan 				 = "";
		began 				 = false;
		durationBegun  		 = false;
		$("#embed-button").css("display", "none");


		socket.removeAllListeners();

		$.ajax({
		    url: "php/nochan.php",
		    success: function(e){

		    	socket.disconnect();

		    	document.getElementById("volume-button").removeEventListener("click", Playercontrols.mute_video);
    			document.getElementById("playpause").removeEventListener("click", Playercontrols.play_pause);
    			document.getElementById("fullscreen").removeEventListener("click", Playercontrols.fullscreen);
			    	
		    	video_id   = "";
		    	song_title = "";

		    	$("meta[name=theme-color]").attr("content", "#2D2D2D"); 

		    	if(!/iPad|iPhone|iPod/.test(navigator.userAgent)) Player.ytplayer.destroy();

				$(".drag-target").remove();
				$("#sidenav-overlay").remove();
		    	$("main").attr("class", "center-align container");
		    	$("body").attr("id", "");
		    	$("body").attr("style", "");
		      	$("header").html($($(e)[61]).html());
		      	$($(e)[63]).insertAfter("header");
		      	$($(e)[65]).insertAfter(".mega");
		      	$("main").html($($(e)[69]).html());
		      	$(".page-footer").removeClass("padding-bottom-extra");
		      	$(".page-footer").removeClass("padding-bottom-novideo");
		      	$("#favicon").attr("href", "static/images/favicon.png");

		      	if($("#alreadyfp").length == 1){
		      		window.initfp();
		      	}else {
					window.fromChannel = true;
		            window.initfp();
		        }

		      	if($("#alreadychannel").length == 0){
		      		$("head").append("<div id='alreadychannel'></div")
		      	}
		      	$("#channel-load").css("display", "none");

				document.title = "Zöff";

				window.initfp();

		    }
		});
	}
}