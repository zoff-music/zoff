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
        <nav id="fp-nav">
            <div class="nav-wrapper">
                <a href="#" class="brand-logo hide-on-small-only">
                    <img id="zicon" src="static/images/squareicon_small.png" alt="zöff" title="Zöff">
                </a>
                <a href="zoff.no" class="brand-logo hide-on-med-and-up">Zöff</a>
                <ul id="nav-mobile" class="right hide-on-med-and-down">
                    <li><a class="modal-trigger" onclick="$('#about').openModal()">About</a></li>
                    <li><a href="https://github.com/nixolas1/Zoff">GitHub</a></li>
                    <li><a class="modal-trigger" onclick="$('#legal').openModal()">Legal</a></li>
                </ul>
            </div>
        </nav>
        <div id="legal" class="modal">
            <div class="modal-content">
                <h4>Legal</h4>
                <p>Copyright © 2015 Nicolas Tonne and Kasper Rynning-Tønnesen<br><br>

Creative Commons License<br>
Zöff by Nixo & KasperRT is licensed under a <a href="http://creativecommons.org/licenses/by-nc-nd/3.0/no/">Creative Commons Attribution-NonCommercial-NoDerivs 3.0 Norway License.</a>
<br><br>
This product is not to be distributed for pay, or to be altered with without permission of the creators. If anything is to be altered with, the Copyright footer is to stand on the bottom of the website, and it shall remain named Zöff</p>
            </div>
            <div class="modal-footer">
                <a href="#!" class=" modal-action modal-close waves-effect waves-green btn-flat">Close</a>
            </div>
        </div>
        <div id="about" class="modal">
            <div class="modal-content">
                <h4>About</h4>
                <p>Zöff is a shared (free) YouTube based radio service, built upon the YouTube API. <br><br>
                Zöff is mainly a webbased service, but an Android app is made by Lasse Drevland, which has been a huge asset for the dev. team.<br><br>
                The website builds mainly on PHP, and NodeJS with Socket.IO and MongoDB on the backend. More about the project itself can be found on GitHub<br><br>
                The team consists of Kasper Rynning-Tønnesen and Nicolas Almagro Tonne, and the project has been worked on since late 2014.<br><br>
                The team can be reached on either <a href="mailto:kasper@kasperrt.no?Subject=Contact%20Zoff">kasper@kasperrt.no</a> or <a href="mailto:me@nixo.no?Subject=Contact%20Zoff">me@nixo.no</a>
                </p>
            </div>
            <div class="modal-footer">
                <a href="#!" class=" modal-action modal-close waves-effect waves-green btn-flat">Close</a>
            </div>
        </div>
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
                <div id="chan-html">
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
                </div>
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
