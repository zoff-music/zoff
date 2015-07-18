var Hostcontroller = {

  host_listener: function() {
    
    var old_id;

    socket.on("id", function(id)
    {
      if(old_id === undefined) old_id = id;
      else
      {
        socket.removeAllListeners(id);
        began = false;
        old_id = id;
      }
      var codeURL = "http://"+window.location.hostname+"/remote/"+id;
      $("#code-text").text(id)
      $("#code-qr").attr("src", "https://chart.googleapis.com/chart?chs=221x221&cht=qr&choe=UTF-8&chld=L|1&chl="+codeURL);
      $("#code-link").attr("href", codeURL);
      if(!began)
      {
        began = true;
        socket.on(id, function(arr)
        {
            if(arr[0] == "volume")
            {
              $("#volume").slider("value", arr[1]);
              ytplayer.setVolume(arr[1]);
              localStorage.setItem("volume", arr[1]);
              Playercontrols.choose_button(arr[1], false);
            }else if(arr[0] == "channel")
            {
              socket.emit("change_channel");

              chan = arr[1].toLowerCase();
              $("#chan").html(chan.substring(0,1).toUpperCase()+chan.substring(1).toLowerCase());

              w_p = true;
              socket.emit("list", chan.toLowerCase());

              if(localStorage[chan.toLowerCase()])
              {
                //localStorage.removeItem(chan.toLowerCase());
                if(localStorage[chan.toLowerCase()].length != 64)
                  localStorage.removeItem(chan.toLowerCase());
                else
                  socket.emit("password", [localStorage[chan.toLowerCase()], chan.toLowerCase()]);
              }

              window.history.pushState("object or string", "Title", "/"+chan.toLowerCase());
            }else if(arr[0] == "pause")
              ytplayer.pauseVideo()
            else if(arr[0] == "play")
              ytplayer.playVideo();
            else if(arr[0] == "skip")
              List.skip();
        });
      }
    });
  }
}