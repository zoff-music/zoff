<li class="no-padding">
    <ul class="collapsible collapsible-accordion">
        <li>
            <a class="col s9 collapsible-header bold waves-effect admin-settings">
                Channel Settings
                <i class="mdi-image-tune"></i>
                <div class="nav-btn close-settings clickable" title="Close" id="closeSettings">
                    <i class="mdi-navigation-close auto-margin"></i>
                </div>
            </a>
            <div class="collapsible-body">
                <form action="#" id="adminForm" onsubmit="return false;">
                    <ul>
                        <li class="white-bg">
                                <div class="input-field field-settings">
                                  <i id="admin-lock" class="mdi-action-lock" title="Click to log out"></i>
                                    <input placeholder="Enter channel password" id="password" type="password" class="validate" />
                                </div>
                        </li>
                        <li>
                            <span class="switch-text">
                            Add songs
                            </span>
                            <div class="switch"><label>
                            Anyone
                            <input name="addsongs" type="checkbox" class="conf" /><span class="lever"></span>
                            Admin
                        </label></div></li>

                        <li>
                          <span class="switch-text">
                            Vote
                          </span>
                            <div class="switch"><label>
                            Anyone
                            <input name="vote" type="checkbox" class="conf" /><span class="lever"></span>
                            Admin
                        </label></div></li>

                        <li><span class="switch-text">
                            Shuffle
                          </span>
                            <div class="switch"><label>
                            Anyone
                            <input name="shuffle" type="checkbox" class="conf" /><span class="lever"></span>
                            Admin
                        </label></div></li>

                        <li><span class="switch-text">
                            Skip
                          </span>
                            <div class="switch"><label>
                            Anyone
                            <input name="skip" type="checkbox" class="conf" /><span class="lever"></span>
                            Admin
                        </label></div></li>

                        <li><span class="switch-text">
                            Song length
                          </span>
                            <div class="switch"><label>
                            Any
                            <input name="longsongs" type="checkbox" class="conf" /><span class="lever"></span>
                            Short
                        </label></div></li>

                        <li><span class="switch-text">
                            Type
                          </span>
                            <div class="switch"><label>
                            Any
                            <input name="allvideos" type="checkbox" class="conf" /><span class="lever"></span>
                            Song
                        </label></div></li>


                        <li><span class="switch-text">
                            Frontpage
                          </span>
                            <div class="switch"><label>
                            Hide
                            <input name="frontpage" type="checkbox" class="conf" /><span class="lever"></span>
                            Display
                        </label></div></li>

                        <li><span class="switch-text">
                            After play
                          </span>
                            <div class="switch"><label>
                            Keep
                            <input name="removeplay" type="checkbox" class="conf" /><span class="lever"></span>
                            Remove
                        </label></div></li>


                      </ul>
                </form>
            </div>
        </li>
    </ul>
</li>

<li class="no-padding remote-panel">
    <ul class="collapsible collapsible-accordion">
        <li>
            <a class="collapsible-header bold waves-effect">Remote Control
                <i class="mdi-action-account-circle"></i>
            </a>
            <div class="collapsible-body">
                <ul>
                    <li>
                        <a id="code-link" target="_blank">
                            <img id="code-qr" alt="QR code for control" title="Link to control this Zöff player" src="https://chart.googleapis.com/chart?chs=221x221&amp;cht=qr&amp;choe=UTF-8&amp;chld=L%7C1&amp;chl=https://zoff.no" />
                            <h4 id="code-text">ABBADUR</h4>
                        </a>
                        <a>
                          You can control this Zöff instance from another device by going to <b>https://zoff.no/remote</b>
                        </a>
                    </li>
                </ul>
            </div>
        </li>
    </ul>
</li>

<li class="no-padding remote-panel">
    <ul class="collapsible collapsible-accordion">
        <li>
            <a class="collapsible-header bold waves-effect">Import Playlist
                <i class="mdi-communication-import-export"></i>
            </a>
            <div class="collapsible-body">
                <ul>
                    <li class="white-bg">
                        <div class="input-field field-settings">
                            <form action="#" id="listImport" onsubmit="return false;">
                                <i class="mdi-av-playlist-add import-icon"></i>
                                <input title="Input YouTube-playlist id here!" placeholder="Enter YouTube-list ID" id="import" type="text" class="validate" />
                            </form>
                        </div>
                    </li>   
                </ul>
            </div>
        </li>
    </ul>
</li>
<!--
<li class="no-padding">
    <h5 id="desc-title">List description</h5>
    <span id="description"></span>
</li>
-->
