<?php
    $guid=substr(base64_encode(crc32($_SERVER['HTTP_USER_AGENT'].$_SERVER['REMOTE_ADDR'].$_SERVER['HTTP_ACCEPT_LANGUAGE'])), 0, 8);
    if(isset($_GET['chan'])) {header('Location: '.$_GET['chan']); exit;}
    $list = explode("/", htmlspecialchars(strtolower($_SERVER["REQUEST_URI"])));
    if($list[1]==""||!isset($list[1])||count($list)<=1){$list="";}
    else $list=$list[1];
?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:fb="http://ogp.me/ns/fb#" ng-app="myApp">
<head>
<base href="/">
    <?php include("php/header.php"); ?>
</head>
<body ng-controller="body">
<header>
    <div ui-view="navbar"></div>
</header>
<div ui-view="main"  style="flex: 1 0 auto;">
    
</div>
<?php include("php/footer.php"); ?>
</body>
</html>