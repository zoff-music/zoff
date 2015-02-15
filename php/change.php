<?php
                                                                //making our guid, its unique and coooooool
$guid=substr(base64_encode(crc32($_SERVER['HTTP_USER_AGENT'].$_SERVER['REMOTE_ADDR'].$_SERVER['HTTP_ACCEPT_LANGUAGE'])), 0, 8);

//save or delete(oid)                                             //getting the list we are in
$list = explode("/", htmlspecialchars(strtolower($_SERVER["REQUEST_URI"])));
if($list[1]==""||!isset($list[1])||count($list)<=1)$list="videos";
else $list = preg_replace('/[^\da-z=?]/i', '', urldecode($list[1]));

$list="../lists/".$list.".json";                                   //actually setting the list for the target. Under is the array for an empty list being created
$array = array("nowPlaying" => array("30H2Z8Lr-4c" => array("id" => "30H2Z8Lr-4c", "title" => "Empty Channel, search to add a video")), "songs" => array(), "conf" => array("startTime" => time(), "views" => array(), "skips" => array(), "vote" => "false", "addsongs" => "false", "longsongs" => "true", "frontpage" => "true", "allvideos" => "true", "removeplay" => "false", "adminpass" => ""));
$array = json_encode($array);                                      //encoding the array
$f = @fopen($list,"x");                                            //opening a file, ignoring warnings
if($f){ fwrite($f,$array); fclose($f); }                           //if the file doesn't exist, we create a new one, and adds the newly made array there
$file = file_get_contents($list);                                  //gets the content of the file
$data = json_decode($file, TRUE);                                  //decoding the file. The true is there for array comprehension in php or something. Don't remove!
$songs = $data["songs"];                                           //setting the now playing and the next song in the next couplecouple of lines
$np = $data["nowPlaying"];
$np = array_values($np);
$firstSong = array_values($songs);
$save = false;                                                      //declares the save variable, see further down for why


if(isset($_REQUEST['shuffle'])){ //shuffle songs  in list

    $q = $data["conf"];
    $q = array_key_exists("adminpass", $q);
    $pass = htmlspecialchars($_GET['pass']);
    $x = explode("/", htmlspecialchars(strtolower($_SERVER["REQUEST_URI"])));
    if($pass != "")
        $pass=crypt($pass, '$6$rounds=9001$'.$x[1].'Fuck0ffuSn34kyn!ggerzZ$');
    if(sizeof($data["songs"]) == 0){
        die("size");
    }
    if($pass == $data["conf"]["adminpass"] || $data["conf"]["adminpass"] == "") {

        //shuffle($data["songs"]);
        foreach($data["songs"] as $k=>$v) { 
                $data["songs"][$v["id"]]["added"]=rand(0,time());
                $sort['votes'][$k] = $v['votes'];
                $sort['added'][$k] = $data["songs"][$k]["added"];
        }
        array_multisort($sort['votes'], SORT_DESC, $sort['added'], SORT_ASC, $data["songs"]);
        file_put_contents($list, json_encode($data));
        //die("shuffeled");
        echo "shuffled";
        die();
    }else{
        die("wrong!");
    }
}

if(is_array($data["conf"]["views"])){
    if(!in_array($guid, $data["conf"]["views"])){                       //add viewer in viewers if not already in there
        array_push($data["conf"]["views"], $guid);
        file_put_contents($list, json_encode($data));
    }
}else{
    $data["conf"]["views"]=array($guid);
    file_put_contents($list, json_encode($data));
}

//If test for either saving when the song is done, or an error has occured
if(isset($_REQUEST['thisUrl'])){
    $string = $_REQUEST['thisUrl'];                                 //saving string as the id of the song
    $action = isset($_REQUEST['act']);                              //checking the action of the request, either save or del
    $firstToAdd = $firstSong[0]["id"];                              //getting the id of the first in the queue
    if($np[0]["id"] == $string)                                     //if the string we're sending in matches the id of the song playing now, we proceed
    {
        if($action=="save" || $action == "empty"){ 					//action save or empty, either way goes further
            $save = true;                                           //small fix for the editing of viewers. Explain later in file.
            //array_shift($data["songs"]);
            //array_shift($data["nowPlaying"]);
            if(!is_null($np[0]["id"]) && !is_null($firstToAdd)){    //Checking both the next song and the song playing now is null, if so it just skips the flipping around with songs
                array_shift($data["songs"]);                        //already shifts the array of songs, because we have the first in the queue saved
                $q = $data["conf"];
        		$q = array_key_exists("removeplay", $q);            
        		if(($data["conf"]["removeplay"] == "false" || $q != 1) && ($np[0]["id"] != "30H2Z8Lr-4c" && !is_null($firstToAdd)))         //checking if removeplay exists or if its false. If its true, the song we just played won't be added to the queue
        		{   //here we just adds the song that was just played into the queue in the songs array, take note here we set added as the current time it was added. This is because of the multisort further down
        			$data["songs"][$np[0]["id"]] = array("id" => $np[0]["id"], "title" => $np[0]["title"], "votes" => $np[0]["votes"], "added" => time(), "guids" => array());
        		}
                array_shift($data["nowPlaying"]);                   //shifting the nowPlaying array, and moving the first in line to the nowPlaying array
                $data["nowPlaying"][$firstSong[0]["id"]] = array("id" => $firstSong[0]["id"], "title" => $firstSong[0]["title"], "votes" => 0, "added" => $firstSong[0]["added"], "guids" => $firstSong[0]["guids"]);
            
            }
            
            //array_push($data["songs"], $add);
            $data["conf"]["skips"] = array();                        //resets the skip count
            $data["conf"]["startTime"] = time();                     //resets the starttime of the song so it will be sorted accordingly
            $data["conf"]["views"]= array($guid);                    //reset the viewers so you dont count old viewers
            foreach($data["songs"] as $k=>$v) {                      //the next 5 lines of code is just for sorting the array with highest votes at the top, and the lowest time added at the top, so that the voting will be alot more fair
                $sort['votes'][$k] = $v['votes'];
                $sort['added'][$k] = $v['added'];
            }
            array_multisort($sort['votes'], SORT_DESC, $sort['added'], SORT_ASC, $data["songs"]);			
        }
       /* else if($action=="delete"){
            array_shift($firstSong[0]);
        }*/
        file_put_contents($list, json_encode($data));                   //sending the encoded json array to the file
     }else if(is_null($np[0]["id"]))                                    //if nowPlaying is null, it just moves the first song in the queue up
     {
        array_shift($data["songs"]);
        array_shift($data["nowPlaying"]);
        $data["nowPlaying"][$firstSong[0]["id"]] = array("id" => $firstSong[0]["id"], "title" => $firstSong[0]["title"], "votes" => 0, "added" => $firstSong[0]["added"], "guids" => $firstSong[0]["guids"]);
            
     }
     if($action == "save" && !$save) 			                        //count views
     {
        file_put_contents($list, json_encode($data));
     }
     $newPlaying = array_values($data["nowPlaying"]);                   //returning the new songs id to the javascript so it gets what song to start next
     echo json_encode(array( "id" => $newPlaying[0]["id"], "title" => $newPlaying[0]["title"]));                                      
}
else if(isset($_GET['v'])){                                             //if it gets v, we start our add "function"
    $q = $data["conf"];
    $q = array_key_exists("addsongs", $q);
    $pass = htmlspecialchars($_GET['pass']);
    $x = explode("/", htmlspecialchars(strtolower($_SERVER["REQUEST_URI"])));
    $pass=crypt($pass, '$6$rounds=9001$'.$x[1].'Fuck0ffuSn34kyn!ggerzZ$');
    if($pass == $data['conf']['adminpass'] || $data['conf']['addsongs'] == "false" || $q != 1) //checking wether it has been set so only admins can add songs. If its false, or the value doesn't exist, we continue
    {
        $video = htmlspecialchars($_GET['v']);                          //id of the video
        $name = htmlspecialchars($_GET['n']);                           //name of the video
        if($np[0]["id"] == "30H2Z8Lr-4c")
        {
            $q = array("nowPlaying" => array($video => array("id" => $video, "title" => $name, "votes" => 0, "added" => time(), "guids" => array())), "songs" => array(), "conf" => array("startTime" => time(), "views" => array(), "skips" => array(), "vote" => "false", "addsongs" => "false", "longsongs" => "true", "frontpage" => "true", "allvideos" => "true", "removeplay" => "false", "adminpass" => ""));
            //$q = array("nowPlaying" => array($video => array("id" => $video, "title" => $name, "votes" => 0, "added" => time(), "guids" => array())), "songs" => array(), "conf" => array("startTime" => time(), "views" => array(), "skips" => array()));
            $q["nowPlaying"][$video]["votes"] = 1;                         //Upping the votes, so it comes further up than the ones already played
            array_push($q["nowPlaying"][$video]["guids"], $guid); 
            file_put_contents($list, json_encode($q));
            print("added");
        }else if(!in_array($video, $data["songs"]))                           //checking if the video already is in the array of songs (should check the now playing to)
        {
            if(count($data["nowPlaying"]) > 0) $place = "songs";        //checking if the nowPlaying array is empty, if it is, the "place" to add it is nowPlaying, if not it is songs
            else $place = "nowPlaying";                                 //Adding to the array
            $data[$place][$video] = array("id" => $video, "title" => $name, "votes" => 0, "added" => time(), "guids" => array());
            $data[$place][$video]["votes"] = 1;                         //Upping the votes, so it comes further up than the ones already played
            array_push($data[$place][$video]["guids"], $guid);          //adding the users GUID to the array so he can't vote infinite times                                            
            if($place != "nowPlaying")
            {
                $sort = array();
                foreach($data["songs"] as $k=>$v) {
                    $sort['votes'][$k] = $v['votes'];                   //Again sorting, explained further up
                    $sort['added'][$k] = $v['added'];
                }
                array_multisort($sort['votes'], SORT_DESC, $sort['added'], SORT_ASC, $data["songs"]);
            }
            file_put_contents($list, json_encode($data));
            print("added");                                             //Just telling the javascript that it has been added for some reason...
        }
    }else{
        print("wrong");
    }
}

else if(isset($_GET['vote'])){                                           //if the getvaluethingy is vote, this starts
    $vote=$_GET['vote'];                                                 //The javascript either sends in neg or pos, this is where we save the value
    $id=$_GET['id'];                                                    //id of the video/song the user is voting for
    if($vote=='del'){                                                   //This is so we don't have to make a seperate function for the delete
        $pass=$_GET['pass'];
        $x = explode("/", htmlspecialchars(strtolower($_SERVER["REQUEST_URI"])));
        $pass=crypt($pass, '$6$rounds=9001$'.$x[1].'Fuck0ffuSn34kyn!ggerzZ$');
        $adminpass=$data["conf"]["adminpass"];    
        
        if($adminpass == $pass){                                        //checking if the password is correct, then deleting the song (this is not in use yet.)
            unset($data["songs"][$id]);
            file_put_contents($list, json_encode($data));
            echo "removed song with ID: ".$id." from list: ".$list;
        }

    }else                                                               //if we don't get the del, we're voting, WOHO!
    {
        $q = $data["conf"];
        $q = array_key_exists("vote", $q);
        $pass = htmlspecialchars($_GET['pass']);
        $x = explode("/", htmlspecialchars(strtolower($_SERVER["REQUEST_URI"])));
        $pass=crypt($pass, '$6$rounds=9001$'.$x[1].'Fuck0ffuSn34kyn!ggerzZ$');
        if($pass == $data['conf']['adminpass'] || $data['conf']['vote'] == "false" || $q != 1)
        {
        	if($vote == 'neg'){$voteAdd = -1;}                              //setting the votetoadd to the array depending of what way you swing.
            else if($vote == 'pos'){$voteAdd = 1;}                          //checking if the key exists in the array, and if we're already voted
        	if(array_key_exists($id, $data["songs"]) && !in_array($guid, $data["songs"][$id]["guids"]))
            {                                                               //finally adding the vote to the votings
                $data["songs"][$id]["votes"] = $data["songs"][$id]["votes"] + $voteAdd;
                if($data["songs"][$id]["votes"] > -1)                       //but only if we're still above or equal to 0
                {
                    $data["songs"][$id]["added"] = time();                  //updating the added time, so it comes on the bottom of its own "level" of votes
                    array_push($data["songs"][$id]["guids"], $guid);        //pushing the users guid to the array so he/she can't vote again
                    foreach($data["songs"] as $k=>$v) {
                        $sort['votes'][$k] = $v['votes'];                   //again, sorting
                        $sort['added'][$k] = $v['added'];
                    }
                    array_multisort($sort['votes'], SORT_DESC, $sort['added'], SORT_ASC, $data["songs"]);
                    file_put_contents($list, json_encode($data));
                    echo "Vote registrated. I hope";                        
                }else
                {
                    print("many");
                }
            }else
            {
                print("many");                                             //not in use..i think..
            }
        }else{
            print("wrong");
        }
        

    }
}
else if(isset($_GET['skip'])){                                          //skip, really similar to the save function, not going in depth here.
	$viewers=count($data["conf"]["views"]);
	$skips=count($data["conf"]["skips"]);                               //Counting how many GUIDS there are under the skip key
	if(!in_array($guid, $data["conf"]["skips"])){                       //If the users GUID isn't in the array, its added
		array_push($data["conf"]["skips"], $guid);
		$skips+=1;                                                      //and the number of skips is upped
		//$data["conf"]["skips"]=$skips;
		if($skips>=$viewers/2){                                         //checking if the skips wanted is larger than the viewers/2, if so its skipping, woohooo!
			array_shift($data["songs"]);
	        $q = $data["conf"];
			$q = array_key_exists("removeplay", $q);
			if($data["conf"]["removeplay"] == "false" || $q != 1)
			{
				$data["songs"][$np[0]["id"]] = array("id" => $np[0]["id"], "title" => $np[0]["title"], "votes" => $np[0]["votes"], "added" => time(), "guids" => array());
			}
			array_shift($data["nowPlaying"]);
           	$data["nowPlaying"][$firstSong[0]["id"]] = array("id" => $firstSong[0]["id"], "title" => $firstSong[0]["title"], "votes" => 0, "added" => $firstSong[0]["added"], "guids" => $firstSong[0]["guids"]);
        	//array_push($data["songs"], $add);
        	$data["conf"]["skips"] = array();
        	$data["conf"]["startTime"] = time(); 
        	foreach($data["songs"] as $k=>$v) {
            	$sort['votes'][$k] = $v['votes'];
            	$sort['added'][$k] = $v['added'];
        	}
	    	array_multisort($sort['votes'], SORT_DESC, $sort['added'], SORT_ASC, $data["songs"]);
	    }
		file_put_contents($list, json_encode($data));
	}
	echo($skips."/".$viewers);                                             //always printing out the skip/viewer ratio

}else if(isset($_POST['conf']))                                            //conf, this is for admin settings/channel settings
{
	$data["conf"]["vote"] = $_POST['vote'];                                //setting all the settings from the post gotten from admin.js
	$data["conf"]["addsongs"] = $_POST['addsongs'];
	$data["conf"]["longsongs"] = $_POST['longsongs'];
	$data["conf"]["frontpage"] = $_POST['frontpage'];
	$data["conf"]["allvideos"] = $_POST['allvideos'];
	$data["conf"]["removeplay"] = $_POST['removeplay'];
	$pass = htmlspecialchars($_POST['pass']);
    if($pass != ""){
        $x = explode("/", htmlspecialchars(strtolower($_SERVER["REQUEST_URI"])));
        $pass=crypt($pass, '$6$rounds=9001$'.$x[1].'Fuck0ffuSn34kyn!ggerzZ$');
    }
    $q = $data["conf"];
	$q = array_key_exists("adminpass", $q);

	if($data["conf"]["adminpass"] == $pass || $q != 1 || $data["conf"]["adminpass"] == "")                      //if the password is the same as the one in the jsonfile, we are updating the settings (not in use yet)
	{
		$data["conf"]["adminpass"] = $pass;
		echo "correct";
		file_put_contents($list, json_encode($data));
	}else
    {
        echo "wrong";
    }
}else{                                                                      //printing the whole data array json encoded for youtube.js or list.js to pick up
    echo json_encode($data); 
}

//
//
//None of these are in use any more/yet
//
//
//

function addSong($name, $id, $title)            
{

}

function nextSong(){
	global $data;
	array_push($data[0], $data[0][0]);
    array_shift($data[0]);

    array_push($data[2], 0); 		
    array_shift($data[2]);

    array_push($data[3], $data[3][0]);
    array_shift($data[3]);

    array_shift($data[4]);
    array_push($data[4], 1);

    $data[5]=array();
    $data[1][0] = time();
}
?>