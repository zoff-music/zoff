<b>Admin Panel</b> <span id="setpass"></span>
<br>
<input type="button" class="button" value="Shuffle" onclick="shuffle(this.form);" title="Shuffle the playlist">

<form id="adminForm" onsubmit="return false" name="ufo" action="" class="daform nomargin" id="base">
    <div class="toggles">
    <div class="toggler">
        <label><input type="radio" class="radio"name="frontpage" value="true"><span>Display</span></label> / 
        <label><input type="radio" class="radio"name="frontpage" value="false"><span>Hide</span></label>
    </div>

    <div class="toggler">
        <label><input type="radio" class="radio"name="vote" value="true"><span>Admin</span></label> / 
        <label><input type="radio" class="radio"name="vote" value="false"><span>Anyone</span></label>
    </div>

    <div class="toggler">
        <label><input type="radio" class="radio"name="addsongs" value="true"><span>Admin</span></label> / 
        <label><input type="radio" class="radio"name="addsongs" value="false"><span>Anyone</span></label>
    </div>

    <div class="toggler">
        <label><input type="radio" class="radio"name="longsongs" value="true"><span>Allow</span></label> / 
        <label><input type="radio" class="radio"name="longsongs" value="false"><span>Block</span></label>
    </div>

    <div class="toggler">
        <label><input type="radio" class="radio"name="allvideos" value="true"><span>All</span></label> / 
        <label><input type="radio" class="radio"name="allvideos" value="false"><span>Song</span></label>
    </div>

    <div class="toggler">
        <label><input type="radio" class="radio"name="removeplay" value="true"><span>Remove</span></label> / 
        <label><input type="radio" class="radio"name="removeplay" value="false"><span>Keep</span></label>
    </div>
    </div>

    <div class="toggtext">
        playlist on frontpage<br>
        can vote<br>
        can add songs<br>
        <span title="(>12 min)">long songs</span><br>
        categories allowed<br>
        songs after playing<br>
    </div>
	<input type="password" name="pass" id="passbox" class="passbox" placeholder="Password">
	<input type="submit" class="button" value="Login/Save" onclick="submitAdmin(this.form);" title="Save settings/Login">
</form>
