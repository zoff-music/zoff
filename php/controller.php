<!DOCTYPE html>
<html lang="en">
<head prefix="og: http://ogp.me/ns# fb: http://ogp.me/ns/fb#">
    <?php include("header.php"); ?>
    <link rel="chrome-webstore-item" href="https://chrome.google.com/webstore/detail/jemjlblambcgjmmhheaklfnphncdmfmb" />
</head>
<body class="noselect cursor-default">
    <header>
        <nav id="fp-nav">
            <div class="nav-wrapper">
                <a href="//zoff.no" class="brand-logo hide-on-small-only">
                    <img id="zicon" src="/static/images/squareicon_small.png" alt="zöff" title="Zöff" />
                </a>
                <a href="//zoff.no" class="brand-logo hide-on-med-and-up">Zöff</a>
                <ul id="nav-mobile" class="right hide-on-med-and-down">
                  <li><a class="modal-trigger waves-effect waves-red" title="Need help with the site?" onclick="$('#help').openModal()">Help</a></li>
                  <li><a class="waves-effect green" title="Remote control a Zöff player" href="https://remote.zoff.no">Remote</a></li>
                  <li><a class="modal-trigger waves-effect waves-orange" onclick="$('#about').openModal()">About</a></li>
                  <li><a class="modal-trigger waves-effect waves-yellow" onclick="$('#legal').openModal()">Legal</a></li>
                  <li><a class="waves-effect waves-purple" href="https://github.com/zoff-music/">GitHub</a></li>
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
                Zöff is mainly a web-based service. The website uses <a href="https://nodejs.org/">NodeJS</a> with <a href="http://socket.io/">Socket.IO</a>, <a href="https://www.mongodb.org/">MongoDB</a> and PHP on the backend, with JavaScript, jQuery and <a href="http://materializecss.com/">Materialize</a> on the frontend. More about the project itself can be found on <a href="https://github.com/zoff-music/Zoff">GitHub</a><br><br>
                The team consists of Kasper Rynning-Tønnesen and Nicolas Almagro Tonne, and the project has been worked on since late 2014.<br><br>
                The team can be reached on <a href="mailto:contact@zoff.no?Subject=Contact%20Zoff">contact@zoff.no</a>
                </p>
            </div>
            <div class="modal-footer">
                <a href="#!" class=" modal-action modal-close waves-effect waves-green btn-flat">Close</a>
            </div>
        </div>
        <div id="help" class="modal">
            <div class="modal-content">
                <h4>So you need help?</h4>
                <p>To remote-control a computer, just type in the ID for that computer. (This can be found in the settings panel on the computer you want to remote control. There is also a QR code for you to scan.</p>
                <p>When you've entered the ID for the computer you want to control, you'll be able to change the volume, have the controled computer vote for skipping, pause the video or play the video.</p>
                <p>The input field you used to enter the ID (if you entered it), has now changed some. If you type in something here now, the controled computer will change channel!</p>
            </div>
            <div class="modal-footer">
                <a href="#!" class=" modal-action modal-close waves-effect waves-green btn-flat">Close</a>
            </div>
        </div>
    </header>

    <main class="center-align container remote-container">
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
                <!--<a id="playbutton" class="remote-button chan-link waves-effect btn green">
                    <i id="remote_play" class="mdi-av-play-arrow"></i>
                </a>
                <a id="pausebutton" class="remote-button chan-link waves-effect btn gray">
                    <i id="remote_pause" class="mdi-av-pause"></i>
                </a>-->
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

    <?php include("footer.php"); ?>

    <script type="text/javascript" src="//cdnjs.cloudflare.com/ajax/libs/jqueryui-touch-punch/0.2.3/jquery.ui.touch-punch.min.js"></script>
    <script type="text/javascript" src="/static/dist/remote.min.js"></script>
	</body>
</html>
