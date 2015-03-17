$(document).ready(function()
{
	found = null;
	bright = [];
	$.expr[":"].contains = $.expr.createPseudo(function(arg) {
    return function( elem ) {
	        return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
	    };
	});
	find = false;
	$("html").keydown(function(event) {
		if ((event.keyCode == 13 && find)  || (event.keyCode == 27 && find) || (event.ctrlKey && event.keyCode === 70)) 
		{ 
			find = !find;
			if(find)
				$(".lresult").addClass("brightness");
			else
			{
				$(".lresult").removeClass("brightness");
				$(".lresult").removeClass("fullbrightness");
				bright.length = 0;
			}
        	event.preventDefault();
        	$("#findform").toggleClass("display");
        	$("#adminPanel").toggleClass("brightness");
        	$("#findform-input").val("");
        	$("#findform-input").focus();
        	/*
        	if(find) $("#playlist").height($("#player").height()-30+30);
        	if(!find)$("#playlist").height($("#player").height()+30);; //closing
			*/
        	/*if(adminTogg) extraHeight = -300;
			else extraHeight = -30;*/

			if(find)
			{
				if($("#adminPanel").height() != 0)
				{
					extraHeight = $("#adminPanel").height()+30;
				}else
				{
					extraHeight = 10;
				}
				$("#playlist").height($("#player").height()-extraHeight); //opening
			}else if(!find)
			{
				if($("#adminPanel").height() != 0)
				{
					extraHeight = $("#adminPanel").height()-10;
				}else
				{
					extraHeight = -30;
				}
				$("#playlist").height($("#player").height()-extraHeight);; //closing
			}

        	myScroll.refresh();
        	setTimeout(function(){myScroll.refresh();}, 505);
    	}

    });
    $("body").keyup(function(event) {
    	if(find)
    	{
    		if(found != null)
    		{
	    		last = found[0];
	    		if(!(typeof last === "undefined"))
		    		$(".lresult").removeClass("fullbrightness");
	    	}
    		found = $("#wrapper").find(".lresult:contains('"+$("#findform-input").val()+"')");
    		if(found != "" && $("#findform-input").val() != "")
    		{
    			for(i = 0; i < found.length; i++)
    			{
	    			found[i].className = found[i].className + " fullbrightness";
	    			console.log(found[i].className.split(" ")[0]);
	    			bright.push(found[i].className.split(" ")[0]);
	    			//bright.push(found[i].className.split(" ")[0]);
    			}
    			myScroll.scrollToElement(found[0], 10, 0, -40);
    		}else
    		{
    			$(".lresult").removeClass("fullbrightness");
    			bright.length = 0;
    		}
    		//console.log($("#wrapper").find(".result:contains('"+$("#findform-input").val()+"')"));
    	}
    });
});