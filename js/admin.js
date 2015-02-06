var adminTogg = false;
var pass_corr = "";

function admin()
{
	adminTogg = !adminTogg;
	
	if(adminTogg) $("#playlist").height($("#player").height()-210+30); //opening
	if(!adminTogg)$("#playlist").height($("#player").height()+30);; //closing

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
	
	
	confRes = $.ajax({
		type: "POST",
		url: "php/change.php",
		async: false,
		data: "conf=start&vote="+voting+"&addsongs="+addsongs+"&longsongs="+longsongs+"&frontpage="+frontpage+"&allvideos="+allvideos+"&removeplay="+removeplay+"&pass="+adminpass,

		success: function() {
			console.log("configurations response: "+response);
		}
	}).responseText;
	
	pass_corr = confRes;

	if(pass_corr=="correct"){
		$("#adminPanel").addClass("success");
	}else{ $("#eBar").addClass("opacityFull");/*$("#adminPanel").addClass("fadeerror");*/}

	console.log(pass_corr);
	updateList();
	setTimeout(function(){
		$("#adminPanel").removeClass("success");
		$("#adminPanel").removeClass("fadeerror");
		$("#eBar").removeClass("opacityFull");
	},1500);
}
