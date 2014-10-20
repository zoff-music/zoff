var adminTogg;

function admin()
{
	$("#adminPanel").toggleClass("hiddenAdmin");
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
