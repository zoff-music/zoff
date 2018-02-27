
function removeAllListeners() {
    Helper.log(["Removing all listeners"]);
    socket.removeEventListener("chat.all");
    socket.removeEventListener("chat");
    socket.removeEventListener("conf");
    socket.removeEventListener("pw");
    socket.removeEventListener("toast");
    socket.removeEventListener("id");
    socket.removeEventListener("channel");
    socket.removeEventListener("np");
    socket.removeEventListener("get_list");
    //socket.removeEventListener("self_ping");
    socket.removeEventListener("viewers");
    socket.removeEventListener("auth_required");
    socket.removeEventListener("auth_accepted");
    socket.removeEventListener("suggested");
    socket.removeEventListener("color");
    socket.removeEventListener("chat_history");
    //socket.removeEventListener("name");
    socket.removeEventListener(id);
}

function hide_native(way) {
    if(way == 1){
        if(!$('.castButton').hasClass('castButton-white-active')) {
            $('.castButton').addClass('castButton-white-active');
        }
        if(!Helper.mobilecheck()) {
            $('.castButton').tooltip('remove');
            $('.castButton').tooltip({
                delay: 5,
                position: "top",
                tooltip: "Stop casting"
            });
        }
        $("#duration").toggleClass("hide");
        $("#fullscreen").toggleClass("hide");
        try{
            Player.player.stopVideo();
        } catch(e){}
        Player.stopInterval = true;
        if(Helper.mobilecheck()){
            if($("#pause").hasClass("hide")){
                $("#play").toggleClass("hide");
                $("#pause").toggleClass("hide");
            } else if($("#play").hasClass("hide")){
                $("#play").toggleClass("hide");
                $("#pause").toggleClass("hide");
            }
        } else {
            $("#volume").slider("value", 100);
        }
        if(Helper.mobilecheck()) {
            if(!$("#player_overlay").hasClass("hide")) {
                $("#player_overlay").addClass("hide")
            }
            $("#player_overlay").css("display", "none");
            $("#playing_on").css("display", "none");
        } else {
            $("#player_overlay").removeClass("hide");
            $("#player_overlay").css("display", "block");
            $("#player_overlay").css("background", "url(https://img.ytimg.com/vi/" + video_id + "/hqdefault.jpg)");
            $("#player_overlay").css("background-position", "center");
            $("#player_overlay").css("background-size", "100%");
            $("#player_overlay").css("background-color", "black");
            $("#player_overlay").css("background-repeat", "no-repeat");
            $("#playing_on").css("display", "flex");
            $("#chromecast_text").html("Playing on<br>" + castSession.La.friendlyName);
        }
        Player.player.setVolume(100);

        $("#player_overlay_text").toggleClass("hide");
    } else if(way == 0){
        if(!Helper.mobilecheck()) {
            $('.castButton').tooltip('remove');
            $('.castButton').tooltip({
                delay: 5,
                position: "top",
                tooltip: "Cast Zoff to TV"
            });
        }
        $('.castButton').removeClass('castButton-white-active');

        $("#duration").toggleClass("hide");
        $("#fullscreen").toggleClass("hide");
        Player.player.playVideo();
        Player.stopInterval = false;
        duration = Player.player.getDuration();
        Player.durationSetter();
        if(!Helper.mobilecheck()){
            Player.player.setVolume(Crypt.get_volume());
            $("#volume").slider("value", Crypt.get_volume());
        }
        $("#player_overlay").addClass("hide");
        $("#player_overlay_text").toggleClass("hide");
        $("#chromecast_text").html("");
        $("#playing_on").css("display", "none");
        if(!offline){
            socket.emit('pos', {channel: chan.toLowerCase(), pass: embed ? '' : Crypt.crypt_pass(Crypt.get_userpass(chan.toLowerCase()))});
        } else {
            Player.loadVideoById(video_id);
        }
    }
}

function chromecastListener(evt, data) {
    console.log(evt, data);
    var json_parsed = JSON.parse(data);
    try {
        json_parsed = JSON.parse(json_parsed);
    } catch(e) {
        console.log("error parsing again");
    }
    console.log(json_parsed.type, typeof(json_parsed));
    //console.log(JSON.parse(json_parsed), json_parsed.type, json_parsed.type == 1, json_parsed.type == "1");
    switch(json_parsed.type){
        case -1:
            if(offline){
                Player.playNext();
            } else {
                socket.emit("end", {id: json_parsed.videoId, channel: chan.toLowerCase(), pass: embed ? '' : Crypt.crypt_pass(Crypt.get_userpass(chan.toLowerCase()))});
            }
            break;
        case 0:
            if(offline){
                Player.playNext();
            } else {
                socket.emit("skip", {error: json_parsed.data_code, id: json_parsed.videoId, pass: adminpass == "" ? "" : Crypt.crypt_pass(adminpass), channel: chan.toLowerCase(), userpass: embed ? '' : Crypt.crypt_pass(Crypt.get_userpass(chan.toLowerCase()))});
            }
            break;
        case 1:
            if(!$("#play").hasClass("hide")) {
                $("#play").addClass("hide");
            }
            $("#pause").removeClass("hide");
            break;
        case 2:
            if(!$("#pause").hasClass("hide")) {
                $("#pause").addClass("hide");
            }
            $("#play").removeClass("hide");
            break;
    }
}

function setup_auth_listener() {
    socket.on('auth_required', function() {
        user_auth_started = true;
        $("#player_overlay").removeClass("hide");
        $("#player_overlay").css("display", "block");
        $("#user_password").modal("open");
        Crypt.remove_userpass(chan.toLowerCase());
        before_toast();
        Materialize.toast("That is not the correct password, try again..", 4000);
    });

    socket.on('auth_accepted', function(msg) {
        if(msg.hasOwnProperty("value") && msg.value) {
            if(temp_user_pass != "") {
                userpass = temp_user_pass;
                Crypt.set_userpass(chan.toLowerCase(), userpass);
            }
        }
    });
}

function setup_no_connection_listener(){
    socket.on('connect_failed', function(){
        Helper.log(['Connection Failed']);
        if(!connect_error){
            connect_error = true;
            Materialize.toast("Error connecting to server, please wait..", 100000000, "red lighten connect_error");
        }
    });

    socket.on("connect_error", function(){
        Helper.log(["Connection Failed."]);
        if(!connect_error){
            connect_error = true;
            Materialize.toast("Error connecting to server, please wait..", 100000000, "red lighten connect_error");
        }
    });
}

function setup_youtube_listener(){
    socket.on("np", Player.youtube_listener);
}

function get_list_listener(){
    socket.on("get_list", function(){
        var add = "";
        if(private_channel) add = Crypt.getCookie("_uI") + "_";
        socket.emit("list", { offline: offline, version: parseInt(localStorage.getItem("VERSION")), channel: add + chan.toLowerCase(), pass: embed ? '' : Crypt.crypt_pass(Crypt.get_userpass(chan.toLowerCase()))});
    });
}

function setup_suggested_listener(){
    socket.on("suggested", function(params){
        var single = true;
        if(params.id === undefined)
        single = false;
        Suggestions.catchUserSuggests(params, single);
    });
}

function setup_viewers_listener(){
    socket.on("viewers", function(view){
        viewers = view;
        var outPutWord    = "<i class='material-icons'>visibility</i>"//v > 1 ? "viewers" : "viewer";

        $("#viewers").html(outPutWord + " " + view);

        if(song_title !== undefined)
        Player.getTitle(song_title, viewers);
    });
}

function setup_admin_listener(){
    socket.on("toast", Admin.toast);
    socket.on("pw", Admin.pw);
    socket.on("conf", Admin.conf);
}

function setup_chat_listener(){
    socket.on("chat_history", function(msg) {
        var data = msg.data;
        for(var i = 0; i < data.length; i++) {
            if(msg.all) {
                Chat.allchat(data[i], data[i].createdAt, true);
                document.getElementById("chatall").scrollTop = document.getElementById("chatall").scrollHeight;
            } else {
                Chat.channelchat(data[i], data[i].createdAt, true);
                document.getElementById("chatchannel").scrollTop = document.getElementById("chatchannel").scrollHeight;
            }
        }
    });
    socket.on("chat.all", Chat.allchat);
    socket.on("chat", Chat.channelchat);
}

function setup_list_listener(){
    socket.on("channel", List.channel_function);
    socket.on("color", Player.setBGimage);
}

function setup_playlist_listener(){
    Helper.log(["Setting up playlist_listener"]);
    socket.on('playlists', Frontpage.frontpage_function);
}

function setup_host_initialization(){
    Helper.log(["Setting up host initialization listener"]);
    socket.on("id", Hostcontroller.host_listener);
}

function setup_host_listener(id){
    Helper.log(["Setting up host action listener"]);
    socket.on(id, Hostcontroller.host_on_action);
}

function enable_debug(){
    localStorage.debug = true;
}

function disable_debug(){
    localStorage.debug = false;
}

function embed_code(autoplay, width, height, color, embed_code){
    return '<iframe src="https://zoff.me/_embed#' + chan.toLowerCase() + '&' + color + autoplay + embed_videoonly + '" width="' + width + 'px" height="' + height + 'px"></iframe>';
}

function change_offline(enabled, already_offline){
    Crypt.set_offline(enabled);
    offline = enabled;
    ga('send', 'event', "button-click", "offline", "", offline ? 1 : 0);
    socket.emit("offline", {status: enabled, channel: chan != undefined ? chan.toLowerCase() : ""});
    if(!Helper.mobilecheck()) {
        $("#offline-mode").tooltip('remove');
    }
    if(enabled){
        if(list_html){
            list_html = $("<div>" + list_html + "</div>");
            //list_html.find(".list-remove").removeClass("hide");
            list_html = list_html.html();
        }
        //$(".list-remove").removeClass("hide");
        $("#viewers").addClass("hide");
        $(".margin-playbar").removeClass("margin-playbar");
        $(".prev.playbar").addClass("margin-playbar");
        $(".prev.playbar").removeClass("hide");
        $("#offline-mode").removeClass("waves-cyan");
        $("#offline-mode").addClass("cyan");
        if(!Helper.mobilecheck()) {
            $("#offline-mode").tooltip({
                delay: 5,
                position: "bottom",
                tooltip: "Disable local mode"
            });
        }

        if(window.location.pathname != "/"){
            $("#controls").on("mouseenter", function(e){
                if($("#seekToDuration").hasClass("hide")){
                    $("#seekToDuration").removeClass("hide");
                }
            });

            $("#controls").on("mouseleave", function(e){
                dragging = false;
                if(!$("#seekToDuration").hasClass("hide")){
                    $("#seekToDuration").addClass("hide");
                }
            });

            $("#controls").on("mousedown", function(e) {
                var acceptable = ["bar", "controls", "duration"];
                if(acceptable.indexOf($(e.target).attr("id")) >= 0) {
                    dragging = true;
                }
            });
            $("#controls").on("mouseup", function(e) {
                dragging = false;
            });
            $("#controls").on("mousemove", Channel.seekToMove);
            $("#controls").on("click", Channel.seekToClick);
            $("#main_components").append("<div id='seekToDuration' class='hide'>00:00/01:00</div>");
            if(!Helper.mobilecheck()) $("#seekToDuration").css("top", $("#controls").position().top - 55);
            else if(Helper.mobilecheck()) $("#seekToDuration").css("top", $("#controls").position().top - 20);
            if(!$("#controls").hasClass("ewresize")) $("#controls").addClass("ewresize");
        } else {
            $("#controls").off("mouseenter");
            $("#controls").off("mouseleave");
            $("#controls").off("mousemove");
            $("#controls").off("click");
        }
        if(full_playlist != undefined && !already_offline){
            for(var x = 0; x < full_playlist.length; x++){
                full_playlist[x].votes = 0;
            }
            List.sortList();
            List.populate_list(full_playlist);
        }
    } else {
        if(list_html){
            list_html = $("<div>" + list_html + "</div>");
            list_html = list_html.html();
        }
        $(".margin-playbar").removeClass("margin-playbar");
        $("#playpause").addClass("margin-playbar");
        $("#viewers").removeClass("hide");
        $(".prev.playbar").addClass("hide");
        $("#offline-mode").addClass("waves-cyan");
        $("#offline-mode").removeClass("cyan");
        if(!Helper.mobilecheck()) {
            $("#offline-mode").tooltip({
                delay: 5,
                position: "bottom",
                tooltip: "Enable local mode"
            });
        }

        $("#controls").off("mouseleave");
        $("#controls").off("mouseenter");
        $("#controls").off("mousedown");
        $("#controls").off("mouseup");
        $("#controls").off("mousemove", Channel.seekToMove);
        $("#controls").off("click", Channel.seekToClick);
        $("#seekToDuration").remove();
        if(window.location.pathname != "/"){
            socket.emit("pos", {channel: chan.toLowerCase(), pass: embed ? '' : Crypt.crypt_pass(Crypt.get_userpass(chan.toLowerCase()))});
            var add = "";
            if(private_channel) add = Crypt.getCookie("_uI") + "_";
            socket.emit("list", {version: parseInt(localStorage.getItem("VERSION")), channel: add + chan.toLowerCase(), pass: embed ? '' : Crypt.crypt_pass(Crypt.get_userpass(chan.toLowerCase()))});
            if($("#controls").hasClass("ewresize")) $("#controls").removeClass("ewresize");
        }
    }
}

function before_toast(){
    if($('.toast').length > 0) {
        var toastElement = $('.toast').first()[0];
        var toastInstance = toastElement.M_Toast;
        toastInstance.remove();
    }
    //Materialize.Toast.removeAll();
}

function scrollChat() {
    var current = $(".chat-tab.active").attr("href");
    if(current == "#channelchat") {
        $('#chatchannel').scrollTop($('#chatchannel')[0].scrollHeight);
    } else if(current == "#all_chat") {
        $('#chatall').scrollTop($('#chatall')[0].scrollHeight);
    }
}

function searchTimeout(event) {
    search_input = $(".search_input").val();

    code = event.keyCode || event.which;

    if (code != 40 && code != 38 && code != 13 && code != 39 && code != 37 && code != 17 && code != 16 && code != 225 && code != 18 && code != 27) {
        clearTimeout(timeout_search);
        if(search_input.length < 3){
            $("#results").html("");
            if(search_input.length == 0) {
                $("body").attr("style", "overflow-y: auto");
            }
        }
        if(code == 13){
            Search.search(search_input);
        }else{
            timeout_search = setTimeout(function(){
                Search.search(search_input);
            }, 1000);
        }
    }
}
