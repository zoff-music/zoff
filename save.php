<?php
	if(isset($_POST['thisUrl']))
	{
		$string = $_POST['thisUrl'];
		
		$file = file_get_contents('videos.json');
		$data = json_decode($file);
		unset($file);//prevent memory leaks for large json.
		//insert data here
		if($data[0] == $string)
		{
			array_push($data, $string);
			array_shift($data);
		}
		file_put_contents("videos.json", json_encode($data));
		echo $data;
		unset($data);
	}else
	{
		echo "You're a bad boy";
	}
	die();	
?>