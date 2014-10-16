<<<<<<< HEAD
<html>
<head>
	<?php include("php/header.php"); ?>
</head>
<body>
	<div class="top vcent centered">
		<div id="change" class="small">
			<?php 
				if(isset($_GET['chan'])) header('Location: '.$_GET['chan']);
				$list = explode("/", htmlspecialchars(strtolower($_SERVER["REQUEST_URI"])));
				if($list[1]==""||!isset($list[1])||count($list)<=1){$list="";include('php/nochan.php');die();}
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
					<!--<a href="/php/admin.php?list=<?php echo $list; ?>" title="Channel settings" ><img src="/static/settings2.png" class="skip middle" alt="Settings"/></a>-->
					<img src="/static/settings2.png" class="skip middle" alt="Settings" title="Settings" onclick="admin();"/>
					<img src="/static/skip.png" class="skip" alt="Skip" title="Skip" onclick="skip();">
				</div>
					<div id="adminPanel"></div>
					<div id="playlist">
						<div id="wrapper">

						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="footer small centered top anim">&copy; 2014 <a class="anim" href="//nixo.no">Nixo</a> &amp; <a class="anim" href="//kasperrt.no">KasperRT </a>&amp; David  </div>

		<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
		<script type="text/javascript" src="/js/iscroll.js"></script>  
		<script type="text/javascript" src="/js/list.js"></script>  
		<script type="text/javascript" src="/js/youtube.js"></script>
		<script type="text/javascript" src="/js/search.js"></script> 
		<script type="text/javascript" src="/js/admin.js"></script>
		<script type="text/javascript" src="/js/visualize.js"></script> 
</body>
</html>
=======
<?php
/*
 * 
 * File: index.php
 * Description: Main controller
 *
 */

// Require the autoloader
require 'vendor/autoload.php';

// New instance of smarty
$template = new Smarty();

// Set smarty options
$template->left_delimiter = '[[+'; 
$template->right_delimiter = ']]';

// Check if we are in a room or not
if (!isset($_GET['q'])) {
    // Not in a room, fetch active rooms
    
    $dir = scandir('./lists');
    $channels = [];
    $time = 60 * 60 * 24 * 3;
    
    foreach ($dir as $files) {
        if (strpos($files, '.json') !== false) {
            if (time() - filemtime('./lists/' . $files) < $time) {
                $channels[] = ucfirst(str_replace('.json', '', $files));
            }
        }
    }
    
    // Build string for search
    $search_string = '';
    foreach ($channels as $channel) {
        $search_string .= '<option value="' . htmlspecialchars(urldecode($channel)) . '">';
    }
    
    // Build string for displaying active rooms
    $display_string = '';
    foreach ($channels as $channel) {
        $display_string .= '<a class="channel" href="' . htmlspecialchars($channel) . '">' . htmlspecialchars(urldecode($channel)) . '</a>';
    }
    
    // Assign to Smarty
    $template->assign('SEARCH_STRING', $search_string);
    $template->assign('DISPLAY_STRING', $display_string);
    
    // Display template
    $template->display('index.tpl');
}
else {
    // In a room, check if it is a valid room or not
    $template->display('chan.tpl');
}
>>>>>>> Fixed template for the frontpage
