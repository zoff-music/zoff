<?php

    if(isset($_GET['chan'])) {header('Location: '.$_GET['chan']); exit;}
    $list = explode("/", htmlspecialchars(strtolower($_SERVER["REQUEST_URI"])));
    if($list[1]==""||!isset($list[1])||count($list)<=1){$list="";include('php/nochan.php');die();}
    else $list=$list[1];

?>

<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:fb="http://ogp.me/ns/fb#">
<head>
	<?php include("php/header.php"); ?>
	<script src="https://cdn.socket.io/socket.io-1.2.0.js"></script>
	<script src="http://code.jquery.com/jquery-1.11.1.js"></script>
	<script>
		var socket = io.connect('http://localhost:3000');
		var guid = "<?php $guid=substr(base64_encode(crc32($_SERVER['HTTP_USER_AGENT'].$_SERVER['REMOTE_ADDR'].$_SERVER['HTTP_ACCEPT_LANGUAGE'])), 0, 8); echo $guid; ?>";
		socket.emit('list', '<?php echo $list; ?>,'+guid);
	</script>
	<script src="js/socket_list.js"></script>
</head>
<body>
	<div id="pBar"></div>
	<div id="sBar"></div>
	<div id="eBar"></div>
    <div class="bgimage" id="bgimage"></div>
	<div class="top vcent centered">
		<div id="change" class="small">
			<div id="mobile-banner">
				<div class="inner"></div>
				<h3 id="innerTitle"><a href="/">Zöff</a>
					<br>
					<span id="innerChan"><?php echo(ucfirst($list));?></span>
				</h3>
				<div id="mobileTitle"></div>
				<!--<div id="viewers">2 viewers</div>-->
			</div>
			<a id="toptitle" href="/">Zöff</a>
			<div id="chan" class="chan" title="Show big URL" onclick="show()"><?php echo(ucfirst($list));?></div>
			<input id="search" name="v" title="Search for songs..." type="text" class="search_input innbox" spellcheck="false" placeholder="Search" onsubmit="null;" autocomplete="off"/>
			<div id="results"></div>
			<div class="main">
				<div id="player" class="ytplayer"></div>
				<div id="jplayer" class="jp"></div>
				<div class="playlist" >
				<div id="buttons" class="">
					<!--<a href="/php/admin.php?list=<?php echo $list; ?>" title="Channel settings" ><img src="/static/settings2.png" class="skip middle" alt="Settings"/></a>-->
					<img src="static/settings2.png" id="settings" class="skip middle" alt="Settings" title="Settings" onclick="admin();"/>
					<img src="static/skip.png" class="skip" alt="Skip" title="Skip" onclick="skip();">

				</div>
					<div class="result hiddenAdmin" id="adminPanel"><?php include("php/panel.php");?> </div>
					<form id="findform" onsubmit="return false;">
							<input id="findform-input" type="text" onsubmit="null;" placeholder="Search list..">
							<label id="numfound"></label>
					</form>
					<div id="playlist">
						<div id="wrapper">
							<img src="static/ajax-loader.gif" id="loading" alt="loading">
						</div>
					</div>
				</div>
			</div>
			<div id="controls"></div>
		</div>
	</div>
	<?php include("php/footer.php"); ?>

</body>
</html>
