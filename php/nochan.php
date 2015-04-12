<?php

if(isset($_GET['chan'])){
    $chan = htmlspecialchars($_GET['chan']);
    header('Location: '.$chan);
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
                <a href="#" class="brand-logo hide-on-small-only">
                    <img id="zicon" src="static/images/squareicon_small.png" alt="zöff" title="Zöff">
                </a>
                <a href="zoff.no" class="brand-logo hide-on-med-and-up">Zöff</a>
                <ul id="nav-mobile" class="right hide-on-med-and-down">
                    <li><a href="#">About</a></li>
                    <li><a href="#">GitHub</a></li>
                    <li><a href="#">Legal</a></li>
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
                        <label for="search">Find or create radio channel</label>
                        <datalist id="searches">
                        </datalist>
                </div>
            </form>
        </div>

        <div class="section">
            <ul class="row" id="channels">
                <li id="chan-html">
                    <li id="chan-card" class="col s12 m4 l3">
                        <div class="card">
                            <a class="chan-link">
                                <div class="chan-bg card-image cardbg"></div>
                            </a>
                            <div class="card-content">
                                <p class="left-align">
                                    <span class="chan-name flow-text truncate"></span>
                                    <br>
                                    <span class="highlighted">Viewers:&nbsp</span>
                                    <span class="chan-views"></span>
                                    <br>
                                    <span class="highlighted">Songs:&nbsp</span>
                                    <span class="chan-songs"></span>
                                </p>
                            </div>
                            <div class="card-action">
                                <a class="chan-link waves-effect waves-orange btn-flat">Listen</a>
                            </div>
                        </div>
                    </li>
                </li>
            </ul>
        </div>
    </main>

    <footer class="page-footer">
        <div class="container">
            <div class="row">
                <div class="col l6 s12">
                    <h5 class="white-text">Zöff</h5>
                    <p class="grey-text text-lighten-4">The shared youtube radio</p>
                    <p class="grey-text text-lighten-4">
                        Being built around the youtube search and video API
                        it enables the creation of collaboratiive and shared live playlists,
                        with billions of videos and songs to choose from, all for free and without registration.
                        <br>
                        Enjoy!
                    </p>
                </div>
                <div class="col l4 offset-l2 s12 valign-wrapper">
                    <ul>
                        <li>
                            <a href="https://play.google.com/store/apps/details?id=no.lqasse.zoff">
                                <img title="Get it on Google Play" src="static/images/google_play.png">
                            </a>
                            <a href="https://github.com/nixolas1/Zoff">
                                <img title="Contribute on GitHub" src="static/images/GitHub_Logo.png">
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="footer-copyright">
            <div class="container">
                &copy; <?php echo date("Y"); ?>
                <a href="//nixo.no">Nixo</a> &amp;
                <a href="//kasperrt.no">KasperRT</a>
            </div>
        </div>
    </footer>

    <script src="//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
    <script src="https://cdn.socket.io/socket.io-1.2.0.js"></script>
    <script type="text/javascript" src="static/js/lib/materialize.js"></script>
    <script type="text/javascript" src="static/js/nochan.js"></script>
	  <noscript><p><img src="//zoff.no/analyse/piwik.php?idsite=1" style="border:0;" alt="" /></p></noscript>
	</body>
</html>
