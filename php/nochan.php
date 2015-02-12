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
$i = 0;
$tooMany = false;

$dir = "./lists";
chdir($dir);
array_multisort(array_map('filemtime', ($fil = glob("*.json"))), SORT_DESC, $fil);

foreach($fil as $files){
	if(strpos($files, '.json') !== FALSE){
		$time_lasted = time() - filemtime($files);
		if($time_lasted > $to)
		{
			$file = file_get_contents($files); 
			$data = json_decode($file, TRUE);
			$q = array_values($data["nowPlaying"]);
			/*if($q[0]["id"] == "30H2Z8Lr-4c");
				unlink("./lists/".$files);*/
		}
		if($time_lasted < $time){
			$file = file_get_contents($files); //Checking if the channel has the setting for showing on the frontpage set to true.
			$data = json_decode($file, TRUE);
			if(!array_key_exists("frontpage", $data['conf']) || $data['conf']['frontpage'] == "true"){ 						  //If it is true, the channelname will be shown on the frontpage
				array_push($channels, ucfirst(str_replace(".json", "", $files)));
			}
		}
		$i++;
		array_push($all_channels, ucfirst(str_replace(".json", "", $files)));
		if($i > 13)
		{	
			$tooMany = true;
			break;
		}
	}
}

?>

<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:fb="http://ogp.me/ns/fb#">
<head>
	<?php include("header.php"); ?>
</head>
<body>
    <div class="bgimage" id="bgimage"></div>
	<div class="top centered nochanvcent">
		<div id="change" class="small" style="opacity:1;">
				<img id="zicon" src="static/favicon.png">
				<div class="fchan nomargin">Zöff</div>
				<form name="ufo" action="" class="daform nomargin" id="base" method="get" onsubmit="null;" >
					<input title="Type channel name here to create or listen to a channel.
					 Only alphanumerical chars. [a-zA-Z0-9]+" list="searches" id="search" name="chan" required pattern="[a-zA-Z0-9]+" type="text" class="search_input innbox" spellcheck="false" maxlength="15" placeholder="Type Channel Name" autofocus/>
					<datalist id="searches">
					  <?php foreach($all_channels as $channel){echo "<option value='".htmlspecialchars($channel)."'> ";} ?>
					</datalist>
				</form>

			</div>
			<center>
			<div class="channels" id="channels">Active Channels<br>
				<?php foreach($channels as $channel){echo "<a class='channel' href='./".htmlspecialchars($channel)."'>".htmlspecialchars($channel)."</a>";} if($tooMany) echo "<a class='channel' title='Only showing the 12 most active.'>...</a>"; ?>
			</div>
			</center>
		</div>

		<div class="footer small centered top anim bottom">&copy; <?php echo date("Y"); ?> <a class="anim" href="//nixo.no">Nixo</a> &amp; <a class="anim" href="//kasperrt.no">KasperRT</a> </div>
	</body>
</html>
