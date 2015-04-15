var list;
var toSend = "";
var sendURL;
var myScroll;
var scroller = false;
var showToggle =true;
var chan = $("#chan").html();
var list_html = $("#list-song-html").html();
var hasadmin=0;

socket.on(guid, function(msg){
	populate_list(msg);
});

socket.on("abc", function(){
	alert("alert");
});

socket.on(chan.toLowerCase(), function(msg){
	populate_list(msg);
});

socket.on("skipping", function(obj)
{
	document.getElementById("pBar").innerHTML = "Vote registrated! "+obj[0]+" of "+obj[1]+" has skipped. "+(Math.ceil(obj[1]/2))+" or more is needed!";
	$("#pBar").addClass("opacityFull");
	setTimeout(function(){
		$("#pBar").removeClass("opacityFull");
	},1500);
});

function populate_list(msg)
{
	console.log(msg);

	$("#wrapper").empty();

		$.each(msg, function(j, listeID){
			if(listeID.hasOwnProperty('startTime')) //check if its config part of list
			{
				console.log("startTime");
				console.log(listeID.addsongs);
				if(!adminTogg)
				{
					names=["vote","addsongs","longsongs","frontpage", "allvideos", "removeplay", "skip", "shuffle"];
					for (var i = 0; i < names.length; i++) {
						document.getElementsByName(names[i])[0].checked = (listeID[names[i]] === 'true');
					}

					if(hasadmin)
						$("#setpass").text("Channel has admin");
					else
						$("#setpass").text("Channel has no admin");
				}
			}else if(!listeID.now_playing){ //check that the song isnt playing

				var video_title=decodeURIComponent(listeID.title);
				var video_id = listeID.id;
				var video_thumb = "background-image:url('http://img.youtube.com/vi/"+video_id+"/mqdefault.jpg');";
				//var delsong = ""; if(pass_corr=="correct");
				var video_votes = listeID.votes;
				$("#wrapper").append(list_html);
				var song = $("#list-song");
				song.find(".list-title").text(video_title);
				song.find(".list-title").attr("title", video_title);
				song.find(".list-votes").text(video_votes);
				song.find(".votebg").attr("onclick", "vote('"+video_id+"','pos')");
				song.find(".list-image").attr("style",video_thumb);
				song.attr("id",video_id);
			}
		});

		if($("#playlist").height() != $("#player").height() || (peis && $("#playlist").height() != $("#jplayer").height()))
		{
			if(!window.mobilecheck())
			{
				if(peis)
				{
					player_name = "#jplayer";
				}else player_name = "#player";
				$("#playlist").css({height: $(".video-container").height()-5});
				$("#playlist").css({overflow: "hidden"});
				if(scroller === false)
				{
					myScroll = new IScroll('#playlist', {
						mouseWheel: true,
						scrollY: true,
					});
					scroller = true;
					myScroll.maxScrollY = myScroll.maxScrollY - 5;
				}else
				{
					myScroll.refresh();
					myScroll.maxScrollY = myScroll.maxScrollY - 5; //Hackish solution for not being able to scroll fully to the bottom, don't understand why this is fucked
				}
			}
		}
		if(window.mobilecheck())
		{
			//document.getElementById("player").style.display="none";
			//ytplayer.pauseVideo();
		}else{
			myScroll.refresh();
			myScroll.maxScrollY = myScroll.maxScrollY - 5;
		}

		$("#settings").css("visibility", "visible");
		$("#settings").css("opacity", "1");
		$("#wrapper").css("opacity", "1");

}

function vote(id, vote){
	socket.emit('vote', [chan, id, vote, guid, adminpass]);
}

function skip(){
	socket.emit('skip', [chan, guid]);
}

function show(){
	if(!window.mobilecheck())
	{
		if(showToggle){
	    	showToggle=false;
	    	$("#toptitle").empty();
	        $("#chan").addClass("bigChan");
	        //$("#chan").html("zoff.no/"+encodeURI(chan));
	        $("#chan").html("zoff.no/"+chan);
	    }else{
	    	showToggle=true;
	    	$("#toptitle").html("Zöff");
	    	$("#chan").removeClass("bigChan");
	    	$("#chan").html(chan);
	   }
	   fitToScreen();
	}
}
