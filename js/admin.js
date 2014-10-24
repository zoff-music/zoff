var adminTogg = false;
var pass_corr = "";

function admin()
{
	adminTogg = !adminTogg;
	
	if(adminTogg) $("#playlist").height($("#playlist").height()-210); //opening
	if(!adminTogg)setTimeout(function(){$("#playlist").height($("#playlist").height()+210);},501); //closing

	$("#adminPanel").toggleClass("hiddenAdmin");
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

	if(pass_corr=="correct"){
		$("#adminPanel").addClass("success");
	}else{ $("#adminPanel").addClass("fadeerror"); alert("Wrong password :(")}

	console.log(pass_corr);
	updateList();
	setTimeout(function(){
		$("#adminPanel").removeClass("success");
		$("#adminPanel").removeClass("fadeerror");
	},1500);
}
