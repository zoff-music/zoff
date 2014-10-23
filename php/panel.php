<b>Admin Panel</b>
<br>
<form id="adminForm" onsubmit="return false" name="ufo" action="" class="daform nomargin" id="base">

	<label>Only admin can vote 				<input type="checkbox" name="vote" value="1"></label>
	<label>Only admin can add songs		<input type="checkbox" name="addSongs" value="1"></label>
	<label>Allow long songs 			<input type="checkbox" name="longSongs" value="1"></label>
	<label>Show playlist on frontpage 	<input type="checkbox" name="frontPage" value="1"></label>
	<label>Only music 			<input type="checkbox" name="onlyMusic" value="1"></label>
	<label>Remove song after playing 	<input type="checkbox" name="removePlay" value="1"></label>
	<label>Admin Password <input type="password" name="pass"></label>

	<input type="button" class="button" value="Save Settings" onclick="submitAdmin(this.form);">   
</form>
