var pass_corr = "";


socket.on("toast", function(msg)
{
	console.log("Got message from server: "+msg);
	pass_corr = "correct";
	switch(msg) {
		case "addedsong":
			msg=rnd(["I added your song", "Your song has been added", "Yay, more songs!", "Thats a cool song!", "I added that song for you", "I see you like adding songs..."])
			break;
	    case "savedsettings":
	        msg=rnd(["I've saved your settings", "I stored all your settings", "Your settings have been stored in a safe place"])
	        break;
	    case "wrongpass":
	        msg=rnd(["That's not the right password!", "Wrong! Better luck next time...", "You seem to have mistyped the password", "Incorrect. Have you tried meditating?","Nope, wrong password!", "Wrong password. The authorities have been notified."])
					if(localStorage[chan.toLowerCase()]){
						localStorage.removeItem(chan.toLowerCase());
					}
					break;
		case "shuffled":
	        msg=rnd(["♫ You stir me right round, baby. ♫","♫ Stir, stir, stir my boat ♫","I vigorously stirred your playlist!", "I hope you like your list stirred, not shaken.", "I shuffled your playlist with the cosmic background radiation as a seed. Enjoy.", "100% randomized, for your listening pleasure!", "I hope you enjoy your fresh playlist!"])
	        break;
		case "deletesong":
	        msg=rnd(["Your song is now in a better place...", "You won't be seeing any more of that video...", "EXTERMINATE! EXTERMINATE! EXTERMINATE!", "I killed it with fire", "Thanks for deleting that song. I didn't like it anyways...", "Removed song securely."])
	        break;
		case "voted":
			msg=rnd(["You voted!", "You vote like a boss", "Voting is the key to democracy", "May you get your song to the very top!", "I love that song! I vouch for you.", "Only you vote that good", "I like the way you vote...", "Up the video goes!", "Voted Zöff for president", "Only 999 more to go!"])
			break;
		case "alreadyvoted":
	        msg=rnd(["You can't vote twice on that song!", "I see you have voted on that song before", "One vote per person!", "I know you want to hear your song, but have patience!", "I'm sorry, but I can't let you vote twice, Dave."])
	        break;
	    case "skip":
			msg=rnd(["The song was skipped", "I have skipped a song", "Skipped to the beat", "Skipmaster3000", "They see me skippin', they hatin'"])
			break;
		case "listhaspass":
			msg=rnd(["I'm sorry, but you have to be an admin to do that!", "Only admins can do that", "You're not allowed to do that, try logging in!", "I can't let you do that", "Please log in to do that"])
			break;
		case "noskip":
			msg=rnd(["Only Admins can skip songs, peasant!", "You have to log in to skip songs on this channel", "Try clicking the settings icon and logging in before you skip"])
			break;
		case "alreadyskip":
			msg=rnd(["Skipping is democratic, only one vote per person!", "More people have to vote to skip, not just you!", "Get someone else to skip too! You can't do it on yourself."])
			break;
		case "notyetskip":
			msg="Skipping is disabled the first 10 seconds.";
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

	$("#admin-lock").removeClass("mdi-action-lock");
	$("#admin-lock").addClass("mdi-action-lock-open clickable");
	localStorage.setItem(chan.toLowerCase(), msg);
	Materialize.toast("Correct password. You now have access to the sacred realm of The Admin.", 4000);
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

	socket.emit('password', [CryptoJS.SHA256(document.getElementById("password").value).toString(), chan.toLowerCase(), guid]);
}

function log_out(){
	if(localStorage[chan.toLowerCase()]){
		localStorage.removeItem(chan.toLowerCase());
		display_logged_out();
		Materialize.toast("Logged out", 4000);
	}else{
		Materialize.toast("Not logged in", 4000);
	}
}

function display_logged_out()
{
	w_p = true;
	names=["vote","addsongs","longsongs","frontpage", "allvideos", "removeplay", "skip", "shuffle"];
	for (var i = 0; i < names.length; i++) {
			$("input[name="+names[i]+"]").attr("disabled", true);
	}
	if(!contains($("#admin-lock").attr("class").split(" "), "mdi-action-lock"))
		$("#admin-lock").addClass("mdi-action-lock");
	$("#admin-lock").removeClass("mdi-action-lock-open clickable");
	if($(".card-action").length != 0 && !contains($(".card-action").attr("class").split(" "), "hide"))
		$(".card-action").addClass("hide");
	adminpass = "";
	document.getElementById("password").value = "";
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
	socket.emit('shuffle', adminpass !== undefined ? adminpass : "");
}

function rnd(arr)
{
	return arr[Math.floor(Math.random() * arr.length)];
}
