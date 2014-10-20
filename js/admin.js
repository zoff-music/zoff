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
	onlyMusic = form.onlyMusic.checked;
	
	console.log("Vote: "+vote);
	console.log("Add Songs: "+addSongs);
	console.log("Long Songs: "+longSongs);
	console.log("Only music: "+onlyMusic);
}
