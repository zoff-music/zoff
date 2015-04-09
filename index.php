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
                    <div class="brand-logo center">
                        <a href="zoff.no" class="hide-on-med-and-up">Zöff</a>
                        <span class="hide-on-med-and-up">/</span>
                        <span id="chan" class="chan" title="Show big URL" onclick="show()"><?php echo(ucfirst($list));?></span>
                    </div>
                    <form>
                        <div class="input-field">
                            <input id="search" type="search" required title="Search for songs..." spellcheck="false" placeholder="Search" onsubmit="null;" autocomplete="off">
                            <label for="search"><i class="mdi-action-search"></i></label>
                            <i class="mdi-navigation-close"></i>
                        </div>
                    </form>
                    <ul id="nav-mobile" class="right">
                        <li>
	                        <a href="#" id="settings" onclick="skip();">
	                            <i class="mdi-av-skip-next"></i>
                                Skip
	                        </a>
                        </li>
                        <li>
                            <a href="#" onclick="admin();">
                                <i class="mdi-action-settings"></i>
                                Settings
                            </a>
                        </li>
                    </ul>
                    <ul class="side-nav" id="mobile-demo">
                        <li><a href="sass.html">Sass</a></li>
                        <li><a href="components.html">Components</a></li>
                        <li><a href="javascript.html">Javascript</a></li>
                        <li><a href="mobile.html">Mobile</a></li>
                    </ul>
                </div> 
            </nav>
        </div>
    </header>

    <main class="center-align container"> 
        <div class="section">
            
        </div>
    </main>

    <?php include("php/footer.php"); ?>
    </body>
</html>