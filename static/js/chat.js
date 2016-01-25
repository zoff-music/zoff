var Chat = {

  chat: function(data)
  {
    if(data.value.length > 150)
      return;
    if(data.value.startsWith("/name ")){
      socket.emit("namechange", data.value.substring(6));
    }
    else if($(".tab a.active").attr("href") == "#all_chat")
      socket.emit("all,chat", data.value);
    else
      socket.emit("chat", data.value);
    data.value = "";
    return;
  },

  allchat_listener: function()
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
          blink_interval = setInterval(Chat.chat_blink, 2000);
        }
      }else if(document.hidden)
      {
        $("#favicon").attr("href", "static/images/highlogo.png");
        unseen = true;
      }
      var color = Helper.intToARGB(Helper.hashCode(inp[0])).substring(0,6);
      $("#chatall").append("<li title='"+inp[2]+"'><span style='color:#"+color+";'>"+inp[0]+"</span></li>");
      var in_text = document.createTextNode(inp[1]);
      $("#chatall li:last")[0].appendChild(in_text);
      document.getElementById("chatall").scrollTop = document.getElementById("chatall").scrollHeight
    });
  },

  setup_chat_listener: function(channel)
  {
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
            blink_interval = setInterval(Chat.chat_blink, 2000);
          }
        }
      }
      var color = Helper.intToARGB(Helper.hashCode(data[0])).substring(0,6);
      $("#chatchannel").append("<li><span style='color:#"+color+";'>"+data[0]+"</span></li>");
      var in_text = document.createTextNode(data[1]);
      $("#chatchannel li:last")[0].appendChild(in_text);
      document.getElementById("chatchannel").scrollTop = document.getElementById("chatchannel").scrollHeight
    });
  },

  chat_blink: function()
  {
    $("#chat-btn i").css("opacity", 0.5);
    setTimeout(function(){$("#chat-btn i").css("opacity", 1);}, 1000);
  }

}