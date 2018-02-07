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
            $("#volume").slider("destroy");
        } catch(e){

        }
        var slider_values = {
            min: 0,
            max: 100,
            value: vol,
            range: "min",
            animate: true,
            slide: function(event, ui) {
                Playercontrols.setVolume(ui.value);
                try{Crypt.set_volume(ui.value);}catch(e){}
            }
        };
        if(Helper.mobilecheck() || slider_type == "vertical") {
            slider_values.orientation = "vertical";
            if(!$(".volume-container").hasClass("hide")) {
                $(".volume-container").toggleClass("hide");
            }
        }
        $("#volume").slider(slider_values);
        Playercontrols.choose_button(vol, false);
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

    volumeOptions: function() {
        if(!chromecastAvailable) {
            if(Player.player.isMuted()) {
                Player.player.unMute();
                vol = Player.player.getVolume();
                $("#volume").slider("value", Player.player.getVolume());
            } else {
                Player.player.mute();
                $("#volume").slider("value", 0);
            }
        }
    },

    hoverMute: function(foo) {
        vol = Player.player.getVolume();
    }
};
