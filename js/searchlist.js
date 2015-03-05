$(document).ready(function()
{
	found = null;
	bright = "";
	$.expr[":"].contains = $.expr.createPseudo(function(arg) {
    return function( elem ) {
	        return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
	    };
	});
	find = false;
	$("body").keydown(function(event) {
		if ((event.keyCode == 13 && find)  || (event.keyCode == 27 && find) || (event.ctrlKey && event.keyCode === 70)) 
		{ 
			find = !find;
			if(find)
				$(".lresult").addClass("brightness");
			else
				$(".lresult").removeClass("brightness");
        	event.preventDefault();
        	$("#findform").toggleClass("display");
        	$("#adminPanel").toggleClass("brightness");
        	$("#findform-input").val("");
        	$("#findform-input").focus();
        	/*
        	if(find) $("#playlist").height($("#player").height()-30+30);
        	if(!find)$("#playlist").height($("#player").height()+30);; //closing
			*/
        	if(adminTogg) extraHeight = -300;
			else extraHeight = -30;

			if(find) $("#playlist").height($("#player").height()+extraHeight+30); //opening
			if(!find)$("#playlist").height($("#player").height()+extraHeight+60);; //closing

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
	    		{
		    		//last.style.backgroundColor = "none";
		    		$(".lresult").removeClass("fullbrightness");
		    		//last.className = last.className + " brightness";
		    	}
	    	}
    		found = $("#wrapper").find(".lresult:contains('"+$("#findform-input").val()+"')");
    		if(found != "" && $("#findform-input").val() != "")
    		{
    			//found[0].style.backgroundColor = "rgba(0,0,0,0.5)";
    			//found[0].setAttribute("style", "-webkit-filter:brightness(100%)");
    			found[0].className = found[0].className + " fullbrightness";
    			bright = found[0].className.split(" ")[0];
    			//found[0].style.backgroundColor = "red";
    			myScroll.scrollToElement(found[0], 10, 0, -30);
    		}else
    		{
    			$(".lresult").removeClass("fullbrightness");
    			bright = "";
    		}
    		//console.log($("#wrapper").find(".result:contains('"+$("#findform-input").val()+"')"));
    	}
    });
});