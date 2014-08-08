$(document).ready(function()
{
    /**
    TODO:
    -legge til timer når man trykker pause for at når man "unpauser", går den dit den ville vært, hvis videoen ville blitt ferdig, load en ny video men ha den på pause
    -legge til tid når en video ble påbegynt, for at hvis folk joiner midt i en video, hopper den dit
    */

    /**

    Fetcher sangen som spilles fra JSON filen				

    */

    var response = $.ajax({ type: "GET",   
	    url: "videos.json",   
	    async: false
    }).responseText;

    var url = $.parseJSON(response);
    response = url[0];

    /**

    Legger sangen inn i <div>en, via swfobject

    */
    var params = { allowScriptAccess: "always"};
    var atts = { id: "myytplayer" };
    swfobject.embedSWF("http://www.youtube.com/v/"+response+"?enablejsapi=1&playerapiid=ytplayer&version=3&controls=1&iv_load_policy=3",
	    "ytapiplayer", "825", "462", "8", null, null, params, atts);

    /**
    eventlistener for når playeren endres
    */

    function onytplayerStateChange(newState) {
	    if(newState == 0) //newState = 0 når videoen er ferdig
	    {
		    $.ajax({		//snutt for å kjøre save.php som lagrer til jsonfilen neste sang og denne sangen. Endrer rekkefølge altså.
			    type: "POST",
			    url: "save.php",
			    data: "thisUrl="+response,
			
			    success: function() {
				    console.log("saved");
			    }
		    });

		    setTimeout(function(){	//har en timeout for at den skal klare å fetche hva den neste sangen er etter at save.php har endret på ting
			    response = $.ajax({ type: "GET",   
				    url: "videos.json",   
				    async: false
			    }).responseText;
			    var url = $.parseJSON(response);
			    response = url[0];
			
			    ytplayer.loadVideoById(response);
		    },100);
	    }
    }

    function errorHandler(newState)		//errorhandler. Fjerner urlen til en "dårlig" video og går til neste
    {
	    $.ajax({
		    type: "POST",
		    url: "delete.php",
		    data: "thisUrl="+response,
		
		    success: function() {
			    console.log("deleted");
		    }
	    });

	    setTimeout(function(){
		    response = $.ajax({ type: "GET",   
			    url: "videos.json",   
			    async: false
		    }).responseText;
		    var url = $.parseJSON(response);
		    response = url[0];
		
		    ytplayer.loadVideoById(response);
	    },100);
    }

    function onYouTubePlayerReady(playerId) {	//funksjon som kjøres når playeren er klar
	    ytplayer = document.getElementById("myytplayer");
	      ytplayer.addEventListener("onStateChange", "onytplayerStateChange");	//eventlistenere
	      ytplayer.addEventListener("onError", "errorHandler");
	      //ytplayer.seekTo(ytplayer.getDuration()-10);
	      ytplayer.setVolume(100);
	      ytplayer.playVideo();
	    }
});