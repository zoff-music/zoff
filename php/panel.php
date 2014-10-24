<b>Admin Panel</b>

<form id="adminForm" onsubmit="return false" name="ufo" action="" class="daform nomargin" id="base">
    <div class="toggles">
    <div class="toggler">
        <label><input type="radio" class="radio"name="frontPage" value="1"><span>Display</span></label> / 
        <label><input type="radio" class="radio"name="frontPage" value="0"><span>Hide</span></label>
    </div>

    <div class="toggler">
        <label><input type="radio" class="radio"name="vote" value="1"><span>Admin</span></label> / 
        <label><input type="radio" class="radio"name="vote" value="0"><span>Anyone</span></label>
    </div>

    <div class="toggler">
        <label><input type="radio" class="radio"name="addSongs" value="1"><span>Admin</span></label> / 
        <label><input type="radio" class="radio"name="addSongs" value="0"><span>Anyone</span></label>
    </div>

    <div class="toggler">
        <label><input type="radio" class="radio"name="longSongs" value="1"><span>Allow</span></label> / 
        <label><input type="radio" class="radio"name="longSongs" value="0"><span>Block</span></label>
    </div>

    <div class="toggler">
        <label><input type="radio" class="radio"name="allvideos" value="1"><span>All</span></label> / 
        <label><input type="radio" class="radio"name="allvideos" value="0"><span>Song</span></label>
    </div>

    <div class="toggler">
        <label><input type="radio" class="radio"name="removePlay" value="1"><span>Remove</span></label> / 
        <label><input type="radio" class="radio"name="removePlay" value="0"><span>Keep</span></label>
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
