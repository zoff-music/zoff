<?php

if(isset($_GET['chan'])){
	header('Location: '.$_GET['chan']);
}

$dir = scandir('./lists');
$channels = array();

foreach($dir as $files){
	if(strpos($files, '.json') !== FALSE){
		array_push($channels, ucfirst(str_replace(".json", "", $files)));
	}
}

?>

				<div class="bigchan nomargin">Zöff</div>
				<form name="ufo" action="" class="daform nomargin" id="base" method="get" onsubmit="null;" >
					<input id="search" name="chan" type="text" class="search_input innbox" spellcheck="false" placeholder="Type Channel Name" autofocus/>
				</form>

			</div>
			<center>
			<div class="channels" id="channels">Channels: <br>
				<?php foreach($channels as $channel){echo "<a class='channel' href='/".$channel."'>".urldecode($channel)."</a>";} ?>
			</div>
			</center>
		</div>

		<div class="footer small centered top anim bottom">&copy; 2014 <a class="anim" href="//nixo.no">Nixo</a> &amp; <a class="anim" href="//kasperrt.no">KasperRT</a> </div>
	</body>
</html>