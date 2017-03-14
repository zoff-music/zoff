<!DOCTYPE html>
<?php
    $guid=substr(base64_encode(crc32($_SERVER['HTTP_USER_AGENT'].$_SERVER['REMOTE_ADDR'].$_SERVER['HTTP_ACCEPT_LANGUAGE'])), 0, 8);
    if(isset($_GET['__mref']) || isset($_GET['fb_source']) || isset($_GET['ref']) || isset($_GET['fref'])) {header('Location: /'); exit;}
    else if(isset($_GET['chan'])) {header('Location: '.$_GET['chan']); exit;}
    $list = explode("/", htmlspecialchars(strtolower($_SERVER["REQUEST_URI"])));
    if($list[1]==""||!isset($list[1])||count($list)<=1){$list="";include('public/php/frontpage.php');die();}
    else{$list=preg_replace("/[^A-Za-z0-9 ]/", '', $list[1]);include('public/php/channel.php');die();}
?>
