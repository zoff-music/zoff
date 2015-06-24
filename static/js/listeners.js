var chan = $("#chan").html();
var w_p = true;
var hasadmin=0;
var list;
var showToggle =true;
var list_html = $("#list-song-html").html();
var full_playlist;
var conf;
var blink_interval;
var blink_interval_exists = false;
var unseen = false;
var timer = 0;
var api_key = "AIzaSyBSxgDrvIaKR2c_MK5fk6S01Oe7bd_qGd8";
var result_html = $("#temp-results-container");
var searching = false
var time_regex = /P((([0-9]*\.?[0-9]*)Y)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)W)?(([0-9]*\.?[0-9]*)D)?)?(T(([0-9]*\.?[0-9]*)H)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)S)?)?/
var tag;
var firstScriptTag;
var ytplayer;
var title;
var viewers;
var video_id;
var conf = [];
var music = 0;
var frontpage = 1;
var adminpass = "";
var filesadded="";
var player_ready = false;
var seekTo;
var song_title;
var viewers = 1;
var paused = false;
var playing = false;
var SAMPLE_RATE = 6000; // 6 seconds
var lastSample = Date.now();
var began = false;
var id;

var socket = io.connect('//'+window.location.hostname+':3000');
socket.on("get_list", function(){
    socket.emit('list', chan.toLowerCase());
});

window.mobilecheck = function() {
var check = false;
(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true;})(navigator.userAgent||navigator.vendor||window.opera);
return check; };

$(document).ready(function()
{
	Youtube.loadPlayer();
	window.onYouTubeIframeAPIReady = Youtube.onYouTubeIframeAPIReady;
	window.vote = List.vote;
	window.submit = Search.submit;
	window.submitAndClose = Search.submitAndClose;

	if(!localStorage["list_update"] || localStorage["list_update"] != "13.06.15")
	{
		localStorage.setItem("list_update", "13.06.15");
		window.location.reload(true);
	}
    Youtube.setup_youtube_listener(chan);
    Admin.admin_listener();
    Chat.setup_chat_listener(chan);
	Chat.allchat_listener();
	List.channel_listener();
	List.skipping_listener();
	Hostcontroller.host_listener();

	//Materialize.toast("Passwords have been reset. If anything is not right, please send us a mail @ contact@zoff.no", 10000);
	$("#settings").sideNav({
      menuWidth: 300, // Default is 240
      edge: 'right', // Choose the horizontal origin
      closeOnClick: false // Closes side-nav on <a> clicks, useful for Angular/Meteor
    });

	$("#chat-btn").sideNav({
			menuWidth: 272, // Default is 240
			edge: 'left', // Choose the horizontal origin
			closeOnClick: false // Closes side-nav on <a> clicks, useful for Angular/Meteor
		});

	$(".drag-target")[1].remove();

	//$('#settings-close').sideNav('hide');

	if(!window.mobilecheck() && !Helper.msieversion())
	{
		Notification.requestPermission();
	}

	if(window.mobilecheck()){
		document.getElementById("search").blur();
		readyLooks();
	}else{

		if(localStorage[chan.toLowerCase()])
		{
			//localStorage.removeItem(chan.toLowerCase());
			if(localStorage[chan.toLowerCase()].length != 64)
				localStorage.removeItem(chan.toLowerCase());
			else
				socket.emit("password", [localStorage[chan.toLowerCase()], chan.toLowerCase()]);
		}

		if($("#chan").html().toLowerCase() == "jazz")
		{
			//loadjsfile("static/js/jazzscript.js");
			//peis = true;
		}
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
		}else if(event.keyCode == 13)
		{
			pId = search_input.split("list=");
			if(pId.length > 1)
			{
				playlist_url = "https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=40&key="+api_key+"&playlistId="+pId[1];
				$.ajax({
					type: "GET",
					url: playlist_url,
					dataType:"jsonp",
					success: function(response)
					{
						var ids="";
						$.each(response.items, function(i,data)
						{
							ids+=data.contentDetails.videoId+",";
						});
						addVideos(ids);
						document.getElementById("search").value = "";
					}
				});
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
    $(".main").removeClass("blurT");
    $("#controls").removeClass("blurT");
    $(".main").removeClass("clickthrough");
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

  else if ($("div.result").length > 2){

      if (e.keyCode == 40) {
        if(i < $("div.result").length -2)
          i++;
        $("div.result:nth-child("+(i-1)+")").removeClass("hoverResults");
        $("div.result:nth-child("+i+")").addClass("hoverResults");
      } else if (e.keyCode == 38) {
        $("div.result:nth-child("+i+")").removeClass("hoverResults");
        $("div.result:nth-child("+(i-1)+")").addClass("hoverResults");
        if(i > 1)
          i--;
      } else if(e.keyCode == 13) {
        i = 0;
        var elem = document.getElementsByClassName("hoverResults")[0];
      if (typeof elem.onclick == "function") {
          elem.onclick.apply(elem);
      }
        $("div.hoverResults").removeClass("hoverResults");
        $("#results").html('');
        document.getElementById("search").value = "";
        $(".main").removeClass("blurT");
      $("#controls").removeClass("blurT");
      $(".main").removeClass("clickthrough");
      }
  }
});

$('input[class=conf]').change(function()
{
    Admin.save();
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