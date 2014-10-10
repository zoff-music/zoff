<html>
<head>
<title>promp</title>
</head>
<body>
<?php
	$files = scandir('oldFiles/');
	foreach($files as $list) {
		if($list != "." && $list != "..")
		{
			$file = file_get_contents("oldFiles/".$list);
			$data = json_decode($file);
			$array = array("nowPlaying" => array(), "songs" => array(), "conf" => array("startTime" => time(), "views" => 0, "skips" => array()));
			if(count($data) > 0)
			{
				for($i = 0; $i < count($data[0]); $i++)
				{
					if($i > 0)
					{

						$arr = "songs";
					}
					else{
						$arr = "nowPlaying";
					}
					$array[$arr][$data[0][0]] = array("id" => $data[0][0], "title" => str_replace("\"", "\'", $data[3][0]), "votes" => 0, "added" => time(), "guids" => array());
					array_shift($data[0]);
					array_shift($data[3]);
				}
				file_put_contents("oldFiles/".$list, json_encode($array));
				echo $array."\n";
			}
		}
	}
?>	
</body>
</html>