var Hostcontroller = {

  enabled: true,

  old_id: null,

  host_listener: function(id) {

    if(Hostcontroller.old_id === null) Hostcontroller.old_id = id;
    else
    {
      socket.removeAllListeners(id);
      began = false;
      Hostcontroller.old_id = id;
    }
    var codeURL = "https://remote."+window.location.hostname+"/"+id;
    $("#code-text").text(id);
    $("#code-qr").attr("src", "https://chart.googleapis.com/chart?chs=221x221&cht=qr&choe=UTF-8&chld=L|1&chl="+codeURL);
    $("#code-link").attr("href", codeURL);
    if(!began)
    {
      began = true;
      setup_host_listener(id);
    }
  },

  host_on_action: function(arr)
  {
    if(enabled){
      if(arr[0] == "volume"){
        $("#volume").slider("value", arr[1]);
        Player.player.setVolume(arr[1]);
        localStorage.setItem("volume", arr[1]);
        Playercontrols.choose_button(arr[1], false);
      }else if(arr[0] == "channel"){
        socket.emit("change_channel");
        Admin.beginning = true;

        chan = arr[1].toLowerCase();
        $("#chan").html(Helper.upperFirst(chan));

        w_p = true;
        socket.emit("list", chan.toLowerCase());

        /*if(Crypt.get_pass(chan.toLowerCase()) !== undefined && Crypt.get_pass(chan.toLowerCase()) != ""){
          socket.emit("password", [Crypt.crypt_pass(Crypt.get_pass(chan.toLowerCase())), chan.toLowerCase()]);
        }*/

        window.history.pushState("object or string", "Title", "/"+chan.toLowerCase());
      }else if(arr[0] == "pause")
        Player.player.pauseVideo();
      else if(arr[0] == "play")
        Player.player.playVideo();
      else if(arr[0] == "skip")
        List.skip();
    }
  },

  change_enabled:function(val){
    enabled = val;
    document.getElementsByName("remote_switch")[0].checked = enabled;
  }
};
