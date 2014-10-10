<?php

if(isset($_GET['chan'])){
	header('Location: '.$_GET['chan']);
}

$dir = scandir('./lists');
$channels = array();
$time = 60*60*24*7*1; //1 uke
foreach($dir as $files){
	if(strpos($files, '.json') !== FALSE){
		if(time() - filemtime('./lists/'.$files) < $time){
			array_push($channels, ucfirst(str_replace(".json", "", $files)));
		}
	}
}

?>

				<div class="bigchan nomargin">Zöff</div>
				<form name="ufo" action="" class="daform nomargin" id="base" method="get" onsubmit="null;" >
					<input list="searches" id="search" name="chan" type="text" class="search_input innbox" spellcheck="false" placeholder="Type Channel Name" autofocus/>
					<datalist id="searches">
					  <?php foreach($channels as $channel){echo "<option value='".urldecode($channel)."'> ";} ?>
					</datalist>
				</form>

			</div>
			<center>
			<div class="channels" id="channels">Active Channels<br>
				<?php foreach($channels as $channel){echo "<a class='channel' href='/".$channel."'>".urldecode($channel)."</a>";} ?>
			</div>
			</center>
		</div>

		<div class="footer small centered top anim bottom">&copy; 2014 <a class="anim" href="//nixo.no">Nixo</a> &amp; <a class="anim" href="//kasperrt.no">KasperRT</a> </div>
	</body>
</html>