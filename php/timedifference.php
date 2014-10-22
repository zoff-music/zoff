<?php
	$list = explode("/", htmlspecialchars(strtolower($_SERVER["REQUEST_URI"])));
	if($list[1]==""||!isset($list[1])||count($list)<=1)$list="videos";
	else $list=$list[1];
	$list="../lists/".$list.".json";
	$data = json_decode(file_get_contents($list), true);
	$songs = $data["nowPlaying"];
	$id = array_values($songs);
	if(count($id)>0){
		$diff = (time() - $data["conf"]["startTime"]);
		$returnArray = array($diff, $id[0]["id"], time(), $data["conf"]["startTime"], $id[0]["title"], $data["conf"]["views"]);
		$returnArray = json_encode($returnArray);
		echo $returnArray;
	}else{
		echo("[0,0,0,0,0,0]");
	}
?>
