var adminTogg;

function admin()
{
	adminTogg = !adminTogg;
	if(adminTogg){
		$.ajax({
			url:"../static/panel.html",
			context: document.body, 
			success: function(response){
				//$(response).hide().appendTo("#adminPanel").fadeIn(1000);
				$("#adminPanel").append(response).hide().fadeIn(1000);
			}
		});
	}else
	{
		setTimeout(function(){document.getElementById("adminPanel").innerHTML = "";}, 500);
		$("#adminPanel").fadeOut(500);
	}
	$("#playlist").toggleClass("lowOpacity");
}


function submitAdmin(form)
{
	vote = form.vote.checked,
	addSongs = form.addSongs.checked,
	longSongs = form.longSongs.checked,
	onlyMusic = form.onlyMusic.checked;
	
	console.log("Vote: "+vote);
	console.log("Add Songs: "+addSongs);
	console.log("Long Songs: "+longSongs);
	console.log("Only music: "+onlyMusic);
}
