<?php

    if(isset($_GET['chan'])) {header('Location: '.$_GET['chan']); exit;}
    $list = explode("/", htmlspecialchars(strtolower($_SERVER["REQUEST_URI"])));
    if($list[1]==""||!isset($list[1])||count($list)<=1){$list="";include('php/nochan.php');die();}
    else $list=$list[1];

?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:fb="http://ogp.me/ns/fb#">
<head>
    <?php include("php/header.php"); ?>
</head>
<body>
    <header>
        <div class="navbar-fixed">
            <nav>
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
                            <a class="nav-btn" href="#" onclick="admin();" data-activates="mobile-demo" id="settings">
                                <i class="mdi-action-settings"></i>
                                <span class="hover-text">Conf</span>
                            </a>
                        </li>
                    </ul>
                    <ul class="side-nav" id="mobile-demo">
                        <?php include("php/panel.php");?>
                    </ul>
                    <form id="searchform">
                        <div>
                            <input id="search" type="search" required title="Search for songs..." spellcheck="false" placeholder="Search" onsubmit="null;" autocomplete="off">
                            <!--<label for="search"><i class="mdi-action-search"></i></label>
                            <i class="mdi-navigation-close"></i>-->
                        </div>
                    </form>
                </div>
            </nav>
        </div>
    </header>

    <main class="container center-align main">
        <div class="row">
            <div class="col s12 m9 video-container">
                <div id="player" class="ytplayer"></div>
            </div>
            <div id="playlist" class="col s12 m3">
                <div id="wrapper">
                    <div id="list-song-html">
                        <div id="list-song" class="card list-song">
                            <a class="clickable votebg">
                                <div class="card-image cardbg list-image"></div>
                            </a>
                            <div class="card-content">
                                <p class="left-align">
                                    <span class="flow-text truncate list-title"></span>
                                    <span class="highlighted hide">Votes:&nbsp;</span>
                                    <span class="list-votes hide"></span>
                                </p>
                            </div>
                            <div class="card-action hide">
                                <a id="del" onclick="vote('id','del')" class="clickable" class="waves-effect waves-orange btn-flat">Remove</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
    <div id="controls"></div>

    <?php include("php/footer.php"); ?>
    </body>
</html>
