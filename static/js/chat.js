var Chat = {

  namechange: function(newName)
  {
    socket.emit("namechange", newName);
    Crypt.set_name(newName);
  },

  removename: function()
  {
    socket.emit("removename");
    Crypt.remove_name();
  },

  chat: function(data)
  {
    if(data.value.length > 150)
      return;
    if(data.value.startsWith("/name ")){
      Chat.namechange(data.value.substring(6));
    }else if(data.value.startsWith("/removename")){
      Chat.removename();
    }
    else if($(".chat-tab-li a.active").attr("href") == "#all_chat")
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

    
      //$("#chat-btn").css("color", "grey");

      if(!blink_interval_exists && inp.indexOf("changed name to") < 0 && !chat_active)
      {
        $("#favicon").attr("href", "static/images/highlogo.png");
        blink_interval_exists = true;
        unseen = true;
        chat_unseen = true;
        //blink_interval = setTimeout(Chat.chat_blink, 2000);
      }

      if(document.hidden)
      {
        $("#favicon").attr("href", "static/images/highlogo.png");
      }
      var color = Helper.intToARGB(Helper.hashCode(inp[0]));
      if(color.length < 6) {
        for(x = color.length; x < 6; x++){
          color = "0" + color;
        }
      }
      color = Helper.hexToRgb(color.substring(0,6));
      var color_temp = Helper.rgbToHsl([color.r, color.g, color.b], false);
      $("#chatall").append("<li title='"+inp[2]+"''><span style='color:"+color_temp+";'>"+inp[0]+"</span></li>");
      var in_text = document.createTextNode(inp[1]);
      $("#chatall li:last")[0].appendChild(in_text);
      document.getElementById("chatall").scrollTop = document.getElementById("chatall").scrollHeight;
    });
  },

  setup_chat_listener: function(channel)
  {
    socket.on("chat", function(data)
    {
      if(!blink_interval_exists && data.indexOf("changed name to") < 0 && !chat_active)
      {
        $("#favicon").attr("href", "static/images/highlogo.png");
        unseen = true;
        chat_unseen = true;
        //blink_interval = setTimeout(Chat.chat_blink, 1000);
      }

      var color = Helper.intToARGB(Helper.hashCode(data[0]));
      if(color.length < 6) {
        for(x = color.length; x < 6; x++){
          color = "0" + color;
        }
      }
      color = Helper.hexToRgb(color.substring(0,6));
      var color_temp = Helper.rgbToHsl([color.r, color.g, color.b], false);
      $("#chatchannel").append("<li><span style='color:"+color_temp+";'>"+data[0]+"</span></li>");
      var in_text = document.createTextNode(data[1]);
      $("#chatchannel li:last")[0].appendChild(in_text);
      document.getElementById("chatchannel").scrollTop = document.getElementById("chatchannel").scrollHeight;
    });
  }

}