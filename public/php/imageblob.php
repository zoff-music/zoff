<?php

$url = file_get_contents("https://img.youtube.com/vi/".$_POST['id']."/mqdefault.jpg");

$image = new Imagick();
$image->readImageBlob($url);


$image->blurImage(30,50);

$output = $image->getimageblob();

$image->setImageFormat("jpeg");

file_put_contents ("../images/thumbnails/".$_POST['id'].".jpg", $image);

echo base64_encode($output);
?>
