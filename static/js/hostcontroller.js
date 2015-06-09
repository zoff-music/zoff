var began = false;
var id

socket.on("id", function(id)
{
  console.log("Unique remote control ID: " + id);
  var codeURL = "http://"+window.location.hostname+"/remote/"+id;
  $("#code-text").text(id.toUpperCase())
  $("#code-qr").attr("src", "https://chart.googleapis.com/chart?chs=221x221&cht=qr&choe=UTF-8&chld=L|1&chl="+codeURL);
  $("#code-link").attr("href", codeURL);
    socket.on(id, function(arr)
    {
        console.log(arr);
        if(arr[0] == "volume")
        {
          $("#volume").slider("value", arr[1]);
          ytplayer.setVolume(arr[1]);
          localStorage.setItem("volume", arr[1]);
          choose_button(arr[1], false);
        }else if(arr[0] == "channel")
        {
          socket.emit("change_channel");
          socket.removeAllListeners(chan.toLowerCase());
          socket.removeAllListeners("chat,"+chan.toLowerCase());
          socket.removeAllListeners(chan.toLowerCase()+",np");

          chan = arr[1].toLowerCase();
          $("#chan").html(chan.substring(0,1).toUpperCase()+chan.substring(1).toLowerCase());
          socket.on(chan.toLowerCase(), function(msg){
          	populate_list(msg, false);
          });

          setup_youtube_listener(chan);
          setup_chat_listener(chan);
          display_logged_out();

          socket.emit("list", chan.toLowerCase()+",unused");

          window.history.pushState("object or string", "Title", "/"+chan.toLowerCase());
        }else if(arr[0] == "pause")
          ytplayer.pauseVideo()
        else if(arr[0] == "play")
          ytplayer.playVideo();
        else if(arr[0] == "skip")
          skip();
    });
  }
});
