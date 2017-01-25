<?php

if(isset($_GET['chan'])){
    $chan = htmlspecialchars($_GET['chan']);
    header('Location: '.$chan);
}

?>
<html lang="en">
<head prefix="og: http://ogp.me/ns# fb: http://ogp.me/ns/fb#">
  <meta name="robots" content="index, nofollow" />
  <?php include("header.php"); ?>
  <script type="text/javascript" src="/public/dist/main.min.js"></script>
</head>
<body class="noselect cursor-default">
    <header>
        <nav id="fp-nav">
            <div class="nav-wrapper">
                <a href="#" class="brand-logo noselect">
                    <img id="zicon" src="public/images/squareicon_small.png" alt="zöff" title="Zöff" />
                </a>
                <span id="frontpage-viewer-counter" class="hide-on-small-only noselect" title="Divided among all channels. Hidden or not"></span>
                <!--<a href="//zoff.no" class="brand-logo brand-mobile hide-on-med-and-up">Zöff</a>-->
                <ul id="nav-mobile" class="right hide-on-med-and-down">
                    <li><a class="waves-effect waves-cyan" id="offline-mode" title="Offline mode" href="#">Offline</a></li>
                    <li><a class="waves-effect waves-green" title="Remote control a Zöff player" href="https://remote.zoff.no">Remote</a></li>
                    <li><a class="modal-trigger waves-effect waves-red" title="Need help with the site?" onclick="$('#help').openModal()">Help</a></li>
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
                <a href="#" class="modal-action modal-close waves-effect waves-green btn-flat">Close</a>
            </div>
        </div>
        <div id="about" class="modal">
            <div class="modal-content">
                <h4>About</h4>
                <p>Zöff is a shared (free) YouTube based radio service, built upon the YouTube API. <br><br>
                Zöff is mainly a web-based service. The website uses <a href="https://nodejs.org/">NodeJS</a> with <a href="http://socket.io/">Socket.IO</a>, <a href="https://www.mongodb.org/">MongoDB</a> and PHP on the backend, with JavaScript, jQuery and <a href="http://materializecss.com/">Materialize</a> on the frontend. More about the project itself can be found on <a href="https://github.com/zoff-music/Zoff">GitHub</a><br><br>
                The team consists of Kasper Rynning-Tønnesen and Nicolas Almagro Tonne, and the project has been worked on since late 2014.<br><br>
                The team can be reached on <a href="mailto:contact@zoff.no?Subject=Contact%20Zoff">contact@zoff.no</a><br><br>
                </p>
            </div>
            <div class="modal-footer">
                <a href="#" class="modal-action modal-close waves-effect waves-green btn-flat">Close</a>
            </div>
        </div>
        <div id="donation" class="modal">
            <div class="modal-content">
                <h4>Thanks!</h4>
                <p>Thanks for your donation, we love you &lt;3
                    <br><br>
                    We will use the money for something awesome, just you wait and see!
                    <br><br>
                    We might also add your name somewhere in the code as a sign of gratitude, see if you can find it! (Might take a day or two for us to see the donation and implement it..)
                </p>
            </div>
            <div class="modal-footer">
                <a href="#" class="modal-action modal-close waves-effect waves-green btn-flat">I'm awesome! (Close)</a>
            </div>
        </div>
        <div id="help" class="modal">
            <div class="modal-content">
                <h4>So you need help?</h4>
                <p>At the center of the site, you'll see a input field. This is meant to navigate to new or existing channels. If you input something here that doesn't exist, a new channel will be create at the blink of an eye! Remember to put a password on the list you've created, so no one else takes it from you! (It's on a first come, first serve basis). When you're ready to proceed, just click the listen button!</p>
                <p>Underneath the input fields, there are several tiles. These are channels that already exists, and they can be clicked! To listen to one of these channels, it is just to click the tile.</p>
            </div>
            <div class="modal-footer">
                <a href="#" class=" modal-action modal-close waves-effect waves-green btn-flat">Close</a>
            </div>
        </div>

    </header>

    <div class="section mega">
        <div id="mega-background"></div>
        <h5>Create a radio channel, collaborate and listen</h5>
            <form class="channel-finder">
                <p class="prething">zoff.no/</p>
                <input
                    class="input-field room-namer"
                    type="text"
                    id="searchFrontpage"
                    name="chan"
                    placeholder="chill"
                    title="Type channel name here to create or listen to a channel. Only alphanumerical chars. [a-zA-Z0-9]+"
                    autocomplete="off"
                    autofocus=""
                    list="searches"
                    required
                    pattern="[a-zA-Z0-9]+"
                    spellcheck="false"
                    maxlength="18"
                />
                <datalist id="searches"></datalist>
                <button class="listen-button">Listen</button>
            </form>
            <div class="pitch outline">
                <div>Live &amp; democratic playlists with YouTube Music</div>
                <div>Play everywhere — No login required</div>
            </div>
    </div>

    <div class="section mobile-search">
            <form class="channel-finder-mobile row" id="base">
                    <div class="input-field col s12">
                        <input
                            class="input-field"
                            type="text"
                            id="search-mobile"
                            name="chan"
                            title="Type channel name here to create or listen to a channel. Only alphanumerical chars. [a-zA-Z0-9]+"
                            autocomplete="off"
                            list="searches"
                            required pattern="[a-zA-Z0-9]+"
                            spellcheck="false"
                            maxlength="18"
                            data-length="18"
                        />
                        <label for="search-mobile" class="noselect">Find or create radio channel</label>
                        <datalist id="searches_mobile">
                        </datalist>
                </div>
            </form>
        </div>
    <div id="channel-load" class="progress">
            <div class="indeterminate" id="channel-load-move"></div>
        </div>
    <main class="center-align container">
        <div id="main_section_frontpage" class="section">
            <div id="preloader" class="progress">
                <div class="indeterminate"></div>
            </div>
            <div id="channel-list-container">
            <ul class="row" id="channels">
                    <li id="chan-card" class="col s12 m4 l3">
                        <div class="card">
                            <a class="chan-link">
                                <div class="chan-bg card-image cardbg"></div>
                                <div class="card-content">
                                    <i class="mdi-action-star-rate pin"></i>
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
                                <div class="card-action noselect">
                                    <span class="chan-link waves-effect waves-orange btn-flat">Listen</span>
                                </div>
                            </a>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </main>

    <?php include("public/php/footer.php"); ?>
	</body>
</html>
