<html>
<head>
    <?php include("header.php"); ?>
</head>
<body>
    <div class="top vcent centered">
        <div id="change" class="small">

                <div class="main"></div>

                <h1>Admin Settingspanel</h1>

                <form name="ufo" action="" class="daform nomargin" id="base" method="get" onsubmit="null;" >
                    <label>Anyone can vote:
                        <label> <input type="radio" name="vote" value="yes">yes</input></label>
                        <label> <input type="radio" name="vote" value="no">no</input></label>
                    </label><br>
                    <label>Anyone can add songs:
                            <label><input type="radio" name="addSongs" value="yes">yes</input></label>
                            <label><input type="radio" name="addSongs" value="no">no</input></label>
                    </label><br>
                    <label>Allow long songs:
                            <label><input type="radio" name="longSongs" value="yes">yes</input></label>
                            <label><input type="radio" name="longSongs" value="no">no</input></label>
                    </label><br>
                    <label>Allow only music:
                        <label><input type="radio" name="onlyMusic" value="yes">yes</input></label>
                        <label><input type="radio" name="onlyMusic" value="no">no</input></label>
                    </label><br>
                    <label>Paste playlist here: <input type="text" name="playlist"></label><br>
                    <input type="button" value="Save Settings">



                    
                   
                </form>
            </div>
        </div>
        <div class="footer small centered top anim bottom">&copy; 2014 <a class="anim" href="//nixo.no">Nixo</a> &amp; <a class="anim" href="//kasperrt.no">KasperRT</a> </div>
    </body>
</html>