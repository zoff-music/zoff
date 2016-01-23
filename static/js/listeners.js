var chan 				  = $("#chan").html();
var w_p 				  = true;
var hasadmin			  = 0;
var showToggle 			  = true;
var list_html 			  = $("#list-song-html").html();
var blink_interval_exists = false;
var unseen 			   	  = false;
var timer 			   	  = 0;
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

var id;
var full_playlist;
var conf;
var blink_interval;
var tag;
var firstScriptTag;
var ytplayer;
var title;
var viewers;
var video_id;
var list;
var seekTo;
var song_title;
var previous_video_id;
var connection_options = {
	'sync disconnect on unload':true,
	'secure': true,
	'force new connection': true 
};

if(window.location.hostname == "zoff.no") add = "https://zoff.no";
else add = "localhost";
var socket = io.connect(''+add+':8880', connection_options);
socket.on("get_list", function(){
    setTimeout(function(){socket.emit('list', chan.toLowerCase())},1000);
});

socket.on("suggested", function(params){
	console.log(params);
	var single = true;
	if(params.id == undefined)
		single = false;
	setTimeout(function(){Suggestions.catchUserSuggests(params, single)}, 1000);
});

$(document).ready(function()
{
	setTimeout(function(){
	//window.vote 		  = List.vote;
	//window.submit 		  = Search.submit;
	//window.submitAndClose = Search.submitAndClose;

	if(!localStorage["list_update"] || localStorage["list_update"] != "13.06.15")
	{
		localStorage.setItem("list_update", "13.06.15");
		window.location.reload(true);
	}
	console.log(Youtube);
    Youtube.setup_youtube_listener(chan);
    Admin.admin_listener();
	List.channel_listener();
	List.skipping_listener();

	$("#settings").sideNav({
      menuWidth: 300, // Default is 240
      edge: 'right', // Choose the horizontal origin
      closeOnClick: false // Closes side-nav on <a> clicks, useful for Angular/Meteor
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

	if(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream){
		document.getElementById("search").blur();
		Youtube.readyLooks();
	}else{
		Chat.setup_chat_listener(chan);
		Chat.allchat_listener();
		Hostcontroller.host_listener();
		window.onYouTubeIframeAPIReady = Youtube.onYouTubeIframeAPIReady;
		Youtube.loadPlayer();

		$("#chat-btn").sideNav({
			menuWidth: 272, // Default is 240
			edge: 'left', // Choose the horizontal origin
			closeOnClick: false // Closes side-nav on <a> clicks, useful for Angular/Meteor
		});

		$(".drag-target")[1].remove();

		if(!Helper.msieversion()) Notification.requestPermission();
		if(navigator.userAgent.toLowerCase().indexOf("firefox") > -1) //quickdickfix for firefoxs weird percent handling
			$(".main").height(window.innerHeight-64);

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

  	$( "#results" ).hover( function() { $("div.result").removeClass("hoverResults"); i = 0; }, function() { });
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

		if (event.keyCode != 40 && event.keyCode != 38 && event.keyCode != 13 && event.keyCode != 39 && event.keyCode != 37) {
			if(search_input.length < 3){$("#results").html("");}
			if(event.keyCode == 13){
			 	Search.search(search_input);
			}else{
				i = 0;
				timer=100;
			}
		}


	});

	setInterval(function(){
		timer--;
		if(timer===0){
			Search.search($(".search_input").val());
		}
	}, 1);
	}, 1000);
});

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
	ytplayer.playVideo();
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

document.getElementById("chat-btn").addEventListener("click", function(){
    $("#text-chat-input").focus();
    //$("#chat-btn").css("color", "white");
    $("#chat-btn i").css("opacity", 1);
    clearInterval(blink_interval);
    blink_interval_exists = false;
    unseen = false;
    $("#favicon").attr("href", "static/images/favicon.png");
});

$(".chat-tab").click(function(){
    $("#text-chat-input").focus();
});


$("#skip").on("click", function(){
  List.skip();
});

$("#chan").on("click", function(){
  List.show();
});

$("#adminForm").on("submit", function(){
  Admin.pass_save();
});

$("#chatForm").on("submit", function(){
  Chat.chat(document.getElementById("chatForm").input);
});

$("#shuffle").on("click", function()
{
  Admin.shuffle();
});

$("#search-btn").on("click", function()
{
  Search.showSearch();
});

$("#song-title").on("click", function()
{
  Search.showSearch();
});

$("#admin-lock").on("click", function()
{
  Admin.log_out();
});

$("#closeSettings").on("click", function()
{
  Admin.hide_settings();
});

$("#results").on( "click", "#temp-results", function(e){
	if($(e.target).html() != $("<i class='mdi-av-playlist-add'></i>").html()){
		var id 		= $(this).attr("data-video-id");
		var title 	= $(this).attr("data-video-title");
		var length 	= $(this).attr("data-video-length");
		
		Search.submitAndClose(id, title, length);
	}
});

$("#results").on( "click", "#add-many", function(e){
	var id 		= $(this).attr("data-video-id");
	var title 	= $(this).attr("data-video-title");
	var length 	= $(this).attr("data-video-length");

	Search.submit(id, title, length);
});

$("#wrapper").on( "click", ".vote-container", function(e){
	var id = $(this).attr("data-video-id");
	List.vote(id, "pos");
});

$("#wrapper").on( "click", "#del", function(e){
	var id = $(this).attr("data-video-id");
	List.vote(id, "del");
});

$("#suggestions").on( "click", ".add-suggested", function(e){
	var id 		= $(this).attr("data-video-id");
	var title 	= $(this).attr("data-video-title");
	var length 	= $(this).attr("data-video-length");


	Search.submit(id, title, length);
	$("#suggested-" + id).remove();
});

$("#suggestions").on( "click", "#del_suggested", function(e){
	var id = $(this).attr("data-video-id");

	$("#suggested-" + id).remove();
});

$("#suggestions").on( "click", "#del_user_suggested", function(e){
	var id = $(this).attr("data-video-id");
	$("#suggested-" + id).remove();
	List.vote(id, "del");
});

$(document).on('click', '#toast-container', function(){
  $(this).fadeOut(function(){
        $(this).remove();
    });
});

$(".brand-logo").click(function(e){
	e.preventDefault();
	console.log("Hellooo");
	onepage_load();
});

window.onpopstate = function(e){
	onepage_load();
}

function onepage_load(){
	var url_split = window.location.href.split("/");

	if(url_split[3] == "" || url_split[3].substring(0,1) == "#"){
		$.ajax({
		    url: "php/nochan_content.php",
		    success: function(e){
		    	ytplayer.destroy();
		    	Playercontrols.clearDurationInterval();

		    	socket.disconnect();

		    	document.getElementById("volume-button").removeEventListener("click", Playercontrols.mute_video);
    			document.getElementById("playpause").removeEventListener("click", Playercontrols.play_pause);
    			document.getElementById("fullscreen").removeEventListener("click", Playercontrols.fullscreen);

    			delete ytplayer
		    	delete Admin
		    	delete Chat
		    	delete Crypt
		    	delete Hostcontroller
		    	delete Playercontrols
		    	delete List
		    	delete Search
		    	delete Suggestions
		    	delete Youtube
		    	delete chan;
				delete w_p;
				delete hasadmin;
				delete showToggle;
				delete list_html;
				delete blink_interval_exists;
				delete unseen;
				delete timer;
				delete api_key;
				delete result_html;
				delete empty_results_html;
				delete searching;
				delete time_regex;
				delete conf;
				delete music;
				delete frontpage;
				delete adminpass;
				delete filesadded;
				delete player_ready;
				delete viewers;
				delete paused;
				delete playing;
				delete SAMPLE_RATE;
				delete lastSample;
				delete began;
				delete i;
				delete id;
				delete full_playlist;
				delete conf;
				delete blink_interval;
				delete tag;
				delete firstScriptTag;
				delete ytplayer;
				delete title;
				delete viewers;
				delete video_id;
				delete list;
				delete seekTo;
				delete song_title;
				delete previous_video_id;
				delete connection_options;
				delete socket;
				delete window.onYouTubeIframeAPIReady;

		    	$("main").attr("class", "center-align container");
		    	$("body").attr("id", "");
		      	$("header").html($($(e)[0]).html());
		      	$($(e)[2]).insertAfter("header");
		      	$($(e)[4]).insertAfter(".mega");
		      	$("main").html($($(e)[6]).html());

		      	removejscssfile("main.min", "js");

		      	$("#scripts").html($($(e)[8]).html());

		    }
		});
}

	function removejscssfile(filename, filetype){
    var targetelement=(filetype=="js")? "script" : (filetype=="css")? "link" : "none" //determine element type to create nodelist from
    var targetattr=(filetype=="js")? "src" : (filetype=="css")? "href" : "none" //determine corresponding attribute to test for
    var allsuspects=document.getElementsByTagName(targetelement)
    for (var i=allsuspects.length; i>=0; i--){ //search backwards within nodelist for matching elements to remove
    if (allsuspects[i] && allsuspects[i].getAttribute(targetattr)!=null && allsuspects[i].getAttribute(targetattr).indexOf(filename)!=-1)
        allsuspects[i].parentNode.removeChild(allsuspects[i]) //remove element by calling parentNode.removeChild()
    }
}
}