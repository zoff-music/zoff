
<div class="navbar-fixed">
        <nav id="nav">
            <div class="nav-wrapper">
                <a ui-sref="main" class="brand-logo hide-on-med-and-down">
                    <img id="zicon" src="static/images/squareicon_small.png" alt="zöff" title="Zöff">
                </a>
                <div class="brand-logo truncate zbrand">
                    <a href="/" class="hide-on-large-only">Zöff</a>
                    <span class="hide-on-large-only">/</span>
                    <span id="chan" class="chan clickable" title="Show big URL" onclick="show()"></span>
                </div>

                <ul class="title-container">
                    <li class="song-title truncate" id="song-title" onclick="showSearch();">
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
                    <?php include("../php/panel.php");?>
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