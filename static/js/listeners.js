var chan 				  = $("#chan").html();
var w_p 				  = true;
var hasadmin			  = 0;
var showToggle 			  = true;
var list_html 			  = $("#list-song-html").html();
var blink_interval_exists = false;
var unseen 			   	  = false;
var timer 			   	  = 0;
var api_key 		   	  = "AIzaSyBSxgDrvIaKR2c_MK5fk6S01Oe7bd_qGd8";
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

var connection_options = {
	'sync disconnect on unload':true
};

if(window.location.hostname == "zoff.no") add = "dev.zoff.no";
else add = "localhost";
var socket = io.connect('http://'+add+':8880', connection_options);
socket.on("get_list", function(){
    socket.emit('list', chan.toLowerCase());
});

$(document).ready(function()
{
	window.vote 		  = List.vote;
	window.submit 		  = Search.submit;
	window.submitAndClose = Search.submitAndClose;

	if(!localStorage["list_update"] || localStorage["list_update"] != "13.06.15")
	{
		localStorage.setItem("list_update", "13.06.15");
		window.location.reload(true);
	}
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

	if(window.mobilecheck()){
		document.getElementById("search").blur();
		Youtube.readyLooks();
	}else{

		Chat.setup_chat_listener(chan);
		Chat.allchat_listener();
		Hostcontroller.host_listener();
		Youtube.loadPlayer();
		window.onYouTubeIframeAPIReady = Youtube.onYouTubeIframeAPIReady;

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