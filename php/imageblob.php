<?php

$url = file_get_contents("https://img.youtube.com/vi/" . $_POST['id'] . "/mqdefault.jpg");

$image = new Imagick();
$image->readImageBlob($url);


$image->blurImage(30,50);

$output = $image->getimageblob();

$image->setImageFormat("jpeg");

$image->imageWriteFile (fopen ("/static/images/thumbnails/".$_POST['id'].".jpg", "wb"));

echo base64_encode($output);
?>