var adminTogg = false;
var pass_corr = "";


socket.on("toast", function(msg)
{
	pass_corr = "correct";
	switch(msg) {
	    case "savedsettings":
	        msg="I saved your settings <3"
	        break;
	    case "wrongpass":
	        msg="That's not the right password! ಠ_ಠ"
	        break;
		case "shuffled":
	        msg="I vigorously stirred your playlist! (J °O°)J"
	        break;
		case "deletesong":
	        msg="Your song is now in a better place..."
	        break;
		case "voted":
			msg="You vote like a boss \\(*0*)/"
			break;
		case "alreadyvoted":
	        msg="You can't vote twice on that song! (¬_¬)"
	        break;
		case "listhaspass":
			msg="I'm sorry, but you have to be an admin to do that (⌒_⌒;)"
			break;
		case "noskip":
			msg="Only Admins can skip songs, peasant (｀∀´)Ψ"
			break;
		case "alreadyskip":
			msg="Skipping is democratic, only one vote per person! （〃・ω・〃）"
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

	refresh_scroll();

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

function shuffle()
{
	console.log(adminpass);
	socket.emit('shuffle', adminpass);
}
