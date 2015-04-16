var adminTogg = false;
var pass_corr = "";


socket.on("toast", function(msg)
{
	pass_corr = "correct";
	switch(msg) {
	    case "savedsettings":
	        msg="Saved settings"
	        break;
	    case "wrongpass":
	        msg="Wrong password"
	        break;
		case "shuffled":
	        msg="Shuffled playlist"
	        break;
		case "deletesong":
	        msg="Deleted song"
	        break;
		case "vote":
			msg="Voted on song"
			break;
		case "alreadyvoted":
	        msg="You have already voted on that song"
	        break;
		case "listhaspass":
			msg="The list is passwordprotected"
			break;
		case "noskip":
			msg="Only admin can skip songs on this channel"
			break;
		case "alreadyskip":
			msg="You've already voted to skip!"
			break;
	}
	Materialize.toast(msg, 4000);
});

socket.on("pw", function(msg)
{
	w_p = false;
	adminpass = msg;
	names=["vote","addsongs","longsongs","frontpage", "allvideos", "removeplay", "skip", "shuffle"];
	for (var i = 0; i < names.length; i++) {
			$("input[name="+names[i]+"]").attr("disabled", false);
	}
	$(".card-action").removeClass("hide");
	localStorage.setItem("passord_i_klartekst_lol", msg);
	Materialize.toast("Correct Password. You are now admin", 4000);
});

socket.on(chan.toLowerCase()+",conf", function(msg)
{
	populate_list(msg, true);
});

$('input[class=conf]').change(function()
{
		save();
});

function pass_save()
{
	socket.emit('password', document.getElementById("password").value);
}

//function used in html onlick
function save(){
	submitAdmin(document.getElementById("adminForm").elements);
}

function submitAdmin(form)
{
	console.log(form);
	voting = form.vote.checked;
	addsongs = form.addsongs.checked;
	longsongs = form.longsongs.checked;
	frontpage = form.frontpage.checked;
	allvideos = form.allvideos.checked;
	removeplay = form.removeplay.checked;
	//adminpass = document.getElementById("password").value;
	skipping = form.skip.checked;
	shuffling = form.shuffle.checked;

	configs = [voting, addsongs, longsongs, frontpage, allvideos, removeplay, adminpass, skipping, shuffling];
	console.log(configs);
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
