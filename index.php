<?php require("main.php"); ?>

<html>
<head>
	<title>Zöff</title>
	<link rel="stylesheet" type="text/css" href="static/style.css" title="Default" />
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
</head>
<body>

	<div class="top vcent centered">
		<div id="change" class="small">
			<div class="big noselect">Zöff</div>
				Zöff
			<form name="ufo" action="" class="daform" id="base" method="get" onsubmit="return submitform();">
				<input id="longurl" name="v" type="text" class="innbox" />
			</form>
		</div>
		   
       <?php include 'vidhandling.php'; ?>
		
		<br>
		<?php print_r($data); ?>
	</div>
	<script>
		$(document).ready(function(){  }) 
	</script>
</body>
</html>