<html>
<head>
	[[+include file="header.tpl]]
</head>
<body>
<div class="top vcent centered">
    <div id="change" class="small">
        <div class="bigchan nomargin">Zöff</div>
        <form name="ufo" action="" class="daform nomargin" id="base" method="get" onsubmit="null;" >
            <input list="searches" id="search" name="chan" type="text" class="search_input innbox" spellcheck="false" maxlength="15" placeholder="Type Channel Name" autofocus/>
            <datalist id="searches">
                [[+$SEARCH_STRING]]
            </datalist>
        </form>

    </div>
    <center>
        <div class="channels" id="channels">Active Channels<br>
           [[+$DISPLAY_STRING]]
        </div>
    </center>
</div>
[[+include file="footer.tpl"]]
</body>
</html>
