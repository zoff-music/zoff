var began = false;
var id

socket.on("id", function(id)
{
  if(!began)
  {
    socket.on(id, function(arr)
    {
        if(arr[0] == "volume")
        {
          $("#volume").slider("value", arr[1]);
          ytplayer.setVolume(arr[1]);
          localStorage.setItem("volume", arr[1]);
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

          socket.emit("list", chan.toLowerCase()+",unused");
        }
    });
  }
  began = true;
});
