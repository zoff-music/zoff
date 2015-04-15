var adminTogg = false;
var pass_corr = "";

socket.on("toast", function(msg)
{
	pass_corr = "correct";
	Materialize.toast(msg, 4000);
	/*document.getElementById("sBar").innerHTML = msg;
	$("#sBar").addClass("opacityFull");
	document.getElementById("passbox").value = "";
	remove_bar();*/
});


//function used in html onlick
function save(){
	submitAdmin($("#adminForm"));
}

function submitAdmin(form)
{
	voting = form.vote.value;
	addsongs = form.addsongs.value;
	longsongs = form.longsongs.value;
	frontpage = form.frontpage.value;
	allvideos = form.allvideos.value;
	removeplay = form.removeplay.value;
	adminpass = form.pass.value;
	skipping = form.skip.value;
	shuffling = form.shuffle.value;

	configs = [voting, addsongs, longsongs, frontpage, allvideos, removeplay, adminpass, skipping, shuffling];
	alert(configs)
	socket.emit("conf", configs);
}

function hide_settings(){
	$('#settings').sideNav('hide');
}

function remove_bar()
{
	setTimeout(function(){
		$("#adminPanel").removeClass("success");
		$("#adminPanel").removeClass("fadeerror");
		$("#eBar").removeClass("opacityFull");
		$("#sBar").removeClass("opacityFull");
	},1500);
}

function shuffle(form)
{
	console.log(adminpass);
	socket.emit('shuffle', adminpass);
}
