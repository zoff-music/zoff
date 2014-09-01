<?php

if(isset($_GET['chan']))
{
	header('Location: '.$_GET['chan']);
}


$dir = scandir('./lists');
$channels = array();

foreach($dir as $files)
{
	//echo $files;
	if(strpos($files, '.json') !== FALSE)
	{
		//echo "found some"
		array_push($channels, ucfirst(str_replace(".json", "", $files)));
		//$channels = $channels . str_replace(".json", "", $files) . " ";
	}
}

?>
Zöff
<form name="ufo" action="" class="daform nomargin" id="base" method="get" onsubmit="null;" autocomplete="off">
	<input id="search" name="chan" type="text" class="search_input innbox" spellcheck="false" placeholder="Type Channel Name" autofocus/>
</form>
</div>
<div id="channels">Channels: <br>
	<?php
		foreach($channels as $channel)
		{
			echo "<a class='channels' href='/".$channel."'>".$channel."</a>";
		}
	?>
</div></div>

<div class="footer small centered top anim">&copy; 2014 <a class="anim" href="//nixo.no">Nixo</a> &amp; <a class="anim" href="//kasperrt.no">KasperRT</a> </div>
</body>
</html>