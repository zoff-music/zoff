var chan 				  = $("#chan").html();
var w_p 				  = true;
var hasadmin			  = 0;
var showToggle 			  = true;
var list_html 			  = $("#list-song-html").html();
var blink_interval_exists = false;
var unseen 			   	  = false;
//var timer 			   	  = 0;
var api_key 		   	  = "***REMOVED***";
var result_html 	   	  = $("#temp-results-container");
var empty_results_html 	  = $("#empty-results-container").html();
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

$().ready(function(){
	if(!window.fromFront) init();
});


function init(){

	mobile_beginning = window.mobilecheck();

	window.onpopstate = function(e){
		onepage_load();
	}

	share_link_modifier();

	chan = $("#chan").html();
	if(window.location.hostname == "zoff.no") add = "https://zoff.no";
	else add = "localhost";
	

	//setTimeout(function(){
		if(Player != undefined) Player.stopInterval= false;
		//window.vote 		  = List.vote;
		//window.submit 		  = Search.submit;
		//window.submitAndClose = Search.submitAndClose;

		if(!localStorage["list_update"] || localStorage["list_update"] != "13.06.15")
		{
			localStorage.setItem("list_update", "13.06.15");
			window.location.reload(true);
		}

		$('ul.tabs').tabs();
		$("#settings").sideNav({
	      menuWidth: 300, // Default is 240
	      edge: 'right', // Choose the horizontal origin
	      closeOnClick: false // Closes side-nav on <a> clicks, useful for Angular/Meteor
	    });
	    $('.collapsible').collapsible({
	      accordion : true // A setting that changes the collapsible behavior to expandable instead of the default accordion style
	    });

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
		    	socket.emit('list', chan.toLowerCase())
		    	//},1000);
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
			Player.readyLooks();
		}else{
			Chat.setup_chat_listener(chan);
			Chat.allchat_listener();
			if(!window.mobilecheck()) Hostcontroller.host_listener();
			window.onYouTubeIframeAPIReady = Player.onYouTubeIframeAPIReady;
			Player.loadPlayer();

			$("#chat-btn").sideNav({
				menuWidth: 272, // Default is 240
				edge: 'left', // Choose the horizontal origin
				closeOnClick: false // Closes side-nav on <a> clicks, useful for Angular/Meteor
			});

			$(".drag-target")[1].remove();

			if(!Helper.msieversion()) Notification.requestPermission();
			
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
		}

	  	$( "#results" ).hover( function() { $("div.result").removeClass("hoverResults"); i = 0; }, function(){ });
		$("#search").focus();

		$('#base').bind("keyup keypress", function(e) {
			var code = e.keyCode || e.which;
			if (code  == 13) {
				e.preventDefault();
				return false;
			}
		});

		$(".search_input").focus();
		$(".search_input").keyup(function(event) {

			search_input = $(this).val();

			if (event.keyCode != 40 && event.keyCode != 38 && event.keyCode != 13 && event.keyCode != 39 && event.keyCode != 37 &&
				event.keyCode != 17 && event.keyCode != 16 && event.keyCode != 225 && event.keyCode != 18) {
				clearTimeout(timeout_search);
				if(search_input.length < 3){$("#results").html("");}
				if(event.keyCode == 13){
				 	Search.search(search_input);
				}else{

					timeout_search = setTimeout(function(){
						Search.search(search_input);
					}, 1000);
					/*i = 0;
					timer=100;*/
				}
			}


		});

		/*setInterval(function(){
			timer--;
			if(timer===0){
				Search.search($(".search_input").val());
			}
		}, 1);*/
	//}, 1000);
	
	$("#embed-button").css("display", "inline-block");
	$("#embed-area").val('<embed src="https://zoff.no/embed.html#' + chan.toLowerCase() + '&autplay" width="600px" height="300px">');

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
  	}else if ($("div.result").length > 2){
  		children = $("#mock-div").children();
      	if (e.keyCode == 40) {
        	$(children[i-1]).removeClass("hoverResults");
        	$(children[i]).addClass("hoverResults");
        	if(i < children.length -2)
          		i++;
      	} else if (e.keyCode == 38) {
      		if(i > 1)
          		i--;
        	$(children[i]).removeClass("hoverResults");
        	$(children[i-1]).addClass("hoverResults");
      	} else if(e.keyCode == 13) {
        	i = 0;
        	var elem = document.getElementsByClassName("hoverResults")[0];
      		if (typeof elem.onclick == "function") {
          		elem.onclick.apply(elem);
      		}
        	$("div.hoverResults").removeClass("hoverResults");
        	$("#results").html('');
        	document.getElementById("search").value = "";
      	}
  	}
});

$('input[class=conf]').change(function()
{
    Admin.save();
});

$("#clickme").click(function(){
	Player.ytplayer.playVideo();
});

$('#listImport').on("submit", function(){
	Search.importPlaylist(document.getElementById("import").value);
});

$(window).focus(function(){
  if(unseen)
  {
    $("#favicon").attr("href", "static/images/favicon.png");
    unseen = false;
  }
});

$(document).on("change", "#autoplay", function() {
	if(this.checked) {
		$("#embed-area").val('<embed src="https://zoff.no/embed.html#' + chan.toLowerCase() + '&autplay" width="600px" height="300px">');
	} else {
		$("#embed-area").val('<embed src="https://zoff.no/embed.html#' + chan.toLowerCase() + '" width="600px" height="300px">');
	}
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

$(document).on("submit", "#chatForm", function(){
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

function share_link_modifier(){
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

    			//setTimeout(function(){
			    	
			    	video_id   = "";
			    	song_title = "";

			    	$("meta[name=theme-color]").attr("content", "#2D2D2D"); 

					Player.ytplayer.destroy();

					$(".drag-target").remove();
					$("#sidenav-overlay").remove();
			    	$("main").attr("class", "center-align container");
			    	$("body").attr("id", "");
			    	$("body").attr("style", "");
			      	$("header").html($($(e)[53]).html());
			      	$($(e)[55]).insertAfter("header");
			      	$($(e)[57]).insertAfter(".mega");
			      	$("main").html($($(e)[61]).html());

			      	if($("#alreadyfp").length == 1){
			      		window.initfp();
			      	}else {
			      		if(window.location.hostname == "zoff.no") number = 47;
						else number = 65;
						window.fromChannel = true;
			      		//$("#scripts").append($($(e)[number]).html());
			      		var scriptScript   = document.createElement('script');
			          	scriptScript.type  = "text/javascript";
			          	scriptScript.src   = "/static/dist/frontpage.min.js";
			          	//scriptScript.async = true;
			          	//$.holdReady( true );
			          	scriptScript.onreadystatechange = scriptScript.onload = function() {
			            	window.initfp();
			          	}
			          	document.getElementById("scripts").appendChild(scriptScript);
			      	}

			      	if($("#alreadychannel").length == 0){
			      		$("head").append("<div id='alreadychannel'></div")
			      	}
			      	$("#channel-load").css("display", "none");
				//}, 1000);

				document.title = "Zöff";


		    }
		});
	}
}