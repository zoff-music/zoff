var Hostcontroller = {
  enabled: true,

  old_id: null,

  host_listener: function(id) {
    if (client) return;
    Helper.log(["Host-listener triggered", "Host-listener id:" + id]);
    if (Hostcontroller.old_id === null) Hostcontroller.old_id = id;
    else {
      socket.removeAllListeners(id);
      began = false;
      Hostcontroller.old_id = id;
    }
    var codeURL =
      window.location.protocol + "//remote." + window.location.host + "/" + id;
    if (embed) {
      if (window.parentWindow && window.parentOrigin) {
        window.parentWindow.postMessage(
          { type: "controller", id: id },
          window.parentOrigin
        );
      }
    } else if (!embed) {
      if (window.location.pathname == "/") return;
      document.querySelector("#code-text").innerText = id;
      document
        .querySelector("#code-qr")
        .setAttribute(
          "src",
          "https://chart.googleapis.com/chart?chs=221x221&cht=qr&choe=UTF-8&chld=L|1&chl=" +
            codeURL
        );
      document.querySelector("#code-link").setAttribute("href", codeURL);
    }
    if (!began) {
      began = true;
      setup_host_listener(id);
    }
  },

  host_on_action: function(arr) {
    if (client) return;
    if (Hostcontroller.enabled) {
      if (arr.type == "volume") {
        try {
          Playercontrols.visualVolume(arr.value);
          Player.setVolume(arr.value);
          if (scUsingWidget) Player.soundcloud_player.setVolume(arr.value);
          else Player.soundcloud_player.setVolume(arr.value / 100);
          try {
            localStorage.setItem("volume", arr.value);
          } catch (e) {}
          Playercontrols.choose_button(arr.value, false);
        } catch (e) {}
      } else if (arr.type == "channel") {
        if (window.location.pathname == "/") return;
        socket.emit("change_channel");
        Admin.beginning = true;

        chan = arr.value.toLowerCase();
        Helper.setHtml("#chan", Helper.upperFirst(chan));
        var shareCodeUrl =
          window.location.protocol +
          "//client." +
          window.location.hostname +
          "/r/" +
          btoa(encodeURIComponent(chan.toLowerCase()));
        document
          .getElementById("share-join-qr")
          .setAttribute(
            "src",
            "https://chart.googleapis.com/chart?chs=221x221&cht=qr&choe=UTF-8&chld=L|1&chl=" +
              shareCodeUrl
          );
        Helper.setHtml(
          "#channel-name-join",
          "client." +
            window.location.hostname +
            "/" +
            encodeURIComponent(chan.toLowerCase())
        );
        w_p = true;
        var add = "";
        //if(private_channel) add = Crypt.getCookie("_uI") + "_";
        socket.emit("list", {
          version: parseInt(_VERSION),
          channel: add + chan.toLowerCase()
        });

        window.history.pushState(
          "object or string",
          "Title",
          "/" + chan.toLowerCase()
        );
      } else if (arr.type == "pause") {
        Player.pauseVideo();
      } else if (arr.type == "play") {
        Player.playVideo();
      } else if (arr.type == "skip") {
        List.skip();
      }
    }
  },

  change_enabled: function(val) {
    if (client) return;
    Hostcontroller.enabled = val;
    try {
      document.querySelector(".remote_switch_class").checked =
        Hostcontroller.enabled;
    } catch (e) {}
  }
};
