<html>
<head>
[[+include file="header.tpl"]]
</head>
<body>
<div class="top vcent centered">
    <div id="change" class="small">
        <a id="toptitle" href="../">Zöff</a>
        <div id="chan" class="chan" title="Show big URL" onclick="show()">
            [[+$CHANNEL_NAME]]
        </div>
        <input id="search" name="v" type="text" class="search_input innbox" spellcheck="false" placeholder="Search" onsubmit="null;" autocomplete="off" />
        <div id="results"></div>
        <div class="main">
            <div id="player" class="ytplayer"></div>
            <div class="playlist" >
                <div id="buttons" class="result">
                    <!--<a href="/php/admin.php?list=<?php echo $list; ?>" title="Channel settings" ><img src="static/settings2.png" class="skip middle" alt="Settings"/></a>-->
                    <img src="static/css/gfx/settings.png" class="skip middle" alt="Settings" title="Settings" onclick="admin();"/>
                    <img src="static/css/gfx/skip.png" class="skip" alt="Skip" title="Skip" onclick="skip();">
                </div>
                <div id="adminPanel"></div>
                <div id="playlist">
                    <div id="wrapper"></div>
                </div>
            </div>
        </div>
    </div>
</div>
[[+include file="footer.tpl"]]
</body>
</html>
