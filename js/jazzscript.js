function jazz_setup()
{
	document.getElementsByClassName("ytplayer")[0].style.display = "none";

	jplayer = new YT.Player('jplayer', {
		height: window.height*0.75,
		width: window.width*0.6,
		videoId: response,
		playerVars: { rel:"0", wmode:"transparent", controls: "0" , iv_load_policy: "3", theme:"light", color:"white"},
		events: {
			'onReady': onJazzReady,
			'onStateChange': onJazzState
		}
	});
	document.getElementsByClassName("jp")[0].style.display = "inline";

}

function onJazzState(state)
{
	if(state.data == 0)
	{
		jplayer.loadVideoById("0fYL_qiDYf0");
		jplayer.playVideo();
	}
}

function onJazzReady(event) {	
	  //ytplayer = document.getElementById("myytplayer");
	 // ytplayer.addEventListener("onStateChange", "onytplayerStateChange");	
	  //ytplayer.addEventListener("onError", "errorHandler");
		getTime();
		if(!window.mobilecheck())
		{
			$("#jplayer").css("opacity", "1");
			$("#controls").css("opacity", "1");
			$(".playlist").css("opacity", "1");
			//$("#player").fadeIn();
			jplayer.loadVideoById("0fYL_qiDYf0");
			jplayer.playVideo();
		}
		readyLooks();
		initSlider();
		//durationFixer = setInterval(durationSetter, 1000);
}
