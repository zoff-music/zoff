<b>Admin Panel</b>

<form id="adminForm" onsubmit="return false" name="ufo" action="" class="daform nomargin" id="base">
    <div class="toggles">
    <div class="toggler">
        <label><input type="radio" class="radio"name="frontPage" value="true"><span>Display</span></label> / 
        <label><input type="radio" class="radio"name="frontPage" value="false"><span>Hide</span></label>
    </div>

    <div class="toggler">
        <label><input type="radio" class="radio"name="vote" value="true"><span>Admin</span></label> / 
        <label><input type="radio" class="radio"name="vote" value="false"><span>Anyone</span></label>
    </div>

    <div class="toggler">
        <label><input type="radio" class="radio"name="addSongs" value="true"><span>Admin</span></label> / 
        <label><input type="radio" class="radio"name="addSongs" value="false"><span>Anyone</span></label>
    </div>

    <div class="toggler">
        <label><input type="radio" class="radio"name="longSongs" value="true"><span>Allow</span></label> / 
        <label><input type="radio" class="radio"name="longSongs" value="false"><span>Block</span></label>
    </div>

    <div class="toggler">
        <label><input type="radio" class="radio"name="allvideos" value="true"><span>All</span></label> / 
        <label><input type="radio" class="radio"name="allvideos" value="false"><span>Song</span></label>
    </div>

    <div class="toggler">
        <label><input type="radio" class="radio"name="removePlay" value="true"><span>Remove</span></label> / 
        <label><input type="radio" class="radio"name="removePlay" value="false"><span>Keep</span></label>
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

	<input type="password" name="pass" id="passbox" class="passbox" placeholder="Channel password">
	<input type="submit" class="button" value="Store" onclick="submitAdmin(this.form);">   
</form>
