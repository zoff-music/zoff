<?php

	if(isset($_POST['from']) && isset($_POST['message'])){

		$from 	 = htmlspecialchars($_POST['from']);
		$message = htmlspecialchars($_POST['message']);
		$headers = "From: " . $from . "\r\n";

		if(filter_var($from, FILTER_VALIDATE_EMAIL) && $message != ""){
			$result  = mail("contact@zoff.me", "ZOFF: Contact from form", $message, $headers);

			if($result == FALSE){
				echo "failure";
			}else{
				echo "success";
			}
		}else{
			echo "failure";
		}
	}

?>
