<html>
<head>
[[+include file="header.tpl"]]
</head>
<body>
<div class="top vcent centered">
    <div id="change" class="small">
        <div class="bigchan nomargin">Zöff</div>
        <form name="ufo" action="" class="daform nomargin" id="base" method="get" onsubmit="null;" >
            <input list="searches" id="search" name="chan" type="text" class="search_input innbox" spellcheck="false" maxlength="15" placeholder="Type Channel Name" autofocus/>
            <datalist id="searches">
                <?php foreach($channels as $channel){echo "<option value='".htmlspecialchars(urldecode($channel))."'> ";} ?>
            </datalist>
        </form>

    </div>
    <center>
        <div class="channels" id="channels">Active Channels<br>
            <?php foreach($channels as $channel){echo "<a class='channel' href='/".htmlspecialchars($channel)."'>".htmlspecialchars(urldecode($channel))."</a>";} ?>
        </div>
    </center>
</div>
<a id="toptitle" href="/">Zöff</a>
<div id="chan" class="chan" title="Show big URL" onclick="show()">
    <?php echo(ucfirst($list));?>
</div>
<input id="search" name="v" type="text" class="search_input innbox" spellcheck="false" placeholder="Search" onsubmit="null;" autocomplete="off"/>
<div id="results"></div>
<div class="main">
    <div id="player" class="ytplayer"></div>
    <div class="playlist" >
        <div id="buttons" class="result">
            <!--<a href="/php/admin.php?list=<?php echo $list; ?>" title="Channel settings" ><img src="static/settings2.png" class="skip middle" alt="Settings"/></a>-->
            <img src="static/settings2.png" class="skip middle" alt="Settings" title="Settings" onclick="admin();"/>
            <img src="static/skip.png" class="skip" alt="Skip" title="Skip" onclick="skip();">
        </div>
        <div id="adminPanel"></div>
        <div id="playlist">
            <div id="wrapper"></div>
        </div>
    </div>
</div>
<div class="footer small centered top anim">
    &copy; 2014 <a class="anim" href="//nixo.no">Nixo</a> &amp; <a class="anim" href="//kasperrt.no">KasperRT </a>&amp; David
</div>
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
<script type="text/javascript" src="static/js/iscroll.js"></script>  
<script type="text/javascript" src="static/js/list.js"></script>  
<script type="text/javascript" src="static/js/youtube.js"></script>
<script type="text/javascript" src="static/js/search.js"></script> 
<script type="text/javascript" src="static/js/admin.js"></script>
<script type="text/javascript" src="static/js/visualize.js"></script> 
</body>
</html>
