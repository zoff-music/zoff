var adminTogg = false;
var pass_corr = "";

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
	allvideos = form.allvideos.checked,
	removePlay = form.removePlay.checked,
	adminpass = form.pass.value;

	confRes = $.ajax({
		type: "POST",
		url: "php/change.php",
		async: false,
		data: "conf=start&vote="+voting+"&addsongs="+addSongs+"&longsongs="+longSongs+"&frontpage="+frontpage+"&allvideos="+allvideos+"&removeplay="+removePlay+"&pass="+adminpass,

		success: function() {
			console.log("configurations response: "+response);
		}
	}).responseText;
	
	pass_corr = confRes;
	console.log(pass_corr);
	updateList();
}
