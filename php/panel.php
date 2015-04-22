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
                                <i class="mdi-action-lock"></i>
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
                            Display
                            <input name="frontpage" type="checkbox" class="conf"><span class="lever"></span>
                            Hide
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




<!--<span id="setpass"></span>

<input type="button" class="button" value="Shuffle" onclick="shuffle(this.form);" title="Shuffle the playlist">

<form id="adminForm" onsubmit="return false" name="ufo" action="" class="daform nomargin" id="base">
    <div class="toggles">
    <div class="toggler">
        <label><input type="radio" class="radio" name="frontpage" value="true"><span>Display</span></label> /
        <label><input type="radio" class="radio" name="frontpage" value="false"><span>Hide</span></label>
    </div>

    <div class="toggler">
        <label><input type="radio" class="radio" name="vote" value="true"><span>Admin</span></label> /
        <label><input type="radio" class="radio" name="vote" value="false"><span>Anyone</span></label>
    </div>

    <div class="toggler">
        <label><input type="radio" class="radio" name="addsongs" value="true"><span>Admin</span></label> /
        <label><input type="radio" class="radio" name="addsongs" value="false"><span>Anyone</span></label>
    </div>

    <div class="toggler">
        <label><input type="radio" class="radio" name="longsongs" value="true"><span>Allow</span></label> /
        <label><input type="radio" class="radio" name="longsongs" value="false"><span>Block</span></label>
    </div>

    <div class="toggler">
        <label><input type="radio" class="radio" name="allvideos" value="true"><span>All</span></label> /
        <label><input type="radio" class="radio" name="allvideos" value="false"><span>Song</span></label>
    </div>

    <div class="toggler">
        <label><input type="radio" class="radio" name="removeplay" value="true"><span>Remove</span></label> /
        <label><input type="radio" class="radio" name="removeplay" value="false"><span>Keep</span></label>
    </div>
    <div class="toggler">
        <label><input type="radio" class="radio" name="skip" value="true"><span>Allow</span></label> /
        <label><input type="radio" class="radio" name="skip" value="false"><span>Block</span></label>
    </div>
    <div class="toggler">
        <label><input type="radio" class="radio" name="shuffle" value="true"><span>Allow</span></label> /
        <label><input type="radio" class="radio" name="shuffle" value="false"><span>Block</span></label>
    </div>
    </div>

    <div class="toggtext">
        playlist on frontpage<br>
        can vote<br>
        can add songs<br>
        <span title="(>12 min)">long songs</span><br>
        categories allowed<br>
        songs after playing<br>
        skipping<br>
        shuffle<br>
    </div>
	<input type="password" name="pass" id="passbox" class="passbox" placeholder="Password">
	<input type="submit" class="button" value="Login/Save" onclick="submitAdmin(this.form);" title="Save settings/Login">
</form>
-->
