
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

function getColor(id) {
    Helper.ajax({
        type: "POST",
        url: "/api/color",
        async: true,
        data: {
            id: id
        },
        success: function(c) {
            c = JSON.parse(c);
            if(typeof(c) == "object") {
                Player.setBGimage({color:c, only:true});
            }
        },
    });
}

function hide_native(way) {
    if(way == 1){
        if(!$('.castButton').hasClass('castButton-white-active')) {
            $('.castButton').addClass('castButton-white-active');
        }
        if(!Helper.mobilecheck()) {
            if(M.Tooltip.getInstance(document.getElementsByClassName("castButton")[0])) {
                Helper.tooltip('.castButton', 'destroy');
            }
            Helper.tooltip('.castButton', {
                delay: 5,
                position: "top",
                html: "Stop casting"
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
            Playercontrols.visualVolume(100);
        }
        if(Helper.mobilecheck()) {
            Helper.addClass("#player_overlay", "hide")
            Helper.css("#player_overlay", "display", "none");
            Helper.css("#playing_on", "display", "none");
        } else {
            Helper.removeClass("#player_overlay", "hide");
            Helper.css("#player_overlay", "display", "block");
            Helper.css("#player_overlay", "background", "url(https://img.ytimg.com/vi/" + video_id + "/hqdefault.jpg)");
            Helper.css("#player_overlay", "background-position", "center");
            Helper.css("#player_overlay", "background-size", "100%");
            Helper.css("#player_overlay", "background-color", "black");
            Helper.css("#player_overlay", "background-repeat", "no-repeat");
            Helper.css("#playing_on", "display", "flex");
            Helper.setHtml("#chromecast_text", "Playing on<br>" + castSession.La.friendlyName);
        }
        Player.player.setVolume(100);

        $("#player_overlay_text").toggleClass("hide");
    } else if(way == 0){
        if(!Helper.mobilecheck()) {
            if(M.Tooltip.getInstance(document.getElementsByClassName("castButton")[0])) {
                Helper.tooltip('.castButton', 'destroy');
            }
            Helper.tooltip('.castButton', {
                delay: 5,
                position: "top",
                html: "Cast Zoff to TV"
            });
        }
        Helper.removeClass('.castButton', 'castButton-white-active');

        $("#duration").toggleClass("hide");
        $("#fullscreen").toggleClass("hide");
        Player.player.playVideo();
        Player.stopInterval = false;
        duration = Player.player.getDuration();
        Player.durationSetter();
        if(!Helper.mobilecheck()){
            Player.player.setVolume(Crypt.get_volume());
            Playercontrols.visualVolume(Crypt.get_volume());
        }
        Helper.addClass("#player_overlay", "hide");
        $("#player_overlay_text").toggleClass("hide");
        Helper.setHtml("#chromecast_text", "");
        Helper.css("#playing_on", "display", "none");
        if(!offline){
            socket.emit('pos', {channel: chan.toLowerCase()});
        } else {
            Player.loadVideoById(video_id);
        }
    }
}

function chromecastListener(evt, data) {
    var json_parsed = JSON.parse(data);
    switch(json_parsed.type){
        case -1:
            if(offline){
                Player.playNext();
            } else {
                socket.emit("end", {id: json_parsed.videoId, channel: chan.toLowerCase()});
            }
            break;
        case 0:
            if(offline){
                Player.playNext();
            } else {
                emit("skip", {error: json_parsed.data_code, id: json_parsed.videoId, channel: chan.toLowerCase()});
            }
            break;
        case 1:
            Helper.addClass("#play", "hide");
            Helper.removeClass("#pause", "hide");
            break;
        case 2:
            Helper.addClass("#pause", "hide");
            Helper.removeClass("#play", "hide");
            break;
    }
}

function start_auth() {
    if(!user_auth_started) {
        user_auth_started = true;
        Helper.removeClass("#player_overlay", "hide");
        Helper.css("#player_overlay", "display", "block");
        M.Modal.getInstance(document.getElementById("user_password")).open();
        $("#user-pass-input").focus();
        //Crypt.remove_userpass(chan.toLowerCase());
        before_toast();
        M.toast({html: "That is not the correct password, try again..", displayLength: 4000});
    }
}

function emit_list() {
    var add = "";
    if(private_channel) add = Crypt.getCookie("_uI") + "_";
    /*var p = Crypt.crypt_pass(Crypt.get_userpass(chan.toLowerCase()), true);
    if(p == undefined) p = "";*/
    if(socket.id) {
        socket.emit("list", {version: parseInt(localStorage.getItem("VERSION")), channel: add + chan.toLowerCase()});
    } else {
        setTimeout(function(){
            emit_list();
        }, 50);
    }
}

function get_list_ajax() {
    //var c = Crypt.get_userpass(chan.toLowerCase());
    Helper.ajax({
        type: "POST",
        data: {
            userpass: "",
            token: zoff_api_token,
        },
        url: "/api/list/" + chan.toLowerCase(),
        success: function(response) {
            response = JSON.parse(response);
            if(response.results.length > 0) {
                if(response.status == 403) {
                    start_auth();
                }
                if(client) {
                    Helper.removeElement("#channel-load");
                }
                List.populate_list(response.results);
            }
        },
        error: function(response, xmlhttp) {
            response = JSON.parse(response);
            if(response.status == 403) {
                start_auth();
            } else if(response.status == 429) {
                setTimeout(function() {
                    get_list_ajax();
                }, xmlhttp.getResponseHeader("Retry-After") * 1000)
            }
            if(client) {
                Helper.removeElement("#channel-load");
            }
            //List.populate_list(response.responseJSON.results);
        }
    });
}

function contextListener(that, e) {
    var parent = $(that).parent();
    var suggested = false;
    if(parent.attr("id").indexOf("suggested-") > -1) suggested = true;
    document.getElementsByClassName("context-menu-root")[0].setAttribute("data-suggested", suggested);
    document.getElementsByClassName("context-menu-root")[0].setAttribute("data-id", parent.attr("id").replace("suggested-", ""));
    Helper.removeClass("#context-menu-overlay", "hide");
    var left = e.pageX - $(".context-menu-root").width() / 2;
    var top = e.pageY;
    if(left + 200 > $(window).width()) {
        left = $(window).width() - 200 - 15;
    } else if (left < 0) {
        left = 11;
    }
    if(top + 96 > $(window).height()) {
        top = $(window).height() - 96 - 15;
    } else if(top < 0) {
        top = 15;
    }
    Helper.css(".context-menu-root", "left", left + "px");
    Helper.css(".context-menu-root", "top", top + "px");
    Helper.removeClass(".context-menu-root","hide");
    if(!Helper.mobilecheck()) {
        mouseContext(left, top);
    }
}

function mouseContext(left, top) {
    $(document).off("mousemove");
    $(document).mousemove(function( event ) {
       if(event.pageX < left - 60 || event.pageX > left + $(".context-menu-root").width() + 60 ||
          event.pageY < top - 60 || event.pageY > top + $(".context-menu-root").height() + 60) {
           Helper.addClass(".context-menu-root", "hide");
           Helper.addClass("#context-menu-overlay", "hide");
           $(document).off("mousemove");
       }
    });
}

function get_np_ajax() {
    /*var c = Crypt.get_userpass(chan.toLowerCase());
    if(c == undefined) c = "";*/
    Helper.ajax({
        type: "POST",
        data: {
            userpass: "",
            fetch_song: true,
            token: zoff_api_token
        },
        url: "/api/list/" + chan.toLowerCase() + "/__np__",
        success: function(response) {
            response = JSON.parse(response);
            Player.getTitle(response.results[0].title, 1);
        },
        error: function(response, xmlhttp) {
            response = JSON.parse(response);
            if(response.status == 403) {
                start_auth();
            } else if(response.status == 429) {
                setTimeout(function() {
                    get_np_ajax();
                }, xmlhttp.getResponseHeader("Retry-After") * 1000)
            }
        }
    })
}

function del_ajax(id) {
    /*var a = Crypt.get_pass(chan.toLowerCase());
    var u = Crypt.get_userpass(chan.toLowerCase());
    if(a == undefined) a = "";
    if(u == undefined) u = "";*/
    Helper.ajax({
        type: "DELETE",
        data: {
            adminpass: "",
            userpass: "",
            token: zoff_api_token
        },
        url: "/api/list/" + chan.toLowerCase() + "/" + id,
        success: function(response) {
            toast("deletesong");
            get_list_ajax();
        },
        error: function(response, xmlhttp) {
            response = JSON.parse(response);
            if(response.status == 403) {
                toast("listhaspass");
            } else if(response.status == 429) {
                setTimeout(function() {
                    del_ajax(id);
                }, xmlhttp.getResponseHeader("Retry-After") * 1000);
            }
        }
    })
}

function add_ajax(id, title, duration, playlist, num, full_num, start, end) {
    /*var a = Crypt.get_pass(chan.toLowerCase());
    var u = Crypt.get_userpass(chan.toLowerCase());
    if(a == undefined) a = "";
    if(u == undefined) u = "";*/
    Helper.ajax({
        type: "POST",
        data: {
            adminpass: "",
            userpass: "",
            title: title,
            duration: duration,
            end_time: end,
            start_time: start,
            token: zoff_api_token
        },
        url: "/api/list/" + chan.toLowerCase() + "/" + id,
        success: function(response) {
            toast("addedsong");
            get_list_ajax();
        },
        error: function(response, xmlhttp) {
            response = JSON.parse(response);
            if(response.status == 403) {
                toast("listhaspass");
            } else if(response.status == 409) {
                vote_ajax(id);
            } else if(response.status == 429) {
                setTimeout(function() {
                    add_ajax(id, title, duration, playlist, num, full_num, start, end);
                }, xmlhttp.getResponseHeader("Retry-After") * 1000);
            }
        }
    });
}

function vote_ajax(id) {
    /*var a = Crypt.get_pass(chan.toLowerCase());
    var u = Crypt.get_userpass(chan.toLowerCase());
    if(a == undefined) a = "";
    if(u == undefined) u = "";*/
    Helper.ajax({
        type: "PUT",
        data: {
            adminpass: "",
            userpass: "",
            token: zoff_api_token
        },
        url: "/api/list/" + chan.toLowerCase() + "/" + id,
        success: function(response) {
            toast("voted");
            get_list_ajax();
        },
        error: function(response, xmlhttp) {
            response = JSON.parse(response);
            if(response.status == 403) {
                toast("listhaspass");
            } else if(response.status == 429) {
                setTimeout(function() {
                    vote_ajax(id);
                }, xmlhttp.getResponseHeader("Retry-After") * 1000);
            }
        }
    })
}

function setup_auth_listener() {
    socket.on('auth_required', function() {
        start_auth();
    });

    socket.on('auth_accepted', function(msg) {
        if(msg.hasOwnProperty("value") && msg.value) {
            if(temp_user_pass != "") {
                userpass = temp_user_pass;
                //Crypt.set_userpass(chan.toLowerCase(), userpass);
            }
        }
    });
}

function setup_no_connection_listener(){
    socket.on('connect_failed', function(){
        Helper.log(['Connection Failed']);
        if(!connect_error){
            connect_error = true;
            M.toast({html: "Error connecting to server, please wait..", displayLength: 100000000, classes: "red lighten connect_error"});
        }
    });

    socket.on("connect_error", function(){
        Helper.log(["Connection Failed."]);
        if(!connect_error){
            connect_error = true;
            M.toast({html: "Error connecting to server, please wait..", displayLength: 100000000, classes: "red lighten connect_error"});
        }
    });
}

function setup_youtube_listener(){
    socket.on("np", Player.youtube_listener);
}

function get_list_listener(){
    socket.on("get_list", function(){
        var add = "";
        socket_connected = true;
        //if(private_channel) add = Crypt.getCookie("_uI") + "_";
        /*var p = Crypt.crypt_pass(Crypt.get_userpass(chan.toLowerCase()), true);
        if(p == undefined) p = "";*/
        socket.emit("list", { offline: offline, version: parseInt(localStorage.getItem("VERSION")), channel: add + chan.toLowerCase()});
    });
    socket.on("id_chromecast", function(msg) {
        chromecast_specs_sent = true;
        castSession.sendMessage("urn:x-cast:zoff.me", {type: "mobilespecs", guid: msg, socketid: socket.id})
    })
}

function setup_suggested_listener(){
    if(client) return;
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
    socket.on("toast", toast);
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
    if(!offline) {
        socket.on("color", Player.setBGimage);
    }
    socket.on("channel", List.channel_function);
}

function setup_playlist_listener(){
    Helper.log(["Setting up playlist_listener"]);
    socket.on('playlists', Frontpage.frontpage_function);
}

function setup_host_initialization(){
    if(!client) {
        Helper.log(["Setting up host initialization listener"]);
        socket.on("id", Hostcontroller.host_listener);
    }
}

function setup_host_listener(id){
    if(!client) {
        Helper.log(["Setting up host action listener"]);
        socket.on(id, Hostcontroller.host_on_action);
    }
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
    if(client) {
        offline = false;
        return;
    }
    Crypt.set_offline(enabled);
    offline = enabled;
    ga('send', 'event', "button-click", "offline", "", offline ? 1 : 0);
    socket.emit("offline", {status: enabled, channel: chan != undefined ? chan.toLowerCase() : ""});
    if(!Helper.mobilecheck()) {
        if(document.querySelectorAll("#offline-mode").length == 1 && M.Tooltip.getInstance(document.getElementById("offline-mode"))) {
            Helper.tooltip("#offline-mode", 'destroy');
        }
    }
    if(enabled){
        if(list_html){
            list_html = $("<div>" + list_html + "</div>");
            //list_html.find(".list-remove").removeClass("hide");
            list_html = list_html.html();
        }
        //$(".list-remove").removeClass("hide");
        Helper.addClass("#viewers", "hide");
        Helper.removeClass(".margin-playbar", "margin-playbar");
        Helper.addClass(".prev.playbar", "margin-playbar");
        Helper.removeClass(".prev.playbar", "hide");
        Helper.removeClass("#offline-mode", "waves-cyan");
        Helper.addClass("#offline-mode", "cyan");
        if(!Helper.mobilecheck()) {
            Helper.tooltip("#offline-mode", {
                delay: 5,
                position: "bottom",
                html: "Disable local mode"
            });
        }

        if(window.location.pathname != "/"){
            socket.removeEventListener("color");
            $("#controls").on("mouseenter", function(e){
                Helper.removeClass("#seekToDuration", "hide");
            });

            $("#controls").on("mouseleave", function(e){
                dragging = false;
                Helper.addClass("#seekToDuration", "hide");
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
            Helper.addClass("#controls", "ewresize");
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
        Helper.removeClass(".margin-playbar", "margin-playbar");
        Helper.addClass("#playpause", "margin-playbar");
        Helper.removeClass("#viewers", "hide");
        Helper.addClass(".prev.playbar", "hide");
        Helper.addClass("#offline-mode", "waves-cyan");
        Helper.removeClass("#offline-mode", "cyan");
        if(!Helper.mobilecheck()) {
            Helper.tooltip("#offline-mode", {
                delay: 5,
                position: "bottom",
                html: "Enable local mode"
            });
        }

        $("#controls").off("mouseleave");
        $("#controls").off("mouseenter");
        $("#controls").off("mousedown");
        $("#controls").off("mouseup");
        $("#controls").off("mousemove", Channel.seekToMove);
        $("#controls").off("click", Channel.seekToClick);
        Helper.removeElement("#seekToDuration");
        if(window.location.pathname != "/"){
            socket.on("color", Player.setBGimage);
            socket.emit("pos", {channel: chan.toLowerCase()});
            var add = "";
            if(private_channel) add = Crypt.getCookie("_uI") + "_";
            socket.emit("list", {version: parseInt(localStorage.getItem("VERSION")), channel: add + chan.toLowerCase()});
            Helper.removeClass("#controls", "ewresize");
        }
    }
}

function handleEvent(e, target, tried, type) {
    if(dynamicListeners[type] && dynamicListeners[type]["#" + target.id]) {
        dynamicListeners[type]["#" + target.id].call(target);
        return;
    } else {
        for(var i = 0; i < target.classList.length; i++) {
            if(dynamicListeners[type] && dynamicListeners[type]["." + target.classList[i]]) {
                dynamicListeners[type]["." + target.classList[i]].call(target);
                return;
            }
        }
    }
    if(!tried) {
        handleEvent(e, e.target.parentElement, true, type);
    }
}

function addListener(type, element, callback) {
    if(dynamicListeners[type] == undefined) dynamicListeners[type] = {};
    dynamicListeners[type][element] = callback;
}

function removeListener(type, element) {
    delete dynamicListeners[type][element];
}

function toast(msg) {
    switch(msg) {
        case "other_list_pass":
            msg = "The other list has a pass, can't import the songs..";
            break;
        case "nolist":
            msg = "There is no list with that name";
            break;
        case "suggested_thumbnail":
            if(embed) return;
            msg = "The thumbnail has been suggested!";
            break;
        case "faulty_start_end":
            if(embed) return;
            msg = "You tried to send a faulty start/end value. Try again..";
            break;
        case "wait_longer":
            if(embed) return;
            msg = Helper.rnd(["Have you tried to wait longer between commands?!", "Looks like you're clicking that button too much..", "You need to wait longer between clicks.."]);
            break;
        case "suggested_description":
            if(embed) return;
            msg = "The description has been suggested!";
            break;
        case "thumbnail_denied":
            if(embed) return;
            msg = "The thumbnail will be denied";
            break;
        case "description_denied":
            if(embed) return;
            msg = "The description will be denied";
            break;
        case "addedsong":
            if(embed) return;
            msg=Helper.rnd(["I added your song", "Your song has been added", "Yay, more songs!", "Thats a cool song!", "I added that song for you", "I see you like adding songs..."]);
            break;
        case "addedplaylist":
            if(embed) return;
            if(Search.submitYouTubeError) {
                M.toast({html: "Added most of your playlist, but something was wrong. Check the playlist..", displayLength: 4000, classes: "red lighten connect_error"});
                Search.submitYouTubeError = false;
                return;
            }
            msg=Helper.rnd(["I added the playlist", "Your playlist has been added", "Yay, many more songs!", "Thats a cool playlist!", "I added all the songs for you", "I see you like adding songs.."]);
            document.getElementById("import").disabled = false;
            Helper.addClass("#playlist_loader", "hide");
            Helper.removeClass("#import", "hide");
            break;
        case "savedsettings":
            if(embed) return;
            msg=Helper.rnd(["I've saved your settings", "I stored all your settings", "Your settings have been stored in a safe place"]);
            break;
        case "wrongpass":
            if(embed) return;
            msg=Helper.rnd(["That's not the right password!", "Wrong! Better luck next time...", "You seem to have mistyped the password", "Incorrect. Have you tried meditating?","Nope, wrong password!", "Wrong password. The authorities have been notified."]);
            //Crypt.remove_pass(chan.toLowerCase());
            Admin.display_logged_out();
            Helper.css("#thumbnail_form", "display", "none");
            Helper.css("#description_form", "display", "none");
            if(!Helper.mobilecheck()) {
                Helper.tooltip('#chan_thumbnail', "destroy");
            }
            w_p = true;
            break;
        case "deleted_songs":
            if(embed) return;
            msg="All songs in the channel has been deleted!";
            break;
        case "shuffled":
            if(embed) return;
            msg=Helper.rnd(["♫ You stir me right round, baby. ♫","♫ Stir, stir, stir my boat ♫","I vigorously stirred your playlist!", "I hope you like your list stirred, not shaken.", "I shuffled your playlist with the cosmic background radiation as a seed. Enjoy.", "100% randomized, for your listening pleasure!", "I hope you enjoy your fresh playlist!"]);
            break;
        case "deletesong":
            if(embed) return;
            msg=Helper.rnd(["Your song is now in a better place...", "You won't be seeing any more of that video...", "EXTERMINATE! EXTERMINATE! EXTERMINATE!", "I killed it with fire", "Thanks for deleting that song. I didn't like it anyways...", "Removed song securely."]);
            break;
        case "voted":
            msg=Helper.rnd(["You voted!", "You vote like a boss", "Voting is the key to democracy", "May you get your song to the very top!", "I love that song! I vouch for you.", "Only you vote that good", "I like the way you vote...", "Up the video goes!", "Voted Zoff for president", "Only 999 more to go!"]);
            break;
        case "alreadyvoted":
            msg=Helper.rnd(["You can't vote twice on that song!", "I see you have voted on that song before", "One vote per person!", "I know you want to hear your song, but have patience!", "I'm sorry, but I can't let you vote twice, Dave."]);
            break;
        case "skip":
            if(embed) return;
            msg=Helper.rnd(["The song was skipped", "I have skipped a song", "Skipped to the beat", "Skipmaster3000", "They see me skippin', they hatin'"]);
            break;
        case "listhaspass":
            if(embed) return;
            if(!tried_again && lastCommand != undefined && lastCommand.length > 0) {
                if(Crypt.get_pass() != undefined) {
                    tried_again = true;
                    if(lastCommand.length == 1) {
                        socket.emit(lastCommand[0]);
                    } else if(lastCommand.length == 2) {
                        socket.emit(lastCommand[0], lastCommand[1]);
                    }
                    lastCommand = [];
                    return;
                }
            }
            document.getElementById("import_spotify").disabled = false;
            document.getElementById("import").disabled = false;
            tried_again = false;
            msg=Helper.rnd(["I'm sorry, but you have to be an admin to do that!", "Only admins can do that", "You're not allowed to do that, try logging in!", "I can't let you do that", "Please log in to do that"]);
            //Crypt.remove_pass(chan.toLowerCase());
            Admin.display_logged_out();
            Helper.css("#thumbnail_form", "display", "none");
            Helper.css("#description_form", "display", "none");
            if(!Helper.mobilecheck()) {
                Helper.tooltip('#chan_thumbnail', "destroy");
            }
            w_p = true;
            Helper.addClass("#playlist_loader", "hide");
            Helper.addClass("#playlist_loader_spotify", "hide");
            Helper.removeClass("#import_spotify", "hide");
            Helper.removeClass("#import", "hide");
            break;
        case "noskip":
            if(embed) return;
            if(!tried_again && lastCommand != undefined && lastCommand.length > 0) {
                if(Crypt.get_pass() != undefined) {
                    tried_again = true;
                    if(lastCommand.length == 1) {
                        socket.emit(lastCommand[0]);
                    } else if(lastCommand.length == 2) {
                        socket.emit(lastCommand[0], lastCommand[1]);
                    }
                    lastCommand = [];
                    return;
                }
            }
            tried_again = false;
            msg=Helper.rnd(["Only Admins can skip songs, peasant!", "You have to log in to skip songs on this channel", "Try clicking the settings icon and logging in before you skip"]);
            break;
        case "alreadyskip":
            if(embed) return;
            msg=Helper.rnd(["Skipping is democratic, only one vote per person!", "More people have to vote to skip, not just you!", "Get someone else to skip too! You can't do it on yourself."]);
            break;
        case "notyetskip":
            if(embed) return;
            msg="Skipping is disabled the first 10 seconds.";
            break;
        case "correctpass":
            if(embed) return;
            tried_again = false;
            adminpass = Crypt.get_pass(chan.toLowerCase()) == undefined ? Crypt.tmp_pass : Crypt.get_pass(chan.toLowerCase());
            msg="Correct password. You now have access to the sacred realm of The Admin.";
            Helper.css("#thumbnail_form", "display", "inline-block");
            Helper.css("#description_form", "display", "inline-block");
            break;
        case "changedpass":
            if(embed) return;
            msg="Your password has been changed!";
            break;
        case "suggested":
            if(embed) return;
            msg="Your song was suggested!";
            break;
        case "alreadyplay":
            if(embed) return;
            msg="Seems the song you want is already playing. No fooling the system!";
            break;
    }
    before_toast();
    M.toast({ html: msg, displayLength: 4000});
}

function emit() {
    if(!embed) {
        lastCommand = [];
        for(var i = 0; i < arguments.length; i++) {
            lastCommand.push(arguments[i]);
        }
    }
    if(arguments.length == 1) {
        socket.emit(arguments[0]);
    } else {
        socket.emit(arguments[0], arguments[1]);
    }
}

function before_toast(){
    /*if($('.toast').length > 0) {
        var toastElement = $('.toast').first()[0];
        var toastInstance = toastElement.M_Toast;
        toastInstance.remove();
    }*/
    M.Toast.dismissAll();
    //Materialize.Toast.removeAll();
}

function scrollChat() {
    var current = $(".chat-tab active").attr("href");
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
