<li class="no-padding">
    <ul class="collapsible collapsible-accordion">
        <li>
            <a class="col s9 collapsible-header bold waves-effect admin-settings">
                Channel Settings
                <i class="mdi-image-tune"></i>
                <div class="nav-btn close-settings clickable" title="Close" href="#" onclick="hide_settings()">
                    <i class="mdi-navigation-close auto-margin"></i>
                </div>
            </a>
            <div class="collapsible-body">
                <ul>
                    <form id="adminForm" onsubmit="pass_save();return false;">
                      <li class="white-bg">
                          <a class="white-bg">
                              <div class="input-field">
                                <i id="admin-lock" class="mdi-action-lock" onclick="log_out()" title="Click to log out"></i>
                                  <input placeholder="Enter channel password" id="password" type="password" class="validate">
                              </div>
                          </a>
                      </li>
                        <li><a class="setting-text">
                            Add songs
                            <div class="switch"><label>
                            Anyone
                            <input name="addsongs" type="checkbox" class="conf"><span class="lever"></span>
                            Admin
                        </label></div></a></li>

                        <li><a class="setting-text">
                            Vote
                            <div class="switch"><label>
                            Anyone
                            <input name="vote" type="checkbox" class="conf"><span class="lever"></span>
                            Admin
                        </label></div></a></li>

                        <li><a class="setting-text">
                            Shuffle
                            <div class="switch"><label>
                            Anyone
                            <input name="shuffle" type="checkbox" class="conf"><span class="lever"></span>
                            Admin
                        </label></div></a></li>

                        <li><a class="setting-text">
                            Skip
                            <div class="switch"><label>
                            Anyone
                            <input name="skip" type="checkbox" class="conf"><span class="lever"></span>
                            Admin
                        </label></div></a></li>

                        <li><a class="setting-text">
                            Song length
                            <div class="switch"><label>
                            Any
                            <input name="longsongs" type="checkbox" class="conf"><span class="lever"></span>
                            Short
                        </label></div></a></li>

                        <li><a class="setting-text">
                            Type
                            <div class="switch"><label>
                            Any
                            <input name="allvideos" type="checkbox" class="conf"><span class="lever"></span>
                            Song
                        </label></div></a></li>


                        <li><a class="setting-text">
                            Frontpage
                            <div class="switch"><label>
                            Hide
                            <input name="frontpage" type="checkbox" class="conf"><span class="lever"></span>
                            Display
                        </label></div></a></li>

                        <li><a class="setting-text">
                            After play
                            <div class="switch"><label>
                            Keep
                            <input name="removeplay" type="checkbox" class="conf"><span class="lever"></span>
                            Remove
                        </label></div></a></li>


                    </form>
                </ul>
            </div>
        </li>
    </ul>
</li>
<li class="no-padding">
    <ul class="collapsible collapsible-accordion">
        <li>
            <a class="collapsible-header bold waves-effect">Remote Control
                <i class="mdi-action-account-circle"></i>
            </a>
            <div class="collapsible-body">
                <ul>
                    <li>
                    <a id="code-link">
                        <img id="code-qr" alt="QR code for control" title="Link to control this Zöff player">
                        <h4 id="code-text">ABBADUR</h4>
                    </a>   
                    <span>You can control this Zöff instance from another device by going to <b>http://zoff.no/remote</b><span>        
                    </li>
                    <!--<li>
                    <form class="row" id="base" onsubmit="controll();return false;">
                        <div class="input-field">
                            <input
                                class="input-field"
                                type="text"
                                id="code-input"
                                name="chan"
                                title="Type channel name here to create or listen to a channel. Only alphanumerical chars. [a-zA-Z0-9]+"
                                autocomplete="off"
                                list="searches"
                                required pattern="[a-zA-Z0-9]+"
                                spellcheck="false"
                                maxlength="8"
                                autocomplete
                                length="8"
                            />
                            <label for="code-input" id="forcode">Type ID of host to be controlled</label>
                        </div>
                    </form>
                    </li>
                    <li>
                    <div id="remote-controls" style="display:none;">
                      <i id="remote_play" class="mdi-av-play-arrow"></i>
                      <i id="remote_pause" class="mdi-av-pause"></i>
                      <i id="remote_skip" class="mdi-av-skip-next"></i>
                    </div>
                    </li>
                    <li>
                    <p class="range-field">
                      <input type="range" id="volume-control" style="display:none;" min="0" max="100" />
                    </p>
                    </li>
                    -->
                </ul>
            </div>
        </li>
    </ul>
</li>
