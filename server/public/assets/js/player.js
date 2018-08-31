var Player = {

    loaded: true,
    before_load: "",
    after_load: "",
    player: "",
    stopInterval: false,
    fireplace: "",
    np: {},
    soundcloud_dead: false,
    soundcloud_player: {
        setVolume: function(val) {}
    },

    now_playing_listener: function(obj) {
        if((offline && !local_new_channel) && video_id != undefined) {
            return;
        }
        if(obj.np != undefined) {
            Player.np = obj.np[0];
            Player.np.start = obj.np[0].start;
            Player.np.end = obj.np[0].end;
            Player.np.duration = obj.np[0].duration;
            if(Player.np.start == undefined) Player.np.start = 0;
            if(Player.np.end == undefined) Player.np.end = Player.np.duration;
            song_title = obj.np[0].title;
            duration   = obj.np[0].duration;

            if(offline && (video_id == "" || video_id == undefined || local_new_channel) && !client){
                if(obj.conf != undefined) {
                    conf       = obj.conf[0];
                }
                time       = obj.time;
                seekTo     = 0 + Player.np.start;
                startTime = time - conf.startTime;
                videoSource = obj.np[0].hasOwnProperty("source") ? obj.np[0].source : "youtube";
                Player.getTitle(song_title, viewers);
                Player.loadVideoById(Player.np.id, duration, Player.np.start, Player.np.end);
            } else {
                videoSource = obj.np[0].hasOwnProperty("source") ? obj.np[0].source : "youtube";
            }
            video_id = obj.np[0].id;
        } else {
            Player.np = {
                id: "",
                start: 0,
                end: 0,
                duration: 0,
            };

            document.getElementById('song-title').innerText = "Empty channel. Add some songs!";
            document.title = "Zoff - the shared YouTube based radio";
            Helper.css("#channel-load", "display", "none");

            if(!window.MSStream && !chromecastAvailable) {
                Helper.removeClass("#player_overlay", "hide");
            }
            try{
                if(!chromecastAvailable) {
                    Player.stopVideo();
                }
            }catch(e){

            }
        }
        if(obj.conf != undefined) {
            conf       = obj.conf[0];
            time       = obj.time;
            startTime = time - conf.startTime;
        } else {
            time = 0;
            startTime = 0;
        }

        // Play video/autoplay video
        if(obj.np != undefined && !offline) {
            seekTo     = (time - conf.startTime) + Player.np.start;
            Player.getTitle(song_title, viewers);
            Player.setThumbnail(conf, Player.np.id);
            if(((embed && autoplay) || !embed) && (!was_stopped || buffering) && !client) {
                Helper.log(["loadVideoById \nwas_stopped="+was_stopped+"\noffline="+offline])
                Player.loadVideoById(Player.np.id, duration, Player.np.start, Player.np.end);
            } else if(!client) {
                Helper.log(["cueVideoById \nwas_stopped="+was_stopped+"\noffline="+offline])
                Player.cueVideoById(Player.np.id, duration, Player.np.start, Player.np.end);
            }
        }
        local_new_channel = false;
        updateChromecastMetadata();
    },

    setThumbnail: function(conf, video_id) {
        if(embed) return;
        if(!conf.hasOwnProperty("thumbnail") || conf.thumbnail == "") {
            try {
                if(videoSource == "soundcloud" && full_playlist != undefined) {
                    document.getElementById("thumbnail_image").innerHTML = "<img id='thumbnail_image_channel' src='" + full_playlist[full_playlist.length - 1].thumbnail + "' alt='thumbnail' />";
                } else {
                    document.getElementById("thumbnail_image").innerHTML = "<img id='thumbnail_image_channel' src='https://img.youtube.com/vi/"+video_id+"/mqdefault.jpg' alt='thumbnail' />";
                }
            } catch(e) {}
        }
    },

    onPlayerStateChange: function(newState) {
        Helper.log([
            "onPlayerStateChange",
            "New state\nState: ",
            newState.data
        ]);
        if(Player.player && Player.player.getCurrentTime() > startTime + Player.np.start && !fix_too_far && autoplay)  {
            //Player.seekTo(seekTo);
            //Player.playVideo();
            fix_too_far = true;
        }
        try {
            Helper.log(["Duration: " + Player.player.getDuration(), "Current time: " + Player.player.getCurrentTime()]);
            Helper.log(["getVideoUrl(): " + Player.player.getVideoUrl().split('v=')[1]]);
        } catch(e){}
        Helper.log(["video_id variable: " + video_id]);
        switch(newState.data) {
            case YT.PlayerState.UNSTARTED:
                break;
            case YT.PlayerState.ENDED:
                playing = false;
                paused  = false;
                was_stopped = false;
                if(!offline) {
                    /*var u = Crypt.crypt_pass(Crypt.get_userpass(chan.toLowerCase()), true);
                    if(u == undefined) u = "";*/
                    socket.emit("end", {id: video_id, channel: chan.toLowerCase()});
                } else {
                    Player.playNext();
                }
                break;
            case YT.PlayerState.PLAYING:
                if(videoSource == "soundcloud") {
                    Player.player.stopVideo();
                    //was_stopped = false;
                    return;
                }
                if(embed) {
                    Helper.css("#player", "visibility", "visible");
                }
                if(!embed && !client && window.location.pathname != "/") {
                    if(Helper.mobilecheck()) {
                        Helper.css("#player", "display", "block");
                        Helper.toggleClass(".video-container", "click-through");
                        Helper.toggleClass(".page-footer", "padding-bottom-extra");
                    }
                    resizePlaylistPlaying(newState.data == YT.PlayerState.PLAYING || newState.data == YT.PlayerState.BUFFERING);
                }
                if(embed && !autoplay) autoplay = true;
                Helper.css("#player", "opacity", "1");
                Helper.css("#channel-load", "display", "none");

                Helper.addClass("#player", "pointer-events-all-mobile");
                Helper.removeClass("#video-container", "click-through");
                Helper.addClass("#player", "small-display");
                Helper.css("#playpause", "visibility", "visible");
                Helper.css("#playpause", "pointer-events", "all");
                playing = true;
                buffering = false;
                if(beginning && Helper.mobilecheck() && !chromecastAvailable){
                    //Player.pauseVideo();
                    beginning = false;
                    mobile_beginning = false;

                }
                if(!embed && window.location.pathname != "/" && !chromecastAvailable) Helper.addClass("#player_overlay", "hide");
                if(window.location.pathname != "/"){
                    if(document.getElementById("play").className.split(" ").length == 1)
                        Helper.toggleClass("#play", "hide");
                    if(document.getElementById("pause").className.split(" ").length == 2)
                        Helper.toggleClass("#pause", "hide");

                }
                buffering = false;
                if((paused || was_stopped) && !offline) {
                    /*var u = Crypt.crypt_pass(Crypt.get_userpass(chan.toLowerCase()), true);
                    if(u == undefined) u = "";*/
                    socket.emit('pos', {channel: chan.toLowerCase()});
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
                        was_stopped = true;
                        if(beginning && mobile_beginning) {
                            Helper.css("#playpause", "visibility", "visible");
                            Helper.css("#playpause", "pointer-events", "all");
                            Helper.css("#channel-load", "display", "none");
                        }
                        if(!empty_clear && !gotten_np) {
                            paused = true;
                        }
                        if(gotten_np) gotten_np = false;
                        if(window.location.pathname != "/") Playercontrols.play_pause_show();
                        mobile_beginning = true;
                        if(!embed && !client && window.location.pathname != "/") {
                            if(Helper.mobilecheck()) {
                                Helper.css("#player", "display", "none");
                                Helper.toggleClass(".video-container", "click-through");
                                Helper.toggleClass(".page-footer", "padding-bottom-extra");
                            }
                            resizePlaylistPlaying(newState.data == YT.PlayerState.PLAYING || newState.data == YT.PlayerState.BUFFERING);
                        }
                    }
                }
                Helper.removeClass("#player", "pointer-events-all-mobile");
                Helper.addClass("#video-container", "click-through");
                Helper.removeClass("#player", "small-display");
                break;
            case YT.PlayerState.BUFFERING:
                //was_stopped = false;
                buffering = true;
                resizePlaylistPlaying(newState.data == YT.PlayerState.PLAYING || newState.data == YT.PlayerState.BUFFERING);
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
            if(document.getElementById("pause").classList.contains("hide")){
                Helper.toggleClass("#play", "hide");
                Helper.toggleClass("#pause", "hide");
            }
            //Playercontrols.play_pause();
        } else {
            if(videoSource == "soundcloud") {
                if(!soundcloud_enabled) {
                    console.error("SoundCloud isn't enabled, so can't search on SoundCloud..");
                    return;
                }
                Player.soundcloud_player.play();
                //SC.Widget(document.querySelector("#soundcloud_player")).play();
            } else {
                Player.player.playVideo();
            }
        }
    },

    pauseVideo: function(){
        if(chromecastAvailable){
            castSession.sendMessage("urn:x-cast:zoff.me", {type: "pauseVideo"});
            if(document.getElementById("play").classList.contains("hide")){
                Helper.toggleClass("#play", "hide");
                Helper.toggleClass("#pause", "hide");
            }
            //Playercontrols.play_pause();
        } else {
            paused = true;
            if(videoSource == "soundcloud") {
                if(!soundcloud_enabled) {
                    console.error("SoundCloud isn't enabled, so can't search on SoundCloud..");
                    return;
                }
                Player.soundcloud_player.pause();
                //SC.Widget(document.querySelector("#soundcloud_player")).pause();
            } else {
                Player.player.pauseVideo();
            }
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

    loadSoundCloud: function(id, this_duration, start, end, _autoplay) {
        if(!soundcloud_enabled) {
            console.error("SoundCloud isn't enabled, so can't search on SoundCloud..");
            return;
        }
        try {
            if(SC == null) return;
        } catch(e) {
            return;
        }
        Player.stopVideo();
        if(_autoplay) was_stopped = false;
        Helper.removeClass(document.getElementById("player_overlay"), "hide");
        Helper.css(document.getElementById("player_overlay"), "background-color", "#2d2d2d");
        if(start == undefined) start = 0;
        if(seekTo == undefined) seekTo = 0;
        soundcloud_loading = false;
        var _autoAdd = "false";
        try {
            if(SC == null || !SC.stream) return;
        } catch(e) {
            return;
        }
        if(previousSoundcloud != id || Player.soundcloud_dead) {
            previousSoundcloud = id;
            if(_autoplay) {
                _autoAdd = "true";
                Helper.removeClass("#player_loader_container", "hide");
            }
            SC.stream("/tracks/" + id).then(function(player){
                Player.soundcloud_player = player;
                Player.soundcloud_player.bind("finish", Player.soundcloudFinish);
                Player.soundcloud_player.bind("pause", Player.soundcloudPause);
                Player.soundcloud_player.bind("play", Player.soundcloudPlay);
                window.player = player;
                Player.soundcloud_dead = false;
                SC.get('/tracks', {
                    ids: id
                }).then(function(tracks) {
                    var sound = tracks[0];
                    Helper.removeClass(".soundcloud_info_container", "hide");
                    document.querySelector("#soundcloud_listen_link").href = sound.permalink_url;
                    document.querySelector(".soundcloud_info_container .green").href = sound.user.permalink_url;
                    //document.querySelector(".soundcloud_info_container .red").href = sound.user.permalink_url;
                });
                if(_autoplay) {
                    player.play().then(function(){
                        Player.soundcloud_player.setVolume(embed ? 1 : Crypt.get_volume() / 100);
                        Player.soundcloud_player.seek((seekTo) * 1000);
                    }).catch(function(e){
                    });
                }
            });
        } else {
            try {
                Player.soundcloud_player.seek(seekTo * 1000);
            } catch(e) {}
            try {
                if(_autoplay) {
                    _autoAdd = "true";
                    Player.soundcloud_player.play();
                }
            } catch(e) {}
        }
        soundcloud_loading = true;
        if(start == undefined) start = 0;
        if(seekTo == undefined) seekTo = 0;

        if(_autoplay) was_stopped = false;
        try {
            Helper.css(document.getElementById("player_overlay"), "background",  "url('" + Player.np.thumbnail + "')");
        } catch(e) {
            console.error("Woops this seems to be the first song in the channel. This will be fixed.. soon.. we think..");
        }

        Helper.css(document.getElementById("player_overlay"), "background-size", "auto");
        Helper.css(document.getElementById("player_overlay"), "background-position", "20%");
        Helper.css(document.getElementById("player_overlay"), "background-color", "#2d2d2d");
        Helper.addClass("#player_overlay_text", "hide");
    },

    loadVideoById: function(id, this_duration, start, end){
        if(id == undefined) return;
        var s;
        var e;
        if(start) s = start;
        else s = Player.np.start;
        if(end) e = end;
        else e = Player.np.end;
        if(!embed) {
            Suggestions.fetchYoutubeSuggests(id);
        }
        if(chromecastAvailable){
            //castSession.sendMessage("urn:x-cast:zoff.me", {start: s, end: e, type: "loadVideo", videoId: id, channel: chan.toLowerCase(), source: videoSource, thumbnail: Player.np.thumbnail, title: Player.np.title});
            loadChromecastVideo();
            chrome.cast.media.GenericMediaMetadata({metadataType: 0, title:song_title, image: 'https://img.youtube.com/vi/'+id+'/mqdefault.jpg', images: ['https://img.youtube.com/vi/'+id+'/mqdefault.jpg']});
            chrome.cast.Image('https://img.youtube.com/vi/'+id+'/mqdefault.jpg');
        } else {
            if(!durationBegun) {
                durationBegun = true;
                Player.durationSetter();
            }
            if(videoSource == "soundcloud") {
                try {
                    Player.player.stopVideo();
                } catch(e) {
                }

                was_stopped = false;
                Player.loadSoundCloud(id, this_duration, start, end, true);
                //SC.Widget(Player.soundcloud_player).play();
            } else {
            //window.player = Player.player;
                try {
                    Player.soundcloud_player.pause();
                } catch(e) {
                }
                Helper.addClass(".soundcloud_info_container", "hide");
                Helper.addClass(document.getElementById("player_overlay"), "hide");
                Helper.css(document.getElementById("player_overlay"), "background",  "none");
                Helper.addClass("#player_overlay_text", "hide");
                Helper.addClass(document.getElementById("player_overlay"), "hide");
                Helper.css(document.getElementById("player_overlay"), "display", "none !important");
                if(embed) {
                    Helper.css("#player", "visibility", "visible");
                }
                try {
                    if(Player.player.getVideoUrl().indexOf(id) > -1) {
                        Player.player.seekTo(seekTo);
                    } else {
                        Player.player.loadVideoById({'videoId': id, 'startSeconds': seekTo, 'endSeconds': e});
                    }
                } catch(e) {
                }
            }
        }
        if(offline && !embed) {
            var url = 'https://img.youtube.com/vi/'+id+'/mqdefault.jpg';
            if(videoSource == "soundcloud") url = Player.np.thumbnail;
            getColor(url);
        }
    },

    cueVideoById: function(id, this_duration, start, end){
        var s;
        var e;
        if(start) s = start;
        else s = Player.np.start;
        if(end) e = end;
        else e = Player.np.end;
        if(!embed) {
            Suggestions.fetchYoutubeSuggests(id);
        }
        if(!durationBegun) {
            durationBegun = true;
            Player.durationSetter();
        }
        was_stopped = true;
        Helper.addClass("#pause", "hide");
        Helper.removeClass("#play", "hide");
        if(videoSource == "soundcloud") {
            try {
                Player.player.stopVideo();
            } catch(e) {
            }
            Player.loadSoundCloud(id, this_duration, start, end, false);
                //SC.Widget(Player.soundcloud_player).play();

        } else {
            try {
                Player.soundcloud_player.pause();
            } catch(e) {
            }
            Helper.addClass(document.getElementById("player_overlay"), "hide");
            Helper.css(document.getElementById("player_overlay"), "background",  "none");
            Helper.addClass("#player_overlay_text", "hide");
            Helper.addClass(document.getElementById("player_overlay"), "hide");
            try {
                Player.player.cueVideoById({'videoId': id, 'startSeconds': s, 'endSeconds': e});
            } catch(e) {
            }
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
            Player.soundcloud_player.setVolume(vol / 100);
        }
    },

    playNext: function(){
        if(full_playlist == undefined || full_playlist.length == 0) return;
	    var next_song = full_playlist[0];

        video_id   = next_song.id;
        time       = (new Date()).getTime();
        song_title = next_song.title;
        duration   = next_song.duration;
        videoSource = next_song.hasOwnProperty("source") ? next_song.source : "youtube";
        var start;
        var end;
        if(next_song.hasOwnProperty("start")) start = next_song.start;
        else start = 0;
        if(next_song.hasOwnProperty("end")) end = next_song.end;
        else end = duration;
        Player.np = next_song;
        Player.np.start = start;
        Player.np.end = end;
        //seekTo = 0;
        Player.np.duration = duration;


        Player.getTitle(song_title, viewers);
        seekTo = start;
        //Player.setBGimage(video_id);
        if(chromecastAvailable){
            loadChromecastVideo();
            //castSession.sendMessage("urn:x-cast:zoff.me", {type: "loadVideo", videoId: video_id, channel: chan.toLowerCase(), start: start, end:end, source: videoSource});
            chrome.cast.media.GenericMediaMetadata({metadataType: 0, title:song_title, image: 'https://img.youtube.com/vi/'+video_id+'/mqdefault.jpg', images: ['https://img.youtube.com/vi/'+video_id+'/mqdefault.jpg']});
            chrome.cast.Image('https://img.youtube.com/vi/'+video_id+'/mqdefault.jpg');
        } else {

            Player.loadVideoById(video_id, duration, start, end);
        }
        List.channel_function({type:"song_change", time: time, offline_change: true});
    },

    playPrev: function() {
        if(full_playlist == undefined) return;
        var length = full_playlist.length - 2;
        if(length < 0) {
            length = 0;
        } else if(length == 0) return;
        var next_song = full_playlist[length];
        video_id   = next_song.id;
        time       = (new Date()).getTime();
        song_title = next_song.title;
        duration   = next_song.duration;
        videoSource = next_song.hasOwnProperty("source") ? next_song.source : "youtube";
        var start;
        var end;
        if(next_song.hasOwnProperty("start")) start = next_song.start;
        else start = 0;
        if(next_song.hasOwnProperty("end")) end = next_song.end;
        else end = duration;

        Player.np = next_song;
        Player.np.start = start;
        Player.np.end = end;
        Player.np.duration = duration;
        seekTo = start;
        Player.getTitle(song_title, viewers);
        //Player.setBGimage(video_id);

        if(chromecastAvailable){
            loadChromecastVideo();
            //castSession.sendMessage("urn:x-cast:zoff.me", {type: "loadVideo", videoId: video_id, channel: chan.toLowerCase(), start: start, end: end, source: videoSource});
            chrome.cast.media.GenericMediaMetadata({metadataType: 0, title:song_title, image: 'https://img.youtube.com/vi/'+video_id+'/mqdefault.jpg', images: ['https://img.youtube.com/vi/'+video_id+'/mqdefault.jpg']});
            chrome.cast.Image('https://img.youtube.com/vi/'+video_id+'/mqdefault.jpg');
        } else {
            Player.loadVideoById(video_id, duration, start, end);
        }

        List.channel_function({type:"song_change_prev", time: time, offline_change: true});
    },

    sendNext: function(obj){
        if(chromecastAvailable){
            castSession.sendMessage("urn:x-cast:zoff.me", {type: "nextVideo", title: obj.title, videoId: obj.videoId, source: obj.source, thumbnail: obj.thumbnail});
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
            //var elem          = document.getElementById('song-title');
            //var getTitleViews = document.getElementById('viewers');

            if(!client && !embed) {
                document.getElementById("host-title").innerText = title;
            }
            document.getElementById("song-title").innerText = title;
            if(!client) document.getElementById("viewers").innerHTML = outPutWord + " " + v;
            document.getElementById("song-title").setAttribute("title", title);
            //elem.title        = title;
            if(chromecastAvailable){
                Helper.css("#player_overlay", "background", "url(https://img.youtube.com/vi/" + video_id + "/hqdefault.jpg)");
                Helper.css("#player_overlay", "background-position", "center");
                Helper.css("#player_overlay", "background-size", "100%");
                Helper.css("#player_overlay", "background-color", "black");
                Helper.css("#player_overlay", "background-repeat", "no-repeat");
                //$("#player_overlay").css("height", "calc(100% - 32px)");
            }
        }
        document.title = title + " • Zoff / "+chan;

    },

    errorHandler: function(newState) {
        if(!user_auth_started) {
            if(newState.data == 5 || newState.data == 100 || newState.data == 101 || newState.data == 150) {
                curr_playing = Player.player.getVideoUrl().replace("https://www.youtube.com/watch?v=", "");
                /*var u = Crypt.crypt_pass(Crypt.get_userpass(chan.toLowerCase()), true);
                if(u == undefined) u = "";*/
                emit("skip", {error: newState.data, id: video_id, channel: chan.toLowerCase()});

            } else if(video_id !== undefined) {
                Player.loadVideoById(video_id, duration);
            }
        }
    },

    soundcloudFinish: function() {
        playing = false;
        paused  = false;
        end_programmatically = true;
        if(!offline) {
            /*var u = Crypt.crypt_pass(Crypt.get_userpass(chan.toLowerCase()), true);
            if(u == undefined) u = "";*/
            socket.emit("end", {id: video_id, channel: chan.toLowerCase()});
        } else {
            Player.playNext();
        }
    },

    soundcloudPause: function() {
        if(end_programmatically) {
            paused = false;
            playing = false;
            end_programmatically = false;
        } else {
            was_stopped = true;
            if(!embed && !client && window.location.pathname != "/") {
                var scPlaying = false;
                try {
                    scPlaying = Player.soundcloud_player.isPlaying();
                } catch(e){}
                resizePlaylistPlaying(Player.player.getPlayerState() == YT.PlayerState.PLAYING || scPlaying || Player.player.getPlayerState() == YT.PlayerState.BUFFERING);
            }
            if(!chromecastAvailable){
                if(Helper.mobilecheck()) {
                    Helper.css("#playpause", "visibility", "visible");
                    Helper.css("#playpause", "pointer-events", "all");
                    Helper.css("#channel-load", "display", "none");
                }
                if(!empty_clear && !gotten_np) {
                    paused = true;
                }
                if(gotten_np) gotten_np = false;
                if(window.location.pathname != "/") Playercontrols.play_pause_show();
                mobile_beginning = true;
            }
            Helper.removeClass("#play", "hide");
            Helper.addClass("#pause", "hide");
        }
    },

    soundcloudPlay: function() {
        Helper.addClass("#player_loader_container", "hide");
        Helper.css(document.getElementById("player_overlay"), "display", "block");
        if(videoSource == "youtube") {
            Player.soundcloud_player.pause();
        } else if(soundcloud_loading){
            Player.soundcloud_player.seek((seekTo) * 1000);
            Player.soundcloud_player.setVolume(embed ? 1 : Crypt.get_volume() / 100);
            soundcloud_loading = false;
        }
        if(embed) {
            Helper.css("#player", "visibility", "visible");
        }
        if(embed && !autoplay) autoplay = true;
        if(!window.MSStream) {
            Helper.css("#player", "opacity", "1");
            //if(!Helper.mobilecheck()) {
                Helper.css("#channel-load", "display", "none");

            //}
        }
        if(!embed && !client && window.location.pathname != "/") {
            var scPlaying = false;
            try {
                scPlaying = Player.soundcloud_player.isPlaying();
            } catch(e){}
            resizePlaylistPlaying(scPlaying);
        }

        Helper.css("#playpause", "visibility", "visible");
        Helper.css("#playpause", "pointer-events", "all");
        playing = true;
        if(beginning && Helper.mobilecheck() && !chromecastAvailable){
            //Player.pauseVideo();
            beginning = false;
            mobile_beginning = false;

        }
        //if(!embed && window.location.pathname != "/" && !chromecastAvailable) Helper.addClass("#player_overlay", "hide");
        if(window.location.pathname != "/"){
                Helper.addClass("#play", "hide");
                Helper.removeClass("#pause", "hide");
        }
        if((was_stopped) && !offline) {
            /*var u = Crypt.crypt_pass(Crypt.get_userpass(chan.toLowerCase()), true);
            if(u == undefined) u = "";*/
            paused = false;
            was_stopped = false;
            socket.emit('pos', {channel: chan.toLowerCase()});
        } else {
            paused = false;
            was_stopped = false;
        }

    },

    soundcloudReady: function() {
        if(SC == undefined && sc_need_initialization) {
            sc_need_initialization = true;
            return;
        }
        sc_need_initialization = false;
        try {
            SC.initialize({
              client_id: api_key.soundcloud
            }, function() {
            });
        } catch(e) {
            sc_need_initialization = true;
            return;
        }
        beginning = true;
        player_ready = true;
        if(!durationBegun) {
            Player.durationSetter();
        }
        if(videoSource == "soundcloud" && video_id != undefined) Player.loadVideoById(video_id, Player.np.duration, Player.np.start, Player.np.end);
    },

    onPlayerReady: function(event) {
        try{
            beginning = true;
            player_ready = true;
            //if(!window.MSStream) {
                if(Helper.mobilecheck()){
                    /*Helper.css("#playpause", "visibility", "hidden");
                    Helper.css("#playpause", "pointer-events", "none");*/
                    Helper.css("#player", "opacity", "1");
                    if(offline) {
                        setTimeout(function(){
                            Helper.css("#channel-load", "display", "none");
                            Helper.css("#playpause", "visibility", "visible");
                            Helper.css("#playpause", "pointer-events", "all");
                        }, 1500);
                    }
                } else {
                    //$("#channel-load").css("display", "none");
                }
                /*$("#player").css("opacity", "1");*/
                Helper.removeClass(".video-container", "no-opacity");
                Helper.css("#controls", "opacity", "1");
                Helper.css(".playlist", "opacity", "1");
                if(autoplay) {
                    Player.loadVideoById(video_id, duration);
                } else {
                    Player.cueVideoById(video_id, duration);
                }
                if(autoplay && (!Helper.mobilecheck() || chromecastAvailable)) {
                    //Player.playVideo();
                }
                if(!durationBegun) {
                    Player.durationSetter();
                }
                /*if(embed){
                    //setTimeout(function(){
                        //Player.player.seekTo(seekTo);
                        if(!autoplay){
                            Player.player.stopVideo();
                            Playercontrols.play_pause_show();
                        } else {
                            Player.seekTo(seekTo);
                        }
                    //}, 1000);
                }else
                Player.seekTo(seekTo);*/
            //}
            Player.player.setVolume(Crypt.get_volume());
            Player.readyLooks();
            Playercontrols.initYoutubeControls(Player.player);
            Playercontrols.initSlider();
        }catch(e){
        }
    },

    readyLooks: function() {
        //Player.setBGimage(video_id);
    },

    setBGimage: function(c){
        var color = c.color;
        if(window.location.pathname != "/" && ((offline && c.only) || (!offline && !c.only) || (!offline && c.only))) {
            document.getElementById("main-container").style.backgroundColor = Helper.rgbToHsl(color,true);
            Helper.css("#nav", "background-color", Helper.rgbToHsl(color, true));
            Helper.css(".title-container", "background-color", Helper.rgbToHsl(color, true));
            var hexHsl = Helper.rgbToHex(color[0], color[1], color[2]);
            try {
                var hsl = Helper.rgbToHsl(color, true).replace("hsl(", "").replace(")", "").replace("%", "").replace(/ /g,'').replace("%", "").split(",");
                hexHsl = Helper.hslToHex(parseInt(hsl[0]), parseInt(hsl[1]), parseInt(hsl[2]));
            } catch(e) {}
            document.querySelector("meta[name=theme-color]").setAttribute("content", hexHsl);
            if(!client) {
                var new_color =  Helper.rgbToHex(color[0], color[1], color[2]);
                new_color = Helper.hexToComplimentary(new_color);
                new_color = Helper.hexToRgb(new_color);
                new_color = Helper.rgbToHsl([new_color.r, new_color.g, new_color.b], true);
                Helper.css("#controls", "background", new_color);
            }
        }
    },

    set_width: function(val){
        document.getElementsByClassName("video-container")[0].style.width = val + "px";
        if(!Helper.mobilecheck()) {
            if(window.innerWidth > 769) {
                var test_against_width = window.innerWidth - Helper.computedStyle(".control-list", "width") - document.querySelector(".zbrand").offsetWidth - document.querySelector(".brand-logo-navigate").offsetWidth - 66;
                title_width = test_against_width;
                document.querySelector(".title-container").style.width = title_width + "px";
            } else {
                document.querySelector(".title-container").style.width = "100%";
            }

        }
    },

    notifyUser: function(id, title) {
        title = title.replace(/\\\'/g, "'").replace(/&quot;/g,"'").replace(/&amp;/g,"&");
        try{
	if (Notification != undefined && Notification.permission === "granted" && document.hidden && !embed) {
            var icon = "https://img.youtube.com/vi/"+id+"/mqdefault.jpg";
            if(videoSource) icon = full_playlist[full_playlist.length - 1].thumbnail;
            var notification = new Notification("Now Playing", {body: title, icon: icon, iconUrl: icon});
            notification.onclick = function(x) { window.focus(); this.cancel(); };
            setTimeout(function(){
                notification.close();
            },5000);
        }
	}catch(e){}
    },

    setup_all_listeners: function() {
        get_list_listener();
        setup_now_playing_listener();
        setup_admin_listener();
        setup_chat_listener();
        setup_list_listener();
    },

    onYouTubeIframeAPIReady: function() {
        try {
            Player.player = new YT.Player('player', {
                videoId: video_id,
                playerVars: { rel:"0", autoplay: 1, wmode:"transparent", controls: "0" , fs: "0", iv_load_policy: "3", theme:"light", color:"white", showinfo: 0},
                events: {
                    'onReady': Player.onPlayerReady,
                    'onStateChange': Player.onPlayerStateChange,
                    'onError': Player.errorHandler
                }
            });
        } catch(e) {
            console.log("YouTube not quite loaded yet");
        }
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
                if(videoSource == "soundcloud") {
                    currDurr = Math.floor(Player.soundcloud_player.currentTime()) / 1000;
                } else {
                    currDurr = Player.player.getCurrentTime() !== undefined ? Math.floor(Player.player.getCurrentTime()) : seekTo;
                }

                if(currDurr - Player.np.start > duration && !offline) {
                    currDurr = duration - Player.np.start;
                }
                currDurr = currDurr - Player.np.start;
                //currDurr = currDurr - Player.np.start;
                minutes = Math.floor(currDurr / 60);
                seconds = currDurr - (minutes * 60);
                if(!isNaN(minutes) && !isNaN(seconds) && !isNaN(dMinutes) && !isNaN(dSeconds)) {
                    Helper.setHtml("#duration", Helper.pad(minutes)+":"+Helper.pad(seconds)+" <span id='dash'>/</span> "+Helper.pad(dMinutes)+":"+Helper.pad(dSeconds));
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
                    document.getElementById("bar").style.width = per+"%";
                }
                if(videoSource == "soundcloud") {
                        if(Math.ceil(currDurr) + 1 > Player.np.end && Player.soundcloud_player.isPlaying()) {
                            end_programmatically = true;
                            if(!offline) {
                                Player.soundcloud_player.pause();
                                was_stopped = false;
                                socket.emit("end", {id: video_id, channel: chan.toLowerCase()});
                            } else {
                                Player.playNext();
                            }
                        }
                } else {
                    if(Math.ceil(Player.player.getCurrentTime()) >= Player.np.end && (Player.player.getPlayerState() == YT.PlayerState.PLAYING)) {
                        end_programmatically = true;

                        if(!offline) {
                            Player.player.pauseVideo();
                            was_stopped = false;
                            socket.emit("end", {id: video_id, channel: chan.toLowerCase()});
                        } else {
                            Player.playNext();
                        }
                    } else if(Math.ceil(Player.player.getCurrentTime()) < Player.np.end && Player.player.getState() != YT.PlayerState.PLAYING && !was_stopped) {
                        Player.player.playVideo();
                    }
                }
            }
        }catch(e){}
        if(!Player.stopInterval) {
            setTimeout(Player.durationSetter, 1000);
        }
    },

    loadPlayer: function(notify) {
        if(document.querySelectorAll("script[src='https://www.youtube.com/iframe_api']").length == 1){
            try{
                Player.onYouTubeIframeAPIReady();
                //SC.Widget(Player.soundcloud_player).bind("ready", Player.soundcloudReady);

            } catch(error){
                console.error(error);
                console.error("Seems YouTube iFrame script isn't correctly loaded. Please reload the page.");
            }

        } else {
            tag            = document.createElement('script');
            tag.src        = "https://www.youtube.com/iframe_api";
            firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        Player.loadSoundCloudPlayer();
    },

    loadSoundCloudPlayer: function() {
        if(document.querySelectorAll("script[src='https://connect.soundcloud.com/sdk/sdk-3.3.0.js']").length == 1) {
            try {
                Player.soundcloudReady();
            } catch(error) {
                sc_need_initialization = true;
                //console.error(error);
                //console.error("Seems SoundCloud script isn't correctly loaded. Please reload the page.");
            }
        } else {
            tagSC            = document.createElement('script');
            if (tagSC.readyState){  //IE
                tagSC.onreadystatechange = function(){
                    if (tagSC.readyState == "loaded" ||
                            tagSC.readyState == "complete"){
                        tagSC.onreadystatechange = null;
                        Player.soundcloudReady();
                    }
                };
            } else {  //Others
                tagSC.onload = function(){
                    Player.soundcloudReady();
                };
            }
            tagSC.src        = "https://connect.soundcloud.com/sdk/sdk-3.3.0.js";
            firstScriptTagSC = document.getElementsByTagName('script')[0];
            firstScriptTagSC.parentNode.insertBefore(tagSC, firstScriptTagSC);
        }
    }

};
