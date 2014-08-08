<?php
/*$host = 'http://'.$_SERVER['HTTP_HOST'].'/+';    
$short = $_SERVER['QUERY_STRING'];*/
$video = $_GET['v'];
$name = $_GET['n'];

$list = file_get_contents('video.json');
if(isset($video)){
file_put_contents("video.json", $video);
}
?>

<html>
    <head>
        <title>Zöff</title>
        <link rel="stylesheet" type="text/css" href="static/style.css" title="Default" />
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
            <script type="text/javascript" src="static/swfobject.js"></script>    
            <div id="ytapiplayer">
              You need Flash player 8+ and JavaScript enabled to view this video.
            </div>

            <script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
            <script type="text/javascript">
              var response = $.ajax({type: "GET", url: "/r/video.json", async: false }).responseText;
              var params = { allowScriptAccess: "always", controls:0, autoplay:1};
              var atts = { id: "myytplayer" };
              swfobject.embedSWF("http://www.youtube.com/v/"+response+
              									 "?enablejsapi=1&playerapiid=ytplayer&version=3&controls=1&iv_load_policy=3&autohide=1", //&autoplay=1
                                 "ytapiplayer", "825", "462", "8", null, null, params, atts);

            </script>
          <br>
          <?php print_r($list); ?>
        </div>
        
    </body>
</html>