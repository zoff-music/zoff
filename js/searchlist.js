$(document).ready(function()
{
	found = null;
	znum = 1;
	elems = [];
	bright = [];
	$.expr[":"].contains = $.expr.createPseudo(function(arg) {
    return function( elem ) {
	        return $(elem).text().toUpperCase().indexOf(arg.toUpperCase()) >= 0;
	    };
	});
	find = false;
	$("html").keydown(function(event) {
		if ((event.keyCode == 27 && find) || (event.ctrlKey && event.keyCode === 70)) 
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
    	var x = event.keyCode;
    	if(find)
    	{
    		if(x == 13)
    		{
    			if(found != "" && $("#findform-input").val() != "")
    			{
    				znum+=1;
    				if(znum >= elems.length) znum = 1;
    				document.getElementById("numfound").innerHTML = znum + " av " + bright.length;
	    			$("#numfound").css("margin-left", "-"+($("#numfound").width()+8));
	    			$("#numfound").css("padding-right", 4);
	    			$("#findform-input").css("padding", "0 "+($("#numfound").width()+8)+"px 0 5px");
	    			myScroll.scrollToElement(elems[znum-1], 10, 0, 0);
    			}
    		}else
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
	    			elems.length = 0;
	    			bright.length = 0;
	    			znum = 1;
	    			for(i = 0; i < found.length; i++)
	    			{
		    			found[i].className = found[i].className + " fullbrightness";
		    			bright.push(found[i].className.split(" ")[0]);
		    			elems.push(found[i]);
	    			}
	    			document.getElementById("numfound").innerHTML = znum + " av " + bright.length;
	    			$("#numfound").css("margin-left", "-"+($("#numfound").width()+8));
	    			$("#numfound").css("padding-right", 4);
	    			$("#findform-input").css("padding", "0 "+($("#numfound").width()+8)+"px 0 5px");
	    			myScroll.scrollToElement(found[0], 10, 0, 0);
	    		}else
	    		{
	    			$(".lresult").removeClass("fullbrightness");
	    			bright.length = 0;
	    			elems.length = 0;
	    			znum = 1;
	    		}
	    	}
    		//console.log($("#wrapper").find(".result:contains('"+$("#findform-input").val()+"')"));
    	}
    });
});