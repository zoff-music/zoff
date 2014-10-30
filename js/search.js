var old_input="";
var timer = 0;

$(document).ready(function()
{

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
		var search_input = $(this).val();
		if(search_input.length < 3){$("#results").html("");}
		if(event.keyCode == 13){
		 	search(search_input);
		}else if(event.keyCode == 27){
			$("#results").html("");
		}else{
			timer=100;
		}

		
	});

	setInterval(function(){
		timer--;
		if(timer==0){
			search($(".search_input").val());
		}
	}, 1);
});


function search(search_input){
	

		$("#results").html('');
		if(search_input != ""){
			var keyword= encodeURIComponent(search_input);

			var yt_url='http://gdata.youtube.com/feeds/api/videos?q='+keyword+'&format=5&orderby=relevance&max-results=25&v=2&alt=jsonc'; 

			$.ajax({
				type: "GET",
				url: yt_url,
				dataType:"jsonp",
				success: function(response)
				{
					if(response.data.items)
					{
						$.each(response.data.items, function(i,data)
						{
							if(data.duration > 720 && longS == 0){return;}
							if(data["category"] == "Music" || music == 1){
								var video_title=encodeURIComponent(data.title).replace(/'/g, "\\\'");
								var views=data.viewCount;
								var video_thumb = "http://i.ytimg.com/vi/"+data.id+"/default.jpg";
								var length = Math.floor(data.duration/60)+":"+(data.duration-Math.floor(data.duration / 60)*60);
								var finalhtml="<div id='result' class='result' onclick=\"submit('"+data.id+"','"+video_title+"');\">"+
								"<img src='"+video_thumb+"' class='thumb'>"+
								"<div id='title'>"+data.title+""+
								"<div class='result_info'>"+views+" views • "+length+"</div></div></div>";
								//+data.uploader+" • "+
								$("#results").append(finalhtml);
							}
						});
					}
					else{ $("#video").html("<div id='no'>No Video</div>");}
				}

			});
		}

}

function submit(id,title){
	console.log($.ajax({
		type: "GET",
		url: "php/change.php",
		async: false,
		data: "v="+id+"&n="+title+"&pass="+adminpass,
		success: function() {
			console.log("added "+id);
			document.getElementById("search").value = "";
			$("#search").addClass("success");
			$("#results").html('');
			//updateList();
		},
		error: function(){
			console.log("error in adding");
			document.getElementById("search").value = "";
			$("#search").addClass("error");
			$("#results").html('');
		}
	}).responseText);

	$("#search").focus();

	setTimeout(function(){
		$("#search").removeClass("success");
		$("#search").removeClass("error");
	},1500);
	updateList();
}

				 // if(reply=="added"){$("#search").removeClass('success'); $("#search").addClass('success');}
