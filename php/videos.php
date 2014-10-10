<?php
$list = htmlspecialchars($_REQUEST['list']);
if(!isset($_REQUEST['list']))$list="videos";
$filename = "../lists/".$list.'.json';
if(!file_exists($filename)){ $f=fopen($filename, "a+"); fwrite($f,"[]"); fclose($f);}
$file = file_get_contents($filename);
print($file);
?>