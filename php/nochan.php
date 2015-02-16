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
$v = 0;
$tooMany = false;

$dir = "./lists";
chdir($dir);
array_multisort(array_map('filemtime', ($fil = glob("*.json"))), SORT_DESC, $fil);
$viewers = array();

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
			if($i <= 12 && (!array_key_exists("frontpage", $data['conf']) || $data['conf']['frontpage'] == "true")){ 						  //If it is true, the channelname will be shown on the frontpage
				array_push($channels, ucfirst(str_replace(".json", "", $files)));
				array_push($viewers, sizeof($data["conf"]["views"]));
			}
		}
		$i++;
		array_push($all_channels, ucfirst(str_replace(".json", "", $files)));
	}
}

?>

<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:fb="http://ogp.me/ns/fb#">
<head>
	<style>
		#change {
			opacity:1 !important;

		}
	</style>
	<?php include("header.php"); ?>
	<style type="text/css">
		.bgimage{
			background: url(./static/<?php echo $selectedBg; ?>) no-repeat;
			-webkit-transition: opacity 1s;
			background-size: 500%;
			background-repeat: no-repeat;
			background-position: center center;
			background-color: #000;
			/* background-image: url(bg5.jpg); */
			-webkit-filter: blur(50px) brightness(0.8);
			-moz-filter: blur(50px) brightness(0.8);
			-ms-filter: blur(50px) brightness(0.8);
			-o-filter: blur(50px) brightness(0.8);
			filter: blur(50px) brightness(0.8);
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			opacity: 1;
		}
	</style>
</head>
<body>
    <div class="bgimage" id="bgimage"></div>
	<div class="top centered nochanvcent">
		<div id="change" class="small">
				<img id="zicon" src="static/favicon.png">
				<div class="fchan nomargin">Zöff</div>
				<form name="ufo" action="" class="daform nomargin" id="base" method="get" onsubmit="null;" >
					<input title="Type channel name here to create or listen to a channel.
					 Only alphanumerical chars. [a-zA-Z0-9]+" list="searches" id="search" name="chan" required pattern="[a-zA-Z0-9]+" type="text" class="search_input innbox" spellcheck="false" maxlength="18" placeholder="Type Channel Name" autofocus/>
					<datalist id="searches">
					  <?php foreach($all_channels as $channel){echo "<option value='".htmlspecialchars($channel)."'> ";} ?>
					</datalist>
				</form>

			</div>
			<center>
			<div class="channels" id="channels">Active Channels<br>
				<?php foreach($channels as $channel){echo "<a class='channel' href='./".htmlspecialchars($channel)."' title='Viewers: ~".$viewers[$v]."'>".htmlspecialchars($channel)."</a>"; $v++;} ?>
			</div>
			</center>
		</div>

		<div class="footer small centered top anim bottom">&copy; <?php echo date("Y"); ?> <a class="anim" href="//nixo.no">Nixo</a> &amp; <a class="anim" href="//kasperrt.no">KasperRT</a> </div>
		<script type="text/javascript">
			var deg = 0;
			var pr = 15;
			document.getElementById("zicon").addEventListener("click", function(){
				deg = deg + 365;
				pr = pr + 0.5;
				document.getElementById("zicon").style.transform = "rotate("+deg+"deg)";
				document.getElementById("zicon").style.width = pr+"%";
				if(pr >= 60)
					window.location.href = 'https://www.youtube.com/v/mK2fNG26xFg?autoplay=1&showinfo=0&autohide=1';
			});
		</script>
	</body>
</html>
