var adminTogg;

function admin()
{
	adminTogg = !adminTogg;
	if(!adminTogg) $("#playlist").height($("#playlist").height()+$("#adminPanel").outerHeight(true));
	$("#adminPanel").toggleClass("hiddenAdmin");
	if(adminTogg) $("#playlist").height($("#playlist").height()-$("#adminPanel").outerHeight(true));
}


function submitAdmin(form)
{
	vote = form.vote.checked,
	addSongs = form.addSongs.checked,
	longSongs = form.longSongs.checked,
	frontpage = form.frontPage.checked,
	onlyMusic = form.onlyMusic.checked,
	removePlay = form.removePlay.checked;
	
	console.log("Vote: "+vote);
	console.log("Add Songs: "+addSongs);
	console.log("Long Songs: "+longSongs);
	console.log("Frontpage: "+frontpage);
	console.log("Only music: "+onlyMusic);
	console.log("Remove after play:"+removePlay);
	
	conf = $.ajax({
		type: "POST",
		url: "php/change.php",
		async: false,
		data: "conf=start&vote="+vote+"&addsongs="+addSongs+"&longsongs="+longSongs+"&frontpage="+frontpage+"&onlymusic="+onlyMusic+"&removeplay="+removePlay,

		success: function() {
			console.log("configurations response: "+response);
		}
	}).responseText;
	
	console.log(conf);
}
