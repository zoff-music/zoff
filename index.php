<html>
<head>
	<title>Zöff</title>
	<meta name="author" content="Nicolas 'Nixo' Almagro Tonne &amp; Kasper 'KasperRT' Rynning-Tønnesen">
	<link rel="stylesheet" type="text/css" href="/style.css" title="Default" />
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<link rel="icon" type="image/png" href="/static/favicon.png"/>
	<link href='http://fonts.googleapis.com/css?family=Open+Sans:300' rel='stylesheet' type='text/css'>
</head>
<body>
	<div class="top vcent centered">
		<div id="change" class="small">
			<?php 
				if(isset($_GET['chan'])) header('Location: '.$_GET['chan']);
				$list = explode("/", htmlspecialchars(strtolower($_SERVER["REQUEST_URI"])));
				if($list[1]==""||!isset($list[1])||count($list)<=1){$list="";include('nochan.php');die();}
				else $list=$list[1];
			?>
			<a id="toptitle" href="/">Zöff</a>
			<div id="chan" class="chan" title="Show big URL" onclick="show()"><?php echo(ucfirst($list));?></div>
			<input id="search" name="v" type="text" class="search_input innbox" spellcheck="false" placeholder="Search" onsubmit="null;" autocomplete="off"/>
			<div id="results"></div>
			<div class="main">
				<div id="player" class="ytplayer"></div>

				<div class="playlist" >
				<div id="buttons" class="result">
					<img src="/static/skip.png" class="skip" alt="Skip" title="Skip" onclick="skip();">
				</div>
					<div id="playlist">
						<div id="wrapper">

						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="footer small centered top anim">&copy; 2014 <a class="anim" href="//nixo.no">Nixo</a> &amp; <a class="anim" href="//kasperrt.no">KasperRT</a> </div>

		<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
		<script type="text/javascript" src="/swfobject.js"></script>
		<script type="text/javascript" src="/iscroll.js"></script>  
		<script type="text/javascript" src="/list.js"></script>  
		<script type="text/javascript" src="/youtube.js"></script>
		<script type="text/javascript" src="/search.js"></script> 
		<script type="text/javascript" src="/visualize.js"></script> 
</body>
</html>