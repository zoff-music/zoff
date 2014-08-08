<?php
/*$host = 'http://'.$_SERVER['HTTP_HOST'].'/+';    
$short = $_SERVER['QUERY_STRING'];*/
$video = htmlspecialchars($_POST['v']);
$name = htmlspecialchars($_POST['n']);


$file = file_get_contents('videos.json');
$data = json_decode($file);
unset($file);
if(isset($_GET['v'])){
	array_push($data, $video);
	file_put_contents('videos.json', json_encode($data));
}
?>