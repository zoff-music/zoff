var list;
var toSend = "";
var sendURL;
var myScroll;
var scroller = false;
var showToggle =true;
var chan = $("#chan").html();

function updateList()
{
	console.log("updating list");
	list = $.ajax({ type: "GET",   
		url: "php/change.php",   
		async: false
	}).responseText;
	list = $.parseJSON(list);
	conf = list["conf"];
	if(conf.hasOwnProperty("addsongs") && conf["addsongs"] == "true") adminadd = 1;
	else adminadd = 0;
	if(conf.hasOwnProperty("onlymusic") && conf["onlymusic"] == "true") music = 1;
	else music = 0;
	if(conf.hasOwnProperty("longsongs") && conf["longsongs"] == "true") longS = 1;
	else longS = 0;
	if(conf.hasOwnProperty("vote") && conf["vote"] == "true") adminvote = 1;
	else adminvote = 0;
	/*list[0].shift();
	list[3].shift();
	list[2].shift();*/

	setTimeout(function()
	{

		$("#wrapper").empty();

		$.each(list["songs"], function(j, listeID){

			var video_title=listeID["title"].replace(/\\\'/g, "'").replace(/\\\&quot;/g,"'");;
			var video_id = listeID["id"];
			var video_thumb = "http://i.ytimg.com/vi/"+video_id+"/default.jpg";
			var odd = ""; if(j%2==0)odd=" oddlist";
			var finalhtml="<div id='result' class='result lresult"+odd+"'>"+
			"<img src='"+video_thumb+"' class='thumb lthumb'>"+
			"<div class='ltitle'>"+video_title+"</div>"+
			"<div class='votes'>"+listeID["votes"]+
                    "<a onclick=\"vote('"+video_id+"','pos');\" id='plus'>+</a>"+
                    "<a onclick=\"vote('"+video_id+"','neg');\" id='minus'>-</a>"+
                    "<input id='del' title='Remove' type='button' class='button' value='X' onclick=\"vote('"+video_id+"','del')\">"+
                    "</div>"+
			"</div>";
			$("#wrapper").append(finalhtml);
		});
		if($("#playlist").height() != $("#player").height())
		{
			if(!window.mobilecheck())
			{
				$("#playlist").css({height: $("#player").height()-$("#adminPanel").outerHeight(true)});
				$("#playlist").css({overflow: "hidden"});
				if(scroller == false)
				{
					myScroll = new IScroll('#playlist', {
						mouseWheel: true,
						scrollbars: false,
						scrollY: true,
						interactiveScrollbars: false
					});
					scroller = true;
				}else
				{
					myScroll.refresh();
				}
			}
		}
		myScroll.refresh();
		if(window.mobilecheck())
		{
			document.getElementById("player").style.display="none";
			ytplayer.pauseVideo();
		}
		document.getElementsByName("vote")[0].checked = (conf["vote"] === "true");
		document.getElementsByName("addSongs")[0].checked = (conf["addsongs"] === "true");
		document.getElementsByName("longSongs")[0].checked = (conf["longsongs"] === "true");
		document.getElementsByName("frontPage")[0].checked = (conf["frontpage"] === "true");
		document.getElementsByName("onlyMusic")[0].checked = (conf["onlymusic"] === "true");
		document.getElementsByName("removePlay")[0].checked = (conf["removeplay"] === "true");
	}, 2500);
}

function vote(id, vote){
	console.log(adminpass);
	console.log($.ajax({
		type: "GET",
		url: "php/change.php",
		async: false,
		data: "vote="+vote+"&id="+id+"&pass="+adminpass,
		success: function() {
			console.log("voted "+vote+" on "+id);
			if(vote=="pos"){ $("#playlist").addClass("success");}
			else{ $("#playlist").addClass("error");}
			updateList();
		},
	}).responseText);
	setTimeout(function(){
		$("#playlist").removeClass("success");
		$("#playlist").removeClass("error");
	},1500);
}

function skip(){
	console.log($.ajax({
		type: "GET",
		url: "php/change.php",
		async: false,
		data: "skip",
		success: function() {
			console.log("voted to skip song");
			 $("#buttons").addClass("success");
			updateList();
		},
	}).responseText);
	setTimeout(function(){
		$("#playlist").removeClass("success");
	},1500);
}

function show(){
	if(showToggle){
    	showToggle=false;
    	$("#toptitle").empty();
        $("#chan").addClass("bigChan");
        $("#chan").html("zoff.no/"+chan);
    }else{
    	showToggle=true;
    	$("#toptitle").html("Zöff");
    	$("#chan").removeClass("bigChan");
    	$("#chan").html(chan);
   }
}


function ks()
{
	list = $.ajax({ type: "GET",   
		url: "php/change.php",   
		async: false
	}).responseText;
	list = $.parseJSON(list);
	myScroll.destroy();
	myScroll = null;
	$("#playlist").css({height: $("#player").height()});
	$("#playlist").css({overflow: "hidden"});
	myScroll = new IScroll('#playlist', {
		mouseWheel: true,
		scrollbars: false,
		scrollY: true,
		interactiveScrollbars: false
	});
	scroller = true; 
}
