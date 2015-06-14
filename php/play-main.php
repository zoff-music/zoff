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
                            <div class="card-action center-align list-remove hide">
                                <a title="Remove song" id="del" onclick="vote('id','del')" class="waves-effect btn-flat clickable">Delete</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
    

<script type="text/javascript" src="/static/js/list.js"></script>
<script type="text/javascript" src="/static/js/searchlist.js"></script>
<script type="text/javascript" src="/static/js/playercontrols.js"></script>
<script type="text/javascript" src="/static/js/youtube.js"></script>
<script type="text/javascript" src="/static/js/search.js"></script>
<script type="text/javascript" src="/static/js/admin.js"></script>
<script type="text/javascript" src="/static/js/chat.js"></script>
<script type="text/javascript" src="/static/js/hostcontroller.js"></script>
<!--<script type="text/javascript" src="/static/js/remotecontroller.js"></script>-->

<!-- Piwik tracking -->
<!--<script type="text/javascript">
  var _paq = _paq || [];
  _paq.push(['trackPageView']);
  _paq.push(['enableLinkTracking']);
  (function() {
    var u="//zoff.no/analyse/";
    _paq.push(['setTrackerUrl', u+'piwik.php']);
    _paq.push(['setSiteId', 1]);
    var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
    g.type='text/javascript'; g.async=true; g.defer=true; g.src=u+'piwik.js'; s.parentNode.insertBefore(g,s);
  })();
</script>-->