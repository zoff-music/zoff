<?php
    $guid=substr(base64_encode(crc32($_SERVER['HTTP_USER_AGENT'].$_SERVER['REMOTE_ADDR'].$_SERVER['HTTP_ACCEPT_LANGUAGE'])), 0, 8);
    if(isset($_GET['chan'])) {header('Location: '.$_GET['chan']); exit;}
    $list = explode("/", htmlspecialchars(strtolower($_SERVER["REQUEST_URI"])));
    if($list[1]==""||!isset($list[1])||count($list)<=1){$list="";include('php/nochan.php');die();}
    else $list=$list[1];

?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:fb="http://ogp.me/ns/fb#">
<head>
	<?php include("php/header.php"); ?>
</head>
<body id="channelpage">
    <header>
      <div class="navbar-fixed">
        <nav id="nav">
            <div class="nav-wrapper">
                <a href="/" class="brand-logo hide-on-med-and-down">
                    <img id="zicon" src="static/images/squareicon_small.png" alt="zöff" title="Zöff">
                </a>
                <div class="brand-logo truncate zbrand">
                    <a href="/" class="hide-on-large-only">Zöff</a>
                    <span class="hide-on-large-only">/</span>
                    <span id="chan" class="chan clickable" title="Show big URL" onclick="show()"><?php echo(ucfirst($list));?></span>
                </div>

                <ul class="title-container">
                    <li class="song-title" id="song-title" onclick="showSearch();">
                        Loading...
                    </li>
                    <li class="search-container hide" id="search-wrapper">
                        <input id="search" class="search_input" type="search" required title="Search for songs..." spellcheck="false" placeholder="Find song on youtube" onsubmit="null;" autocomplete="off">
                    </li>
                </ul>

                <ul class="right control-list">
                  <li id="search_loader" class="valign-wrapper hide">
                      <div class="valign">
                         <div class="preloader-wrapper small active">
                          <div class="spinner-layer spinner-blue">
                            <div class="circle-clipper left">
                              <div class="circle"></div>
                            </div><div class="gap-patch">
                              <div class="circle"></div>
                            </div><div class="circle-clipper right">
                              <div class="circle"></div>
                            </div>
                          </div>

                          <div class="spinner-layer spinner-red">
                            <div class="circle-clipper left">
                              <div class="circle"></div>
                            </div><div class="gap-patch">
                              <div class="circle"></div>
                            </div><div class="circle-clipper right">
                              <div class="circle"></div>
                            </div>
                          </div>

                          <div class="spinner-layer spinner-yellow">
                            <div class="circle-clipper left">
                              <div class="circle"></div>
                            </div><div class="gap-patch">
                              <div class="circle"></div>
                            </div><div class="circle-clipper right">
                              <div class="circle"></div>
                            </div>
                          </div>

                          <div class="spinner-layer spinner-green">
                            <div class="circle-clipper left">
                              <div class="circle"></div>
                            </div><div class="gap-patch">
                              <div class="circle"></div>
                            </div><div class="circle-clipper right">
                              <div class="circle"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      </li>
                    <li>
                        <a class="nav-btn" href="#find" id="search-btn" onclick="showSearch();">
                            <i class="mdi-action-search"></i>
                            <span class="hover-text">Find</span>
                        </a>
                    </li>
                    <li>
                        <a class="nav-btn" href="#skip" id="skip" onclick="skip();">
                            <i class="mdi-av-skip-next"></i>
                            <span class="hover-text">Skip</span>
                        </a>
                    </li>
                    <li>
                        <a class="nav-btn hide-on-small-only" href="#stir" id="shuffle" onclick="shuffle();">
                            <i class="mdi-av-shuffle"></i>
                            <span class="hover-text">Stir</span>
                        </a>
                    </li>
                    <li>
                        <a class="nav-btn hide-on-small-only" href="#chat_btn" data-activates="chat-bar" id="chat-btn">
                            <i class="tiny mdi-communication-message"></i>
                            <span class="hover-text">Chat</span>
                        </a>
                    </li>
                    <li>
                        <a class="nav-btn" href="#settings" data-activates="settings-bar" id="settings">
                            <i class="mdi-action-settings"></i>
                            <span class="hover-text">Conf</span>
                        </a>
                    </li>
                </ul>
                <ul class="side-nav" id="settings-bar">
                    <?php include("php/panel.php");?>
                </ul>
                <div id="results" class="search_results hide">
                    <div id="temp-results-container">
                      <div id="temp-results">
                          <div id="result" class="result">
                              <img class="thumb">
                              <span id="title">
                                  <div class="search-title"></div>
                                  <span class="result_info"></span>
                              </span>
                              <a href="#add" class="waves-effect waves-orange btn-flat add-many" title="Add several videos">
                                  <i class="mdi-av-playlist-add"></i>
                              </a>
                          </div>
                      </div>
                    </div>
                </div>
            </div>
        </nav>
      </div>
    </header>
    <main class="container center-align main">
        <div class="row">
            <div class="col s12 m9 video-container hide-on-small-only">

                <ul class="side-nav left-aligned chat-bar" id="chat-bar">
                    <li id="chat-log">
                        <ul class="collapsible collapsible-accordion">
                            <li class="active">

                                <div class="collapsible-body" style="display: block;">
                                    <ul id="chat">
                                      <div class="row">
                                        <div class="col s12">
                                          <ul class="tabs">
                                            <li class="tab col s3 chat-tab-li"><a class="active chat-tab truncate" href="#channelchat"><?php echo $list; ?></a></li>
                                            <li class="tab col s3 chat-tab-li"><a class="chat-tab" href="#all_chat">All</a></li>
                                          </ul>
                                        </div>
                                        <div id="channelchat" class="col s12"><ul id="chatchannel"></ul></div>
                                        <div id="all_chat" class="col s12"><ul id="chatall"></ul></div>
                                      </div>
                                    </ul>
                                </div>
                            </li>
                        </ul>
                    </li>
                    <li id="chat-input">
                      <form onsubmit="chat(this.input);return false;">
                        <input id="text-chat-input" name="input" type="text" autocomplete="off" placeholder="Chat" maxlength="150">
                      </form>
                    </li>
                </ul>
                <!--
                  width: calc(100% - 261px);
                  display: inline;
                  -->
                <div id="player" class="ytplayer"></div>
                <div id="player_overlay" class="hide valign-wrapper">
                  <div id="player_overlay_text" class="valign center-align">
                    Waiting for Video
                  </div>
                </div>
                <div id="controls">
                  <div id="playpause">
                    <i id="play" class="mdi-av-play-arrow hide"></i>
                    <i id="pause" class="mdi-av-pause"></i>
                  </div>
                  <div id="duration">00:00 / 00:00</div>
                  <div id="volume-button">
                    <i id="v-mute" class="mdi-av-volume-off"></i>
                    <i id="v-low" class="mdi-av-volume-mute"></i>
                    <i id="v-medium" class="mdi-av-volume-down"></i>
                    <i id="v-full" class="mdi-av-volume-up"></i>
                  </div>
                  <div id="volume"></div>
                  <div id="fullscreen">
                    <i class="mdi-navigation-fullscreen"></i>
                  </div>
                  <div id="viewers"></div>
                  <div id="bar"></div>
                </div>
            </div>
            <div id="playlist" class="col s12 m3">
                <div id="wrapper">
                    <div id="list-song-html">
                        <div id="list-song" class="card left-align list-song">
                            <span class="clickable vote-container" title="Vote!">
                                <a class="clickable center-align votebg">
                                    <span class="card-image cardbg list-image"></span>
                                </a>
                                <span class="card-content">
                                    <span class="flow-text truncate list-title"></span>
                                    <span class="vote-span">
                                        <span class="list-votes"></span>
                                        <span class="highlighted vote-text">&nbsp;votes</span>
                                    </span>
                                </span>
                            </span>
                            <div class="list-remove card-action center-align hide">
                                <a title="Remove song" id="del" onclick="vote('id','del')" class="waves-effect btn-flat clickable">Remove</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <?php include("php/footer.php"); ?>

    </body>
</html>
