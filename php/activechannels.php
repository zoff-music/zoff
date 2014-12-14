<?php

$dir = scandir('../lists');
$channels = array();
$all_channels = array();
$time = 60*60*24*4; //4 dager
foreach($dir as $files){
	if(strpos($files, '.json') !== FALSE){
		if(time() - filemtime('./lists/'.$files) < $time){
			array_push($channels, ucfirst(str_replace(".json", "", $files)));
		}
		array_push($all_channels, ucfirst(str_replace(".json", "", $files)));
	}
}

print_r(json_encode($channels));

?>