var Hostcontroller = {

    enabled: true,

    old_id: null,

    host_listener: function(id) {
        if(Hostcontroller.old_id === null) Hostcontroller.old_id = id;
        else {
            socket.removeAllListeners(id);
            began = false;
            Hostcontroller.old_id = id;
        }
        if(embed) {
            if(window.parentWindow && window.parentOrigin) {
                window.parentWindow.postMessage({type: "controller", id: id}, window.parentOrigin);
            }
        }
        var codeURL = window.location.protocol + "//remote."+window.location.hostname+"/"+id;
        $("#code-text").text(id);
        $("#code-qr").attr("src", "https://chart.googleapis.com/chart?chs=221x221&cht=qr&choe=UTF-8&chld=L|1&chl="+codeURL);
        $("#code-link").attr("href", codeURL);
        if(!began) {
            began = true;
            setup_host_listener(id);
        }
    },

    host_on_action: function(arr) {
        if(enabled){
            if(arr.type == "volume") {
                $("#volume").slider("value", arr.value);
                Player.player.setVolume(arr.value);
                localStorage.setItem("volume", arr.value);
                Playercontrols.choose_button(arr.value, false);
            } else if(arr.type == "channel") {
                socket.emit("change_channel");
                Admin.beginning = true;

                chan = arr.value.toLowerCase();
                $("#chan").html(Helper.upperFirst(chan));

                w_p = true;
                var add = "";
                if(private_channel) add = Crypt.getCookie("_uI") + "_";
                socket.emit("list", {version: parseInt(localStorage.getItem("VERSION")), channel: add + chan.toLowerCase(), pass: embed ? '' : Crypt.crypt_pass(Crypt.get_userpass(chan.toLowerCase()))});

                window.history.pushState("object or string", "Title", "/"+chan.toLowerCase());
            } else if(arr.type == "pause") {
                Player.pauseVideo();
            } else if(arr.type == "play") {
                Player.playVideo();
            } else if(arr.type == "skip") {
                List.skip();
            }
        }
    },

    change_enabled:function(val){
        enabled = val;
        $(".remote_switch_class").prop("checked", enabled);
    }
};
