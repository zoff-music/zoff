var Hostcontroller = {

  host_listener: function() {
    socket.on("id", function(id)
    {
      var codeURL = "//"+window.location.hostname+"/remote/"+id;
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

              socket.emit("list", chan.toLowerCase());

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