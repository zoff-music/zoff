var list;
var toSend = "";
var sendURL;
var showToggle =true;
var chan = $("#chan").html();
var list_html = $("#list-song-html").html();
var hasadmin=0;
var w_p = true;
var peis = false;
var full_playlist;
var conf;

window.mobilecheck = function() {
var check = false;
(function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true;})(navigator.userAgent||navigator.vendor||window.opera);
return check; };

socket.on(chan.toLowerCase(), function(msg){
	channel_function(msg);
});

function channel_function(msg)
{
	if(msg[0] == "list")
	{
		full_playlist = msg[1];
		var index_of_conf = getIndexOfConf(full_playlist);
		conf = full_playlist[index_of_conf];
		full_playlist.splice(index_of_conf, 1);
		full_playlist.sort(predicate({
	    name: 'votes',
	    reverse: true
  		}, 'added'));
		set_conf(conf);
		populate_list(full_playlist);
	}else if(msg[0] == "added")
	{
		full_playlist.push(msg[1]);
		full_playlist.sort(predicate({
	    name: 'votes',
	    reverse: true
  		}, 'added'));

		insertAtIndex(getIndexOfSong(msg[1].id), msg[1], true);

		setTimeout(function(){
			var test = $("#wrapper").children()[getIndexOfSong(msg[1].id)];
			test.style.height = 66;
		},0);

	}else if(msg[0] == "deleted")
	{
		var to_delete = $("#wrapper").children()[getIndexOfSong(msg[1])];
		to_delete.style.height = 0;
		setTimeout(function()
		{
			$("#"+msg[1]).remove();
			full_playlist.splice(getIndexOfSong(msg[1]), 1);
		}, 1050);
	}else if(msg[0] == "vote")
	{
		var index_of_song = getIndexOfSong(msg[1]);
		full_playlist[index_of_song].votes += 1;
		full_playlist[index_of_song].added = msg[2];
		full_playlist.sort(predicate({
	    name: 'votes',
	    reverse: true
  		}, 'added'));
		populate_list(full_playlist, false);
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
		insertAtIndex($("#wrapper").children().length, full_playlist[full_playlist.length-2], false);
		//populate_list(full_playlist);
	}
}

socket.on("skipping", function(obj)
{
	document.getElementById("pBar").innerHTML = "Vote registrated! "+obj[0]+" of "+obj[1]+" has skipped. "+(Math.ceil(obj[1]/2))+" or more is needed!";
	$("#pBar").addClass("opacityFull");
	setTimeout(function(){
		$("#pBar").removeClass("opacityFull");
	},1500);
});

function set_conf(conf_array)
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
}

function populate_list(msg)
{
		$("#wrapper").empty();

		$.each(msg, function(j, listeID){
			if(!listeID.now_playing){ //check that the song isnt playing

				var video_title=decodeURIComponent(listeID.title);
				var video_id = listeID.id;
				var video_thumb = "background-image:url('https://img.youtube.com/vi/"+video_id+"/mqdefault.jpg');";
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
			}
		}

		$("#settings").css("visibility", "visible");
		$("#settings").css("opacity", "1");
		$("#wrapper").css("opacity", "1");

		full_playlist = msg;
		full_playlist = full_playlist.sort(predicate({
	    name: 'votes',
	    reverse: true
  		}, 'added'));
}

function vote(id, vote){
	socket.emit('vote', [chan, id, vote, guid, adminpass]);
	return true;
}

function skip(){
	socket.emit('skip', [chan, guid, localStorage[chan.toLowerCase()]]);
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

function predicate() {
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
}

function insertAtIndex(i, song_info, transition) {
    if(i === 0) {
     	$("#wrapper").prepend(generateSong(song_info, transition));
			return;
    }

    $("#wrapper > div:nth-child(" + (i) + ")").after(generateSong(song_info, transition));

}

function generateSong(song_info, transition)
{
	var video_id = song_info.id;
	var video_title = song_info.title;
	var video_votes = song_info.votes;
	var video_thumb = "background-image:url('https://img.youtube.com/vi/"+video_id+"/mqdefault.jpg');";

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
}

function getIndexOfSong(id)
{
	indexes = $.map(full_playlist, function(obj, index) {
	    if(obj.id == id) {
	        return index;
	    }
	});
	return indexes[0];
}

function getIndexOfConf(flist)
{
	indexes = $.map(flist, function(obj, index) {
	    if("views" in obj) {
	        return index;
	    }
	});
	return indexes[0];
}
