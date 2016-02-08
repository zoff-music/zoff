<?php

	if(isset($_POST['from']) && isset($_POST['message'])){

		$from 	 = htmlspecialchars($_POST['from']);
		$message = htmlspecialchars($_POST['message']);
		$headers = "From: " . $from . "\r\n";

		$result  = mail("contact@zoff.no", "Contact from form", $message, $headers);

		if($result == FALSE){
			echo "failure";
		}else{
			echo "success";
		}
	}

?>