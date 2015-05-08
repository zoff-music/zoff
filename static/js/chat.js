
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
});

socket.on("chat,"+chan.toLowerCase(), function(data)
{
  var color = intToARGB(hashCode(data.substring(0,8))).substring(0,6);
	$("#chat").append("<li><span style='color:"+color+";'>"+data.substring(0,8)+"</span>"+data.substring(8)+"</li>");
  document.getElementById("chat").scrollTop = document.getElementById("chat").scrollHeight
});

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
