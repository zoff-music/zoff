<?php

$url = file_get_contents("https://img.youtube.com/vi/" . $_POST['id'] . "/hqdefault.jpg");

$image = new Imagick();
$image->readImageBlob($url);


$image->blurImage(30,50);

$output = $image->getimageblob();

echo base64_encode($output);
?>