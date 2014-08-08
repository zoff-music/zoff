<?php
/*$host = 'http://'.$_SERVER['HTTP_HOST'].'/+';    
$short = $_SERVER['QUERY_STRING'];*/
$video = htmlspecialchars($_GET['v']);
$name = htmlspecialchars($_GET['n']);

$list = json_decode(file_get_contents('videos.json'));
if(isset($_GET['v'])){
	$file = file_get_contents('videos.json');
	$data = json_decode($file);
	unset($file);//prevent memory leaks for large json.
}
?>

<html>
    <head>
        <title>Zöff</title>
        <link rel="stylesheet" type="text/css" href="style.css" title="Default" />
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    </head>
    <body>

        <div class="top vcent centered">
         <div id="change" class="small">
         	<div class="big">Zöff</div>
          Zöff
          <form name="ufo" action="" class="daform" id="base" method="get" onsubmit="return submitform();">
                    <input id="longurl" name="v" type="text" class="innbox" />
                </form>
          </div>
            <script type="text/javascript" src="swfobject.js"></script>    
			<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>   
            <div id="ytapiplayer">
				You need Flash player 8+ and JavaScript enabled to view this video.
			  </div>

			  <script>
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
							},500);
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
				
			  </script>
          <br>
          <?php print_r($list); ?>
        </div>
        
    </body>
</html>