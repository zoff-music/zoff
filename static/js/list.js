var list;
var toSend = "";
var sendURL;
var myScroll;
var scroller = false;
var showToggle =true;
var chan = $("#chan").html();
var list_html = $("#list-song-html").html();
var hasadmin=0;
var w_p = true;

window.mobilecheck = function() {
var check = false;
(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true;})(navigator.userAgent||navigator.vendor||window.opera);
return check; };

socket.on("abc", function(){
	alert("alert");
});

socket.on(chan.toLowerCase(), function(msg){
	populate_list(msg, false);
});

socket.on("skipping", function(obj)
{
	document.getElementById("pBar").innerHTML = "Vote registrated! "+obj[0]+" of "+obj[1]+" has skipped. "+(Math.ceil(obj[1]/2))+" or more is needed!";
	$("#pBar").addClass("opacityFull");
	setTimeout(function(){
		$("#pBar").removeClass("opacityFull");
	},1500);
});

function populate_list(msg, conf_only)
{
	//console.log(msg);
	//console.log(conf_only);
	if(!conf_only)
		$("#wrapper").empty();

		$.each(msg, function(j, listeID){
			if(listeID.hasOwnProperty('startTime')) //check if its config part of list
			{
				console.log("startTime");
				if(listeID['adminpass'] == "" || w_p == false) hasadmin = false;
				else hasadmin = true;
				music = listeID["allvideos"];
				longsongs = listeID["longsongs"];
				names=["vote","addsongs","longsongs","frontpage", "allvideos", "removeplay", "skip", "shuffle"];
				for (var i = 0; i < names.length; i++) {
					document.getElementsByName(names[i])[0].checked = (listeID[names[i]] === true);
					if(hasadmin)
						$("input[name="+names[i]+"]").attr("disabled", true);


					/*if(hasadmin)
						$("#setpass").text("Channel has admin");
					else
						$("#setpass").text("Channel has no admin");*/
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
				song.find(".vote-container").attr("onclick", "vote('"+video_id+"','pos')");
				song.find(".list-image").attr("style",video_thumb);
				song.attr("id",video_id);
				song.find("#del").attr("onclick", "vote('"+video_id+"', 'del')");
				if(!w_p) $(".card-action").removeClass("hide");
				if(video_votes==1)song.find(".vote-text").text("vote");
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
					refresh_scroll();
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
	return true;
}

function skip(){
	socket.emit('skip', [chan, guid]);
	return true;
}

function importOldList(chan){
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
			addVideos(ids);
			ids="";
			num=0;
		}
		num++;
	});

	addVideos(ids);
	document.getElementById("search").value = "";
}

function refresh_scroll()
{
	myScroll.refresh();
	myScroll.maxScrollY = myScroll.maxScrollY - 5;
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
