<li class="no-padding">
    <ul class="collapsible collapsible-accordion">
        <li>
            <a class="col s9 collapsible-header bold waves-effect admin-settings active">
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
<li class="no-padding hide">
    <ul class="collapsible collapsible-accordion">
        <li>
            <a class="collapsible-header bold waves-effect">User Settings
                <i class="mdi-action-account-circle"></i>
            </a>
            <div class="collapsible-body">
                <ul>
                    <li><a href="#!">Second</a></li>
                    <li><a href="#!">Third</a></li>
                    <li><a href="#!">Fourth</a></li>
                </ul>
            </div>
        </li>
    </ul>
</li>
