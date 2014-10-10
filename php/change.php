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

$f = @fopen($list,"x");
if($f){ fwrite($f,"[[],[".time()."],[],[],[],[]]"); fclose($f); }
$file = file_get_contents($list);
$data = json_decode($file);
$save = false;

if(isset($_REQUEST['thisUrl'])){
    $string = $_REQUEST['thisUrl'];
    $action = isset($_REQUEST['act']);

    if($data[0][0] == $string)
    {
        if($action=="save"){ 					//next song
            $save = true;
            nextSong();					
        }
        else if($action=="delete"){
            array_shift($data[0]);
            array_shift($data[3]);
            array_shift($data[2]);
        }
        file_put_contents($list, json_encode($data));
     }
     if($action == "save" && !$save) 			//count views
     {
        $data[4][0] = $data[4][0] + 1;
        file_put_contents($list, json_encode($data));
     }
     echo $data[0][0];
}
else if(isset($_GET['v'])){ //add
        $video = htmlspecialchars($_GET['v']);
        $name = htmlspecialchars($_GET['n']);
    if(!in_array($video, $data[0]))
    {
        //array_push($data[0], $video);
        $i = array_search(0, $data[2]);
        if($i == 0)$i=1;
        else if($i == false)$i=count($data[2]);
        array_splice($data[3], $i, 0, array($name));
        array_splice($data[2], $i, 0, array(1));
        array_splice($data[0],   $i, 0, array($video));
        file_put_contents($list, json_encode($data));
        print("added");
    }
   
}
else if(isset($_GET['vote'])){ //add vote
    $vote=$_GET['vote'];
    $id=$_GET['id'];
    $i = array_search($id, $data[0]);
	if($vote == 'neg'){$voteAdd = -1;}
	else if($vote == 'pos'){$voteAdd = 1;}
	$name = $data[3][$i];
	$votes = $data[2][$i] + $voteAdd;
    if($i == true && $votes >= 0){
		
		//print_r($i);
       // echo "IIII: ",$i;
		unset($data[3][$i]);
		unset($data[0][$i]);
		unset($data[2][$i]);
		$underVote = array_search($votes-1, $data[2]); #nenennenenen feiiiiiiiiiiiiiiiiil

		if($underVote == 0)$underVote=1;
        else if($underVote == false)$underVote=count($data[2]);
        array_splice($data[3], $underVote, 0, array($name));
        array_splice($data[2], $underVote, 0, array($votes));
        array_splice($data[0],   $underVote, 0, array($id));
		file_put_contents($list, json_encode($data));
		echo "Vote registrated. I hope";
    }
}
else if(isset($_GET['skip'])){ //skip song request
	$viewers=$data[4][0];
	$skips=count($data[5]);
	if(!in_array($guid, $data[5])){
		array_push($data[5], $guid);
		$skips+=1;
		$data[5][0]=$skips;
		if($skips>=$viewers/2){
			nextSong();
			echo("skipped!");
		}
		file_put_contents($list, json_encode($data));
	}
	echo($skips."/".$viewers);

}
else{ print($file); }

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