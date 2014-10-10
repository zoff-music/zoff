<?php 

if(isset($_GET["pass"]) && $_GET["pass"]=="bæsj"){

include("change.php"); 

$dir = scandir('../lists');
$channels = array();
foreach($dir as $file){
    if(strpos($file, '.json') !== FALSE){
        $name='./lists/'.$file;
        $data = json_decode(file_get_contents($name));
        unlink($name);
        checkFile($name); //should create a new file with correct stuff, in change
        processList($data);
    }
}
}else{
    echo("kek");
}

function processList($list, $name){
    foreach($list as $item){
        //get id and title
        addSong($name, $id, $title); //in change
    }
}


?>