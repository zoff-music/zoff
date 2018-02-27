var Player = {

    loaded: true,
    before_load: "",
    after_load: "",
    player: "",
    stopInterval: false,
    fireplace: "",
    np: {},

    youtube_listener: function(obj) {
        Helper.log(["object", obj]);
        var state;
        if(embed && obj.np) {
            if(window.parentWindow && window.parentOrigin) {
                window.parentWindow.postMessage({type: "np", title: obj.np[0].title}, window.parentOrigin);
                if(full_playlist.length > 0) {
                    Player.sendNext({title: full_playlist[0].title, videoId: full_playlist[0].id});
                }
            }
        }
        try {
            state = Player.player.getPlayerState();
        } catch(e) {
            state = null;
        }
        if(!paused) {
            gotten_np = true;
        }
        if((((!offline && (state != null || from_frontpage)) || (offline && (!(state != null) || from_frontpage))|| (!offline && (!(state != null) || from_frontpage)) || (offline && state == -1)) && !(offline && prev_chan_player == chan)) || (offline && video_id == undefined)){
            prev_chan_player = chan;
            from_frontpage = false;
            Player.loaded      = false;
            Helper.log([
                "youtube_listener",
                "Received: ",
                obj,
                "paused variable: " + paused,
                "mobile_beginning variable: " + mobile_beginning]);
            try{
                Helper.log(["getVideoUrl(): " + Player.player.getVideoUrl().split('v=')[1]]);
            } catch(e){

            }
            Helper.log(["video_id variable: " + video_id]);
            if(!obj.np){
                $('#song-title').html("Empty channel. Add some songs!");
                document.title = "Zoff - the shared YouTube based radio";
                $("#channel-load").css("display", "none");
                //$("#player_overlay").height($("#player").height());

                if(!window.MSStream && !chromecastAvailable) {
                    if($("#player_overlay").hasClass("hide")) {
                        $("#player_overlay").removeClass("hide");
                    }
                }
                try{
                    if(!chromecastAvailable) {
                        Player.stopVideo();
                    }
                }catch(e){

                }
                //List.importOldList(channel.toLowerCase());
            } else if(paused){

                Player.getTitle(obj.np[0].title, viewers);
                //Player.setBGimage(video_id);
                if(!Helper.mobilecheck()) {
                    Player.notifyUser(obj.np[0].id, obj.np[0].title);
                }
                if(!chromecastAvailable) {
                    Player.stopVideo();
                }
                video_id   = obj.np[0].id;
                Player.np = {
                    id: video_id,
                    start: obj.np[0].start,
                    end: obj.np[0].end,
                    duration: obj.np[0].duration,
                };
                if(!obj.np[0].hasOwnProperty("start")) {
                    Player.np.start = 0;
                }
                if(!obj.np[0].hasOwnProperty("end")) {
                    Player.np.end = Player.np.duration;
                }

                conf       = obj.conf[0];
                time       = obj.time;
                seekTo     = (time - conf.startTime) + Player.np.start;
                song_title = obj.np[0].title;
                duration   = obj.np[0].duration;
                //Player.setBGimage(video_id);
            } else if(!paused){
                //Helper.log("gotten new song");
                if(previous_video_id === undefined) {
                    previous_video_id = obj.np[0].id;
                } else if(previous_video_id != video_id) {
                    previous_video_id = video_id;
                }

                video_id   = obj.np[0].id;
                Player.np = {
                    id: video_id,
                    start: obj.np[0].start,
                    end: obj.np[0].end,
                    duration: obj.np[0].duration,
                };
                if(!obj.np[0].hasOwnProperty("start")) {
                    Player.np.start = 0;
                }
                if(!obj.np[0].hasOwnProperty("end")) {
                    Player.np.end = Player.np.duration;
                }
                conf       = obj.conf[0];
                time       = obj.time;
                seekTo     = (time - conf.startTime) + Player.np.start;
                song_title = obj.np[0].title;
                duration   = obj.np[0].duration;

                if(mobile_beginning && Helper.mobilecheck() && seekTo === 0 && !chromecastAvailable) {
                    seekTo = 1 + Player.np.start;
                }

                try{
                    if(full_playlist[0].id == video_id && !mobile_beginning){
                        List.song_change(full_playlist[0].added);
                    }
                    Suggestions.fetchYoutubeSuggests(video_id);
                }catch(e){}

                Player.getTitle(song_title, viewers);
                if(player_ready && !window.MSStream) {
                    try {
                        var compared;
                        var prev_state = state;
                        try {
                            compared = Player.player.getVideoUrl().split('v=')[1] != video_id;
                        } catch(e) {
                            compared = true;
                        }
                        if(prev_state == 2 && !chromecastAvailable) {
                            Player.stopVideo();
                            was_stopped = true;
                            if(!durationBegun) {
                                Player.durationSetter();
                            }
                        } else {
                            if(compared || chromecastAvailable){

                                Player.loadVideoById(video_id, duration);
                                if(!Helper.mobilecheck()) {
                                    Player.notifyUser(video_id, song_title);
                                }
                                Player.seekTo(seekTo);
                                if(paused && !chromecastAvailable){
                                    Player.pauseVideo();
                                }
                            }
                            if(!paused){
                                if((!mobile_beginning || chromecastAvailable) && prev_state != 2) {
                                    Player.playVideo();
                                }
                                if(!durationBegun) {
                                    Player.durationSetter();
                                }
                            }

                            if(Player.player.getDuration() > seekTo || Player.player.getDuration() === 0 || chromecastAvailable || Player.player.getCurrentTime() != seekTo) {
                                Player.seekTo(seekTo);
                            }
                            Player.after_load  = video_id;

                            if(!Player.loaded) {
                                setTimeout(function(){Player.loaded = true;},500);
                            }
                        }
                    }catch(e) {
                        if(chromecastAvailable) {
                            Player.loadVideoById(video_id, duration);
                            Player.seekTo(seekTo);
                        }
                        if(!durationBegun && !chromecastAvailable) {
                            Player.durationSetter();
                        }
                    }
                } else {
                    Player.getTitle(song_title, viewers);
                }
            }
        } else {
            if(!durationBegun) {
                Player.durationSetter();
            }
            duration = Player.player.getDuration();
        }

        if(Object.keys(obj).length == 0) {
            paused = false;
            empty_clear = true;
        } else {
            empty_clear = false;
        }
    },

    onPlayerStateChange: function(newState) {
        Helper.log([
            "onPlayerStateChange",
            "New state\nState: ",
            newState
        ]);
        try{
            Helper.log(["Duration: " + Player.player.getDuration(), "Current time: " + Player.player.getCurrentTime()]);
            Helper.log(["getVideoUrl(): " + Player.player.getVideoUrl().split('v=')[1]]);
        }catch(e){}
        Helper.log(["video_id variable: " + video_id]);
        switch(newState.data) {
            case YT.PlayerState.UNSTARTED:
                break;
            case YT.PlayerState.ENDED:
                playing = false;
                paused  = false;
                if(!offline) {
                    socket.emit("end", {id: video_id, channel: chan.toLowerCase(), pass: embed ? '' : Crypt.crypt_pass(Crypt.get_userpass(chan.toLowerCase()))});
                } else {
                    Player.playNext();
                }
                break;
            case YT.PlayerState.PLAYING:
                if(!window.MSStream) {
                    $("#player").css("opacity", "1");
                    if(!Helper.mobilecheck()) {
                        $("#channel-load").css("display", "none");
                        /*if(Frontpage.winter && $("#snow").length == 0) {
                            $("#video-container").prepend('<div id="snow" class="snow-channel"></div>');
                        }*/
                    }
                }
                playing = true;
                if(beginning && Helper.mobilecheck() && !chromecastAvailable){
                    //Player.pauseVideo();
                    beginning = false;
                    mobile_beginning = false;

                }
                if(!embed && window.location.pathname != "/" && !chromecastAvailable) Helper.addClass("#player_overlay", "hide");
                if(window.location.pathname != "/"){
                    if(document.getElementById("play").className.split(" ").length == 1)
                        $("#play").toggleClass("hide");
                    if(document.getElementById("pause").className.split(" ").length == 2)
                        $("#pause").toggleClass("hide");
                }
                if((paused && !offline) || was_stopped) {
                    socket.emit('pos', {channel: chan.toLowerCase(), pass: embed ? '' : Crypt.crypt_pass(Crypt.get_userpass(chan.toLowerCase()))});
                    paused = false;
                    was_stopped = false;
                }
                break;
            case YT.PlayerState.PAUSED:
                if(end_programmatically) {
                    paused = false;
                    playing = false;
                    end_programmatically = false;
                } else {
                    if(!chromecastAvailable){
                        if(beginning && mobile_beginning) {
                            $("#playpause").css("visibility", "visible");
                            $("#playpause").css("pointer-events", "all");
                            $("#channel-load").css("display", "none");
                        }
                        if(!empty_clear && !gotten_np) {
                            paused = true;
                        }
                        if(gotten_np) gotten_np = false;
                        if(window.location.pathname != "/") Playercontrols.play_pause_show();
                        mobile_beginning = true;
                    }
                }
                break;
            case YT.PlayerState.BUFFERING:
                break;
        }
    },

    playPauseVideo: function() {
        if(chromecastAvailable) {
            castSession.sendMessage("urn:x-cast:zoff.me", {type: "playPauseVideo"});
        }
    },

    playVideo: function(){
        if(chromecastAvailable){
            castSession.sendMessage("urn:x-cast:zoff.me", {type: "playVideo"});
            //socket.emit('pos', {channel: chan.toLowerCase()});
            chrome.cast.media.GenericMediaMetadata({metadataType: 0, title:song_title, image: 'https://img.youtube.com/vi/'+video_id+'/mqdefault.jpg', images: ['https://img.youtube.com/vi/'+video_id+'/mqdefault.jpg']});
            //chrome.cast.Image('https://img.youtube.com/vi/'+video_id+'/mqdefault.jpg');
            if($("#pause").hasClass("hide")){
                $("#play").toggleClass("hide");
                $("#pause").toggleClass("hide");
            }
            //Playercontrols.play_pause();
        } else {
            Player.player.playVideo();
        }
    },

    pauseVideo: function(){
        if(chromecastAvailable){
            castSession.sendMessage("urn:x-cast:zoff.me", {type: "pauseVideo"});
            if($("#play").hasClass("hide")){
                $("#play").toggleClass("hide");
                $("#pause").toggleClass("hide");
            }
            //Playercontrols.play_pause();
        } else {
            paused = true;
            Player.player.pauseVideo();
        }
    },

    seekTo: function(_seekTo){
        if(chromecastAvailable){
            castSession.sendMessage("urn:x-cast:zoff.me", {type: "seekTo", seekTo: _seekTo});
        } else if(!offline){
            Player.player.seekTo(_seekTo);
        } else {
            Player.player.seekTo(0 + Player.np.start);
        }
    },

    loadVideoById: function(id, this_duration, start, end){
        var s;
        var e;
        if(start) s = start;
        else s = Player.np.start;
        if(end) e = end;
        else e = Player.np.end;
        if(chromecastAvailable){
            castSession.sendMessage("urn:x-cast:zoff.me", {start: s, end: e, type: "loadVideo", videoId: id, channel: chan.toLowerCase()});
            chrome.cast.media.GenericMediaMetadata({metadataType: 0, title:song_title, image: 'https://img.youtube.com/vi/'+id+'/mqdefault.jpg', images: ['https://img.youtube.com/vi/'+id+'/mqdefault.jpg']});
            chrome.cast.Image('https://img.youtube.com/vi/'+id+'/mqdefault.jpg');
        } else {
            window.player = Player.player;
            Player.player.loadVideoById({'videoId': id, 'startSeconds': s, 'endSeconds': e});
        }
        if(offline) {
            socket.emit("color", {id: id});
        }
    },

    stopVideo: function(){
        if(chromecastAvailable){
            castSession.sendMessage("urn:x-cast:zoff.me", {type: "stopVideo"});
        } else {
            try{
                Player.player.stopVideo();
            } catch(e){}
        }
    },

    setVolume: function(vol){
        if(chromecastAvailable){
            castSession.setVolume(vol/100);
        } else {
            Player.player.setVolume(vol);
        }
    },

    playNext: function(){
        var next_song = full_playlist[0];

        video_id   = next_song.id;
        time       = (new Date()).getTime();
        song_title = next_song.title;
        duration   = next_song.duration;
        var start;
        var end;
        if(next_song.hasOwnProperty("start")) start = next_song.start;
        else start = 0;
        if(next_song.hasOwnProperty("end")) end = next_song.end;
        else end = duration;

        Player.np = {
            id: video_id,
            start: start,
            end: end,
            duration: duration,
        };

        Player.getTitle(song_title, viewers);
        //Player.setBGimage(video_id);
        if(chromecastAvailable){
            castSession.sendMessage("urn:x-cast:zoff.me", {type: "loadVideo", videoId: video_id, channel: chan.toLowerCase(), start: start, end:end});
            chrome.cast.media.GenericMediaMetadata({metadataType: 0, title:song_title, image: 'https://img.youtube.com/vi/'+video_id+'/mqdefault.jpg', images: ['https://img.youtube.com/vi/'+video_id+'/mqdefault.jpg']});
            chrome.cast.Image('https://img.youtube.com/vi/'+video_id+'/mqdefault.jpg');
        } else {
            Player.loadVideoById(video_id, duration, start, end);
        }
        List.channel_function({type:"song_change", time: time});
    },

    playPrev: function() {
        var length = full_playlist.length - 2;
        if(length < 0) {
            length = 0;
        }
        var next_song = full_playlist[length];
        video_id   = next_song.id;
        time       = (new Date()).getTime();
        song_title = next_song.title;
        duration   = next_song.duration;
        var start;
        var end;
        if(next_song.hasOwnProperty("start")) start = next_song.start;
        else start = 0;
        if(next_song.hasOwnProperty("end")) end = next_song.end;
        else end = duration;

        Player.np = {
            id: video_id,
            start: start,
            end: end,
            duration: duration,
        };

        Player.getTitle(song_title, viewers);
        //Player.setBGimage(video_id);

        if(chromecastAvailable){
            castSession.sendMessage("urn:x-cast:zoff.me", {type: "loadVideo", videoId: video_id, channel: chan.toLowerCase(), start: start, end: end});
            chrome.cast.media.GenericMediaMetadata({metadataType: 0, title:song_title, image: 'https://img.youtube.com/vi/'+video_id+'/mqdefault.jpg', images: ['https://img.youtube.com/vi/'+video_id+'/mqdefault.jpg']});
            chrome.cast.Image('https://img.youtube.com/vi/'+video_id+'/mqdefault.jpg');
        } else {
            Player.loadVideoById(video_id, duration, start, end);
        }

        List.channel_function({type:"song_change_prev", time: time});
    },

    sendNext: function(obj){
        if(chromecastAvailable){
            castSession.sendMessage("urn:x-cast:zoff.me", {type: "nextVideo", title: obj.title, videoId: obj.videoId});
        }

        if(embed) {
            if(window.parentWindow && window.parentOrigin) {
                window.parentWindow.postMessage({type: "nextVideo", title: obj.title}, window.parentOrigin);
            }
        }
    },

    getTitle: function(titt, v) {
        var outPutWord = "<i class='material-icons'>visibility</i>"//v > 1 ? "viewers" : "viewer";
        var title;
        try {
            title = decodeURIComponent(titt);
        } catch(e) {
            title = titt;
        }
        if(window.location.pathname != "/"){
            var elem          = document.getElementById('song-title');
            var getTitleViews = document.getElementById('viewers');

            elem.innerHTML    = title;
            getTitleViews.innerHTML = outPutWord + " " + v;
            elem.title        = title;
            if(chromecastAvailable){
                $("#player_overlay").css("background", "url(https://img.youtube.com/vi/" + video_id + "/hqdefault.jpg)");
                $("#player_overlay").css("background-position", "center");
                $("#player_overlay").css("background-size", "100%");
                $("#player_overlay").css("background-color", "black");
                $("#player_overlay").css("background-repeat", "no-repeat");
                //$("#player_overlay").css("height", "calc(100% - 32px)");
            }
        }
        document.title = title + " • Zoff / "+chan;

    },

    errorHandler: function(newState) {
        if(!user_auth_started) {
            if(newState.data == 5 || newState.data == 100 || newState.data == 101 || newState.data == 150) {
                curr_playing = Player.player.getVideoUrl().replace("https://www.youtube.com/watch?v=", "");
                socket.emit("skip", {error: newState.data, id: video_id, pass: adminpass == "" ? "" : Crypt.crypt_pass(adminpass), channel: chan.toLowerCase(), userpass: embed ? '' : Crypt.crypt_pass(Crypt.get_userpass(chan.toLowerCase()))});

            } else if(video_id !== undefined) {
                Player.loadVideoById(video_id, duration);
            }
        }
    },

    onPlayerReady: function(event) {
        try{
            beginning = true;
            player_ready = true;
            if(!window.MSStream) {
                if(Helper.mobilecheck()){
                    $("#playpause").css("visibility", "hidden");
                    $("#playpause").css("pointer-events", "none");
                    $("#player").css("opacity", "1");
                    if(offline) {
                        setTimeout(function(){
                            $("#channel-load").css("display", "none");
                            $("#playpause").css("visibility", "visible");
                            $("#playpause").css("pointer-events", "all");
                        }, 1500);
                    }
                } else {
                    //$("#channel-load").css("display", "none");
                }
                /*$("#player").css("opacity", "1");*/
                $(".video-container").removeClass("no-opacity");
                $("#controls").css("opacity", "1");
                $(".playlist").css("opacity", "1");
                Player.loadVideoById(video_id, duration);
                if(autoplay && (!Helper.mobilecheck() || chromecastAvailable)) {
                    Player.playVideo();
                }
                if(!durationBegun) {
                    Player.durationSetter();
                }
                if(embed){
                    setTimeout(function(){
                        Player.player.seekTo(seekTo);
                        if(!autoplay){
                            Player.player.pauseVideo();
                            Playercontrols.play_pause_show();
                        }
                    }, 1000);
                }else
                Player.seekTo(seekTo);
            }
            Player.readyLooks();
            Playercontrols.initYoutubeControls(Player.player);
            Playercontrols.initSlider();
            Player.player.setVolume(Crypt.get_volume());
        }catch(e){
        }
    },

    readyLooks: function() {
        //Player.setBGimage(video_id);
    },

    setBGimage: function(c){
        var color = c.color;
        if(window.location.pathname != "/") {
            document.getElementById("main-container").style.backgroundColor = Helper.rgbToHsl(color,true);
            $("meta[name=theme-color]").attr("content", Helper.rgbToHex(color[0], color[1], color[2]));
            var new_color =  Helper.rgbToHex(color[0], color[1], color[2]);
            new_color = Helper.hexToComplimentary(new_color);
            new_color = Helper.hexToRgb(new_color);
            new_color = Helper.rgbToHsl([new_color.r, new_color.g, new_color.b], true);
            $("#controls").css("background", new_color);
        }
    },

    set_width: function(val){
        $(".video-container").width(val);
        if(!Helper.mobilecheck()) {
            if($(window).width() > 769) {
                var test_against_width = $(window).width() - $(".control-list").width() - $(".zbrand").outerWidth() - $(".brand-logo-navigate").outerWidth() - 66;
                title_width = test_against_width;
                $(".title-container").width(title_width);
            } else {
                $(".title-container").width("100%");
            }

        }
    },

    notifyUser: function(id, title) {
        title = title.replace(/\\\'/g, "'").replace(/&quot;/g,"'").replace(/&amp;/g,"&");
        if (Notification.permission === "granted" && document.hidden && !embed) {
            var notification = new Notification("Now Playing", {body: title, icon: "https://i.ytimg.com/vi/"+id+"/mqdefault.jpg", iconUrl: "http://i.ytimg.com/vi/"+id+"/mqdefault.jpg"});
            notification.onclick = function(x) { window.focus(); this.cancel(); };
            setTimeout(function(){
                notification.close();
            },5000);
        }
    },

    setup_all_listeners: function() {
        get_list_listener();
        setup_youtube_listener();
        setup_admin_listener();
        setup_chat_listener();
        setup_list_listener();
    },

    onYouTubeIframeAPIReady: function() {
        Player.player = new YT.Player('player', {
            videoId: video_id,
            playerVars: { rel:"0", wmode:"transparent", controls: "0" , fs: "0", iv_load_policy: "3", theme:"light", color:"white", showinfo: 0},
            events: {
                'onReady': Player.onPlayerReady,
                'onStateChange': Player.onPlayerStateChange,
                'onError': Player.errorHandler
            }
        });
    },

    createFireplacePlayer: function() {
        Player.fireplace = new YT.Player('fireplace_player', {
            videoId: "L_LUpnjgPso",
            playerVars: { rel:"0", wmode:"transparent", controls: "0" , fs: "0", iv_load_policy: "3", theme:"light", color:"white", showinfo: 0},
            events: {
                'onReady': Player.onFireplaceReady,
                'onStateChange': Player.onFireplaceChange
            }
        });
    },

    onFireplaceReady: function() {
        Player.fireplace.playVideo();
    },

    onFireplaceChange: function(newState) {
        switch(newState.data) {
            case 0:
            Player.fireplace.seekTo(0);
            Player.fireplace.playVideo();
            break;
            case 2:
            Player.fireplace.playVideo();
            break;
        }
    },

    durationSetter: function() {
        try{
            if(!user_auth_avoid && duration !== undefined){

                if(!Player.stopInterval) {
                    durationBegun = true;
                }

                dMinutes = Math.floor(duration / 60);
                dSeconds = duration - dMinutes * 60;
                currDurr = Player.player.getCurrentTime() !== undefined ? Math.floor(Player.player.getCurrentTime()) : seekTo;
                if(currDurr - Player.np.start > duration && !offline) {
                    currDurr = duration - Player.np.start;
                }
                currDurr = currDurr - Player.np.start;
                //currDurr = currDurr - Player.np.start;
                minutes = Math.floor(currDurr / 60);
                seconds = currDurr - (minutes * 60);
                if(!isNaN(minutes) && !isNaN(seconds) && !isNaN(dMinutes) && !isNaN(dSeconds)) {
                    $("#duration").html(Helper.pad(minutes)+":"+Helper.pad(seconds)+" <span id='dash'>/</span> "+Helper.pad(dMinutes)+":"+Helper.pad(dSeconds));
                }
                per = (100 / duration) * currDurr;
                if(per >= 100) {
                    per = 100;
                } else if(duration === 0) {
                    per = 0;
                }

                if(embed) {
                    if(window.parentWindow && window.parentOrigin) {
                        window.parentWindow.postMessage({type: "duration", duration: Player.player.getCurrentTime() - Player.np.start, full_duration: Player.player.getDuration() - Player.np.end, percent: per}, window.parentOrigin);
                    }
                }

                if(!dragging) {
                    $("#bar").width(per+"%");
                }

                if(Player.player.getCurrentTime() > Player.np.end && Player.player.getPlayerState() == YT.PlayerState.PLAYING) {
                    end_programmatically = true;
                    Player.player.pauseVideo();

                    if(!offline) {
                        socket.emit("end", {id: video_id, channel: chan.toLowerCase(), pass: embed ? '' : Crypt.crypt_pass(Crypt.get_userpass(chan.toLowerCase()))});
                    } else {
                        Player.playNext();
                    }
                }
            }
        }catch(e){}
        if(!Player.stopInterval) {
            setTimeout(Player.durationSetter, 1000);
        }
    },

    loadPlayer: function() {
        if($("script[src='https://www.youtube.com/iframe_api']").length == 1){
            try{
                Player.onYouTubeIframeAPIReady();
            } catch(error){
                console.error("Seems YouTube iFrame script isn't correctly loaded. Please reload the page.");
            }
        } else {
            tag            = document.createElement('script');
            tag.src        = "https://www.youtube.com/iframe_api";
            firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }
    }

};
