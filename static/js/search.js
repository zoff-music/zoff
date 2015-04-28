var old_input="";
var timer = 0;
var api_key = "AIzaSyBSxgDrvIaKR2c_MK5fk6S01Oe7bd_qGd8";
var result_html = $("#temp-results").html();
$( "#results" ).empty();
var time_regex = /P((([0-9]*\.?[0-9]*)Y)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)W)?(([0-9]*\.?[0-9]*)D)?)?(T(([0-9]*\.?[0-9]*)H)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)S)?)?/

/*jshint multistr: true */

$(document).ready(function()
{

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
		console.log(search_input);
		if(event.keyCode == 13 && search_input == "fireplace")
		{
			if(!peis)
			{
				peis = true;
				loadjsfile("js/jazzscript.js");

			}else
			{
				peis = false;
				document.getElementsByClassName("jp")[0].style.display = "none";
				document.getElementsByClassName("ytplayer")[0].style.display = "inline";
				pauseJazz();
			}
		}

		if (event.keyCode != 40 && event.keyCode != 38 && event.keyCode != 13 && event.keyCode != 39 && event.keyCode != 37) {
			if(search_input.length < 3){$("#results").html("");}
			if(event.keyCode == 13){
			 	search(search_input);
			}else if(event.keyCode == 27){
				$("#results").html("");
				$(".main").removeClass("blurT");
				$("#controls").removeClass("blurT");
				$(".main").removeClass("clickthrough");
				showSearch();
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
			search($(".search_input").val());
		}
	}, 1);
});

$(document).keyup(function(e) {
	if ($("div.result").length > 2){
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

function showSearch(){
	$("#search-wrapper").toggleClass("hide");
	if(window.mobilecheck())
	{
		$(".search_input").focus();
	}
	$("#song-title").toggleClass("hide");
	$("#results").toggleClass("hide");
	$("#search").focus();

}

function search(search_input){


		$(".search_results").html('');
		if(window.search_input !== ""){
			var keyword= encodeURIComponent(window.search_input);

			//response= x
			var yt_url = "https://www.googleapis.com/youtube/v3/search?key="+api_key+"&videoEmbeddable=true&part=id&fields=items(id)&type=video&order=viewCount&safeSearch=none&maxResults=25";
			yt_url+="&q="+keyword;
			if(music)yt_url+="&videoCategoryId=10";

			var vid_url = "https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet,id&key="+api_key+"&id=";

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
					$.each(response.items, function(i,song)
					{
						var duration=song.contentDetails.duration;
						secs=durationToSeconds(duration)
						if(!longsongs || secs<720){
							title=song.snippet.title;
							enc_title=encodeURIComponent(title).replace(/'/g, "\\\'");
							id=song.id;
							duration = duration.replace("PT","").replace("H","h ").replace("M","m ").replace("S","s")
							thumb=song.snippet.thumbnails.medium.url;

							$("#results").append(result_html);
							var song = $("#result");
							song.find(".search-title").text(title);
							song.find(".result_info").text(duration);
							song.find(".thumb").attr("src", thumb);
							song.find(".add-many").attr("onclick", "submit('"+id+"','"+enc_title+"',"+secs+");");
							song.attr("onclick", "submitAndClose('"+id+"','"+enc_title+"',"+secs+");");
							song.attr("id",id);
						}
					});

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

}

function submitAndClose(id,title,duration){
	submit(id,title, duration);
	$("#results").html('');
	showSearch();
	console.log("sub&closed");
	document.getElementById("search").value = "";
	$("#results").html = "";
	$(".main").removeClass("blurT");
	$("#controls").removeClass("blurT");
	$(".main").removeClass("clickthrough");
}

function addVideos(ids){
	var request_url="https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet,id&key=AIzaSyBSxgDrvIaKR2c_MK5fk6S01Oe7bd_qGd8&id=";
	request_url += ids;

	$.ajax({
	type: "GET",
	url: request_url,
	dataType:"jsonp",
	success: function(response){
		$.each(response.items, function(i,song)
		{
			var duration=durationToSeconds(song.contentDetails.duration);
			if(!longsongs || secs<720){
				enc_title=encodeURIComponent(song.snippet.title).replace(/'/g, "\\\'");
				submit(song.id, enc_title, duration);
			}
		});
		
	}
	});
}

function submit(id,title,duration){
	socket.emit("add", [id, decodeURIComponent(title), adminpass, duration]);
}

function durationToSeconds(duration) {
    var matches = duration.match(time_regex);
    hours= parseInt(matches[12])||0,
    minutes= parseInt(matches[14])||0,
    seconds= parseInt(matches[16])||0
    return hours*60*60+minutes*60+seconds;
}
