(function(){

  var chan = $("#chan").html();
  var w_p = true;
  var hasadmin=0;
  var list;
  var toSend = "";
  var sendURL;
  var showToggle =true;
  var list_html = $("#list-song-html").html();
  var full_playlist;
  var conf;
  var pass_corr = "";
  var blink_interval;
  var blink_interval_exists = false;
  var unseen = false;
  var old_input="";
  var timer = 0;
  var api_key = "AIzaSyBSxgDrvIaKR2c_MK5fk6S01Oe7bd_qGd8";
  var result_html = $("#temp-results-container");
  var searching = false
  var time_regex = /P((([0-9]*\.?[0-9]*)Y)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)W)?(([0-9]*\.?[0-9]*)D)?)?(T(([0-9]*\.?[0-9]*)H)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)S)?)?/
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
  var player_ready = false;
  var seekTo;
  var song_title;
  var viewers = 1;
  var paused = false;
  var playing = false;
  var SAMPLE_RATE = 6000; // 6 seconds
  var lastSample = Date.now();
  var guid = "mockvalue";
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

  console.log("asd");

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
  				socket.emit("password", [localStorage[chan.toLowerCase()], chan.toLowerCase(), guid]);
  		}

  		if($("#chan").html().toLowerCase() == "jazz")
  		{
  			//loadjsfile("static/js/jazzscript.js");
  			//peis = true;
  		}
  		if(navigator.userAgent.toLowerCase().indexOf("firefox") > -1) //quickdickfix for firefoxs weird percent handling
  			$(".main").height(window.innerHeight-64);

  		git_info = $.ajax({ type: "GET",
  				url: "https://api.github.com/repos/nixolas1/zoff/commits",
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
  			//console.log(search_input);
  			//console.log(search_input.split("list=")[1]);
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

  /*****************************
  ******************************
  ******************************
  ******************************
  ******************************
    List
  ******************************
  ******************************
  ******************************
  ******************************
  ******************************
  *****************************/

  var List = {

    channel_listener: function()
    {
    	socket.on(chan.toLowerCase(), function(msg){
    		List.channel_function(msg);
    	});
    },

    channel_function: function(msg)
    {
    	//console.log(msg);
    	if(msg[0] == "list")
    	{
    		full_playlist = msg[1];
    		var index_of_conf = List.getIndexOfConf(full_playlist);
    		conf = full_playlist[index_of_conf];
    		full_playlist.splice(index_of_conf, 1);
    		full_playlist.sort(Helper.predicate({
    	    name: 'votes',
    	    reverse: true
      		}, 'added'));
    		List.set_conf(conf);
    		List.populate_list(full_playlist);
    	}else if(msg[0] == "added")
    	{
    		full_playlist.push(msg[1]);
    		full_playlist.sort(Helper.predicate({
    	    name: 'votes',
    	    reverse: true
      		}, 'added'));

    		List.insertAtIndex(List.getIndexOfSong(msg[1].id), msg[1], true);

    		setTimeout(function(){
    			var test = $("#wrapper").children()[List.getIndexOfSong(msg[1].id)];
    			$(test).css("height", 66);
    		},0);

    	}else if(msg[0] == "deleted")
    	{
    		var to_delete = $("#wrapper").children()[List.getIndexOfSong(msg[1])];
    		to_delete.style.height = 0;
    		setTimeout(function()
    		{
    			$("#"+msg[1]).remove();
    			full_playlist.splice(List.getIndexOfSong(msg[1]), 1);
    		}, 1050);
    	}else if(msg[0] == "vote")
    	{
    		var index_of_song = List.getIndexOfSong(msg[1]);
    		full_playlist[index_of_song].votes += 1;
    		full_playlist[index_of_song].added = msg[2];
    		full_playlist.sort(Helper.predicate({
    	    name: 'votes',
    	    reverse: true
      		}, 'added'));
    		List.populate_list(full_playlist, false);
    	}else if(msg[0] == "song_change")
    	{

    		full_playlist[0].now_playing = true;
    		full_playlist[0].votes = 0;
    		full_playlist[0].guids = [];
    		full_playlist[0].added = msg[1];
    		full_playlist[full_playlist.length-1].now_playing = false;
    		/*full_playlist.sort(predicate({
    	    name: 'votes',
    	    reverse: true
      		}, 'added'));
    		*/
    		full_playlist.push(full_playlist.shift());
    		$("#wrapper").children()[0].remove();
    		List.insertAtIndex($("#wrapper").children().length, full_playlist[full_playlist.length-2], false);
    		//populate_list(full_playlist);
    	}
    },

    skipping_listener: function(){
    	socket.on("skipping", function(obj)
    	{
    		document.getElementById("pBar").innerHTML = "Vote registrated! "+obj[0]+" of "+obj[1]+" has skipped. "+(Math.ceil(obj[1]/2))+" or more is needed!";
    		$("#pBar").addClass("opacityFull");
    		setTimeout(function(){
    			$("#pBar").removeClass("opacityFull");
    		},1500);
    	});
    },

    set_conf: function(conf_array)
    {
    	if(conf_array['adminpass'] == "" || w_p == false) hasadmin = false;
    	else hasadmin = true;
    	music = conf_array["allvideos"];
    	longsongs = conf_array["longsongs"];
    	names=["vote","addsongs","longsongs","frontpage", "allvideos", "removeplay", "skip", "shuffle"];
    	for (var i = 0; i < names.length; i++) {
    		document.getElementsByName(names[i])[0].checked = (conf_array[names[i]] === true);
    		if(hasadmin)
    			$("input[name="+names[i]+"]").attr("disabled", true);
    	}
    },

    populate_list: function(msg)
    {
    		$("#wrapper").empty();

    		$.each(msg, function(j, listeID){
    			if(!listeID.now_playing){ //check that the song isnt playing

    				var video_title=decodeURIComponent(listeID.title);
    				var video_id = listeID.id;
    				var video_thumb = "background-image:url('//img.youtube.com/vi/"+video_id+"/mqdefault.jpg');";
    				//var delsong = ""; if(pass_corr=="correct");
    				var video_votes = listeID.votes;
    				$("#wrapper").append(list_html);
    				var song = $("#list-song");
    				song.find(".list-title").text(video_title);
    				song.find(".list-title").attr("title", video_title);
    				song.find(".list-votes").text(video_votes);
    				song.find(".vote-container").attr("onclick", "vote('"+video_id+"','pos')");
    				song.find(".list-image").attr("style",video_thumb);
    				song.attr("id",video_id);
    				song.find("#del").attr("onclick", "vote('"+video_id+"', 'del')");
    				if(!w_p) $(".card-action").removeClass("hide");
    				if(video_votes==1)song.find(".vote-text").text("vote");
    			}
    		});


    		$("#settings").css("visibility", "visible");
    		$("#settings").css("opacity", "1");
    		$("#wrapper").css("opacity", "1");

    		full_playlist = msg;
    		full_playlist = full_playlist.sort(Helper.predicate({
    	    name: 'votes',
    	    reverse: true
      		}, 'added'));
    },

    vote: function(id, vote){
    	socket.emit('vote', [chan, id, vote, guid, adminpass]);
    	return true;
    },

    skip: function(){
    	socket.emit('skip', [chan, guid, localStorage[chan.toLowerCase()]]);
    	return true;
    },

    importOldList: function(chan){
    	playlist_url = "lists/"+chan+".json";

    	list = $.ajax({
    		type: "GET",
    		url: playlist_url,
    		async: false
    	}).responseText;
    	list = $.parseJSON(list);
    	var ids="";
    	var num=0;
    	$.each(list.songs, function(i,data)
    	{
    		ids+=data.id+",";
    		if(num>45){
    			Search.addVideos(ids);
    			ids="";
    			num=0;
    		}
    		num++;
    	});

    	Search.addVideos(ids);
    	document.getElementById("search").value = "";
    },

    show: function(){
    	if(!window.mobilecheck())
    	{
    		if(showToggle){
    	    	showToggle=false;
    	    	$("#toptitle").empty();
    	        $("#chan").addClass("bigChan");
    	        //$("#chan").html("zoff.no/"+encodeURI(chan));
    	        $("#chan").html("zoff.no/"+chan.toLowerCase());
    	    }else{
    	    	showToggle=true;
    	    	$("#toptitle").html("Zöff");
    	    	$("#chan").removeClass("bigChan");
    	    	$("#chan").html(chan);
    	   }
    	}
    },

    insertAtIndex: function(i, song_info, transition) {
        if(i === 0) {
         	$("#wrapper").prepend(List.generateSong(song_info, transition));
    			return;
        }

        $("#wrapper > div:nth-child(" + (i) + ")").after(List.generateSong(song_info, transition));

    },

    generateSong: function(song_info, transition)
    {
    	var video_id = song_info.id;
    	var video_title = song_info.title;
    	var video_votes = song_info.votes;
    	var video_thumb = "background-image:url('//img.youtube.com/vi/"+video_id+"/mqdefault.jpg');";

    	var song = $("<div>"+list_html+"</div>");
    	if(transition) song.find("#list-song").css("height", 0);
    	song.find(".list-title").text(video_title);
    	song.find(".list-title").attr("title", video_title);
    	song.find(".list-votes").text(video_votes);
    	song.find(".vote-container").attr("onclick", "vote('"+video_id+"','pos')");
    	song.find(".list-image").attr("style",video_thumb);
    	song.find("#list-song").attr("id", video_id);
    	song.find("#del").attr("onclick", "vote('"+video_id+"', 'del')");
    	if(!w_p) song.find(".card-action").removeClass("hide");
    	if(video_votes == 1)song.find(".vote-text").text("vote");

    	return song.html();
    },

    getIndexOfSong: function(id)
    {
    	indexes = $.map(full_playlist, function(obj, index) {
    	    if(obj.id == id) {
    	        return index;
    	    }
    	});
    	return indexes[0];
    },

    getIndexOfConf: function(flist)
    {
    	indexes = $.map(flist, function(obj, index) {
    	    if("views" in obj) {
    	        return index;
    	    }
    	});
    	return indexes[0];
    }
  }

  /*****************************
  ******************************
  ******************************
  ******************************
  ******************************
    Admin
  ******************************
  ******************************
  ******************************
  ******************************
  ******************************
  *****************************/

  var Admin = {

    admin_listener: function()
    {
    	socket.on("toast", function(msg)
    	{
    		console.log("Got message from server: "+msg);
    		pass_corr = "correct";
    		switch(msg) {
    			case "addedsong":
    				msg=Helper.rnd(["I added your song", "Your song has been added", "Yay, more songs!", "Thats a cool song!", "I added that song for you", "I see you like adding songs..."])
    				break;
    		    case "savedsettings":
    		        msg=Helper.rnd(["I've saved your settings", "I stored all your settings", "Your settings have been stored in a safe place"])
    		        break;
    		    case "wrongpass":
    		        msg=Helper.rnd(["That's not the right password!", "Wrong! Better luck next time...", "You seem to have mistyped the password", "Incorrect. Have you tried meditating?","Nope, wrong password!", "Wrong password. The authorities have been notified."])
    						if(localStorage[chan.toLowerCase()]){
    							localStorage.removeItem(chan.toLowerCase());
    						}
    						break;
    			case "shuffled":
    		        msg=Helper.rnd(["♫ You stir me right round, baby. ♫","♫ Stir, stir, stir my boat ♫","I vigorously stirred your playlist!", "I hope you like your list stirred, not shaken.", "I shuffled your playlist with the cosmic background radiation as a seed. Enjoy.", "100% randomized, for your listening pleasure!", "I hope you enjoy your fresh playlist!"])
    		        break;
    			case "deletesong":
    		        msg=Helper.rnd(["Your song is now in a better place...", "You won't be seeing any more of that video...", "EXTERMINATE! EXTERMINATE! EXTERMINATE!", "I killed it with fire", "Thanks for deleting that song. I didn't like it anyways...", "Removed song securely."])
    		        break;
    			case "voted":
    				msg=Helper.rnd(["You voted!", "You vote like a boss", "Voting is the key to democracy", "May you get your song to the very top!", "I love that song! I vouch for you.", "Only you vote that good", "I like the way you vote...", "Up the video goes!", "Voted Zöff for president", "Only 999 more to go!"])
    				break;
    			case "alreadyvoted":
    		        msg=Helper.rnd(["You can't vote twice on that song!", "I see you have voted on that song before", "One vote per person!", "I know you want to hear your song, but have patience!", "I'm sorry, but I can't let you vote twice, Dave."])
    		        break;
    		    case "skip":
    				msg=Helper.rnd(["The song was skipped", "I have skipped a song", "Skipped to the beat", "Skipmaster3000", "They see me skippin', they hatin'"])
    				break;
    			case "listhaspass":
    				msg=Helper.rnd(["I'm sorry, but you have to be an admin to do that!", "Only admins can do that", "You're not allowed to do that, try logging in!", "I can't let you do that", "Please log in to do that"])
    				break;
    			case "noskip":
    				msg=Helper.rnd(["Only Admins can skip songs, peasant!", "You have to log in to skip songs on this channel", "Try clicking the settings icon and logging in before you skip"])
    				break;
    			case "alreadyskip":
    				msg=Helper.rnd(["Skipping is democratic, only one vote per person!", "More people have to vote to skip, not just you!", "Get someone else to skip too! You can't do it on yourself."])
    				break;
    			case "notyetskip":
    				msg="Skipping is disabled the first 10 seconds.";
    				break;
    		}
    		Materialize.toast(msg, 4000);
    	});


    	socket.on("pw", function(msg)
    	{
    		w_p = false;
    		adminpass = msg;
    		names=["vote","addsongs","longsongs","frontpage", "allvideos", "removeplay", "skip", "shuffle"];
    		for (var i = 0; i < names.length; i++) {
    				$("input[name="+names[i]+"]").attr("disabled", false);
    		}
    		$(".card-action").removeClass("hide");

    		$("#admin-lock").removeClass("mdi-action-lock");
    		$("#admin-lock").addClass("mdi-action-lock-open clickable");
    		localStorage.setItem(chan.toLowerCase(), msg);
    		Materialize.toast("Correct password. You now have access to the sacred realm of The Admin.", 4000);
    	});

    	socket.on("conf", function(msg)
    	{
    		List.set_conf(msg[0]);
    	});
    },

    pass_save: function()
    {
    	socket.emit('password', [CryptoJS.SHA256(document.getElementById("password").value).toString(), chan.toLowerCase(), guid]);
    },

    log_out: function(){
    	if(localStorage[chan.toLowerCase()]){
    		localStorage.removeItem(chan.toLowerCase());
    		Admin.display_logged_out();
    		Materialize.toast("Logged out", 4000);
    	}else{
    		Materialize.toast("Not logged in", 4000);
    	}
    },

    display_logged_out: function()
    {
    	w_p = true;
    	names=["vote","addsongs","longsongs","frontpage", "allvideos", "removeplay", "skip", "shuffle"];
    	for (var i = 0; i < names.length; i++) {
    			$("input[name="+names[i]+"]").attr("disabled", true);
    	}
    	if(!Helper.contains($("#admin-lock").attr("class").split(" "), "mdi-action-lock"))
    		$("#admin-lock").addClass("mdi-action-lock");
    	$("#admin-lock").removeClass("mdi-action-lock-open clickable");
    	if($(".card-action").length != 0 && !Helper.contains($(".card-action").attr("class").split(" "), "hide"))
    		$(".card-action").addClass("hide");
    	adminpass = "";
    	document.getElementById("password").value = "";
    },

    //function used in html onlick
    save: function(){
    	Admin.submitAdmin(document.getElementById("adminForm").elements);
    },

    submitAdmin: function(form)
    {
    	voting = form.vote.checked;
    	addsongs = form.addsongs.checked;
    	longsongs = form.longsongs.checked;
    	frontpage = form.frontpage.checked;
    	allvideos = form.allvideos.checked;
    	removeplay = form.removeplay.checked;
    	//adminpass = document.getElementById("password").value;
    	skipping = form.skip.checked;
    	shuffling = form.shuffle.checked;

    	configs = [voting, addsongs, longsongs, frontpage, allvideos, removeplay, adminpass, skipping, shuffling];
    	socket.emit("conf", configs);
    },

    hide_settings: function(){
    	$('#settings').sideNav('hide');
    },

    remove_bar: function()
    {
    	setTimeout(function(){
    		$("#adminPanel").removeClass("success");
    		$("#adminPanel").removeClass("fadeerror");
    		$("#eBar").removeClass("opacityFull");
    		$("#sBar").removeClass("opacityFull");
    	},1500);
    },

    shuffle: function()
    {
    	socket.emit('shuffle', adminpass !== undefined ? adminpass : "");
    }

  }

  /*****************************
  ******************************
  ******************************
  ******************************
  ******************************
    Chat
  ******************************
  ******************************
  ******************************
  ******************************
  ******************************
  *****************************/

  var Chat = {

    chat: function(data)
    {
      if(data.value.length > 150)
        return;
      if($(".tab a.active").attr("href") == "#all_chat")
        socket.emit("all,chat", data.value);
    	else
        socket.emit("chat", data.value);
      data.value = "";
      return;
    },

    allchat_listener: function()
    {
      socket.on("chat.all", function(inp)
      {

        if($("#chat-bar").position()["left"] != 0)
        {
          //$("#chat-btn").css("color", "grey");
          if(!blink_interval_exists)
          {
            $("#favicon").attr("href", "static/images/highlogo.png");
            blink_interval_exists = true;
            unseen = true;
            blink_interval = setInterval(Chat.chat_blink, 2000);
          }
        }else if(document.hidden)
        {
          $("#favicon").attr("href", "static/images/highlogo.png");
          unseen = true;
        }
        var color = Helper.intToARGB(Helper.hashCode(inp[0])).substring(0,6);
      	$("#chatall").append("<li title='"+inp[2]+"'><span style='color:#"+color+";'>"+inp[0]+"</span></li>");
        var in_text = document.createTextNode(inp[1]);
        $("#chatall li:last")[0].appendChild(in_text);
        document.getElementById("chatall").scrollTop = document.getElementById("chatall").scrollHeight
      });
    },

    setup_chat_listener: function(channel)
    {
      document.getElementsByClassName("chat-tab")[0].innerHTML = channel;
      socket.on("chat", function(data)
      {
        if($("#chat-bar").position()["left"] != 0)
        {
          if(data[1].indexOf(":") >= 0){
            //$("#chat-btn").css("color", "grey");
            if(!blink_interval_exists)
            {
              $("#favicon").attr("href", "static/images/highlogo.png");
              blink_interval_exists = true;
              blink_interval = setInterval(Chat.chat_blink, 2000);
            }
          }
        }
        var color = Helper.intToARGB(Helper.hashCode(data[0])).substring(0,6);
      	$("#chatchannel").append("<li><span style='color:#"+color+";'>"+data[0]+"</span></li>");
        var in_text = document.createTextNode(data[1]);
        $("#chatchannel li:last")[0].appendChild(in_text);
        document.getElementById("chatchannel").scrollTop = document.getElementById("chatchannel").scrollHeight
      });
    },

    chat_blink: function()
    {
      $("#chat-btn i").css("opacity", 0.5);
      setTimeout(function(){$("#chat-btn i").css("opacity", 1);}, 1000);
    }

  }

  /*****************************
  ******************************
  ******************************
  ******************************
  ******************************
  Playercontrols
  ******************************
  ******************************
  ******************************
  ******************************
  ******************************
  *****************************/

  var Playercontrols = {

    initYoutubeControls: function(player)
    {
    	setInterval(Playercontrols.durationSetter, 1000);
      Playercontrols.initControls();
    },

    initControls: function()
    {
    	document.getElementById("volume-button").addEventListener("click", Playercontrols.mute_video);
    	document.getElementById("playpause").addEventListener("click", Playercontrols.play_pause);
    	document.getElementById("fullscreen").addEventListener("click", Playercontrols.fullscreen);
    },

    initSlider: function()
    {
    	if(localStorage.volume)
    	{
    		vol = localStorage.getItem("volume");
    	}else{
    		vol = 100;
    		localStorage.setItem("volume", vol);
    	}
    	$("#volume").slider({
    	    min: 0,
    	    max: 100,
    	    value: vol,
    			range: "min",
    			animate: true,
    	    slide: function(event, ui) {
            Playercontrols.setVolume(ui.value);
    				localStorage.setItem("volume", ui.value);
    	    }
    	});
      Playercontrols.choose_button(vol, false);
    	//$("#volume").slider("value", ytplayer.getVolume());
    },

    fullscreen: function()
    {
    	var playerElement = document.getElementById("player");
    	var requestFullScreen = playerElement.requestFullScreen || playerElement.mozRequestFullScreen || playerElement.webkitRequestFullScreen;
      if (requestFullScreen) {
        requestFullScreen.bind(playerElement)();
      }
    },

    play_pause: function()
    {
    	if(ytplayer.getPlayerState() == 1)
    	{
    		ytplayer.pauseVideo();
    	}else if(ytplayer.getPlayerState() == 2 || ytplayer.getPlayerState() == 0)
    	{
    		ytplayer.playVideo();
    	}
    },

    settings: function()
    {
    	$("#qS").toggleClass("hide");
    },

    changeQuality: function(wantedQ)
    {
    	//wantedQ = this.getAttribute("name");
    	//console.log("Change quality");
    	//console.log(wantedQ);
    	if(ytplayer.getPlaybackQuality != wantedQ)
    	{
    		ytplayer.setPlaybackQuality(wantedQ);
    		ytplayer.getPlaybackQuality();
    	}
    	$("#qS").toggleClass("hide");
    },

    mute_video: function()
    {
    	if(!ytplayer.isMuted())
    	{
        Playercontrols.choose_button(0, true);
    		ytplayer.mute();
    	}else
    	{
    		ytplayer.unMute();
        Playercontrols.choose_button(ytplayer.getVolume(), false);
    	}
    },

    setVolume: function(vol)
    {
    	ytplayer.setVolume(vol);
      Playercontrols.choose_button(vol, false);
    	if(ytplayer.isMuted())
    		ytplayer.unMute();
    },

    choose_button: function(vol, mute)
    {
    	if(!mute){
    		if(vol >= 0 && vol <= 33){
    			if(document.getElementById("v-full").className.split(" ").length == 1)
    				$("#v-full").toggleClass("hide");
    			if(document.getElementById("v-medium").className.split(" ").length == 1)
    				$("#v-medium").toggleClass("hide");
    			if(document.getElementById("v-low").className.split(" ").length == 2)
    				$("#v-low").toggleClass("hide");
    			if(document.getElementById("v-mute").className.split(" ").length == 1)
    				$("#v-mute").toggleClass("hide");
    		}else if(vol >= 34 && vol <= 66){
    			if(document.getElementById("v-full").className.split(" ").length == 1)
    				$("#v-full").toggleClass("hide");
    			if(document.getElementById("v-medium").className.split(" ").length == 2)
    				$("#v-medium").toggleClass("hide");
    			if(document.getElementById("v-low").className.split(" ").length == 1)
    				$("#v-low").toggleClass("hide");
    			if(document.getElementById("v-mute").className.split(" ").length == 1)
    				$("#v-mute").toggleClass("hide");
    		}else if(vol >= 67 && vol <= 100){
    			if(document.getElementById("v-full").className.split(" ").length == 2)
    				$("#v-full").toggleClass("hide");
    			if(document.getElementById("v-medium").className.split(" ").length == 1)
    				$("#v-medium").toggleClass("hide");
    			if(document.getElementById("v-low").className.split(" ").length == 1)
    				$("#v-low").toggleClass("hide");
    			if(document.getElementById("v-mute").className.split(" ").length == 1)
    				$("#v-mute").toggleClass("hide");
    		}
    	}else
    	{
    		if(document.getElementById("v-full").className.split(" ").length == 1)
    			$("#v-full").toggleClass("hide");
    		if(document.getElementById("v-medium").className.split(" ").length == 1)
    			$("#v-medium").toggleClass("hide");
    		if(document.getElementById("v-low").className.split(" ").length == 1)
    			$("#v-low").toggleClass("hide");
    		if(document.getElementById("v-mute").className.split(" ").length == 2)
    			$("#v-mute").toggleClass("hide");
    	}
    },

    playPause: function()
    {
    	state = ytplayer.getPlayerState();
    	button = document.getElementById("playpause");
    	if(state == 1)
    	{
    		ytplayer.pauseVideo();
    	}else if(state == 2)
    	{
    		ytplayer.playVideo();
    	}
    },

    durationSetter: function()
    {
    	duration = ytplayer.getDuration();
    	dMinutes = Math.floor(duration / 60);
    	dSeconds = duration - dMinutes * 60;
    	currDurr = ytplayer.getCurrentTime();
    	if(currDurr > duration)
    		currDurr = duration;
    	minutes = Math.floor(currDurr / 60);
    	seconds = currDurr - minutes * 60;
    	document.getElementById("duration").innerHTML = Helper.pad(minutes)+":"+Helper.pad(seconds)+" <span id='dash'>/</span> "+Helper.pad(dMinutes)+":"+Helper.pad(dSeconds);
    	per = (100 / duration) * currDurr;
    	if(per >= 100)
    		per = 100;
    	else if(duration == 0)
    		per = 0;
    	$("#bar").width(per+"%");
    },

    volumeOptions: function()
    {
    	if(ytplayer.isMuted())
    	{
    		ytplayer.unMute();
    		vol = ytplayer.getVolume();
    		$("#volume").slider("value", ytplayer.getVolume());
    	}
    	else
    	{
    		ytplayer.mute();
    		$("#volume").slider("value", 0);
    	}
    },

    hoverMute: function(foo)
    {
    	vol = ytplayer.getVolume();

    },

    logQ: function()
    {
    	console.log(ytplayer.getPlaybackQuality());
    }

  }

  /*****************************
  ******************************
  ******************************
  ******************************
  ******************************
    Search
  ******************************
  ******************************
  ******************************
  ******************************
  ******************************
  *****************************/

  var Search = {

    showSearch: function(){
    	$("#search-wrapper").toggleClass("hide");
    	if(window.mobilecheck())
    	{
    		$(".search_input").focus();
    	}
    	$("#song-title").toggleClass("hide");
    	$("#results").toggleClass("hide");
    	$("#results").empty();
    	$("#search-btn i").toggleClass("mdi-navigation-close");
    	$("#search-btn i").toggleClass("mdi-action-search");
    	$("#search").focus();

    },

    search: function(search_input){
      $(".search_results").html('');
      if(window.search_input !== ""){
        searching = true;
        var keyword= encodeURIComponent(window.search_input);

        //response= x
        var yt_url = "https://www.googleapis.com/youtube/v3/search?key="+api_key+"&videoEmbeddable=true&part=id&fields=items(id)&type=video&order=viewCount&safeSearch=none&maxResults=25";
        yt_url+="&q="+keyword;
        if(music)yt_url+="&videoCategoryId=10";

        var vid_url = "https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet,id&key="+api_key+"&id=";

        if(Helper.contains($("#search_loader").attr("class").split(" "), "hide"))
          $("#search_loader").removeClass("hide");

        $.ajax({
          type: "GET",
          url: yt_url,
          dataType:"jsonp",
          success: function(response){
            if(response.items){
            //get list of IDs and make new request for video info
              $.each(response.items, function(i,data)
              {
                vid_url += data.id.videoId+",";
              });
                console.log("Search for: "+keyword)

              $.ajax({
                type: "GET",
                url: vid_url,
                dataType:"jsonp",
                success: function(response){

                  var output = "";
                  var pre_result = $(result_html);

                  //$("#results").append(result_html);

                  $.each(response.items, function(i,song)
                  {
                    var duration=song.contentDetails.duration;
                    secs=Search.durationToSeconds(duration)
                    if(!longsongs || secs<720){
                      title=song.snippet.title;
                      enc_title=encodeURIComponent(title).replace(/'/g, "\\\'");
                      id=song.id;
                      duration = duration.replace("PT","").replace("H","h ").replace("M","m ").replace("S","s")
                      thumb=song.snippet.thumbnails.medium.url;

                      //$("#results").append(result_html);
                      var songs = pre_result;

                      songs.find(".search-title").text(title);
                      songs.find(".result_info").text(duration);
                      songs.find(".thumb").attr("src", thumb);
                      songs.find(".add-many").attr("onclick", "submit('"+id+"','"+enc_title+"',"+secs+");");
                      $($(songs).find("div")[0]).attr("onclick", "submitAndClose('"+id+"','"+enc_title+"',"+secs+");");
                      $($(songs).find("div")[0]).attr("id", id)
                      output += songs.html();

                    }
                  });

                  console.log(response.items.length);

                  $("<div style='display:none;' id='mock-div'>"+output+"</div>").appendTo($("#results")).show("blind", (response.items.length-1) * 83.33);

                  if(!Helper.contains($("#search_loader").attr("class").split(" "), "hide"))
                    $("#search_loader").addClass("hide");

                  $(".add-many").click(function(e) {
                      e.preventDefault();
                      e.stopPropagation();
                      return false;
                  });
                }
              });
            }
          }
        });

      }else{
        $(".main").removeClass("blurT");
        $("#controls").removeClass("blurT");
        $(".main").removeClass("clickthrough");
      }
    },

    submitAndClose: function(id,title,duration){
    	Search.submit(id,title, duration);
    	$("#results").html('');
    	Search.showSearch();
    	console.log("sub&closed");
    	document.getElementById("search").value = "";
    	$("#results").html = "";
    	$(".main").removeClass("blurT");
    	$("#controls").removeClass("blurT");
    	$(".main").removeClass("clickthrough");
    },

    addVideos: function(ids){
    	console.log(ids)
    	var request_url="https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet,id&key=AIzaSyBSxgDrvIaKR2c_MK5fk6S01Oe7bd_qGd8&id=";
    	request_url += ids;

    	$.ajax({
    	type: "POST",
    	url: request_url,
    	dataType:"jsonp",
    	success: function(response){
    		$.each(response.items, function(i,song)
    		{
    			var duration=Search.durationToSeconds(song.contentDetails.duration);
    			if(!longsongs || duration<720){
    				enc_title=encodeURIComponent(song.snippet.title).replace(/'/g, "\\\'");
    				Search.submit(song.id, enc_title, duration);
    			}
    		});

    	}
    	});
    },

    submit: function(id,title,duration){
    	socket.emit("add", [id, decodeURIComponent(title), adminpass, duration]);
    },

    durationToSeconds: function(duration) {
        var matches = duration.match(time_regex);
        hours= parseInt(matches[12])||0,
        minutes= parseInt(matches[14])||0,
        seconds= parseInt(matches[16])||0
        return hours*60*60+minutes*60+seconds;
    }

  }

  /*****************************
  ******************************
  ******************************
  ******************************
  ******************************
    Youtube
  ******************************
  ******************************
  ******************************
  ******************************
  ******************************
  *****************************/

  var Youtube = {

    setup_youtube_listener: function(channel)
    {
    	socket.on("np", function(obj)
    	{
    		//console.log(obj);
    		if(obj[0].length == 0){
    			console.log("Empty list");
    			document.getElementById('song-title').innerHTML = "Empty channel. Add some songs!";
    			$("#player_overlay").height($("#player").height());
    			if(!window.mobilecheck())
    				$("#player_overlay").toggleClass("hide");
    			List.importOldList(channel.toLowerCase());
    		}
    		else{
    			//console.log("gotten new song");
    			$("#player_overlay").addClass("hide");
    			video_id = obj[0][0]["id"];
    			conf = obj[1][0];
    			time = obj[2];
    			seekTo = time - conf["startTime"];
    			song_title = obj[0][0]["title"];

          Youtube.getTitle(song_title, viewers);
    			Youtube.setBGimage(video_id);
    			if(player_ready && !window.mobilecheck())
    			{
    				if(ytplayer.getVideoUrl().split('v=')[1] != video_id)
    				{
    					ytplayer.loadVideoById(video_id);
    					Youtube.notifyUser(video_id, song_title);
    					ytplayer.seekTo(seekTo);
    					if(paused)
    						ytplayer.pauseVideo();
    				}else
    					console.log("like");
    				if(!paused)
    					ytplayer.playVideo();
    				if(ytplayer.getDuration() > seekTo || ytplayer.getDuration() == 0)
    					ytplayer.seekTo(seekTo);
    			}
    			else
            Youtube.getTitle(song_title, viewers);
    		}
    	});

    	socket.on("viewers", function(view)
    	{
    		viewers = view;
    		if(song_title !== undefined)
    			Youtube.getTitle(song_title, viewers);
    	});
    },

    onPlayerStateChange: function(newState) {
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
    },

    getTitle: function(titt, v)
    {
    	var outPutWord = v > 1 ? "viewers" : "viewer";
    	var title= decodeURIComponent(titt);
    	var elem = document.getElementById('song-title');

    	document.title = title + " • Zöff / "+chan;
    		elem.innerHTML = title;
    		document.getElementById('viewers').innerHTML = v + " " + outPutWord;
    		elem.title = title + " • " + v + " " + outPutWord;

    },

    errorHandler: function(newState)
    {
    	var failsafe = ytplayer.getVideoUrl().split("https://www.youtube.com/watch");
    	if(newState.data == 5 || newState.data == 100 || newState.data == 101 || newState.data == 150)
    			socket.emit("skip", newState.data);
    	else if(video_id !== undefined)
    			ytplayer.loadVideoById(video_id);
    },

    onPlayerReady: function(event) {
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
    		Youtube.readyLooks();
    		Playercontrols.initYoutubeControls(ytplayer);
    		Playercontrols.initSlider();
    		ytplayer.setVolume(localStorage.getItem("volume"));
    },

    readyLooks: function()
    {
    	Youtube.setBGimage(video_id);
    },

    setBGimage: function(id){
    	if(id !== undefined)
    	{
    		var img = new Image();
    		img.onload = function () {
    		  var colorThief = new ColorThief();
    			//console.log(rgbToHsl(colorThief.getColor(img)));
    			document.getElementsByTagName("body")[0].style.backgroundColor = Helper.rgbToHsl(colorThief.getColor(img))
    			//$("body").css("background-color", rgbToHsl(colorThief.getColor(img)));
    			//$("body").css("background-color", colorThief.getColor(img));
    		};
    		img.crossOrigin = 'Anonymous';
    		img.src = 'https://cors-anywhere.herokuapp.com/http://img.youtube.com/vi/'+id+'/mqdefault.jpg';
    	}
    },

    notifyUser: function(id, title) {
    	title= title.replace(/\\\'/g, "'").replace(/&quot;/g,"'").replace(/&amp;/g,"&");
      	if (Notification.permission === "granted" && document.hidden && id != "30H2Z8Lr-4c" && !window.mobilecheck()) {
    	    var notification = new Notification("Now Playing", {body: title, icon: "http://i.ytimg.com/vi/"+id+"/mqdefault.jpg", iconUrl: "http://i.ytimg.com/vi/"+id+"/mqdefault.jpg"});
    	    notification.onclick = function(x) { window.focus(); this.cancel(); };
    			setTimeout(function(){
    	    	notification.close();
    	    },5000);
      	}
    },

    setup_all_listeners: function()
    {
    	socket.on("get_list", function(){
    			socket.emit('list', chan);
    	});
    	Youtube.setup_youtube_listener(chan);
    	Admin.admin_listener();
    	Chat.setup_chat_listener(chan);
    	Chat.allchat_listener();
    	List.channel_listener();
    	List.skipping_listener();
    },

    onYouTubeIframeAPIReady: function() {
      ytplayer = new YT.Player('player', {
        videoId: "asd",
        playerVars: { rel:"0", wmode:"transparent", controls: "0" , iv_load_policy: "3", theme:"light", color:"white"},
        events: {
          'onReady': Youtube.onPlayerReady,
          'onStateChange': Youtube.onPlayerStateChange,
          'onError': Youtube.errorHandler
        }
      });
    },

    loadPlayer: function() {
      tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    },

  }


    /***************************
    ******************************
    ******************************
    ******************************
    ******************************
      Hostcontroller
    ******************************
    ******************************
    ******************************
    ******************************
    ******************************
    *****************************/

  var Hostcontroller = {

    host_listener: function() {
      socket.on("id", function(id)
      {
        console.log("Unique remote control ID: " + id);
        var codeURL = "https://"+window.location.hostname+"/remote/"+id;
        $("#code-text").text(id)
        $("#code-qr").attr("src", "https://chart.googleapis.com/chart?chs=221x221&cht=qr&choe=UTF-8&chld=L|1&chl="+codeURL);
        $("#code-link").attr("href", codeURL);
        if(!began)
        {
          began = true;
          socket.on(id, function(arr)
          {
              console.log(arr);
              if(arr[0] == "volume")
              {
                $("#volume").slider("value", arr[1]);
                ytplayer.setVolume(arr[1]);
                localStorage.setItem("volume", arr[1]);
                choose_button(arr[1], false);
              }else if(arr[0] == "channel")
              {
                socket.emit("change_channel");
                socket.removeAllListeners();

                chan = arr[1].toLowerCase();
                $("#chan").html(chan.substring(0,1).toUpperCase()+chan.substring(1).toLowerCase());

                Youtube.setup_youtube_listener(chan);
                Admin.admin_listener();
                Chat.setup_chat_listener(chan);
                Chat.allchat_listener();
                List.channel_listener();
                List.skipping_listener();

                socket.emit("list", chan.toLowerCase()+",unused");

                window.history.pushState("object or string", "Title", "/"+chan.toLowerCase());
              }else if(arr[0] == "pause")
                ytplayer.pauseVideo()
              else if(arr[0] == "play")
                ytplayer.playVideo();
              else if(arr[0] == "skip")
                skip();
          });
        }
      });
    }

  }

  /*****************************
  ******************************
  ******************************
  ******************************
  ******************************
    Helpers
  ******************************
  ******************************
  ******************************
  ******************************
  ******************************
  *****************************/

  var Helper = {
    rnd: function(arr)
    {
    	return arr[Math.floor(Math.random() * arr.length)];
    },

    predicate: function() {
    	var fields = [],
    		n_fields = arguments.length,
    		field, name, reverse, cmp;

    	var default_cmp = function (a, b) {
    			if (a === b) return 0;
    			return a < b ? -1 : 1;
    		},
    		getCmpFunc = function (primer, reverse) {
    			var dfc = default_cmp,
    				// closer in scope
    				cmp = default_cmp;
    			if (primer) {
    				cmp = function (a, b) {
    					return dfc(primer(a), primer(b));
    				};
    			}
    			if (reverse) {
    				return function (a, b) {
    					return -1 * cmp(a, b);
    				};
    			}
    			return cmp;
    		};

    	// preprocess sorting options
    	for (var i = 0; i < n_fields; i++) {
    		field = arguments[i];
    		if (typeof field === 'string') {
    			name = field;
    			cmp = default_cmp;
    		} else {
    			name = field.name;
    			cmp = getCmpFunc(field.primer, field.reverse);
    		}
    		fields.push({
    			name: name,
    			cmp: cmp
    		});
    	}

    	// final comparison function
    	return function (A, B) {
    		var a, b, name, result;
    		for (var i = 0; i < n_fields; i++) {
    			result = 0;
    			field = fields[i];
    			name = field.name;

    			result = field.cmp(A[name], B[name]);
    			if (result !== 0) break;
    		}
    		return result;
    	};
    },

    hashCode: function(str) { // java String#hashCode
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
           hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return hash;
    },

    intToARGB: function(i){
        return ((i>>24)&0xFF).toString(16) +
               ((i>>16)&0xFF).toString(16) +
               ((i>>8)&0xFF).toString(16) +
               (i&0xFF).toString(16);
    },

    pad: function(n)
    {
    	return n < 10 ? "0"+Math.floor(n) : Math.floor(n);
    },


    contains: function(a, obj) {
        var i = a.length;
        while (i--) {
           if (a[i] === obj) {
               return true;
           }
        }
        return false;
    },

    sample: function() {
    	if (Date.now() - lastSample >= SAMPLE_RATE * 2) {
    		socket.removeAllListeners()
    		socket.disconnect();
    		socket.connect();
    		Youtube.setup_all_listeners();
    	}
    	lastSample = Date.now();
    	setTimeout(Helper.sample, SAMPLE_RATE);
    },

    loadjsfile: function(filename)
    {
    	if (filesadded.indexOf("["+filename+"]")==-1){
    	    var fileref=document.createElement('script');
    	    fileref.setAttribute("type","text/javascript");
    	    fileref.setAttribute("src", filename);
    	    document.getElementsByTagName("head")[0].appendChild(fileref);
    	    filesadded+="["+filename+"]";
    	}
    },

    msieversion: function() {

            var ua = window.navigator.userAgent;
            var msie = ua.indexOf("MSIE ");

            if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))      // If Internet Explorer, return version number
                return true;
            else                 // If another browser, return 0
                return false;

       return false;
    },

    getRandomInt: function(min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
    },

    rgbToHsl: function(arr){
    		r = arr[0], g = arr[1], b = arr[2];
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

        if(l>0.5)l=0.5; //make sure it isnt too light

        return "hsl("+Math.floor(h*360)+", "+Math.floor(s*100)+"%, "+Math.floor(l*100)+"%)";
    }

  }

  Element.prototype.remove = function() {
      this.parentElement.removeChild(this);
  }

  NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
      for(var i = 0, len = this.length; i < len; i++) {
          if(this[i] && this[i].parentElement) {
              this[i].parentElement.removeChild(this[i]);
          }
      }
  }
})();
