<?php

if(isset($_GET['chan'])){
	$chan = htmlspecialchars($_GET['chan']);
	header('Location: '.$chan);
}

$dir = scandir('./lists');
$channels = array();
$all_channels = array();
$time = 60*60*24*4; //4 dager
$to = 60*60*24*2;
foreach($dir as $files){
	if(strpos($files, '.json') !== FALSE){
		$time_lasted = time() - filemtime('./lists/'.$files);
		if($time_lasted > $to)
		{
			clearstatcache();
			$size = filesize('./lists/'.$files);
			if($size < 200){
				unlink("./lists/".$files);
				$size;
			}
		}
		if($time_lasted < $time){
			$file = file_get_contents('./lists/'.$files); //Checking if the channel has the setting for showing on the frontpage set to true.
			$data = json_decode($file, TRUE);
			$conf = $data['conf']['frontpage'];
			if($conf == "true"){ 						  //If it is true, the channelname will be shown on the frontpage
				array_push($channels, ucfirst(str_replace(".json", "", $files)));
			}
		}
		array_push($all_channels, ucfirst(str_replace(".json", "", $files)));
	}
}

  $bg = array('bg1.jpg', 'bg2.jpg', 'bg3.jpg', 'bg4.jpg', 'bg5.jpg' ); // array of filenames

  $i = rand(0, count($bg)-1); // generate random number size of the array
  $selectedBg = "$bg[$i]"; // set variable equal to which random filename was chosen

?>

<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:fb="http://ogp.me/ns/fb#">
<head>
	<style type="text/css">
		<!--
		.bgimage{
			background: url(./static/<?php echo $selectedBg; ?>) no-repeat;
		}
		-->
	</style>
	<?php include("php/header.php"); ?>
</head>
<body>
    <div class="bgimage" id="bgimage"></div>
	<div class="top centered nochanvcent">
		<div id="change" class="small">
				<div class="bigchan nomargin">Zöff</div>
				<form name="ufo" action="" class="daform nomargin" id="base" method="get" onsubmit="null;" >
					<input list="searches" id="search" name="chan" type="text" class="search_input innbox" spellcheck="false" maxlength="15" placeholder="Type Channel Name" autofocus/>
					<datalist id="searches">
					  <?php foreach($all_channels as $channel){echo "<option value='".htmlspecialchars(urldecode($channel))."'> ";} ?>
					</datalist>
				</form>

			</div>
			<center>
			<div class="channels" id="channels">Active Channels<br>
				<?php foreach($channels as $channel){echo "<a class='channel' href='./".htmlspecialchars($channel)."'>".htmlspecialchars(urldecode($channel))."</a>";} ?>
			</div>
			</center>
		</div>

		<div class="footer small centered top anim bottom">&copy; 2014 <a class="anim" href="//nixo.no">Nixo</a> &amp; <a class="anim" href="//kasperrt.no">KasperRT</a> </div>
	</body>
</html>
