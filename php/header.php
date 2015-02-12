<!--
	
	Project is on github: https://github.com/nixolas1/Zoff
	Made by: Nicolas Almagro Tonne and Kasper Rynning-Tønnesen

	-->
<?php
  $bg = array('bg1.jpg', 'bg2.jpg', 'bg3.jpg', 'bg4.jpg', 'bg5.jpg' ); // array of filenames

  $i = rand(0, count($bg)-1); // generate random number size of the array
  $selectedBg = "$bg[$i]"; // set variable equal to which random filename was chosen
 ?>
<style type="text/css">
		<!--
		.bgimage{
			background: url(./static/<?php echo $selectedBg; ?>) no-repeat;
			opacity:0;
		}
		-->
</style>	
<title>Zöff</title>
<meta name="author" content="Nicolas 'Nixo' Almagro Tonne &amp; Kasper 'KasperRT' Rynning-Tønnesen">
<meta name="description" content="The shared YouTube radio.">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta property="og:image" content="static/favicon.png" />
<meta property="og:title" content="Zöff">
<meta property="og:description" content="The shared YouTube radio.">
<meta property="og:type" content="website">
<link rel="stylesheet" type="text/css" href="static/style.css" title="Default" />
<link rel="icon" type="image/png" href="static/favicon.png"/>
<link rel="stylesheet" type="text/css" href="static/controlstyle.css" />