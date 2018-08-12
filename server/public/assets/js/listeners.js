var chan = window.chan === undefined && document.querySelectorAll("#chan").length > 0 ? document.querySelector("#chan").innerText : window.chan;
var w_p = true;
var domain = window.location.host.split(".");
var client = false;
if(domain.length > 0 && domain[0] == "client") {
    client = true;
}
var soundcloud_enabled = true;
var local_new_channel = false;
var hiddenPlaylist = false;
var videoSource;
var dynamicListeners = {};
var socket_connected = false;
var hasadmin = 0;
var hostMode = false;
var soundcloud_loading = false;
var buffering = false;
var list_html = document.querySelectorAll("#list-song-html").length > 0 ? document.querySelector("#list-song-html").innerHTML : undefined;
var unseen = false;
var searching = false;
var time_regex = /P((([0-9]*\.?[0-9]*)Y)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)W)?(([0-9]*\.?[0-9]*)D)?)?(T(([0-9]*\.?[0-9]*)H)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)S)?)?/;
var end_programmatically = false;
var _kWay = "38384040373937396665";
var _kT = "";
var _kDone = false;
var music = 0;
var was_stopped = Helper.mobilecheck() ? true : false;
var timed_remove_check;
var slider_type = Helper.mobilecheck() ? "vertical" : "horizontal";
var programscroll = false;
var lastCommand;
var tried_again = false;
var userscroll = false;
var gotten_np   = false;
var frontpage = 1;
var adminpass = "";
var showDiscovery = false;
var player_ready = false;
var viewers = 1;
var temp_user_pass = "";
var zoff_api_token = "DwpnKVkaMH2HdcpJT2YPy783SY33byF5/32rbs0+xdU=";
if(window.location.hostname == "localhost" || window.location.hostname == "client.localhost") {
    var zoff_api_token = "AhmC4Yg2BhaWPZBXeoWK96DAiAVfbou8TUG2IXtD3ZQ=";
}
var retry_frontpage;
var previousSoundcloud;
var chromecast_specs_sent = false;
var dragging = false;
var user_auth_started = false;
var beginning = false;
var empty_clear = false;
var user_auth_avoid = false;
var user_change_password = false;
var paused = false;
var currently_showing_channels 	= 1;
var playing = false;
var SAMPLE_RATE = 6000; // 6 seconds
var lastSample = Date.now();
var fireplace_initiated = false;
var began = false;
var userpass = "";
var i = -1;
var lazy_load = false;
var embed = false;
var autoplay = Helper.mobilecheck() ? false : true;
var durationBegun = false;
var chat_active = false;
var chat_unseen = false;
var blinking = false;
var from_frontpage = false;
var access_token_data = {};
var spotify_authenticated = false;
var not_import_html = "";
var not_export_html = "";
var embed_height = 300;
var embed_width = 600;
var embed_videoonly = "";
var embed_autoplay = "&autoplay";
var connect_error = false;
var access_token_data_youtube = {};
var youtube_authenticated = false;
var chromecastAvailable = false;
var color = "808080";
var find_start = false;
var find_started = false;
var offline = false;
var cast_ready_connect = false;
var number_suggested = 0;
var prev_chan_list = "";
var changing_to_frontpage = false;
var prev_chan_player = "";
var chromecastReady = false;
var find_word = "";
var found_array = [];
var found_array_index = 0;
var startTime = 0;
var fix_too_far = false;
var guid = "";
var castSession;
var width_timeout;
var tap_target_timeout;

if(localStorage.debug === undefined){
    var debug = false;
    localStorage.debug = debug;
}

var image_timeout;
var result_html;
var empty_results_html;
var pagination_buttons_html;
var mobile_beginning;
var timeout_search;
var id;
var full_playlist;
var conf;
var tag;
var firstScriptTag;
var viewers;
var video_id;
var seekTo;
var song_title;
var socket;
var connection_options = {
    'sync disconnect on unload':true,
    'secure': true,
    'force new connection': true
};
var fromFront = false;
var fromChannel = false;

try{
    if (navigator.serviceWorker && window.location.host != "zoff.dev") {
        navigator.serviceWorker.register('/service-worker.js', {scope: '/'})
        .then(function (registration) {
            Helper.log(registration);
        })
        .catch(function (event) {
            console.error(event);
        });
    } else {
        Helper.log('Service Worker is not supported in this browser.');
    }
    /*
    navigator.serviceWorker.getRegistration('/').then(function(registration) {
    if(registration) {
    registration.unregister();
}
});*/

} catch(event) {}

window.zoff = {
    enable_debug: enable_debug,
    disable_debug: disable_debug
}

if(!Helper.mobilecheck() && (window.location.host != "localhost" && window.location.host != "client.localhost")) {
    window.onerror = function(e, source, lineno, colno, error) {
        if(e == "Script error." || e.toString().indexOf(" ReferenceError: pagespeed is not defined") > -1) return true;
        Helper.logs.unshift({log: e.toString().replace(/(\r\n|\n|\r)/gm,""), date: new Date(), lineno: lineno, colno: colno, source:source});
        Helper.logs.unshift({log: chan != "" && chan != undefined ? chan.toLowerCase() : "frontpage", date: new Date()});

        try {
            document.querySelector(".contact-form-content").remove();
            document.querySelector("#submit-contact-form").remove();
            document.querySelector(".contact-modal-header").innerText = "An error occurred";
            document.querySelector(".contact-container-info").remove();
            document.querySelector(".contact-modal-footer").insertAdjacentHTML("beforeend", '<a href="#!" class="waves-effect waves-green btn-flat send-error-modal">Send</a>');
            document.querySelector("#contact-form").setAttribute("id", "error-report-form");
            document.querySelector("#contact-container").insertAdjacentHTML("afterbegin", '<p>Do you want to send an error-report?</p> \
            <p class="error-report-success"></p> \
            <div class="error-code-container"> \
            <code id="error-report-code"></code> \
            </div>');
        } catch(e){}
        M.Modal.init(document.getElementById("contact"));
        M.Modal.getInstance(document.getElementById("contact")).open();
        var cache = [];
        Helper.setHtml("#error-report-code", JSON.stringify(Helper.logs, function(key, value) {
            if (typeof value === 'object' && value !== null) {
                if (cache.indexOf(value) !== -1) {
                    // Duplicate reference found
                    try {
                        // If this value does not reference a parent it can be deduped
                        return JSON.parse(JSON.stringify(value));
                    } catch (error) {
                        // discard key if value cannot be deduped
                        return;
                    }
                }
                // Store value in our collection
                cache.push(value);
            }
            return value;
        }, 4));
        cache = null;
        //console.error(e.originalEvent.error);
        return true;
    };
}

window.addEventListener("DOMContentLoaded", function() {
    if(!localStorage.getItem("VERSION") || parseInt(localStorage.getItem("VERSION")) != VERSION) {
        localStorage.setItem("VERSION", VERSION);
    }

    if(!fromFront && window.location.pathname != "/") Channel.init();
    else if(!fromChannel && window.location.pathname == "/"){
        Frontpage.init();
    }
    if(window.location.pathname == "/" && !client) {
        if(document.querySelectorAll("script[src='https://www.youtube.com/iframe_api']").length == 1){

        } else {
            tag            = document.createElement('script');
            tag.src        = "https://www.youtube.com/iframe_api";
            firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }
        if(document.querySelectorAll("script[src='https://connect.soundcloud.com/sdk/sdk-3.3.0.js']").length == 1) {

        } else {
            tagSC            = document.createElement('script');
            if (tagSC.readyState){  //IE
                tagSC.onreadystatechange = function(){
                    if (tagSC.readyState == "loaded" ||
                            tagSC.readyState == "complete"){
                        tagSC.onreadystatechange = null;
                        SC.initialize({
                          client_id: api_key.soundcloud
                        }, function() {
                        });
                    }
                };
            } else {  //Others
                tagSC.onload = function(){
                    SC.initialize({
                      client_id: api_key.soundcloud
                    }, function() {
                    });
                };
            }
            tagSC.src        = "https://connect.soundcloud.com/sdk/sdk-3.3.0.js";
            firstScriptTagSC = document.getElementsByTagName('script')[0];
            firstScriptTagSC.parentNode.insertBefore(tagSC, firstScriptTagSC);
        }
    } else if(window.location.pathname == "/" && client) {
        Player.loadSoundCloudPlayer();
    }

    if(Helper.mobilecheck()) {
        socket.on("guid", function(msg) {
            guid = msg;
        });
    }

    M.Modal.init(document.getElementById("donate"));

    socket.on("connect", function(){
        if(chromecastAvailable) {
            socket.emit("get_id");
        }
        if(connect_error){
            connect_error = false;
            if(offline) {
                socket.emit("offline", {status: true, channel: chan != undefined ? chan.toLowerCase() : ""});
            }

            /*if(chan != undefined && (Crypt.get_pass(chan.toLowerCase()) !== undefined && Crypt.get_pass(chan.toLowerCase()) !== "")){
            emit("password", {password: Crypt.crypt_pass(Crypt.get_pass(chan.toLowerCase())), channel: chan.toLowerCase()});
        }*/
        /*$(".connect_error").fadeOut(function(){
        $(".connect_error").remove();
        M.toast({ html: "Connected!", displayLength: 2000, classes: "green lighten"});
    });*/
        var to_remove = document.querySelector(".connect_error");
        if(to_remove != null) {
            var instance = M.Toast.getInstance(to_remove);
            instance.dismiss();
        }
        M.toast({ html: "Connected!", displayLength: 2000, classes: "green lighten"});
        //before_toast();
    }
    Chat.namechange("", true, true);
});

/*socket.on("name", function(data) {
if(data.type == "name" && data.accepted) {
Crypt.set_name(temp_name, temp_pass);
temp_name = "";
temp_pass = "";
} else {
temp_name = "";
temp_pass = "";
}
});*/

socket.on("self_ping", function() {
    if(chan != undefined && chan.toLowerCase() != "") {
        socket.emit("self_ping", {channel: chan.toLowerCase()});
    }
});

setup_no_connection_listener();
}, false);

initializeCastApi = function() {
    try {
        if(cast == undefined) return;
    } catch(event) {
        return;
    }
    cast.framework.CastContext.getInstance().setOptions({
        receiverApplicationId: "E6856E24",
        autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
    });
    var context = cast.framework.CastContext.getInstance();
    chromecastReady = true;
    context.addEventListener(cast.framework.CastContextEventType.SESSION_STATE_CHANGED, function(event) {
        Helper.log([
            "session state",
            event.sessionState
        ]);
        switch (event.sessionState) {
            case cast.framework.SessionState.SESSION_STARTED:
                castSession = cast.framework.CastContext.getInstance().getCurrentSession();
                castSession.addMessageListener("urn:x-cast:zoff.me", chromecastListener)
                updateChromecastMetadata();
                //chrome.cast.Image('https://img.youtube.com/vi/'+video_id+'/mqdefault.jpg');
                chromecastAvailable = true;
                paused = false;
                mobile_beginning = false;

                //console.log("request here", request);
                //castSession.sendMessage("urn:x-cast:zoff.me", {type: "loadVideo", start: Player.np.start, end: Player.np.end, videoId: video_id, seekTo: _seekTo, channel: chan.toLowerCase(), source: videoSource, thumbnail: Player.np.thumbnail})
                castSession.sendMessage("urn:x-cast:zoff.me", {type: "nextVideo", videoId: full_playlist[0].id, title: full_playlist[0].title, source: full_playlist[0].source, thumbnail: full_playlist[0].thumbnail})
                loadChromecastVideo();
                if(window.location.hostname.indexOf("zoff.me") > -1 && !offline && window.location.hostname.indexOf("localhost") == -1) {
                    socket.emit("get_id");
                }
                hide_native(1);
                if(Helper.mobilecheck()) {
                    Player.playVideo();
                }
                Helper.css("#channel-load", "display", "none");
                Helper.addClass('.castButton', 'castButton-white-active');
                Helper.css("#playpause", "visibility", "visible");
                Helper.css("#playpause", "pointer-events", "all");
                break;
            case cast.framework.SessionState.SESSION_RESUMED:
                castSession = cast.framework.CastContext.getInstance().getCurrentSession();
                castSession.addMessageListener("urn:x-cast:zoff.me", chromecastListener);
                updateChromecastMetadata();
                //chrome.cast.Image('https://img.youtube.com/vi/'+video_id+'/mqdefault.jpg');
                chromecastAvailable = true;
                paused = false;
                mobile_beginning = false;

                if(window.location.hostname.indexOf("zoff.me") > -1 && !offline && window.location.hostname.indexOf("localhost") == -1) {
                    socket.emit("get_id");
                }
                loadChromecastVideo();
                //castSession.sendMessage("urn:x-cast:zoff.me", {type: "loadVideo", start: Player.np.start, end: Player.np.end, videoId: video_id, seekTo: _seekTo, channel: chan.toLowerCase(), source: videoSource, thumbnail: Player.np.thumbnail})
                castSession.sendMessage("urn:x-cast:zoff.me", {type: "nextVideo", videoId: full_playlist[0].id, title: full_playlist[0].title, source: full_playlist[0].source, thumbnail: full_playlist[0].thumbnail})
                hide_native(1);
                Helper.css("#channel-load", "display", "none");
                Helper.addClass('.castButton', 'castButton-white-active');
                Helper.css("#playpause", "visibility", "visible");
                Helper.css("#playpause", "pointer-events", "all");
                break;
            case cast.framework.SessionState.SESSION_ENDED:
                chromecastAvailable = false;
                hide_native(0);
                break;
        }
    });

    context.addEventListener(cast.framework.CastContextEventType.CAST_STATE_CHANGED, function(event){
        Helper.log([
            "cast state",
            event.castState
        ]);
        if(event.castState == "NOT_CONNECTED"){
            Helper.css(".castButton", "display", "block");
            Helper.addClass(".volume-container", "volume-container-cast");
            cast_ready_connect = true;
            if((!localStorage.getItem("_chSeen") || localStorage.getItem("_chSeen") != "seen") && !client) {
                Helper.css(".castButton", "display", "block");
                showDiscovery = true;
                var elem = document.querySelector('.tap-target');
                var instance = M.TapTarget.init(elem);
                instance.open();
                tap_target_timeout = setTimeout(function() {
                    instance.close();
                }, 4000);
                localStorage.setItem("_chSeen", "seen");
                Helper.removeClass('.castButton', 'castButton-white-active');
            }
        } else if(event.castState == "NO_DEVICES_AVAILABLE"){
            cast_ready_connect = false;
            Helper.removeClass(".volume-container", "volume-container-cast");
        }
    });

    if(context.getCastState() == "NOT_CONNECTED") {
        Helper.css(".castButton", "display", "block");
        Helper.removeClass('.castButton', 'castButton-white-active');
        cast_ready_connect = true;
    }
};

addListener("click", "#player_overlay", function(event) {
    if(chromecastAvailable) {
        Player.playPauseVideo();
    }
});

addListener("click", "#hide-playlist", function(event) {
    this.preventDefault();
    fullVideo(!hiddenPlaylist);
});


addListener("click", "#bitcoin-address", function(event) {
    var copyTextarea = document.querySelector('#bitcoin-address');
    copyTextarea.select();
    var successful = document.execCommand('copy');
    if(successful) {
        M.toast({html: "Copied!", displayLength: 2000, classes: "green lighten"});
    } else {
        M.toast({html: "Error copying..", displayLength: 2000, classes: "red lighten"});
    }
});

addListener("click", "#ethereum-address", function(event) {
    var copyTextarea = document.querySelector('#ethereum-address');
    copyTextarea.select();
    var successful = document.execCommand('copy');
    if(successful) {
        M.toast({html: "Copied!", displayLength: 2000, classes: "green lighten"});
    } else {
        M.toast({html: "Error copying..",displayLength: 2000, classes: "red lighten"});
    }
});

addListener("click", ".prev-results-button", pagination_results);
addListener("click", ".next-results-button", pagination_results);

addListener("click", "#settings", function(event) {
    var sidenavElem = document.getElementsByClassName("sidenav")[0];
    if(!M.Sidenav.getInstance(document.querySelector(".sidenav")).isOpen) {
        M.Sidenav.getInstance(sidenavElem).open();
    } else {
        M.Sidenav.getInstance(sidenavElem).close();
    }
});

addListener("click", ".accept-delete", function(event) {
    this.preventDefault();
    emit("delete_all", {channel: chan.toLowerCase()});
    M.Modal.getInstance(document.getElementById("delete_song_alert")).close();
});


addListener("click", "#chat_submit", function(event){
    this.preventDefault();
    this.stopPropagation();
    Chat.chat(document.getElementById("chatForm").input);
    document.getElementById("chat_submit").focus();
    //return true;
    //document.getElementById("chatForm").submit();
});

addListener("click", "#offline-mode", function(event){
    this.preventDefault();
    if(!Crypt.get_offline()){
        change_offline(true, offline);
    } else{
        change_offline(false, offline);
    }
});

addListener("submit", "#thumbnail_form", function(event){
    this.preventDefault();
    emit("suggest_thumbnail", {channel: chan, thumbnail: document.getElementById("chan_thumbnail").value});
    document.getElementById("chan_thumbnail").value = "";
});

addListener("submit", "#description_form", function(event){
    this.preventDefault();
    emit("suggest_description", {channel: chan, description: document.getElementById("chan_description").value});
    document.getElementById("chan_description").value = "";
});

addListener("click", "#playpause-overlay", function(){
    if(document.getElementById("play-overlay").classList.contains("hide")){
        Player.pauseVideo();
        Helper.toggleClass("#play-overlay", "hide");
        Helper.toggleClass("#pause-overlay", "hide");
    } else if(document.getElementById("pause-overlay").classList.contains("hide")){
        Player.playVideo();
        Helper.toggleClass("#play-overlay", "hide");
        Helper.toggleClass("#pause-overlay", "hide");
    }
});

addListener("click", '#cookieok', function(e) {
    this.preventDefault();
    M.Toast.getInstance(e.parentElement).dismiss();
    localStorage.ok_cookie = true;
});

addListener("click", ".connect_error", function(event){
    this.preventDefault();
    M.Toast.getInstance(this.parentElement).dismiss();
});

addListener("click", ".extra-button-search", function(e){
    this.preventDefault();
    document.getElementById("search").value = e.getAttribute("data-text");
    Search.search(e.getAttribute("data-text"));
});

addListener("click", ".extra-button-delete", function(e){
    this.preventDefault();
    e.parentElement.remove();
    if(document.querySelector(".not-imported-container").children.length === 0){
        Helper.toggleClass(".not-imported", "hide");
    }
});

addListener("click", "#context-menu-overlay", function(event) {
    Helper.addClass(".context-menu-root", "hide");
    Helper.addClass("#context-menu-overlay", "hide");
    Helper.addClass(".context-menu-root", "data-id", "");
});

addListener("click", ".copy-context-menu", function(e) {
    this.preventDefault();
    var that = e;
    var parent = that.parentElement;
    var id = parent.getAttribute("data-id");
    if(id != "") {
        Helper.css(".copy_video_id", "display", "block");
        Helper.setHtml(".copy_video_id", "https://www.youtube.com/watch?v=" + id);
        var copyTextarea = document.querySelector('.copy_video_id');
        copyTextarea.select();
        var successful = document.execCommand('copy');
        if(successful) {
            M.toast({html: "Copied!", displayLength: 2000, classes: "green lighten"});
        } else {
            M.toast({html: "Error copying..", displayLength: 2000, classes: "red lighten"});
        }
        Helper.css(".copy_video_id", "display", "none");
    }
    Helper.addClass(".context-menu-root", "hide");
    Helper.addClass("#context-menu-overlay", "hide");
    document.getElementsByClassName("context-menu-root")[0].setAttribute("data-id", "");
});

addListener("click", ".find-context-menu", function(e) {
    this.preventDefault();
    var that = e;
    if(that.classList.contains("context-menu-disabled")) {
        return;
    }
    var parent = that.parentElement;
    var id = parent.getAttribute("data-id");
    Search.search(id, false, true);
    if(Helper.contains(document.getElementsByClassName("search-container")[0].getAttribute("class").split(" "), "hide")) {
        Search.showSearch();
    }
    Helper.addClass(".context-menu-root", "hide");
    Helper.addClass("#context-menu-overlay", "hide");
    document.getElementsByClassName("context-menu-root")[0].setAttribute("data-id", "");
});

addListener("click", ".delete-context-menu", function(e) {
    var that = e;
    if(that.classList.contains("context-menu-disabled")) {
        return;
    }
    var parent = that.parentElement;
    var id = parent.getAttribute("data-id");
    var suggested = parent.getAttribute("data-suggested");

    if(suggested == "true") {
        number_suggested = number_suggested - 1;
        if(number_suggested < 0) number_suggested = 0;

        var to_display = number_suggested > 9 ? "9+" : number_suggested;
        if(to_display == 0){
            Helper.addClass(document.querySelector(".suggested-link span.badge.new.white"), "hide");
        }

        Helper.setHtml(document.querySelector(".suggested-link span.badge.new.white"), to_display);
    }

    List.vote(id, "del");
    Helper.addClass(".context-menu-root", "hide");
    Helper.addClass("#context-menu-overlay", "hide");
    document.getElementsByClassName("context-menu-root")[0].setAttribute("data-id", "");
})

addListener("click", "#closePlayer", function(event){
    this.preventDefault();
    socket.emit("change_channel");
    try{
        if(chromecastAvailable){
            var castSession = cast.framework.CastContext.getInstance().getCurrentSession();
            castSession.endSession(true);
        }
        Player.player.destroy();
        Helper.toggleClass("#player_bottom_overlay", "hide");
        Helper.removeElement("#player");
        Player.soundcloud_player.unbind("finish", Player.soundcloudFinish);
        Player.soundcloud_player.unbind("pause", Player.soundcloudPause);
        Player.soundcloud_player.unbind("play", Player.soundcloudPlay);
        Player.soundcloud_player.kill();
    } catch(error){}
    socket.removeEventListener("np");
    socket.removeEventListener("id");
    socket.removeEventListener(id);
    previousSoundcloud = null;
    Helper.removeElement("#soundcloud_container");
    Helper.removeElement("#alreadychannel");
    Player.player = "";
    document.title = "Zoff - the shared YouTube based radio";
    Helper.removeElement("#closePlayer");
});

document.addEventListener("keydown", function(event) {
    if(window.location.pathname != "/"){
        if(event.keyCode == 91 || event.keyCode == 17){
            find_start = true;
        } else if(find_start && event.keyCode == 70){
            find_start = false;
            find_started = !find_started;
            event.preventDefault();
            if(find_started){
                Helper.toggleClass("#find_div", "hide");
                document.getElementById("find_input").focus();
                find_word = "";
            } else {
                Helper.toggleClass("#find_div", "hide");
                document.getElementById("find_input").value = "";
                document.getElementById("find_input").blur();
                Helper.removeClass(".highlight", "highlight");
                found_array = [];
                found_array_index = 0;
                find_word = "";
            }
        } else if(event.keyCode == 32 && document.querySelector(".search-container").classList.contains("hide") && window.location.pathname != "/" &&
        document.querySelector("#text-chat-input") != document.activeElement &&
        document.querySelector("#password") != document.activeElement &&
        document.querySelector("#user-pass-input") != document.activeElement &&
        document.querySelector("#chan_thumbnail") != document.activeElement &&
        document.querySelector("#chan_description") != document.activeElement &&
        document.querySelector("#contact-form-from") != document.activeElement &&
        document.querySelector("#contact-form-message") != document.activeElement &&
        document.querySelector("#remote_channel") != document.activeElement &&
        document.querySelector("#import") != document.activeElement &&
        document.querySelector("#find_input") != document.activeElement &&
        document.querySelector("#import_spotify") != document.activeElement) {
            if(chromecastAvailable) {
                event.preventDefault();
                Player.playPauseVideo();
                return false;
            } else {
                if(videoSource == "soundcloud") {
                    event.preventDefault();
                    Playercontrols.play_pause();
                    return false;
                }
                if(Player.player.getPlayerState() == 1) {
                    event.preventDefault();
                    Player.player.pauseVideo();
                    return false;
                } else if(Player.player.getPlayerState() == 2 || Player.player.getPlayerState() == 5) {
                    event.preventDefault();
                    Player.player.playVideo();
                    return false;
                }
            }
        } else {
            find_start = false;
        }
    }
}, false);

document.addEventListener("keyup", function(event) {
    _kT += event.keyCode;
    if(_kWay.substring(0, _kT.length) == _kT) {
        if(_kWay == _kT && !_kDone) {
            _kDone = true;
            document.getElementById("main-container").style.transition = "transform .5s, filter .5s";
            setTimeout(function() {
                document.getElementById("main-container").style.transform = "rotate(180deg)";
                document.getElementById("main-container").style.filter = "invert(100%)";
            }, 10);
            _kT = "";
            for(var i = 0; i < 20; i++) {
                var c = "green";
                if(i%2 == 0) c = "red"
                M.toast({ html: "Congratulations!", displayLength: 4000, classes: c});
            }
        } else if(_kWay == _kT && _kDone){
            _kDone = false;
            document.getElementById("main-container").style.filter = "invert(0%)";
            document.getElementById("main-container").style.transform = "rotate(0deg)";
            _kT = "";
        }
    } else {
        _kT = "";
    }
    if(event.keyCode == 27 && window.location.path != "/"){
        //$("#results").html("");
        Helper.addClass("#search-wrapper", "hide");
        Helper.removeClass(".song-title", "hide");
        if(document.querySelector("#search-btn i").innerText == "close")
        {
            /*$("#results").slideUp({
                complete: function() {
                    $("#results").empty();
                }
            });*/
            document.querySelector("#results").innerHTML = "";
            document.querySelector("#results_soundcloud").innerHTML = "";
            document.getElementsByTagName("body")[0].setAttribute("style", "overflow-y:auto")
            document.querySelector("#search-btn i").innerText = "search";
            document.querySelector(".search_input").value  = "";
        }
        if(find_started) {
            Helper.toggleClass("#find_div", "hide");
            document.getElementById("find_input").value = "";
            document.getElementById("find_input").blur();
            Helper.removeClass(".highlight", "highlight");
            found_array = [];
            found_array_index = 0;
            find_word = "";
            find_start = false;
            find_started = false;
        }
        if(document.querySelectorAll(".search-container").length != 0 && !document.querySelector(".search-container").classList.contains("hide")){
            Helper.toggleClass("#results", "hide");
        }
    } else if(event.keyCode == 13 && window.location.path != "/" && document.querySelectorAll("#search").length > 0 && document.querySelector("#search").value == "fireplace" && !document.querySelector(".search-container").classList.contains("hide") && window.location.pathname != "/") {
        clearTimeout(timeout_search);
        Helper.setHtml("#results", "");
        document.querySelector("#search").value = "";
        Helper.addClass("#search-wrapper", "hide");
        Helper.removeClass("#song-title", "hide");
        document.querySelector("#search-btn i").innerText = "search";
        Helper.css(".search_results", "display", "none");
        if(fireplace_initiated) {
            fireplace_initiated = false;
            Player.fireplace.destroy();
            Helper.css("#fireplace_player", "display", "none");
        } else {
            fireplace_initiated = true;
            Helper.css("#fireplace_player", "display", "block");
            Player.createFireplacePlayer();
        }
    } else if((event.keyCode == 91 || event.keyCode == 17) && !find_started){
        find_start = false;
    }
    if(event.target.classList.contains("search_input")) {
        searchTimeout(event);
    }
}, false);

document.addEventListener("click", function(event) {
    handleEvent(event, event.target, false, "click");
}, true);

document.addEventListener("mouseleave", function(event) {
    if(event.target.className == "card sticky-action") {
        var that = event.target;
        if(that.querySelector(".card-reveal") == null) return;
        that.querySelector(".card-reveal").setAttribute("style", "display: block;transform: translateY(0%);");
        clearTimeout(image_timeout);
        image_timeout = setTimeout(function(){
            that.querySelector(".card-reveal").setAttribute("style", "display: none;");
        }, 100);
    }
}, true);

document.addEventListener("mouseenter", function(event) {
    if(event.target.className == "card sticky-action") {
        var that = event.target;
        if(that.querySelector(".card-reveal") == null) return;
        that.querySelector(".card-reveal").setAttribute("style", "display: block;");
        clearTimeout(image_timeout);
        image_timeout = setTimeout(function(){
            that.querySelector(".card-reveal").setAttribute("style", "display: block;transform: translateY(-100%);");
        }, 50);
    }
}, true);

document.addEventListener("contextmenu", function(event) {
    handleEvent(event, event.target, false, "contextmenu");
}, true);

document.addEventListener("input", function(event) {
    handleEvent(event, event.target, false, "input");
}, true);

document.addEventListener("change", function(event) {
    handleEvent(event, event.target, false, "change");
}, true);

document.addEventListener("submit", function(event) {
    handleEvent(event, event.target, false, "submit");
}, true);

addListener("change", "#width_embed", function(event) {
    var that = this.target;
    embed_width = that.value;
    document.getElementById("embed-area").value = embed_code(embed_autoplay, embed_width, embed_height, color, embed_videoonly);
});

addListener("change", "#height_embed", function(event) {
    var that = this.target;
    embed_height = that.value;
    document.getElementById("embed-area").value = embed_code(embed_autoplay, embed_width, embed_height, color, embed_videoonly);
});

addListener("click", ".prev_page", function(event) {
    //addListener("click", ".prev_page", function(event){
    this.preventDefault();
    List.dynamicContentPage(-1);
});

addListener("click", ".modal-close", function(event){
    this.preventDefault();
});

addListener("click", "#player_overlay", function(event) {
    if(videoSource == "soundcloud") Playercontrols.play_pause();
});

/*
addListener("change", ".password_protected", function(event) {
    this.preventDefault();
    if(this.checked) {
        M.Modal.getInstance(document.getElementById("user_password")).open();
        document.getElementById("user-pass-input").focus();
    } else {
        userpass = "";
        Helper.addClass(".change_user_pass", "hide");
        Admin.save(true);
    }
});*/

addListener("submit", "#user-password-channel-form", function(event) {
    this.preventDefault();
    if(user_auth_started) {
        temp_user_pass = document.getElementById("user-pass-input").value;

        document.getElementById("user-pass-input").value = "";
        socket.emit("list", {version: parseInt(localStorage.getItem("VERSION")), channel: chan.toLowerCase(), pass: Crypt.crypt_pass(temp_user_pass)});
    } else {
        M.Modal.getInstance(document.getElementById("user_password")).close();
        userpass = document.getElementById("user-pass-input").value;
        user_change_password = false;
        document.getElementById("user-pass-input").value = "";
        Admin.save(true);
    }
});

addListener("click", ".change_user_pass_btn", function(event) {
    this.preventDefault();
    user_change_password = true;
    M.Modal.getInstance(document.getElementById("user_password")).open();
    document.getElementById("user-pass-input").focus();
});

addListener("contextmenu", "#context-menu-overlay", function(event) {
    this.preventDefault();
});

addListener("click", ".submit-user-password", function(event) {
    this.preventDefault();
    if(user_auth_started) {
        temp_user_pass = document.getElementById("user-pass-input").value;
        document.getElementById("user-pass-input").value = "";
        socket.emit("list", {version: parseInt(localStorage.getItem("VERSION")), channel: chan.toLowerCase(), pass: Crypt.crypt_pass(temp_user_pass)});
    } else {
        M.Modal.getInstance(document.getElementById("user_password")).close();
        userpass = document.getElementById("user-pass-input").value;
        user_change_password = false;
        document.getElementById("user-pass-input").value = "";
        Admin.save(true);
    }
});

addListener("click", "#abort-channel-login", function(event) {
    this.preventDefault();
    if(user_auth_started) {
        Player.stopInterval = true;
        user_auth_avoid = true;
        if(!Helper.mobilecheck()) {
            Helper.tooltip('.castButton', "destroy");
            Helper.tooltip("#viewers", "destroy");
            //$('.castButton-unactive').tooltip("destroy");
            Helper.tooltip("#offline-mode", "destroy");
            Helper.tooltip('#admin-lock', "destroy");
        }
        window.history.pushState("to the frontpage!", "Title", "/");
        Channel.onepage_load();
        user_auth_started = false;
    } else {
        document.getElementById("user-pass-input").value = "";
        if(!user_change_password) {
            document.getElementsByClassName("password_protected")[0].checked = false;
        }
        user_change_password = false;
    }
});

addListener("click", ".delete-all-songs", function(event){
    this.preventDefault();
    M.Modal.getInstance(document.getElementById("delete_song_alert")).open();
});

addListener("click", ".extra-add-text", function(e){
    e.select();
});

addListener("click", ".next_page", function(event){
    this.preventDefault();
    List.dynamicContentPage(1);
});

addListener("click", ".last_page", function(event){
    this.preventDefault();
    List.dynamicContentPage(10);
});

addListener("click", ".first_page", function(event){
    this.preventDefault();
    List.dynamicContentPage(-10);
});

addListener("click", ".donate-button", function(event) {
    this.preventDefault();
    M.Modal.init(document.getElementById("donate"));
    ga('send', 'event', "button-click", "donate");
    M.Modal.getInstance(document.getElementById("donate")).open();
});

addListener("click", '#toast-container', function(){
    before_toast();
});


addListener("click", "#aprilfools", function(){
    Helper.css(".mega", "-webkit-transform", "rotate(0deg)");
    Helper.css(".mega", "-moz-transform", "rotate(0deg)");
});

addListener("change", '#view_channels_select', function(event) {
    var that = this;
    if(currently_showing_channels != parseInt(that.target.value)) {
        Frontpage.populate_channels(Frontpage.all_channels, (parseInt(that.target.value) == 1 ? true : false), true);
    }
    currently_showing_channels = parseInt(that.target.value);
});

addListener("input", '#color_embed', function(e){
    var that = e;
    color = that.value.substring(1);
    document.getElementById("embed-area").value = embed_code(embed_autoplay, embed_width, embed_height, color, embed_videoonly);
});

addListener("click", ".chan-link", function(e){
    this.preventDefault();
    var href = e.href.replace(window.location.protocol + "//" +  window.location.hostname + "/", "");
    Frontpage.to_channel(href, false);
});

addListener("click", ".listen-button", function(event){
    if(document.querySelector(".room-namer").value === ""){
        this.preventDefault();
        Frontpage.to_channel(document.querySelector(".room-namer").getAttribute("placeholder"));
    }
});

addListener("submit", ".channel-finder", function(event){
    this.preventDefault();
    Frontpage.to_channel(document.querySelector(".room-namer").value);
    return false;
});

addListener("change", '.remote_switch_class', function()
{
    Hostcontroller.change_enabled(document.getElementsByName("remote_switch")[0].checked);
    Crypt.set_remote(enabled);
});

addListener("change", '.offline_switch_class', function()
{
    offline = document.getElementsByName("offline_switch")[0].checked;
    change_offline(offline, !offline);
});

addListener("change", '.host_switch_class', function()
{
    var host = document.getElementsByName("host_switch")[0].checked;
    enable_host_mode(host);
});

addListener("change", '.conf', function(e)
{
    this.preventDefault();
    if(e.classList.contains("password_protected")) {
        if(e.checked) {
            M.Modal.getInstance(document.getElementById("user_password")).open();
            document.getElementById("user-pass-input").focus();
        } else {
            userpass = "";
            Helper.addClass(".change_user_pass", "hide");
            Admin.save(true);
        }
    } else {
        Admin.save(false);
    }
});

addListener("click", "#clickme", function(){
    Player.playVideo();
});

addListener("click", "#listExport", function(event){
    this.preventDefault();
    if(!youtube_authenticated){
        var nonce = Helper.randomString(29);
        window.callback = function(data) {
            access_token_data_youtube = data;
            if(access_token_data_youtube.state == nonce){
                youtube_authenticated = true;
                Helper.removeClass("#playlist_loader_export", "hide");
                Helper.addClass(".youtube_export_button", "hide");
                setTimeout(function(){
                    youtube_authenticated = false;
                    access_token_data_youtube = {};
                }, access_token_data_youtube.expires_in * 1000);
                List.exportToYoutube();

            } else {
                access_token_data_youtube = "";
                console.error("Nonce doesn't match");
            }
            youtube_window.close();
            window.callback = "";
        };
        youtube_window = window.open("/o_callback#youtube=true&nonce=" + nonce, "", "width=600, height=600");
    } else {
        List.exportToYoutube();
    }
});

addListener("click", ".export-spotify-auth", function(event){
    this.preventDefault();
    var nonce = Helper.randomString(29);
    window.callback = function(data) {
        access_token_data = data;
        if(access_token_data.state == nonce){
            spotify_authenticated = true;
            Channel.spotify_is_authenticated(true);
            setTimeout(function(){
                spotify_authenticated = false;
                access_token_data = {};
                Channel.spotify_is_authenticated(false);
            }, access_token_data.expires_in * 1000);
            Helper.css(".spotify_export_button", "display", "none");
            List.exportToSpotify();
        } else {
            access_token_data = {};
            console.error("States doesn't match");
        }
        spotify_window.close();
        window.callback = "";
    };
    spotify_window = window.open("/o_callback#spotify=true&nonce=" + nonce, "", "width=600, height=600");
});

addListener("submit", "#listImport", function(event){
    this.preventDefault();
    var url = document.getElementById("import").value.split("https://www.youtube.com/playlist?list=");
    if(document.getElementById("import").value !== "" && url.length == 2){
        Search.importPlaylist(url[1]);
        document.getElementById("import").value = "";
        document.getElementById("import").disabled = true;
        Helper.addClass("#import", "hide");
        Helper.removeClass("#playlist_loader", "hide");

        ga('send', 'event', "import", "youtube");
    } else {
        before_toast();
        M.toast({html: "It seems you've entered a invalid url.", displayLength: 4000});
    }
    document.getElementById("import").value = "";
});

addListener("submit", "#listImportZoff", function(event) {
    this.preventDefault();
    var new_channel = document.getElementById("import_zoff").value;
    document.getElementById("import_zoff").value = "";
    if(new_channel == "") {
        M.toast({html: "It seems you've entered a invalid channel-name.", displayLength: 4000});
        return;
    }
    socket.emit("import_zoff", {channel: chan.toLowerCase(), new_channel: new_channel.toLowerCase()});
});

addListener("click", ".import-zoff", function(event) {
    this.preventDefault();
    Helper.addClass(".import-zoff-container", "hide");
    Helper.removeClass(".zoff_add_field", "hide");
});

addListener("submit", "#listImportSpotify", function(event){
    this.preventDefault();
    if(spotify_authenticated && document.getElementById("import_spotify").value !== ""){
        var url = document.getElementById("import_spotify").value.split("https://open.spotify.com/user/");
        if(url.length == 2) {
            url = url[1].split("/");
            var user = url[0];
            var playlist_id = url[2];
            playlist_id = playlist_id.split("?")[0];

            document.getElementById("import_spotify").disabled = true;
            Helper.addClass("#import_spotify", "hide");
            Helper.removeClass("#playlist_loader_spotify", "hide");

            ga('send', 'event', "import", "spotify");

            Search.importSpotifyPlaylist('https://api.spotify.com/v1/users/' + user + '/playlists/' + playlist_id + '/tracks');
        } else {
            before_toast();
            M.toast({html: "It seems you've entered a invalid url.", displayLength: 4000});
        }
    }
    document.getElementById("import_spotify").value = "";
});

addListener("change", "#autoplay", function(e) {
    if(e.checked) embed_autoplay = "&autoplay";
    else embed_autoplay = "";
    document.getElementById("embed-area").value = embed_code(embed_autoplay, embed_width, embed_height, color, embed_videoonly);
});

addListener("change", "#videoonly", function(e) {
    if(e.checked) embed_videoonly = "&videoonly";
    else embed_videoonly = "";
    document.getElementById("embed-area").value = embed_code(embed_autoplay, embed_width, embed_height, color, embed_videoonly);
});

addListener("click", "#playbutton_remote", function(event) {
    this.preventDefault();
    Mobile_remote.play_remote();
});

addListener("click", "#pausebutton_remote", function(event) {
    this.preventDefault();
    Mobile_remote.pause_remote();
});

addListener("click", "#skipbutton_remote", function(event) {
    this.preventDefault();
    Mobile_remote.skip_remote();
});

addListener("click", ".skip_next_client", function(event) {
    this.preventDefault();
});

addListener("submit", "#remoteform", function(event) {
    this.preventDefault();
    Mobile_remote.get_input(document.getElementById("remote_channel").value);
});

addListener("click", ".chat-tab-li", function() {
    scrollChat();
});

addListener("click", ".chat-tab", function(){
    document.getElementById("text-chat-input").focus();
});

addListener("click", ".prev", function(event){
    this.preventDefault();
    List.skip(false);
});

addListener("click", ".skip", function(event){
    this.preventDefault();
    List.skip(true);
});

addListener("click", "#chan", function(event){
    this.preventDefault();
    List.show();
});

addListener("submit", "#adminForm", function(event){
    this.preventDefault();
    Admin.pass_save();
});

addListener("click", "#channel-share-modal", function(){
    M.Modal.getInstance(document.getElementById("channel-share-modal")).close();
});

addListener("click", ".shareface", function(event) {
    ga('send', 'event', "button-click", "share-facebook");
});

addListener("click", ".android-image-link", function() {
    ga('send', 'event', "button-click", "android-playstore-link");
});

addListener("click", "#twitter-code-link", function() {
    ga('send', 'event', "button-click", "share-twitter");
});

addListener("click", ".help-button-footer", function() {
    this.preventDefault();
    M.Modal.init(document.getElementById("help"));
    ga('send', 'event', "button-click", "help-footer");
    M.Modal.getInstance(document.getElementById("help")).open();
});

addListener("click", "#embed-button", function() {
    this.preventDefault();
    M.Modal.init(document.getElementById("embed"));
    ga('send', 'event', "button-click", "embed-channel", "channel-name", chan.toLowerCase());
    M.Modal.getInstance(document.getElementById("embed")).open();
});

addListener("click", "#contact-button", function() {
    this.preventDefault();
    M.Modal.init(document.getElementById("contact"));
    ga('send', 'event', "button-click", "contact-footer");
    M.Modal.getInstance(document.getElementById("contact")).open();
});

addListener("click", ".about-button", function() {
    this.preventDefault();
    M.Modal.init(document.getElementById("about"));
    ga('send', 'event', "button-click", "contact-footer");
    M.Modal.getInstance(document.getElementById("about")).open();
});

addListener("click", ".playlist-link", function(event){
    chat_active = false;
    Helper.css("#chat-container", "display", "none");
    Helper.css("#wrapper", "display", "block");
    Helper.css("#suggestions", "display", "none");
    Helper.css("#pageButtons", "display", "flex");
});

addListener("click", ".suggested-link", function(event){
    chat_active = false;
    Helper.css("#chat-container", "display", "none");
    Helper.css("#wrapper", "display", "none");
    Helper.css("#suggestions", "display", "block");
    Helper.css("#pageButtons", "display", "none");
});

addListener("click", ".import-spotify-auth", function(event){
    this.preventDefault();
    var nonce = Helper.randomString(29);
    window.callback = function(data) {
        access_token_data = data;
        if(access_token_data.state == nonce){
            spotify_authenticated = true;
            Channel.spotify_is_authenticated(true);
            setTimeout(function(){
                spotify_authenticated = false;
                access_token_data = {};
                Channel.spotify_is_authenticated(false);
                Helper.css(".spotify_authenticated", "display", "none");
                Helper.css(".spotify_unauthenticated", "display", "block");
            }, access_token_data.expires_in * 1000);
        } else {
            access_token_data = {};
            console.error("States doesn't match");
        }
        spotify_window.close();
        window.callback = "";
    };
    spotify_window = window.open("/o_callback#spotify=true&nonce=" + nonce, "", "width=600, height=600");
});

addListener("click", ".import-youtube", function(event){
    this.preventDefault();
    Helper.css(".youtube_unclicked", "display", "none");
    Helper.css(".youtube_clicked", "display", "block");
});

addListener("submit", "#chatForm", function(event){
    this.preventDefault();
    this.stopPropagation();
    Chat.chat(document.getElementById("chatForm").input);
    return false;
});

addListener("click", "#shuffle", function(event)
{
    this.preventDefault();
    Admin.shuffle();
});

addListener("click", "#search-btn", function(event)
{
    this.preventDefault();
    Search.showSearch();
});

addListener("click", "#song-title", function(event)
{
    this.preventDefault();
    Search.showSearch();
});

addListener("click", "#admin-lock", function(event)
{
    this.preventDefault();
    Admin.log_out();
});

addListener("click", "#closeSettings", function(event)
{
    //this.preventDefault();
    Admin.hide_settings();
});


window.addEventListener("focus", function(event) {
    document.getElementById("favicon").setAttribute("href", "/assets/images/favicon.png");
    unseen = false;
});

window.addEventListener("resize", function(){
    resizeFunction();
});

addListener("click", ".result-object", function(e){
    var html  = this.target;
    var substr = this.target.outerHTML.substring(0,4);
    if(substr != "<i c" && !html.classList.contains("waves-effect") && !html.classList.contains("result-start") && !html.classList.contains("result-end") && !html.classList.contains("result-get-more-info")){
        var id 		= e.getAttribute("data-video-id");
        var title 	= e.getAttribute("data-video-title");
        var original_length = e.getAttribute("data-video-length");
        var start   = parseInt(e.querySelector(".result-start").value);
        var end     = parseInt(e.querySelector(".result-end").value);
        var source = "youtube";
        var thumbnail = "https://img.youtube.com/vi/" + id + "/mqdefault.jpg";
        if(e.getAttribute("data-type-source") != undefined) {
            source = "soundcloud";
            thumbnail = e.getAttribute("data-type-thumbnail");
        }
        if(end > original_length) {
            end = original_length;
        }
        if(start > end) {
            M.toast({html: "Start can't be before the end..", displayLength: 3000, classes: "red lighten"});
        } else if(start < 0) {
            M.toast({html: "Start can't be less than 0..", displayLength: 3000, classes: "red lighten"});
        } else {
            try {
                var length = parseInt(end) - parseInt(start);
                Search.submitAndClose(id, title, length, start, end, source, thumbnail);
            } catch(err) {
                M.toast({html: "Only numbers are accepted as song start and end parameters..", displayLength: 3000, classes: "red lighten"});
            }
        }
    }
});

addListener("click", ".result-get-more-info", function(event) {
    this.preventDefault();
    var that = this.target;
    var parent = that.parentElement.parentElement.parentElement.parentElement;
    if(that.tagName == "I") parent = parent.parentElement;

    var videoId = parent.getAttribute("data-video-id");
    var to_toggle = document.getElementById("inner-results").querySelectorAll("[data-video-id='" + videoId + "']")[0];
    to_toggle = to_toggle.children[0];
    Helper.toggleClass(to_toggle, "result-object-slid");
    if(Helper.html(that.children[0]) == "keyboard_arrow_right") {
        Helper.setHtml(that.children[0], "keyboard_arrow_left");
    } else {
        Helper.setHtml(that.children[0], "keyboard_arrow_right");
    }
})

addListener("click", '#submit-contact-form', function(event) {
    this.preventDefault();
    var message = document.getElementById("contact-form-message").value;
    var from    = document.getElementById("contact-form-from").value;
    Helper.send_mail(from, message);
    //document.getElementById("contact-form").submit();
});

addListener("submit", '#contact-form', function(event){
    this.preventDefault();
    var message = document.getElementById("contact-form-message").value;
    var from    = document.getElementById("contact-form-from").value;

    Helper.send_mail(from, message);
});

addListener("click", ".send-error-modal", function(event) {
    this.preventDefault();
    var captcha_response = grecaptcha.getResponse();

    Helper.removeClass("#send-loader", "hide");
    Helper.ajax({
        type: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        data: {
            from: "no-reply@zoff.me",
            message: Helper.html("#error-report-code"),
            "g-recaptcha-response": captcha_response,
        },
        url: "/api/mail",
        success: function(data){
            if(data == "success"){
                Helper.removeElement(".send-error-modal");
                Helper.removeElement("#error-report-form");
                Helper.removeElement(".error-code-container");
                Helper.setHtml(".error-report-success", "Error report sent!");
                Helper.setHtml("#contact-container", "Mail has been sent, we'll be back with you shortly.");
                window.location.reload(true);
            }else{
                Helper.setHtml(".error-report-success", "Mail was not sent, try again");
            }
            Helper.addClass("#send-loader", "hide");
        }
    });
    return false;
    //document.getElementById("error-report-form").submit();
})

addListener("submit", "#error-report-form", function(event) {
    this.preventDefault();
    //event.preventDefault();

    var captcha_response = grecaptcha.getResponse();

    Helper.removeClass("#send-loader", "hide");
    Helper.ajax({
        type: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        data: {
            from: "no-reply@zoff.me",
            message: Helper.html("#error-report-code"),
            "g-recaptcha-response": captcha_response,
        },
        url: "/api/mail",
        success: function(data){
            if(data == "success"){
                Helper.removeElement(".send-error-modal");
                Helper.removeElement("#error-report-form");
                Helper.removeElement(".error-code-container");
                Helper.setHtml(".error-report-success", "Error report sent!");
                Helper.setHtml("#contact-container", "Mail has been sent, we'll be back with you shortly.");
                window.location.reload(true);
            }else{
                Helper.setHtml(".error-report-success", "Mail was not sent, try again");
            }
            Helper.addClass("#send-loader", "hide");
        }
    });
});

addListener("click", "#add-many", function(e){
    this.preventDefault();
    this.stopPropagation();
    var id 		= e.getAttribute("data-video-id");
    var title 	= e.getAttribute("data-video-title");
    var original_length = e.getAttribute("data-video-length");
    var parent = e.parentElement.parentElement;

    var start   = parseInt(parent.querySelectorAll(".result-start")[0].value);
    var end     = parseInt(parent.querySelectorAll(".result-end")[0].value);
    if(end > original_length) {
        end = original_length;
    }
    var source = "youtube";
    var thumbnail;
    if(e.getAttribute("data-type-source") != undefined) {

        source = "soundcloud";
        thumbnail = e.getAttribute("data-type-thumbnail");
    }
    if(start > end) {
        M.toast({html: "Start can't be before the end..", displayLength: 3000, classes: "red lighten"});
    } else if(start < 0) {
        M.toast({html: "Start can't be less than 0..", displayLength: 3000, classes: "red lighten"});
    } else {
        try {
            var length = parseInt(end) - parseInt(start);

            e.parentElement.parentElement.parentElement.remove();
            Search.submit(id, title, length, false, 0, 1, start, end, source, thumbnail);
        } catch(event) {
            M.toast({html: "Only numbers are accepted as song start and end parameters..", displayLength: 3000, classes: "red lighten"});
        }
    }

});

addListener("click", ".vote-container", function(e, target){
    if(hostMode) {
        toast("Can't vote while in host mode!", "red lighten");
        document.querySelector("#toast-container").setAttribute("style", "z-index: 99999999999 !important");
        return;
    }
    var id = e.getAttribute("data-video-id");
    List.vote(id, "pos");
});

addListener("click", ".delete_button", function(e){
    var id = e.getAttribute("data-video-id");
    List.vote(id, "del");
});

addListener("click", ".add-suggested", function(e){
    var id 		= e.getAttribute("data-video-id");
    var title 	= e.getAttribute("data-video-title");
    var length 	= e.getAttribute("data-video-length");
    var added_by = e.getAttribute("data-added-by");
    Search.submit(id, title, parseInt(length), false, 0, 1, 0, parseInt(length), "youtube");
    if(added_by == "user") {
        number_suggested = number_suggested - 1;
        if(number_suggested < 0) number_suggested = 0;

        var to_display = number_suggested > 9 ? "9+" : number_suggested;
        if(!document.querySelector(".suggested-link span.badge.new.white").classList.contains("hide") && to_display == 0){
            Helper.addClass(document.querySelector(".suggested-link span.badge.new.white"), "hide");
            Helper.addClass("#user_suggests", "hide");
            Helper.addClass("#suggest_bar", "hide");
        }

        document.querySelector(".suggested-link span.badge.new.white").innerText = to_display;
    }
    Helper.removeElement("#suggested-" + id);
});

addListener("click", ".del_suggested", function(e){
    var id = e.getAttribute("data-video-id");

    Helper.removeElement("#suggested-" + id);
});

addListener("click", ".del_user_suggested", function(e){
    var id = e.getAttribute("data-video-id");
    Helper.removeElement("#suggested-" + id);

    number_suggested = number_suggested - 1;
    if(number_suggested < 0) number_suggested = 0;

    var to_display = number_suggested > 9 ? "9+" : number_suggested;
    if(to_display == 0){
        Helper.addClass(document.querySelector(".suggested-link span.badge.new.white"), "hide");
    }

    docu.querySelector(".suggested-link span.badge.new.white").innerText = to_display;

    List.vote(id, "del");
});

/*
addListener("click", '#toast-container', function(){
    var toastElement = document.querySelector('.toast');
     var toastInstance = M.Toast.getInstance(toastElement);
     toastInstance.dismiss();
});
*/

addListener("click", "#embed-area", function(e){
    e.select();
});

addListener("click", ".brand-logo-navigate", function(event){
    this.preventDefault();

    window.history.pushState("to the frontpage!", "Title", "/");
    Channel.onepage_load();
});

addListener("click", "#player_bottom_overlay", function(event){
    if(this.target.id == "closePlayer") return;
    Frontpage.to_channel(this.target.getAttribute("data-channel"), false);
});

addListener("click", ".generate-channel-name", function(event) {
    this.preventDefault();
    Helper.ajax({
        type: "GET",
        url: "/api/generate_name",
        success: function(response) {
            document.getElementsByClassName("room-namer")[0].value = "";
            document.getElementsByClassName("room-namer")[0].value = response;
        }
    });

    ga('send', 'event', "button-click", "generate-channel");
});

addListener("click", "#close_find_form_button", function(event) {
    this.preventDefault();
    find_start = false;
    find_started = false;
    Helper.toggleClass("#find_div", "hide");
    document.getElementById("find_input").value = "";
    document.getElementById("find_input").blur();
    Helper.removeClass(".highlight", "highlight");
    found_array = [];
    found_array_index = 0;
    find_word = "";
});

addListener("submit", "#find_form", function(event){
    this.preventDefault();
    if(this.target.find_value.value != find_word) {
        find_word = this.target.find_value.value;
        found_array = [];
        found_array_index = 0;
    }
    if(found_array.length == 0){
        var that = this.target;
        found_array_index = 0;
        found_array = [];
        for(var i = 0; i < full_playlist.length; i++) {
            var obj = full_playlist[i];
            if(obj.title.toLowerCase().indexOf(that.find_value.value.toLowerCase()) >= 0 && i != full_playlist.length-1) {
                found_array.push(i);
            }
        }

    } else {
        found_array_index = found_array_index + 1;
        if(found_array.length - 1 < found_array_index){
            found_array_index = 0;
        }

    }
    if(found_array.length == 0) {
        document.getElementById("num_found").innerText = 0;
        document.getElementById("of_total_found").innerText = found_array.length;
    } else {
        document.getElementById("num_found").innerText = found_array_index + 1;
        document.getElementById("of_total_found").innerText = found_array.length;
    }

    if(found_array.length > 0 && found_array[found_array_index] != full_playlist.length - 1){
        Helper.removeClass(".highlight", "highlight");
        var jump_to_page = Math.floor(found_array[found_array_index] / List.can_fit);
        Helper.addClass(document.querySelector("#wrapper").children[found_array[found_array_index]], "highlight");
        List.dynamicContentPageJumpTo(jump_to_page);
    } else {
        Helper.removeClass(".highlight", "highlight");
        Helper.log(["none found"]);
    }
});
