var old_input="";
var timer = 0;
/*jshint multistr: true */

$(document).ready(function()
{
	$( "#results" ).hover( function() { $("div.result").removeClass("hoverResults"); i = undefined; }, function() { });
		

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
		if (event.keyCode != 40 && event.keyCode != 38 && event.keyCode != 13) {
			var search_input = $(this).val();
			if(search_input.length < 3){$("#results").html("");}
			if(event.keyCode == 13){
			 	search(search_input);
			}else if(event.keyCode == 27){
				$("#results").html("");
				$(".main").removeClass("blurT");
			}else{
				timer=100;
			}
		}

		
	});

	setInterval(function(){
		timer--;
		if(timer===0){
			search($(".search_input").val());
			i = 0;
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
	    }
	}
});


function search(search_input){
	

		$("#results").html('');
		if(search_input !== ""){
			var keyword= encodeURIComponent(search_input);

			var yt_url='http://gdata.youtube.com/feeds/api/videos?q='+keyword+'&format=5&orderby=relevance&max-results=6&v=2&alt=jsonc'; 

			$.ajax({
				type: "GET",
				url: yt_url,
				dataType:"jsonp",
				success: function(response)
				{
					if(response.data.items)
					{
						var wrapper = "";
						$.each(response.data.items, function(i,data)
						{
							if(data.duration > 720 && longS === 0){return;}
							if(data.category == "Music" || music == 1){
								var video_title=encodeURIComponent(data.title).replace(/'/g, "\\\'");
								var views=data.viewCount;
								var video_thumb = "http://i.ytimg.com/vi/"+data.id+"/default.jpg";
								var length = Math.floor(data.duration/60)+":"+(data.duration-Math.floor(data.duration / 60)*60);
								var finalhtml="\
								<div id='result' class='result' onclick=\"submitAndClose('"+data.id+"','"+video_title+"');\">\
									<img src='"+video_thumb+"' class='thumb'>\
									<div id='title'>"+data.title+"\
										<div class='result_info'>"+views+" views • "+length+"</div>\
										<input id='add' title='Add several songs' type='button' class='button' value='+' onclick=\"submit('"+data.id+"','"+video_title+"');\">\
									</div>\
								</div>";
								//+data.uploader+" • "+
								//$("#results").append(finalhtml);
								wrapper += finalhtml;
							}
						});
						//console.log(wrapper);
						//$("#results").append(wrapper).show("slow");
						if(wrapper.length > 0)
						{
							$(".main").addClass("blurT");
							$("#controls").addClass("blurT");
						}

						$("<div id='r' style='display:none;'>"+wrapper+"</div>").appendTo('#results').slideDown('slow');
					
					}
					else{ $("#video").html("<div id='no'>No Video</div>");}
				}

			});
		}else{
			$(".main").removeClass("blurT");
			$("#controls").removeClass("blurT");
		}

}

function submitAndClose(id,title){
	submit(id,title);
	$("#results").html('');
	console.log("sub&closed");

}

function submit(id,title){

	serverAns = $.ajax({
		type: "GET",
		url: "php/change.php",
		async: false,
		data: "v="+id+"&n="+title+"&pass="+adminpass,
		success: function() {
			
			//document.getElementById("search").value = "";
			//$("#search").addClass("success");
		},
		error: function(){
			console.log("error in adding");
			document.getElementById("search").value = "";
			$("#search").addClass("error");
		}
	}).responseText;

	if(serverAns == "wrong")
	{
		alert("Wrong adminpassword");
		$("#search").addClass("error");
	}else{
		$("#search").addClass("success");
	}
	
	$("#search").focus();

	setTimeout(function(){
		$("#search").removeClass("success");
		$("#search").removeClass("error");
	},1500);
	updateList();
	event.stopPropagation();
}

				 // if(reply=="added"){$("#search").removeClass('success'); $("#search").addClass('success');}
