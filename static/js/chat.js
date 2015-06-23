var blink_interval;
var blink_interval_exists = false;
var unseen = false;

function chat(data)
{
  if(data.value.length > 150)
    return;
  if($(".tab a.active").attr("href") == "#all_chat")
    socket.emit("all,chat", data.value);
	else
    socket.emit("chat", data.value);
  data.value = "";
  return;
}

setup_chat_listener(chan);
allchat_listener();

document.getElementById("chat-btn").addEventListener("click", function(){
    $("#text-chat-input").focus();
    //$("#chat-btn").css("color", "white");
    $("#chat-btn i").css("opacity", 1);
    clearInterval(blink_interval);
    blink_interval_exists = false;
    unseen = false;
    $("#favicon").attr("href", "static/images/favicon.png");
});

$(".chat-tab").click(function(){
    $("#text-chat-input").focus();
});

function allchat_listener()
{
  socket.on("chat.all", function(inp)
  {

    if($("#chat-bar").position()["left"] != 0)
    {
      //$("#chat-btn").css("color", "grey");
      if(!blink_interval_exists)
      {
        $("#favicon").attr("href", "static/images/highlogo.png");
        blink_interval_exists = true;
        unseen = true;
        blink_interval = setInterval(chat_blink, 2000);
      }
    }else if(document.hidden)
    {
      $("#favicon").attr("href", "static/images/highlogo.png");
      unseen = true;
    }
    var color = intToARGB(hashCode(inp[0])).substring(0,6);
  	$("#chatall").append("<li title='"+inp[2]+"'><span style='color:#"+color+";'>"+inp[0]+"</span></li>");
    var in_text = document.createTextNode(inp[1]);
    $("#chatall li:last")[0].appendChild(in_text);
    document.getElementById("chatall").scrollTop = document.getElementById("chatall").scrollHeight
  });
}

$(window).focus(function(){
  if(unseen)
  {
    $("#favicon").attr("href", "static/images/favicon.png");
    unseen = false;
  }
});

function setup_chat_listener(channel)
{
  document.getElementsByClassName("chat-tab")[0].innerHTML = channel;
  socket.on("chat", function(data)
  {
    if($("#chat-bar").position()["left"] != 0)
    {
      if(data[1].indexOf(":") >= 0){
        //$("#chat-btn").css("color", "grey");
        if(!blink_interval_exists)
        {
          $("#favicon").attr("href", "static/images/highlogo.png");
          blink_interval_exists = true;
          blink_interval = setInterval(chat_blink, 2000);
        }
      }
    }
    var color = intToARGB(hashCode(data[0])).substring(0,6);
  	$("#chatchannel").append("<li><span style='color:#"+color+";'>"+data[0]+"</span></li>");
    var in_text = document.createTextNode(data[1]);
    $("#chatchannel li:last")[0].appendChild(in_text);
    document.getElementById("chatchannel").scrollTop = document.getElementById("chatchannel").scrollHeight
  });
}

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
