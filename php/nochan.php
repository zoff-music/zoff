<?php

if(isset($_GET['chan'])){
	$chan = htmlspecialchars($_GET['chan']);
	header('Location: '.$chan);
}

$dir = scandir('./lists');
$channels = array();
$all_channels = array();
$time = 60*60*24*4; //4 dager
$to = 60*60*24*2;
$i = 0;
$v = 0;
$tooMany = false;

$dir = "./lists";
chdir($dir);
array_multisort(array_map('filemtime', ($fil = glob("*.json"))), SORT_DESC, $fil);
$viewers = array();

foreach($fil as $files){
	if(strpos($files, '.json') !== FALSE){
		$time_lasted = time() - filemtime($files);
		if($time_lasted > $to)
		{
			$file = file_get_contents($files); 
			$data = json_decode($file, TRUE);
			$q = array_values($data["nowPlaying"]);
			/*if($q[0]["id"] == "30H2Z8Lr-4c");
				unlink("./lists/".$files);*/
		}
		if($time_lasted < $time){
			$file = file_get_contents($files); //Checking if the channel has the setting for showing on the frontpage set to true.
			$data = json_decode($file, TRUE);
			if($i <= 12 && (!array_key_exists("frontpage", $data['conf']) || $data['conf']['frontpage'] == "true")){ 						  //If it is true, the channelname will be shown on the frontpage
				array_push($channels, ucfirst(str_replace(".json", "", $files)));
				array_push($viewers, sizeof($data["conf"]["views"]));
			}
		}
		$i++;
		array_push($all_channels, ucfirst(str_replace(".json", "", $files)));
	}
}

?>

<html xmlns="http://www.w3.org/1999/xhtml" xmlns:fb="http://ogp.me/ns/fb#">
<head>
	<?php include("header.php"); ?>
</head>
<body>
	<header>
		<nav>
			<div class="nav-wrapper">
				<a href="zoff.no" class="brand-logo hide-on-small-only"><img id="zicon" src="static/images/favicon.png" alt="zöff"></a>
				<a href="zoff.no" class="brand-logo hide-on-med-and-up">Zöff</a>
				<ul id="nav-mobile" class="right hide-on-med-and-down">
					<li><a href="sass.html">Sass</a></li>
					<li><a href="components.html">Components</a></li>
					<li><a href="javascript.html">JavaScript</a></li>
				</ul>
			</div>
		</nav>
	</header>

	<main class="center-align container">
		<div class="section">
			<form class="row" id="base" method="get">
        			<div class="input-field col s12">
						<input 
							class="input-field"
							type="text" 
							id="search" 
							name="chan" 
							title="Type channel name here to create or listen to a channel. Only alphanumerical chars. [a-zA-Z0-9]+" 
							autocomplete="off" 
							list="searches" 
							required pattern="[a-zA-Z0-9]+" 
							spellcheck="false" 
							maxlength="18" 
							autofocus
						/>
						<label for="search">Channel name</label>
						<datalist id="searches">
							<?php foreach($all_channels as $channel){echo "<option value='".htmlspecialchars($channel)."'> ";} ?>
						</datalist>
				</div>
			</form>
		</div>
		<div class="divider"></div>
		<div class="section container">
			<?php foreach($channels as $channel){
				$ch=htmlspecialchars($channel);
				echo "<a class='channel' href='./".$ch."' title='Viewers: ~".$viewers[$v]."'>".$ch."</a>
			"; $v++;} 
			?>
		</div>
	</main>

	<footer class="page-footer">
		<div class="badge">
			<a href="https://play.google.com/store/apps/details?id=no.lqasse.zoff">
				<img alt="Get it on Google Play" src="static/images/google_play.png">
			</a>
		</div>
		&copy; <?php echo date("Y"); ?>
		<a href="//nixo.no">Nixo</a> &amp; 
		<a href="//kasperrt.no">KasperRT</a> 
	</footer>

	<script src="//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
	<script type="text/javascript" src="static/js/nochan.js"></script>
	<script type="text/javascript" src="static/js/lib/materialize.js"></script>

	<!-- Piwik tracking -->
	<script type="text/javascript">
	  var _paq = _paq || [];
	  _paq.push(['trackPageView']);
	  _paq.push(['enableLinkTracking']);
	  (function() {
	    var u="//zoff.no/analyse/";
	    _paq.push(['setTrackerUrl', u+'piwik.php']);
	    _paq.push(['setSiteId', 1]);
	    var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
	    g.type='text/javascript'; g.async=true; g.defer=true; g.src=u+'piwik.js'; s.parentNode.insertBefore(g,s);
	  })();
	</script>
	<noscript><p><img src="//zoff.no/analyse/piwik.php?idsite=1" style="border:0;" alt="" /></p></noscript>
	<!-- End Piwik Code -->

	</body>
</html>
