<!DOCTYPE html>
<html lang="en">
    <head prefix="og: http://ogp.me/ns# fb: http://ogp.me/ns/fb#">
        
    <!-- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    |    Zöff                                                         |
    |    Project is on github: https://github.com/zoff-music/Zoff       |
    |    Made by: Nicolas Almagro Tonne and Kasper Rynning-Tønnesen   |
    - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -->

    <title>Zöff</title>
    <meta name="author" content="Nicolas 'Nixo' Almagro Tonne &amp; Kasper 'KasperRT' Rynning-Tønnesen"/>
    <meta name="description" content="The Shared (free) YouTube radio. Being built around the YouTube search and video API it enables the creation of collaborative and shared live playlists, with billions of videos and songs to choose from, all for free and without registration. Enjoy!"/>
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no"/>
    <meta charset="UTF-8"/>
    <meta name="theme-color" content="#2D2D2D" />
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta property="og:image" content="../static/images/highlogo.png" />
    <meta property="og:title" content="Zöff"/>
    <meta property="og:description" content="The Shared (free) YouTube radio. Being built around the YouTube search and video API it enables the creation of collaborative and shared live playlists, with billions of videos and songs to choose from, all for free and without registration. Enjoy!"/>
    <meta property="og:type" content="website"/>
    <link rel="stylesheet" href="//ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/themes/smoothness/jquery-ui.min.css">
    <link type="text/css" rel="stylesheet" href="../static/css/materialize.min.css" />
    <link rel="stylesheet" type="text/css" href="../static/css/style.css" title="Default" />
    <link rel="icon" id="favicon" type="image/png" href="../static/images/favicon.png"/>
    <script>
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

      ga('create', '***REMOVED***', 'auto');
      ga('send', 'pageview');

    </script>
    <link rel="chrome-webstore-item" href="https://chrome.google.com/webstore/detail/jemjlblambcgjmmhheaklfnphncdmfmb" />
</head>
<body>
    <header>
        <nav id="fp-nav">
            <div class="nav-wrapper">
                <a href="//zoff.no" class="brand-logo hide-on-small-only">
                    <img id="zicon" src="../static/images/squareicon_small.png" alt="zöff" title="Zöff" />
                </a>
                <a href="//zoff.no" class="brand-logo hide-on-med-and-up">Zöff</a>
                <ul id="nav-mobile" class="right hide-on-med-and-down">
                  <li><a class="waves-effect green" title="Remote control a Zöff player" href="remote">Remote</a></li>
                  <li><a class="modal-trigger waves-effect waves-orange" onclick="$('#about').openModal()">About</a></li>
                  <li><a class="modal-trigger waves-effect waves-yellow" onclick="$('#legal').openModal()">Legal</a></li>
                  <li><a class="waves-effect waves-purple" href="https://github.com/zoff-music/Zoff">GitHub</a></li>
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
                Zöff is mainly a webbased service, but an <a href="https://play.google.com/store/apps/details?id=no.lqasse.zoff&amp;hl=en">Android app</a> is made by Lasse Drevland, which has been a huge asset for the dev. team.<br><br>
                The website uses <a href="https://nodejs.org/">NodeJS</a> with <a href="http://socket.io/">Socket.IO</a>, <a href="https://www.mongodb.org/">MongoDB</a> and PHP on the backend, with JavaScript, jQuery and <a href="http://materializecss.com/">Materialize</a> on the frontend. More about the project itself can be found on <a href="https://github.com/zoff-music/Zoff">GitHub</a><br><br>
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
    <h3 id="remote-text">Remote Controller</h3>
    </div>
        <div class="section">
            <form action="#" class="row" id="remoteform" onsubmit="return false;">
                    <div class="input-field col s12">
                        <input
                            class="input-field"
                            type="text"
                            id="search"
                            name="chan"
                            title="Type channel name here to create or listen to a channel. Only alphanumerical chars. [a-zA-Z0-9]+"
                            autocomplete="off"
                            spellcheck="false"
                            maxlength="10"
                            data-length="10"
                        />
                        <label for="search" id="forsearch">Type ID of host to be controlled</label>
                </div>
            </form>

            <div class="rc" id="remote-controls">
                <a id="playbutton" class="remote-button chan-link waves-effect btn green">
                    <i id="remote_play" class="mdi-av-play-arrow"></i>
                </a>
                <a id="pausebutton" class="remote-button chan-link waves-effect btn gray">
                    <i id="remote_pause" class="mdi-av-pause"></i>
                </a>
                <a id="skipbutton" class="remote-button chan-link waves-effect btn blue">
                    <i id="remote_skip" class="mdi-av-skip-next"></i>
                </a>
            </div>

            <i class="mdi-av-volume-up slider-vol rc"></i>
            <div class="rc" id="volume-control" title="Volume"></div>

        </div>

        <div class="section about-remote">
            <b>Here you can control another Zöff player from any device.</b>
            <br>
            To find the ID of your player, click the Conf <i class="mdi-action-settings"></i> icon on the top right of the player page, then "Remote Control".
            <br>You can either scan the QR code or type the ID manually.
        </div>
    </main>

    <footer class="page-footer">
        <div class="container">
            <div class="row">
                <div class="col l6 s12">
                    <h5 class="white-text">Zöff</h5>
                    <p class="grey-text text-lighten-4">The shared YouTube radio</p>
                    <p class="grey-text text-lighten-4">
                        Being built around the YouTube search and video API
                        it enables the creation of collaborative and shared live playlists,
                        with billions of videos and songs to choose from, all for free and without registration.
                        <br />
                        Enjoy!
                    </p>
                    <p id="latest-commit" class="grey-text text-lighten-4 truncate"></p>
                </div>
                <div class="col l4 offset-l2 s12 valign-wrapper">
                    <ul>
                        <li>
                            <a href="https://github.com/zoff-music/Zoff">
                                <img title="Contribute on GitHub" src="../static/images/GitHub_Logo.png" alt="GitHub" />
                            </a>
                            <p>
                                <a class="waves-effect waves-light btn light-blue share shareface" href="https://www.facebook.com/sharer/sharer.php?u=http://<?php echo $_SERVER['HTTP_HOST'].'/'.$list; ?>" target="popup" onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=http://<?php echo $_SERVER['HTTP_HOST'].'/'.$list; ?>','Share Playlist','width=600,height=300')">
                                    <img class="left" src="../static/images/facebook.png" alt="Share on Facebook" />Share on&nbsp;Facebook
                                </a>
                            </p>
                            <p>
                                <a class="waves-effect waves-light btn light-blue share" href="http://twitter.com/intent/tweet?url=http://<?php echo $_SERVER['HTTP_HOST'].'/'.$list; ?>&amp;text=Check%20out%20this%20playlist%20<?php echo ucfirst($list); ?>%20on%20Z&ouml;ff!&amp;via=zoffmusic" target="popup" onclick="window.open('http://twitter.com/intent/tweet?url=http://<?php echo $_SERVER['HTTP_HOST'].'/'.$list; ?>&amp;text=Check%20out%20this%20playlist%20<?php echo ucfirst($list); ?>%20on%20Z&ouml;ff!&amp;via=zoffmusic','Share Playlist','width=600,height=300')">
                                    <img class="left" src="../static/images/twitter.png" alt="Share on Twitter" />Share on&nbsp;Twitter
                                </a>
                            </p>
                            <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank" id="donate_form">
                              <input type="hidden" name="cmd" value="_s-xclick">
                              <input type="hidden" name="hosted_button_id" value="JEXDYP59N5VWE">
                              <a title="Like what we made? Help us by donating (a) beer!" class="waves-effect waves-light btn orange light-blue share" onclick="document.getElementById('donate_form').submit();">Donate
                              </a>
                            </form>
                            <p>
                                <a href="//chart.googleapis.com/chart?chs=500x500&amp;cht=qr&amp;chl=http://<?php echo $_SERVER['HTTP_HOST'].'/'.$list; ?>&amp;choe=UTF-8&amp;chld=L%7C1" >
                                    <img class="card rounded" src="//chart.googleapis.com/chart?chs=150x150&amp;cht=qr&amp;chl=http://<?php echo $_SERVER['HTTP_HOST'].'/'.$list; ?>&amp;choe=UTF-8&amp;chld=L%7C1" alt="QRCode for link" title="QR code for this page, for easy sharing!" />
                                </a>
                            </p>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="footer-copyright">
            <div class="container">
                &copy; <?php echo date("Y"); ?>
                <a href="http://nixo.no">Nixo</a> &amp;
                <a href="http://kasperrt.no">KasperRT</a>
                &nbsp;&nbsp;All Rights Reserved.
            </div>
        </div>
    </footer>


    <script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
    <script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min.js"></script>
    <script type="text/javascript" src="/static/dist/lib/materialize.min.js"></script>
    <script type="text/javascript" src="//cdn.socket.io/socket.io-1.3.5.js"></script>


    <script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/jqueryui-touch-punch/0.2.3/jquery.ui.touch-punch.min.js"></script>
    <script type="text/javascript" src="../static/dist/remote.min.js"></script>
	</body>
</html>
