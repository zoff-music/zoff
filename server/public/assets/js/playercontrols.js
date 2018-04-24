var Playercontrols = {

    stopInterval: false,


    initYoutubeControls: function() {
        Playercontrols.initControls();
    },

    initControls: function() {
        $("#volume-button").on("click", Playercontrols.mute_video);
        $("#playpause").on("click", Playercontrols.play_pause);
        $("#volume-button-overlay").on("click", Playercontrols.mute_video);
        $("#playpause-overlay").on("click", Playercontrols.play_pause);
        $("#fullscreen").on("click", Playercontrols.fullscreen);
    },

    initSlider: function() {
        try {

            vol = (Crypt.get_volume());
            //$("#volume").slider("destroy");
        } catch(e){
            vol = 100;
        }
        try {
            if(document.getElementsByClassName("volume-slid")) {
                document.getElementById("volume").innerHTML = "";
            }
        }catch(e){}
        if(Helper.mobilecheck() || slider_type == "vertical") {
            //slider_values.orientation = "vertical";
            if(!$(".volume-container").hasClass("hide")) {
                $(".volume-container").toggleClass("hide");
            }
        }
        $("#volume").append("<div class='volume-slid " + slider_type + "'></div>");
        $("#volume").append("<div class='volume-handle " + slider_type + "'></div>");
        if(slider_type != "vertical") {
            if($("#volume").hasClass("vertical")) {
                $("#volume").removeClass("vertical");
            }
            $(".volume-slid").css("width", vol + "%");
            $(".volume-handle").css("left", "calc(" + vol + "% - 1px)");
        } else {
            if(!$("#volume").hasClass("vertical")) {
                $("#volume").addClass("vertical");
            }
            $(".volume-slid").css("height", vol + "%");
            $(".volume-handle").css("bottom", "calc(" + vol + "% - 1px)");

        }
        Playercontrols.choose_button(vol, false);
        //document.getElementsByClassName("volume-handle")[0].onmousedown = Playercontrols.dragMouseDown;
        //Playercontrols.visualVolume(slider_values);
        //document.getElementsByClassName("volume-slid")[0].onmousedown = Playercontrols.dragMouseDown;
        document.getElementById("volume").onmousedown = function(e) {
            Playercontrols.dragMouseDown(e, "player");
        }
        if(!Helper.mobilecheck()) {
            document.getElementById("volume").onclick = function(e) {
                Playercontrols.elementDrag(e, "player");
                Playercontrols.closeDragElement("player");
            }
        }
        document.getElementById("volume").addEventListener("touchstart", function(e) {
            e.preventDefault();
            Playercontrols.dragMouseDown(e, "player");
        }, false);

    },

    dragMouseDown: function(e, element) {
        e = e || window.event;
        // get the mouse cursor position at startup:
        document.onmouseup = function() {
            Playercontrols.closeDragElement(element);
        }
        document.getElementById("volume").addEventListener("touchend", function() {
            Playercontrols.closeDragElement(element);
        }, false);
        // call a function whenever the cursor moves:
        document.onmousemove = function(e) {
            Playercontrols.elementDrag(e, element);
        }
        document.getElementById("volume").addEventListener("touchmove", function(e) {
            e.preventDefault();
            Playercontrols.elementDrag(e, element);
        }, false);
    },

    elementDrag: function(e, element) {
        var elmnt;
        var cmp_elmnt;
        var slid_elmnt;
        if(element == "player") {
            elmnt = document.getElementsByClassName("volume-handle")[0];
            cmp_elmnt = document.getElementById("volume");
            slid_elmnt = document.getElementsByClassName("volume-slid")[0];
        } else {
            elmnt = document.getElementsByClassName("volume-handle-remote")[0];
            cmp_elmnt = document.getElementById("volume-control-remote");
            slid_elmnt = document.getElementsByClassName("volume-slid-remote")[0];
        }
        e = e || window.event;

        var pos3 = e.clientX;
        var pos4 = e.clientY;
        if(pos3 == undefined) {
            pos3 = e.touches[0].clientX;
        }
        if(pos4 == undefined) {
            pos4 = e.touches[0].clientY;
        }
        var volume = 0;
        if(slider_type != "vertical" || element != "player") {
            if(elmnt.className.indexOf("ui-state-active") == -1) {
                elmnt.className += " ui-state-active";
            }
            var pos = pos3 - cmp_elmnt.offsetLeft;
            if(pos > -1 && pos < cmp_elmnt.offsetWidth + 1) {
                elmnt.style.left = pos + "px";
                volume = pos / cmp_elmnt.offsetWidth;
            } else if(pos < 1) {
                elmnt.style.left = 0 + "px";
                volume = 0;
            } else {
                elmnt.style.left = cmp_elmnt.offsetWidth + "px";
                volume = 1;
            }
            slid_elmnt.style.width = volume * 100 + "%";
            if(element == "player") Playercontrols.setVolume(volume * 100);
            else socket.emit("id", {id: Mobile_remote.id, type: "volume", value: volume * 100});
        } else {
            var pos = pos4 - cmp_elmnt.offsetTop;
            var pos0 = window.innerHeight - pos - 14;

            if(pos0 > 64 && pos0 < 164) {
                volume = (pos0 - 64) / 100;
            } else if(pos0 < 65) {
                volume = 0;
            } else {
                volume = 1;
            }
            slid_elmnt.style.height = volume * 100 + "%";
            Playercontrols.setVolume(volume * 100);

        }
        try{Crypt.set_volume(volume * 100);}catch(e){
        }
    },

    closeDragElement: function(element) {
        /* stop moving when mouse button is released:*/
        var elmnt;
        if(element == "player") {
            elmnt = document.getElementsByClassName("volume-handle")[0];
        } else {
            elmnt = document.getElementsByClassName("volume-handle-remote")[0];
        }
        if(elmnt.className.indexOf("ui-state-active") > -1) {
            setTimeout(function(){
                elmnt.classList.remove("ui-state-active");
            }, 1);
        }
        document.onmouseup = null;
        document.onmousemove = null;
        if(element == "player") {
            document.getElementById("volume").removeEventListener("touchmove", function(e) {
                e.preventDefault();
                Playercontrols.elementDrag(e, element);
            }, false);
            document.getElementById("volume").removeEventListener("touchend", function() {
                Playercontrols.closeDragElement(element);
            }, false);
        } else {
            document.getElementById("volume-control-remote").removeEventListener("touchmove", function(e) {
                e.preventDefault();
                Playercontrols.elementDrag(e);
            }, false);
            document.getElementById("volume-control-remote").removeEventListener("touchend", function() {
                Playercontrols.closeDragElement();
            }, false);
        }
    },

    fullscreen: function() {
        var playerElement = $("#player").get(0);
        var requestFullScreen = playerElement.requestFullScreen || playerElement.mozRequestFullScreen || playerElement.webkitRequestFullScreen;
        if (requestFullScreen) {
            requestFullScreen.bind(playerElement)();
        }
    },

    play_pause: function() {
        if(!chromecastAvailable){
            if(Player.player.getPlayerState() == YT.PlayerState.PLAYING)
            {
                Player.pauseVideo();
                if(Helper.mobilecheck() && !window.MSStream){
                    //if(Helper.mobilecheck() && !/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream){
                    //document.getElementById("player").style.display = "none";
                    $("#player").css("display", "none");
                    $(".video-container").toggleClass("click-through");
                    $(".page-footer").toggleClass("padding-bottom-extra");
                }
            } else if(Player.player.getPlayerState() == YT.PlayerState.PAUSED || Player.player.getPlayerState() === YT.PlayerState.ENDED || (Player.player.getPlayerState() === YT.PlayerState.CUED)){
                Player.playVideo();
                //if(Helper.mobilecheck() && !/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream){
                if(Helper.mobilecheck() && !window.MSStream){
                    //document.getElementById("player").style.display = "block";
                    $("#player").css("display", "block");
                    $(".video-container").toggleClass("click-through");
                    $(".page-footer").toggleClass("padding-bottom-extra");
                }
            }
        } else {
            Playercontrols.play_pause_show();
        }
    },

    play_pause_show: function() {
        if(chromecastAvailable){
            if($("#play").hasClass("hide")){
                Player.pauseVideo();
            } else if($("#pause").hasClass("hide")){
                Player.playVideo();
            }
        } else {

            if(!$("#pause").hasClass("hide")) {
                $("#pause").toggleClass("hide");
                $("#pause-overlay").toggleClass("hide");
            }
            if($("#play").hasClass("hide")) {
                $("#play").toggleClass("hide");
                $("#play-overlay").toggleClass("hide");
            }
        }
    },

    settings: function() {
        $("#qS").toggleClass("hide");
    },

    changeQuality: function(wantedQ) {
        if(Player.player.getPlaybackQuality != wantedQ) {
            Player.player.setPlaybackQuality(wantedQ);
            Player.player.getPlaybackQuality();
        }
        $("#qS").toggleClass("hide");
    },

    mute_video: function() {
        if(Helper.mobilecheck() || slider_type == "vertical") {
            $(".volume-container").toggleClass("hide");
        } else {
            if(!Player.player.isMuted()) {
                if(chromecastAvailable) castSession.sendMessage("urn:x-cast:zoff.me", {type: "mute"});
                Playercontrols.choose_button(0, true);
                Player.player.mute();
            } else {
                if(chromecastAvailable)castSession.sendMessage("urn:x-cast:zoff.me", {type: "unMute"});
                Player.player.unMute();
                Playercontrols.choose_button(Player.player.getVolume(), false);
            }
        }
    },

    setVolume: function(vol) {
        Player.setVolume(vol);
        Playercontrols.choose_button(vol, false);
        if(Player.player.isMuted())
        Player.player.unMute();
    },

    choose_button: function(vol, mute) {
        if(!mute){
            if(vol >= 0 && vol <= 33) {
                if(!$("#v-full").hasClass("hide")) {
                    $("#v-full").toggleClass("hide");
                    $("#v-full-overlay").toggleClass("hide");
                }
                if(!$("#v-medium").hasClass("hide")) {
                    $("#v-medium").toggleClass("hide");
                    $("#v-medium-overlay").toggleClass("hide");
                }
                if($("#v-low").hasClass("hide")) {
                    $("#v-low").toggleClass("hide");
                    $("#v-low-overlay").toggleClass("hide");
                }
                if(!$("#v-mute").hasClass("hide")) {
                    $("#v-mute").toggleClass("hide");
                    $("#v-mute-overlay").toggleClass("hide");
                }
            } else if(vol >= 34 && vol <= 66) {
                if(!$("#v-full").hasClass("hide")) {
                    $("#v-full").toggleClass("hide");
                    $("#v-full-overlay").toggleClass("hide");
                }
                if($("#v-medium").hasClass("hide")) {
                    $("#v-medium").toggleClass("hide");
                    $("#v-medium-overlay").toggleClass("hide");
                }
                if(!$("#v-low").hasClass("hide")) {
                    $("#v-low").toggleClass("hide");
                    $("#v-low-overlay").toggleClass("hide");
                }
                if(!$("#v-mute").hasClass("hide")) {
                    $("#v-mute").toggleClass("hide");
                    $("#v-mute-overlay").toggleClass("hide");
                }
            } else if(vol >= 67 && vol <= 100) {
                if($("#v-full").hasClass("hide")) {
                    $("#v-full").toggleClass("hide");
                    $("#v-full-overlay").toggleClass("hide");
                }
                if(!$("#v-medium").hasClass("hide")) {
                    $("#v-medium").toggleClass("hide");
                    $("#v-medium-overlay").toggleClass("hide");
                }
                if(!$("#v-low").hasClass("hide")) {
                    $("#v-low").toggleClass("hide");
                    $("#v-low-overlay").toggleClass("hide");
                }
                if(!$("#v-mute").hasClass("hide")) {
                    $("#v-mute").toggleClass("hide");
                    $("#v-mute-overlay").toggleClass("hide");
                }
            }
        } else {
            if(!$("#v-full").hasClass("hide")) {
                $("#v-full").toggleClass("hide");
                $("#v-full-overlay").toggleClass("hide");
            }
            if(!$("#v-medium").hasClass("hide")) {
                $("#v-medium").toggleClass("hide");
                $("#v-medium-overlay").toggleClass("hide");
            }
            if(!$("#v-low").hasClass("hide")) {
                $("#v-low").toggleClass("hide");
                $("#v-low-overlay").toggleClass("hide");
            }
            if($("#v-mute").hasClass("hide")) {
                $("#v-mute").toggleClass("hide");
                $("#v-mute-overlay").toggleClass("hide");
            }
        }
    },

    playPause: function() {
        state = Player.player.getPlayerState();
        button = document.getElementById("playpause");
        if(state == YT.PlayerState.PLAYING) {
            Player.pauseVideo();
        } else if(state == YT.PlayerState.PAUSED) {
            Player.playVideo();
        }
    },

    visualVolume: function(val) {
        var elmnt = document.getElementsByClassName("volume-handle")[0];
        var cmp_elmnt = document.getElementById("volume");
        var slid_elmnt = document.getElementsByClassName("volume-slid")[0];


        if(slider_type != "vertical") {
            var pos = (cmp_elmnt.offsetWidth / 100) * val;
            var volume = 0;
            //var pos = pos3 - cmp_elmnt.offsetLeft;
            if(pos > -1 && pos < cmp_elmnt.offsetWidth + 1) {
                elmnt.style.left = pos + "px";
                volume = pos / cmp_elmnt.offsetWidth;
            } else if(pos < 1) {
                elmnt.style.left = 0 + "px";
                volume = 0;
            } else {
                elmnt.style.left = cmp_elmnt.offsetWidth + "px";
                volume = 1;
            }

            slid_elmnt.style.width = volume * 100 + "%";
            Playercontrols.setVolume(volume * 100);
        } else {
            var pos = val;
            var pos0 = window.innerHeight - pos - 14;
            var volume = 0;
            if(pos0 > 64 && pos0 < 164) {
                volume = (pos0 - 64) / 100;
            } else if(pos0 < 65) {
                volume = 0;
            } else {
                volume = 1;
            }
            slid_elmnt.style.height = volume * 100 + "%";
            Playercontrols.setVolume(volume * 100);
        }
    },

    volumeOptions: function() {
        if(!chromecastAvailable) {
            if(Player.player.isMuted()) {
                Player.player.unMute();
                vol = Player.player.getVolume();
                Playercontrols.visualVolume(Player.player.getVolume());
            } else {
                Player.player.mute();
                Playercontrols.visualVolume(0);
            }
        }
    },

    hoverMute: function(foo) {
        vol = Player.player.getVolume();
    }
};
