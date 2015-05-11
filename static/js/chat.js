var blink_interval;
var blink_interval_exists = false;

function chat(data)
{
  if(data.value.length > 150)
    return;
	socket.emit("chat", data.value);
  data.value = "";
  return;
}

document.getElementById("chat-btn").addEventListener("click", function(){
    console.log("clicked");
    $("#text-chat-input").focus();
    //$("#chat-btn").css("color", "white");
    $("#chat-btn i").css("opacity", 1);
    clearInterval(blink_interval);
    blink_interval_exists = false;
    $("#favicon").attr("href", "static/images/favicon.png");
});

socket.on("chat,"+chan.toLowerCase(), function(data)
{
  if($("#chat-bar").position()["left"] != 0)
  {
    //$("#chat-btn").css("color", "grey");
    if(!blink_interval_exists)
    {
      $("#favicon").attr("href", "static/images/highlogo.png");
      blink_interval_exists = true;
      blink_interval = setInterval(chat_blink, 2000);
    }
  }
  var color = intToARGB(hashCode(data.substring(0,8))).substring(0,6);
	$("#chat").append("<li><span style='color:"+color+";'>"+data.substring(0,8)+"</span></li>");
  var in_text = document.createTextNode(data.substring(8));
  $("#chat li:last")[0].appendChild(in_text);
  document.getElementById("chat").scrollTop = document.getElementById("chat").scrollHeight
});

function chat_blink()
{
  $("#chat-btn i").css("opacity", 0.5);
  setTimeout(function(){$("#chat-btn i").css("opacity", 1);}, 1000);
}

function hashCode(str) { // java String#hashCode
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
       hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
}

function intToARGB(i){
    return ((i>>24)&0xFF).toString(16) +
           ((i>>16)&0xFF).toString(16) +
           ((i>>8)&0xFF).toString(16) +
           (i&0xFF).toString(16);
}
