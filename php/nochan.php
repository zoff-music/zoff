<?php

if(isset($_GET['chan'])){
    $chan = htmlspecialchars($_GET['chan']);
    header('Location: '.$chan);
}

?>
<html lang="en">
<head prefix="og: http://ogp.me/ns# fb: http://ogp.me/ns/fb#">
  <?php include("header.php"); ?>
</head>
<body>
    <header>
        <nav id="fp-nav">
            <div class="nav-wrapper">
                <a href="#" class="brand-logo hide-on-small-only">
                    <img id="zicon" src="static/images/squareicon_small.png" alt="zöff" title="Zöff" />
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
                The team can be reached on <a href="mailto:contact@zoff.no?Subject=Contact%20Zoff">contact@zoff.no</a><br><br>
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
                            length="18"
                        />
                        <label for="search">Find or create radio channel</label>
                        <datalist id="searches">
                        </datalist>
                </div>
            </form>
        </div>

        <div class="section">
            <div id="preloader" class="progress">
                <div class="indeterminate"></div>
            </div>
            <ul class="row" id="channels">
              <ul>
                    <li id="chan-card" class="col s12 m4 l3">
                        <div class="card">
                            <a class="chan-link">
                                <div class="chan-bg card-image cardbg"></div>
                            </a>
                            <div class="card-content">
                                <p class="left-align">
                                    <span class="chan-name flow-text truncate"></span>
                                    <br>
                                    <span class="highlighted">Viewers:&nbsp;</span>
                                    <span class="chan-views"></span>
                                    <br>
                                    <span class="highlighted">Songs:&nbsp;</span>
                                    <span class="chan-songs"></span>
                                </p>
                            </div>
                            <div class="card-action">
                                <a class="chan-link waves-effect waves-orange btn-flat">Listen</a>
                            </div>
                        </div>
                    </li>
                  </ul>
            </ul>
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
                        <br>
                        Enjoy!
                    </p>
                    <p id="latest-commit" class="grey-text text-lighten-4 truncate"></p>
                </div>
                <div class="col l4 offset-l2 s12 valign-wrapper">
                    <ul>
                      <li>
                          <!--<a href="https://play.google.com/store/apps/details?id=no.lqasse.zoff">
                              <img title="Get it on Google Play" src="static/images/google_play.png">
                          </a>-->
                          <a href="https://github.com/zoff-music/Zoff">
                              <img title="Contribute on GitHub" src="static/images/GitHub_Logo.png" alt="GitHub" />
                          </a>
                          <p>
                              <a class="waves-effect waves-light btn light-blue share shareface" href="https://www.facebook.com/sharer/sharer.php?u=http://<?php echo $_SERVER['HTTP_HOST']; ?>" target="popup" onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=http://<?php echo $_SERVER['HTTP_HOST']; ?>','Share Playlist','width=600,height=300')">
                                  <img class="left" src="static/images/facebook.png" alt="Share on Facebook" />Share on Facebook
                              </a>
                          </p>
                          <p>
                              <a class="waves-effect waves-light btn light-blue share" href="https://twitter.com/intent/tweet?url=http://<?php echo $_SERVER['HTTP_HOST']; ?>&amp;text=Check%20out%20Zöff!&amp;via=zoffmusic" target="popup" onclick="window.open('http://twitter.com/intent/tweet?url=http://<?php echo $_SERVER['HTTP_HOST']; ?>&amp;text=Check%20out%20Zöff!&amp;via=zoffmusic','Share Playlist','width=600,height=300')">
                                  <img class="left" src="static/images/twitter.png" alt="Share on Twitter" />Share on Twitter
                              </a>
                          </p>
                          <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank" id="donate_form">
                            <input type="hidden" name="cmd" value="_s-xclick">
                            <input type="hidden" name="hosted_button_id" value="JEXDYP59N5VWE">
                            <a title="Like what we made? Help us with a beer!" name="submit" class="waves-effect waves-light btn orange light-blue share" onclick="document.getElementById('donate_form').submit();">Donate
                            </a>
                          </form>
                          <p>
                              <a href="https://chart.googleapis.com/chart?chs=500x500&amp;cht=qr&amp;chl=http://<?php echo $_SERVER['HTTP_HOST']; ?>&amp;choe=UTF-8&amp;chld=L%7C1" >
                                  <img src="https://chart.googleapis.com/chart?chs=150x150&amp;cht=qr&amp;chl=http://<?php echo $_SERVER['HTTP_HOST']; ?>&amp;choe=UTF-8&amp;chld=L%7C1" alt="QRCode for link" title="QR code for this page, for easy sharing!" />
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

    <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
    <script type="text/javascript" src="https://cdn.socket.io/socket.io-1.2.0.js"></script>
    <script type="text/javascript" src="static/js/lib/materialize.min.js"></script>
    <script type="text/javascript" src="static/build-js/main-fp.js"></script>
	</body>
</html>
