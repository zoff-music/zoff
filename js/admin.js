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
	voting = form.vote.checked,
	addSongs = form.addSongs.checked,
	longSongs = form.longSongs.checked,
	frontpage = form.frontPage.checked,
	onlyMusic = form.onlyMusic.checked,
	removePlay = form.removePlay.checked,
	adminpass = form.pass.value;

	confRes = $.ajax({
		type: "POST",
		url: "php/change.php",
		async: false,
		data: "conf=start&vote="+voting+"&addsongs="+addSongs+"&longsongs="+longSongs+"&frontpage="+frontpage+"&onlymusic="+onlyMusic+"&removeplay="+removePlay+"&pass="+adminpass,

		success: function() {
			console.log("configurations response: "+response);
		}
	}).responseText;
	
	pass = confRes;
	console.log(pass);

}
