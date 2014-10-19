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
			"<div class='votes'>"+listeID["votes"]+"<a onclick=\"vote('"+video_id+"','pos');\" id='plus'>+</a><a onclick=\"vote('"+video_id+"','neg');\" id='minus'>-</a></div>"+
			"</div>";
			$("#wrapper").append(finalhtml);
		});
		if($("#playlist").height() > $("#player").height())
		{
			if(!window.mobilecheck())
			{
				$("#playlist").css({height: $("#player").height()});
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
		if(window.mobilecheck())
		{
			document.getElementById("player").style.display="none";
			ytplayer.pauseVideo();
		}
	}, 2500);
}

function vote(id, vote){
	console.log($.ajax({
		type: "GET",
		url: "php/change.php",
		async: false,
		data: "vote="+vote+"&id="+id,
		success: function() {
			console.log("voted "+vote+" on "+id);
			if(vote=="pos"){ $("#playlist").addClass("success");}
			else{ $("#playlist").addClass("error");}
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