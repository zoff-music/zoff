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

<li class="no-padding remote-panel hide-on-small-only">
    <ul class="collapsible collapsible-accordion">
        <li>
            <a class="collapsible-header bold waves-effect">Remote Control
                <i class="mdi-action-settings-remote"></i>
            </a>
            <div class="collapsible-body">
                <ul>
                    <li>
                        <span class="switch-text">
                            Enable Remote
                        </span>
                        <div class="switch"><label>
                            Disabled
                            <input name="remote_switch" type="checkbox" class="remote_switch_class" checked /><span class="lever"></span>
                            Enabled
                            </label>
                            </div>
                        <a id="code-link" target="_blank">
                            <img id="code-qr" alt="QR code for control" title="Link to control this Zöff player" src="https://chart.googleapis.com/chart?chs=221x221&amp;cht=qr&amp;choe=UTF-8&amp;chld=L%7C1&amp;chl=http://zoff.no" />
                            <h4 id="code-text">ABBADUR</h4>
                        </a>
                        <a>
                          You can control this Zöff instance from another device by going to <b>https://remote.zoff.no/</b>
                        </a>
                    </li>
                </ul>
            </div>
        </li>
    </ul>
</li>


<li class="no-padding hide-on-small-only">
    <ul class="collapsible collapsible-accordion">
        <li>
            <a class="collapsible-header bold waves-effect import-a">Import Playlist
                <i class="mdi-hardware-keyboard-arrow-down"></i>
            </a>
            <div class="collapsible-body">
                <ul>
                    <li class="white-bg">
                        <div class="input-field field-settings youtube_unclicked import-buttons">
                            <a class="modal-trigger waves-effect red btn import-youtube" title="Import from YouTube playlist">
                              YouTube
                            </a>
                        </div>
                        <div class="input-field field-settings youtube_clicked">
                            <form action="#" id="listImport">
                                <i class="mdi-av-playlist-add import-icon"></i>
                                <input title="Input YouTube-playlist url here!" placeholder="Enter YouTube-list URL" id="import" type="text" class="validate" autocomplete="off" />
                                    <div class="valign playlist_loader_padding">
                                        <div id="playlist_loader" class="preloader-wrapper small active hide">
                                            <div class="spinner-layer spinner-blue">
                                                <div class="circle-clipper left">
                                                    <div class="circle"></div>
                                                </div>
                                                <div class="gap-patch">
                                                    <div class="circle"></div>
                                                </div>
                                                <div class="circle-clipper right">
                                                    <div class="circle"></div>
                                                </div>
                                            </div>

                                            <div class="spinner-layer spinner-red">
                                                <div class="circle-clipper left">
                                                    <div class="circle"></div>
                                                </div>
                                                <div class="gap-patch">
                                                    <div class="circle"></div>
                                                </div>
                                                <div class="circle-clipper right">
                                                    <div class="circle"></div>
                                                </div>
                                            </div>

                                            <div class="spinner-layer spinner-yellow">
                                                <div class="circle-clipper left">
                                                    <div class="circle"></div>
                                                </div>
                                                <div class="gap-patch">
                                                    <div class="circle"></div>
                                                </div>
                                                <div class="circle-clipper right">
                                                    <div class="circle"></div>
                                                </div>
                                            </div>

                                            <div class="spinner-layer spinner-green">
                                                <div class="circle-clipper left">
                                                    <div class="circle"></div>
                                                </div>
                                                <div class="gap-patch">
                                                    <div class="circle"></div>
                                                </div>
                                                <div class="circle-clipper right">
                                                    <div class="circle"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                            </form>
                        </div>
                    </li>
                    <li class="white-bg">
                        <div class="input-field field-settings spotify_unauthenticated import-buttons">
                            <a class="modal-trigger waves-effect green lighten btn import-spotify-auth" title="Import Spotify playlist">
                              Spotify
                            </a>
                        </div>
                        <div class="input-field field-settings spotify_authenticated">
                            <form action="#" id="listImportSpotify">
                                <i class="mdi-av-playlist-add import-icon"></i>
                                <input title="Input Spotify-playlist url here!" placeholder="Enter Spotify-list url" id="import_spotify" type="text" class="validate" autocomplete="off" />
                                <div class="valign playlist_loader_padding">
                                    <div id="playlist_loader_spotify" class="preloader-wrapper small active hide">
                                        <div class="spinner-layer spinner-blue">
                                            <div class="circle-clipper left">
                                                <div class="circle"></div>
                                            </div>
                                            <div class="gap-patch">
                                                <div class="circle"></div>
                                            </div>
                                            <div class="circle-clipper right">
                                                <div class="circle"></div>
                                            </div>
                                        </div>

                                        <div class="spinner-layer spinner-red">
                                            <div class="circle-clipper left">
                                                <div class="circle"></div>
                                            </div>
                                            <div class="gap-patch">
                                                <div class="circle"></div>
                                            </div>
                                            <div class="circle-clipper right">
                                                <div class="circle"></div>
                                            </div>
                                        </div>

                                        <div class="spinner-layer spinner-yellow">
                                            <div class="circle-clipper left">
                                                <div class="circle"></div>
                                            </div>
                                            <div class="gap-patch">
                                                <div class="circle"></div>
                                            </div>
                                            <div class="circle-clipper right">
                                                <div class="circle"></div>
                                            </div>
                                        </div>

                                        <div class="spinner-layer spinner-green">
                                            <div class="circle-clipper left">
                                                <div class="circle"></div>
                                            </div>
                                            <div class="gap-patch">
                                                <div class="circle"></div>
                                            </div>
                                            <div class="circle-clipper right">
                                                <div class="circle"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </li>
                    <li class="not-imported white-bg hide">
                        <div class="center-align">Not imported</div>
                        <ul class="input-field field-settings not-imported-container">
                            <li class="white-bg not-imported-element">
                                <div class="extra-add-text truncate"></div>
                                <a href="#" class="waves-effect red lighten btn right extra-button extra-button-delete">X</a>
                                <a href="#" class="waves-effect green lighten btn right extra-button extra-button-search">
                                <i class="mdi-action-search search-extra"></i></a>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        </li>
    </ul>
</li>

<li class="no-padding hide-on-small-only">
    <ul class="collapsible collapsible-accordion white-bg">
        <li>
            <a class="collapsible-header bold waves-effect export-a">Export Playlist
                <i class="mdi-hardware-keyboard-arrow-up"></i>
            </a>
            <div class="collapsible-body">
                <ul>
                    <li class="white-bg">
                        <div class="input-field field-settings youtube_export_button export-buttons">
                            <a class="modal-trigger waves-effect red btn export-youtube" id="listExport" title="Export to YouTube">
                              YouTube
                            </a>
                            <div class="valign playlist_loader_padding">
                                <div id="playlist_loader_export" class="preloader-wrapper small active hide">
                                    <div class="spinner-layer spinner-blue">
                                        <div class="circle-clipper left">
                                            <div class="circle"></div>
                                        </div>
                                        <div class="gap-patch">
                                            <div class="circle"></div>
                                        </div>
                                        <div class="circle-clipper right">
                                            <div class="circle"></div>
                                        </div>
                                    </div>

                                    <div class="spinner-layer spinner-red">
                                        <div class="circle-clipper left">
                                            <div class="circle"></div>
                                        </div>
                                        <div class="gap-patch">
                                            <div class="circle"></div>
                                        </div>
                                        <div class="circle-clipper right">
                                            <div class="circle"></div>
                                        </div>
                                    </div>

                                    <div class="spinner-layer spinner-yellow">
                                        <div class="circle-clipper left">
                                            <div class="circle"></div>
                                        </div>
                                        <div class="gap-patch">
                                            <div class="circle"></div>
                                        </div>
                                        <div class="circle-clipper right">
                                            <div class="circle"></div>
                                        </div>
                                    </div>

                                    <div class="spinner-layer spinner-green">
                                        <div class="circle-clipper left">
                                            <div class="circle"></div>
                                        </div>
                                        <div class="gap-patch">
                                            <div class="circle"></div>
                                        </div>
                                        <div class="circle-clipper right">
                                            <div class="circle"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="input-field field-settings">
                        </div>
                    </li>
                    <!--<li class="white-bg">
                        <div class="input-field field-settings spotify_unauthenticated export-buttons">
                            <a class="modal-trigger waves-effect green lighten btn export-spotify-auth" id="listExportSpotify" title="Export to Spotify">
                              Spotify
                            </a>
                        </div>
                    </li>-->
                    <li class="exported-list-container white-bg hide">
                        <ul class="input-field field-settings white-bg">
                            <li class="white-bg exported-list white-bg">

                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        </li>
    </ul>
</li>

<li class="no-padding show-only-mobile">
    <ul class="collapsible collapsible-accordion">
        <li>
            <a class="collapsible-header bold waves-effect import-a">Remote Controller
                <i class="mdi-action-settings-remote"></i>
            </a>
            <div class="collapsible-body">
                <ul id="remote-mobile-container">
                    <li class="white-bg">
                        <p id="remote_header">Control another client</p>
                        <form action="#" class="row" id="remoteform">
                            <div class="input-field col s12">
                                <input
                                    class="input-field"
                                    type="text"
                                    id="remote_channel"
                                    name="chan"
                                    autocomplete="off"
                                    spellcheck="false"
                                    maxlength="10"
                                    data-length="10"
                                    placeholder="ID to remotecontroll"
                                />
                            </div>
                        </form>
                        <button id="playbutton_remote" class="remote-button waves-effect btn green" disabled>
                            <i id="remote_play" class="mdi-av-play-arrow"></i>
                        </button>
                        <button id="pausebutton_remote" class="remote-button waves-effect btn gray" disabled>
                        <i id="remote_pause" class="mdi-av-pause"></i></button>
                        <button id="skipbutton_remote" class="remote-button waves-effect btn blue" disabled>
                            <i id="remote_skip" class="mdi-av-skip-next"></i>
                        </button>
                        <i class="mdi-av-volume-up slider-vol"></i>
                        <div class="" id="volume-control-remote" title="Volume"></div>
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
