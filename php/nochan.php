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
                <a href="#" class="brand-logo hide-on-small-only noselect">
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
                <a href="#!" class="modal-action modal-close waves-effect waves-green btn-flat">Close</a>
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
                <a href="#!" class="modal-action modal-close waves-effect waves-green btn-flat">Close</a>
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
                <a href="#!" class="modal-action modal-close waves-effect waves-green btn-flat">I'm awesome! (Close)</a>
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
                            data-length="18"
                        />
                        <label for="search" class="noselect">Find or create radio channel</label>
                        <datalist id="searches">
                        </datalist>
                </div>
            </form>
        </div>

        <div class="section">
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
                                    <a class="chan-link waves-effect waves-orange btn-flat">Listen</a>
                                </div>
                            </a>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </main>

    <?php include("php/footer.php"); ?>
    <script type="text/javascript" src="static/js/nochan.js"></script>
	</body>
</html>
