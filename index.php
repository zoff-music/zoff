<?php 
    if(isset($_GET['chan'])) header('Location: '.$_GET['chan']);
    $list = explode("/", htmlspecialchars(strtolower($_SERVER["REQUEST_URI"])));
    if($list[1]==""||!isset($list[1])||count($list)<=1){$list="";include('php/nochan.php');die();}
    else $list=$list[1];
?>

<html>
<head>
	<?php include("php/header.php"); ?>
</head>
<body>
    <div class="bgimage" id="bgimage"></div>
	<div class="top vcent centered">
		<div id="change" class="small">
			<a id="toptitle" href="/">Zöff</a>
			<div id="chan" class="chan" title="Show big URL" onclick="show()"><?php echo(ucfirst($list));?></div>
			<input id="search" name="v" type="text" class="search_input innbox" spellcheck="false" placeholder="Search" onsubmit="null;" autocomplete="off"/>
			<div id="results"></div>
			<div class="main">
				<div id="player" class="ytplayer"></div>
				<div class="playlist" >
				<div id="buttons" class="">
					<!--<a href="/php/admin.php?list=<?php echo $list; ?>" title="Channel settings" ><img src="/static/settings2.png" class="skip middle" alt="Settings"/></a>-->
					<img src="static/settings2.png" class="skip middle" alt="Settings" title="Settings" onclick="admin();"/>
					<img src="static/skip.png" class="skip" alt="Skip" title="Skip" onclick="skip();">

				</div>
					<div class="result hiddenAdmin" id="adminPanel"><?php include("php/panel.php");?> </div>
					<div id="playlist">
						<div id="wrapper">

						</div>
					</div>
				</div>
				<div id="controls"></div>
				<div id="olay" class="hide"><span>Empty Playlist</span></div>
			</div>
		</div>
		<?php include("php/footer.php"); ?>
</body>
</html>
