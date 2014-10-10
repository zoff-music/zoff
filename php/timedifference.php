<?php
	$list = explode("/", htmlspecialchars(strtolower($_SERVER["REQUEST_URI"])));
	if($list[1]==""||!isset($list[1])||count($list)<=1)$list="videos";
	else $list=$list[1];
	$list="../lists/".$list.".json";
	$data = json_decode(file_get_contents($list));
	$diff = (time() - $data[1][0]);
	
	$returnArray = array($diff, $data[0][0], time(), $data[1][0], $data[3][0], $data[4][0]);
	$returnArray = json_encode($returnArray);

	echo $returnArray;
?>
