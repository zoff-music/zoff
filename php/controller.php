<html xmlns="http://www.w3.org/1999/xhtml" xmlns:fb="http://ogp.me/ns/fb#">
<head>
    <title>Zöff Remote</title>
    <?php include("header.php"); ?>
</head>
<body>
    <header>
        <nav id="fp-nav">
            <div class="nav-wrapper">
                <a href="zoff.no" class="brand-logo hide-on-small-only">
                    <img id="zicon" src="/static/images/squareicon_small.png" alt="zöff" title="Zöff">
                </a>
                <a href="zoff.no" class="brand-logo hide-on-med-and-up">Zöff</a>
                <ul id="nav-mobile" class="right hide-on-med-and-down">
                    <li><a class="modal-trigger" onclick="$('#about').openModal()">About</a></li>
                    <li><a class="modal-trigger" onclick="$('#legal').openModal()">Legal</a></li>
                    <li><a href="https://github.com/nixolas1/Zoff">GitHub</a></li>
                </ul>
            </div>
        </nav>
        <div id="legal" class="modal">
            <div class="modal-content">
                <h4>Legal</h4>
                <p>Copyright © 2015 <br>Nicolas Almagro Tonne and Kasper Rynning-Tønnesen
                <br><br>
                Creative Commons License<br>
                Zöff is licensed under a <br><a href="http://creativecommons.org/licenses/by-nc-nd/3.0/no/">Creative Commons Attribution-NonCommercial-NoDerivs 3.0 Norway License.</a>
                <br>
                Do not redistribute without permission from the developers.
                <br>
            </div>
            <div class="modal-footer">
                <a href="#!" class=" modal-action modal-close waves-effect waves-green btn-flat">Close</a>
            </div>
        </div>
        <div id="about" class="modal">
            <div class="modal-content">
                <h4>About</h4>
                <p>Zöff is a shared (free) YouTube based radio service, built upon the YouTube API. <br><br>
                Zöff is mainly a webbased service, but an <a href="https://play.google.com/store/apps/details?id=no.lqasse.zoff&hl=en">Android app</a> is made by Lasse Drevland, which has been a huge asset for the dev. team.<br><br>
                The website uses <a href="https://nodejs.org/">NodeJS</a> with <a href="http://socket.io/">Socket.IO</a>, <a href="https://www.mongodb.org/">MongoDB</a> and PHP on the backend, with JavaScript, jQuery and <a href="http://materializecss.com/">Materialize</a> on the frontend. More about the project itself can be found on <a href="https://github.com/nixolas1/Zoff">GitHub</a><br><br>
                The team consists of Kasper Rynning-Tønnesen and Nicolas Almagro Tonne, and the project has been worked on since late 2014.<br><br>
                The team can be reached on <a href="mailto:contact@zoff.no?Subject=Contact%20Zoff">contact@zoff.no</a>
                </p>
            </div>
            <div class="modal-footer">
                <a href="#!" class=" modal-action modal-close waves-effect waves-green btn-flat">Close</a>
            </div>
        </div>
    </header>

    <main class="center-align container">
    <div class="section">
    <h3 id="remote-text"></h3>
    </div>
        <div class="section">
            <form class="row" id="base" onsubmit="window.location.href = '/remote/'+this.chan.value;return false;">
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
                            maxlength="8"
                            autocomplete
                            length="8"
                            value="<?php /*if(isset($_GET('id'))echo($_GET('id'));*/?>"
                        />
                        <label for="search" id="forsearch">Type ID of host to be controlled</label>
                </div>
            </form>
            <div id="remote-controls" style="display:none;">
                <a class="chan-link waves-effect btn green" onclick="play();">
                    <i id="remote_play" class="mdi-av-play-arrow"></i>
                </a>
                <a class="chan-link waves-effect btn gray" onclick="pause();">
                    <i id="remote_pause" class="mdi-av-pause"></i>
                </a>
                <a class="chan-link waves-effect btn blue" onclick="skip();">
                    <i id="remote_skip" class="mdi-av-skip-next"></i>
                </a>

            </div>
            <!--<p class="range-field" onclick="console.log('test');">
                <input type="range" id="volume-control" style="display:none;" min="0" value="100" max="100" />
            </p>-->
            <div id="volume-control"></div>
        </div>

        <div class="section">

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
                        it enables the creation of collaborative and shared live playlists,
                        with billions of videos and songs to choose from, all for free and without registration.
                        <br>
                        Enjoy!
                    </p>
                </div>
                <div class="col l4 offset-l2 s12 valign-wrapper">
                    <ul>
                      <li>
                          <a href="https://play.google.com/store/apps/details?id=no.lqasse.zoff">
                              <img title="Get it on Google Play" src="/static/images/google_play.png">
                          </a>
                          <a href="https://github.com/nixolas1/Zoff">
                              <img title="Contribute on GitHub" src="/static/images/GitHub_Logo.png">
                          </a>
                          <p>
                              <a class="waves-effect waves-light btn light-blue share shareface" href="https://www.facebook.com/sharer/sharer.php?u=http://<?php echo $_SERVER['HTTP_HOST']; ?>" target="popup" onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=http://<?php echo $_SERVER['HTTP_HOST']; ?>','Share Playlist','width=600,height=300')">
                                  <img class="left" src="/static/images/facebook.png">Share on Facebook
                              </a>
                          </p>
                          <p>
                              <a class="waves-effect waves-light btn light-blue share" href="http://twitter.com/intent/tweet?url=http://<?php echo $_SERVER['HTTP_HOST']; ?>&text=Check out Zöff!&via=zoffmusic" target="popup" onclick="window.open('http://twitter.com/intent/tweet?url=http://<?php echo $_SERVER['HTTP_HOST']; ?>&text=Check out Zöff!&via=zoffmusic','Share Playlist','width=600,height=300')">
                                  <img class="left" src="/static/images/twitter.png">Share on Twitter
                              </a>
                          </p>
                          <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank" id="donate_form">
                            <input type="hidden" name="cmd" value="_s-xclick">
                            <input type="hidden" name="hosted_button_id" value="JEXDYP59N5VWE">
                            <a border="0" title="Like what we made? Help us with a beer!" name="submit" class="waves-effect waves-light btn orange light-blue share" onclick="document.getElementById('donate_form').submit();">Donate
                            </a>
                          </form>
                          <p>
                              <a href="https://chart.googleapis.com/chart?chs=500x500&cht=qr&chl=http://<?php echo $_SERVER['HTTP_HOST']; ?>&choe=UTF-8&chld=L|1" >
                                  <img src="https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=http://<?php echo $_SERVER['HTTP_HOST']; ?>&choe=UTF-8&chld=L|1" alt="QRCode for link" title="QR code for this page, for easy sharing!">
                              </a>
                          </p>
                      </li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="footer-copyright">
            <div class="container">
                &copy; 2014 - <?php echo date("Y"); ?>
                <a href="//nixo.no">Nixo</a> &amp;
                <a href="//kasperrt.no">KasperRT</a>
            </div>
        </div>
    </footer>

    <script src="//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
    <script src="//ajax.googleapis.com/ajax/libs/jqueryui/1.11.2/jquery-ui.min.js"></script>
    <script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/jqueryui-touch-punch/0.2.3/jquery.ui.touch-punch.min.js"></script>
    <script src="//cdn.socket.io/socket.io-1.2.0.js"></script>
    <script type="text/javascript" src="/static/js/lib/materialize.js"></script>
    <script type="text/javascript" src="/static/js/remotecontroller.js"></script>
	  <noscript><p><img src="//zoff.no/analyse/piwik.php?idsite=1" style="border:0;" alt="" /></p></noscript>
	</body>
</html>
