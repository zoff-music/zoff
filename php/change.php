<?php

$guid=substr(base64_encode(crc32($_SERVER['HTTP_USER_AGENT'].$_SERVER['REMOTE_ADDR'].$_SERVER['HTTP_ACCEPT_LANGUAGE'])), 0, 8);

if(isset($_REQUEST['test'])){
    echo($guid);
    exit;
}

//save or del
$list = explode("/", htmlspecialchars(strtolower($_SERVER["REQUEST_URI"])));
if($list[1]==""||!isset($list[1])||count($list)<=1)$list="videos";
else $list=$list[1];

$list="../lists/".$list.".json";
$array = array("nowPlaying" => array(), "songs" => array(), "conf" => array("startTime" => time(), "views" => 0, "skips" => array()));
$array = json_encode($array);
$f = @fopen($list,"x");
if($f){ fwrite($f,$array); fclose($f); }
$file = file_get_contents($list);
$data = json_decode($file, TRUE);
$songs = $data["songs"];
$np = $data["nowPlaying"];
$np = array_values($np);
$firstSong = array_values($songs);
$save = false;


if(isset($_REQUEST['thisUrl'])){
    $string = $_REQUEST['thisUrl'];
    $action = isset($_REQUEST['act']);
    $firstToAdd = $firstSong[0]["id"];
    if($np[0]["id"] == $string)
    {
        if($action=="save" || $action == "empty"){ 					//next song
            $save = true;
            //array_shift($data["songs"]);
            //array_shift($data["nowPlaying"]);
            if(!is_null($np[0]["id"]) && !is_null($firstToAdd)){
                array_shift($data["songs"]);
                $q = $data["conf"];
		$q = array_key_exists("delsongs", $q);
		if(!$data["conf"]["delsongs"] || $q != 1)
		{
			$data["songs"][$np[0]["id"]] = array("id" => $np[0]["id"], "title" => $np[0]["title"], "votes" => $np[0]["votes"], "added" => time(), "guids" => array());
		}
                array_shift($data["nowPlaying"]);
                $data["nowPlaying"][$firstSong[0]["id"]] = array("id" => $firstSong[0]["id"], "title" => $firstSong[0]["title"], "votes" => 0, "added" => $firstSong[0]["added"], "guids" => $firstSong[0]["guids"]);
            
            }
            
            //array_push($data["songs"], $add);
            $data["conf"]["skips"] = array();
            $data["conf"]["startTime"] = time();
            $data["conf"]["views"] = 1;	
            foreach($data["songs"] as $k=>$v) {
                $sort['votes'][$k] = $v['votes'];
                $sort['added'][$k] = $v['added'];
            }
            array_multisort($sort['votes'], SORT_DESC, $sort['added'], SORT_ASC, $data["songs"]);			
        }
       /* else if($action=="delete"){
            array_shift($firstSong[0]);
        }*/
        file_put_contents($list, json_encode($data));
     }else if(is_null($np[0]["id"]))
     {
        array_shift($data["songs"]);
        //$data["songs"][$np[0]["id"]] = array("id" => $np[0]["id"], "title" => $np[0]["title"], "votes" => $np[0]["votes"], "added" => time(), "guids" => array());
        array_shift($data["nowPlaying"]);
        $data["nowPlaying"][$firstSong[0]["id"]] = array("id" => $firstSong[0]["id"], "title" => $firstSong[0]["title"], "votes" => 0, "added" => $firstSong[0]["added"], "guids" => $firstSong[0]["guids"]);
            
     }
     if($action == "save" && !$save) 			//count views
     {
        $data["conf"]["views"] = $data["conf"]["views"] + 1;
        file_put_contents($list, json_encode($data));
     }
     $newPlaying = array_values($data["nowPlaying"]);
     echo $newPlaying[0]["id"];
}
else if(isset($_GET['v'])){ //add
    $video = htmlspecialchars($_GET['v']);
    $name = htmlspecialchars($_GET['n']);
    if(!in_array($video, $data["songs"]))
    {
        if(count($data["nowPlaying"]) > 0) $place = "songs";
        else $place = "nowPlaying";
        $data[$place][$video] = array("id" => $video, "title" => $name, "votes" => 0, "added" => time(), "guids" => array());
        $data[$place][$video]["votes"] = 1;
        array_push($data[$place][$video]["guids"], $guid);
        $sort = array();
        if($place != "nowPlaying")
        {
            foreach($data["songs"] as $k=>$v) {
                $sort['votes'][$k] = $v['votes'];
                $sort['added'][$k] = $v['added'];
            }
            array_multisort($sort['votes'], SORT_DESC, $sort['added'], SORT_ASC, $data["songs"]);
        }
        file_put_contents($list, json_encode($data));
        print("added");
    }
   
}
else if(isset($_GET['vote'])){ //add vote
    $vote=$_GET['vote'];
    $id=$_GET['id'];
    //$i = array_search($id, $data["songs"]);
    //$i = array_search($id, array_keys($data["songs"]))
	if($vote == 'neg'){$voteAdd = -1;}
    else if($vote == 'pos'){$voteAdd = 1;}
	if(array_key_exists($id, $data["songs"]) && !in_array($guid, $data["songs"][$id]["guids"]))
    {
        $data["songs"][$id]["votes"] = $data["songs"][$id]["votes"] + $voteAdd;
        if($data["songs"][$id]["votes"] > -1)
        {
            $data["songs"][$id]["added"] = time();
            array_push($data["songs"][$id]["guids"], $guid);
            foreach($data["songs"] as $k=>$v) {
                $sort['votes'][$k] = $v['votes'];
                $sort['added'][$k] = $v['added'];
            }
            array_multisort($sort['votes'], SORT_DESC, $sort['added'], SORT_ASC, $data["songs"]);
            file_put_contents($list, json_encode($data));
            echo "Vote registrated. I hope";
        }
    }else
    {
        echo array_key_exists($id, $data["songs"]);
    }
}
else if(isset($_GET['skip'])){ //skip song request
	$viewers=$data["conf"]["views"];
	$skips=count($data["conf"]["skips"]);
	if(!in_array($guid, $data["conf"]["skips"])){
		array_push($data["conf"]["skips"], $guid);
		$skips+=1;
		//$data["conf"]["skips"]=$skips;
		if($skips>=$viewers/2){
			array_shift($data["songs"]);
	        	$q = $data["conf"];
			$q = array_key_exists("delsongs", $q);
			if(!$data["conf"]["delsongs"] || $q != 1)
			{
				$data["songs"][$np[0]["id"]] = array("id" => $np[0]["id"], "title" => $np[0]["title"], "votes" => $np[0]["votes"], "added" => time(), "guids" => array());
			}
			array_shift($data["nowPlaying"]);
	           	$data["nowPlaying"][$firstSong[0]["id"]] = array("id" => $firstSong[0]["id"], "title" => $firstSong[0]["title"], "votes" => 0, "added" => $firstSong[0]["added"], "guids" => $firstSong[0]["guids"]);
	            	//array_push($data["songs"], $add);
	            	$data["conf"]["skips"] = array();
	            	$data["conf"]["startTime"] = time();
	            	$data["conf"]["views"] = 1; 
	            	foreach($data["songs"] as $k=>$v) {
	                	$sort['votes'][$k] = $v['votes'];
	                	$sort['added'][$k] = $v['added'];
	            	}
            	    	array_multisort($sort['votes'], SORT_DESC, $sort['added'], SORT_ASC, $data["songs"]);
		}
		file_put_contents($list, json_encode($data));
	}
	echo($skips."/".$viewers);

}else if(isset($_GET['timedifference'])){ 

    $diff = (time() - $data["conf"]["startTime"]);
    $returnArray = array($diff, $firstSong[0]["id"], time(), $data["conf"]["startTime"], $firstSong[0]["title"], $data["conf"]["views"]);
    $returnArray = json_encode($returnArray);
    echo($data); 
}else{ 
    echo json_encode($data); 
}

function addSong($name, $id, $title)
{

}

function nextSong(){
	global $data;
	array_push($data[0], $data[0][0]);
    array_shift($data[0]);

    array_push($data[2], 0); 		//reset votes
    array_shift($data[2]);

    array_push($data[3], $data[3][0]);
    array_shift($data[3]);

    array_shift($data[4]);
    array_push($data[4], 1);

    $data[5]=array();
    $data[1][0] = time();
}
?>
