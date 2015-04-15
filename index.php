<?php

    $guid=substr(base64_encode(crc32($_SERVER['HTTP_USER_AGENT'].$_SERVER['REMOTE_ADDR'].$_SERVER['HTTP_ACCEPT_LANGUAGE'])), 0, 8);
    if(isset($_GET['chan'])) {header('Location: '.$_GET['chan']); exit;}
    $list = explode("/", htmlspecialchars(strtolower($_SERVER["REQUEST_URI"])));
    if($list[1]==""||!isset($list[1])||count($list)<=1){$list="";include('php/nochan.php');die();}
    else $list=$list[1];

?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:fb="http://ogp.me/ns/fb#">
<head>
	<?php include("php/header.php"); ?>
  <link rel="stylesheet" type="text/css" href="static/css/controlstyle.css" />
</head>
<body>
    <header>
        <nav id="nav">
            <div class="nav-wrapper">
                <a href="//zoff.no" class="brand-logo hide-on-small-only">
                    <img id="zicon" src="static/images/squareicon_small.png" alt="zöff" title="Zöff">
                </a>
                <div class="brand-logo">
                    <a href="//zoff.no" class="hide-on-med-and-up">Zöff</a>
                    <span class="hide-on-med-and-up">/</span>
                    <span id="chan" class="chan hide" title="Show big URL" onclick="show()"><?php echo(ucfirst($list));?></span>
                </div>
                <ul class="right">
                    <li>
                        <a class="nav-btn" href="#" id="skip" onclick="skip();">
                            <i class="mdi-av-skip-next"></i>
                            <span class="hover-text">Skip</span>
                        </a>
                    </li>
                    <li>
                        <a class="nav-btn" href="#" data-activates="settings-bar" id="settings">
                            <i class="mdi-action-settings"></i>
                            <span class="hover-text">Conf</span>
                        </a>
                    </li>
                </ul>
                <ul class="side-nav" id="settings-bar">
                    <?php include("php/panel.php");?>
                </ul>
                <form id="searchform" onsubmit="return false">
                    <div>
                        <input id="search" class="search_input" type="search" required title="Search for songs..." spellcheck="false" placeholder="Search" onsubmit="null;" autocomplete="off">
                        <!--<label for="search"><i class="mdi-action-search"></i></label>
                        <i class="mdi-navigation-close"></i>-->
                    </div>
                </form>
                <div id="results"></div>
            </div>
        </nav>
    </header>
    <main class="container center-align main">
        <div class="row">
            <div class="col s12 m9 video-container">
                <div id="player" class="ytplayer"></div>
                <div id="controls">
                  <div id="playpause">
                    <i id="play" class="mdi-av-play-arrow hide"></i>
                    <i id="pause" class="mdi-av-pause"></i>
                  </div>
                  <div id="duration">00:00 / 00:00</div>
                  <div id="volume-button">
                    <i id="v-mute" class="mdi-av-volume-off"></i>
                    <i id="v-low" class="mdi-av-volume-mute"></i>
                    <i id="v-medium" class="mdi-av-volume-down"></i>
                    <i id="v-full" class="mdi-av-volume-up"></i>
                  </div>
                  <div id="volume"></div>
                  <div id="fullscreen">
                    <i class="mdi-navigation-fullscreen"></i>
                  </div>
                  <div id="bar"></div>
                </div>
            </div>
            <div id="playlist" class="col s12 m3">
                <div id="wrapper">
                    <div id="list-song-html">
                        <div id="list-song" class="card list-song">
                            <a class="clickable votebg" title="Vote!">
                                <span class="card-image cardbg list-image"></span>
                            </a>
                            <span class="card-content">
                                <span class="flow-text truncate list-title"></span>
                                <span class="highlighted">Votes:&nbsp;</span>
                                <span class="list-votes"></span>
                            </span>
                            <div class="card-action hide">
                                <a id="del" onclick="vote('id','del')" class="clickable" class="waves-effect waves-orange btn-flat">Remove</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <?php include("php/footer.php"); ?>

    </body>
</html>
