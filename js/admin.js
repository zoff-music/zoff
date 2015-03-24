var adminTogg = false;
var pass_corr = "";

function admin()
{
	adminTogg = !adminTogg;
	if(adminTogg)
	{
		if(find)
		{
			eH = -10;
		}else
			eH = 30;
		$("#playlist").height($("#player").height()-290+eH); //opening
	}else if(!adminTogg)
	{
		if(find)
		{
			eH = -10;
		}else
			eH = 30;
		$("#playlist").height($("#player").height()+eH); //closing
	}
	$("#adminPanel").toggleClass("hiddenAdmin");
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
	
	confRes = $.ajax({
		type: "POST",
		url: "php/change.php",
		async: false,
		data: "conf=start&vote="+voting+"&addsongs="+addsongs+"&longsongs="+longsongs+"&frontpage="+frontpage+"&allvideos="+allvideos+"&removeplay="+removeplay+"&pass="+adminpass+"&skip="+skipping+"&shuffle="+shuffling,

		success: function() {
			console.log("configurations response: "+response);
		}
	}).responseText;
	
	pass_corr = confRes;

	if(pass_corr=="correct"){
		//$("#adminPanel").addClass("success");
		document.getElementById("sBar").innerHTML = "Successfully applied settings.";
		$("#sBar").addClass("opacityFull");
		document.getElementById("passbox").value = "";
	}else{ 
		document.getElementById("eBar").innerHTML = "Error: Wrong Admin Password!";
		$("#eBar").addClass("opacityFull");
		document.getElementById("passbox").value = "";/*$("#adminPanel").addClass("fadeerror");*/
	}

	console.log(pass_corr);
	updateList();
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
	confRes = $.ajax({
		type: "GET",
		url: "php/change.php",
		async: false,
		data: "shuffle=true&pass="+adminpass,

		success: function() {
			console.log("configurations response: "+response);
		}
	}).responseText;
	if(confRes == "shuffled")
	{
		document.getElementById("sBar").innerHTML = "Successfully shuffled playlist.";
		$("#sBar").addClass("opacityFull");
		updateList();
	}else if(confRes = "wrong!"){
		document.getElementById("eBar").innerHTML = "Error: Wrong Admin Password!";
		$("#eBar").addClass("opacityFull");
	}else if(confRes = "size"){
		document.getElementById("eBar").innerHTML = "Error: Empty Playlist!";
		$("#eBar").addClass("opacityFull");
	}
	setTimeout(function(){
		$("#adminPanel").removeClass("success");
		$("#adminPanel").removeClass("fadeerror");
		$("#eBar").removeClass("opacityFull");
		$("#sBar").removeClass("opacityFull");
	},1500);
}
