var chan 				  		= window.chan === undefined ? $("#chan").html() : window.chan;
var w_p 				  		= true;
var domain = window.location.host.split(".");
var client = false;
if(domain.length > 0 && domain[0] == "client") {
    client = true;
}
var dynamicListeners = {};
var socket_connected = false;
var hasadmin			  		= 0;
var list_html 			  		= $("#list-song-html").html();
var unseen 			   	  		= false;
var searching 		   	  		= false;
var time_regex 		   	  		= /P((([0-9]*\.?[0-9]*)Y)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)W)?(([0-9]*\.?[0-9]*)D)?)?(T(([0-9]*\.?[0-9]*)H)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)S)?)?/;
var conf 			   	  		= [];
var private_channel 			= false;
var end_programmatically = false;
var music 			   	  		= 0;
var was_stopped = false;
var timed_remove_check;
var slider_type = Helper.mobilecheck() ? "vertical" : "horizontal";
var programscroll = false;
var lastCommand;
var tried_again = false;
var userscroll = false;
var gotten_np   = false;
var frontpage 		   	  		= 1;
var empty_clear = false;
var adminpass 		   	  		= "";
var showDiscovery						= false;
var player_ready 	   	  		= false;
var viewers 			  		= 1;
var temp_user_pass 				= "";
var zoff_api_token = "DwpnKVkaMH2HdcpJT2YPy783SY33byF5/32rbs0+xdU=";
if(window.location.hostname == "localhost" || window.location.hostname == "client.localhost") {
    var zoff_api_token = "AhmC4Yg2BhaWPZBXeoWK96DAiAVfbou8TUG2IXtD3ZQ=";
}
var retry_frontpage;
var chromecast_specs_sent = false;
var dragging 					= false;
var user_auth_started 			= false;
var user_auth_avoid 			= false;
var user_change_password 		= false;
var paused 				  		= false;
var currently_showing_channels 	= 1;
var playing 			  		= false;
var SAMPLE_RATE 		  		= 6000; // 6 seconds
var lastSample 			  		= Date.now();
var fireplace_initiated   		= false;
var began 				  		= false;
var userpass              		= "";
var i 					  		= -1;
var lazy_load    		  		= false;
var embed				  		= false;
var autoplay			  		= true;
var durationBegun 	      		= false;
var chat_active 		  		= false;
var chat_unseen 		  		= false;
var blinking 			  		= false;
var from_frontpage        		= false;
var access_token_data     		= {};
var spotify_authenticated 		= false;
var not_import_html       		= "";
var not_export_html       		= "";
var embed_height          		= 300;
var embed_width           		= 600;
var embed_videoonly = "";
var embed_autoplay        		= "&autoplay";
var connect_error         		= false;
var access_token_data_youtube 	= {};
var youtube_authenticated 		= false;
var chromecastAvailable 		= false;
var color               		= "808080";
var find_start          		= false;
var find_started        		= false;
var offline             		= false;
var cast_ready_connect  		= false;
var number_suggested 			= 0;
var prev_chan_list 				= "";
var changing_to_frontpage = false;
var prev_chan_player 			= "";
var chromecastReady 			= false;
var find_word = "";
var found_array 				= [];
var found_array_index 			= 0;
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
var title;
var viewers;
var video_id;
var seekTo;
var song_title;
var previous_video_id;
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
        .catch(function (e) {
            console.error(e);
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

} catch(e) {}

/*
$.ajaxPrefilter(function( options, original_Options, jqXHR ) {
    options.async = true;
});*/

window.zoff = {
    enable_debug: enable_debug,
    disable_debug: disable_debug
}

if(!Helper.mobilecheck() && (window.location.host != "localhost" && window.location.host != "client.localhost")) {
    window.onerror = function(e, source, lineno, colno, error) {
        if(e == "Script error.") return true;
        Helper.logs.unshift({log: e.toString().replace(/(\r\n|\n|\r)/gm,""), date: new Date(), lineno: lineno, colno: colno, source:source});
        Helper.logs.unshift({log: chan != "" && chan != undefined ? chan.toLowerCase() : "frontpage", date: new Date()});
        $(".contact-form-content").remove();
        $("#submit-contact-form").remove();
        $(".contact-modal-header").text("An error occurred");
        $(".contact-container-info").remove();
        $(".contact-modal-footer").prepend('<a href="#!" class="waves-effect waves-green btn-flat send-error-modal">Send</a>');
        $("#contact-form").attr("id", "error-report-form");
        $("#contact-container").prepend('<p>Do you want to send an error-report?</p> \
            <p class="error-report-success"></p> \
            <div class="error-code-container"> \
                <code id="error-report-code"></code> \
            </div>');
        M.Modal.init(document.getElementById("contact"));
        M.Modal.getInstance(document.getElementById("contact")).open();
        /*$("#error-report-modal").modal();*/
        Helper.setHtml("#error-report-code", JSON.stringify(Helper.logs, undefined, 4));
        //console.error(e.originalEvent.error);
        return true;
    };
}

$().ready(function(){
    if(!localStorage.getItem("VERSION") || parseInt(localStorage.getItem("VERSION")) != VERSION) {
        localStorage.setItem("VERSION", VERSION);
    }

    if(!fromFront && window.location.pathname != "/") Channel.init();
    else if(!fromChannel && window.location.pathname == "/"){
        Frontpage.init();
    }

    if(Helper.mobilecheck()) {
        socket.on("guid", function(msg) {
            guid = msg;
        });
    }

    M.Modal.init(document.getElementById("donate"));

    socket.on("connect", function(){
        if(connect_error){
            connect_error = false;
            if(offline) {
                socket.emit("offline", {status: true, channel: chan != undefined ? chan.toLowerCase() : ""});
            }
            /*if(chan != undefined && (Crypt.get_pass(chan.toLowerCase()) !== undefined && Crypt.get_pass(chan.toLowerCase()) !== "")){
                emit("password", {password: Crypt.crypt_pass(Crypt.get_pass(chan.toLowerCase())), channel: chan.toLowerCase()});
            }*/
            $(".connect_error").fadeOut(function(){
                $(".connect_error").remove();
                M.toast({ html: "Connected!", displayLength: 2000, classes: "green lighten"});
            });
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
});

initializeCastApi = function() {
    try {
        if(cast == undefined) return;
    } catch(e) {
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
                chrome.cast.media.GenericMediaMetadata({metadataType: 0, title:song_title, image: 'https://img.youtube.com/vi/'+video_id+'/mqdefault.jpg', images: ['https://img.youtube.com/vi/'+video_id+'/mqdefault.jpg']});
                //chrome.cast.Image('https://img.youtube.com/vi/'+video_id+'/mqdefault.jpg');
                chromecastAvailable = true;
                paused = false;
                mobile_beginning = false;
                var _seekTo;
                try{
                    _seekTo = Player.player.getCurrentTime();
                } catch(e){
                    _seekTo = seekTo;
                }
                castSession.sendMessage("urn:x-cast:zoff.me", {type: "loadVideo", start: Player.np.start, end: Player.np.end, videoId: video_id, seekTo: _seekTo, channel: chan.toLowerCase()})
                castSession.sendMessage("urn:x-cast:zoff.me", {type: "nextVideo", videoId: full_playlist[0].id, title: full_playlist[0].title})

                if(Helper.mobilecheck() && !chromecast_specs_sent) {
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
                chrome.cast.media.GenericMediaMetadata({metadataType: 0, title:song_title, image: 'https://img.youtube.com/vi/'+video_id+'/mqdefault.jpg', images: ['https://img.youtube.com/vi/'+video_id+'/mqdefault.jpg']});
                //chrome.cast.Image('https://img.youtube.com/vi/'+video_id+'/mqdefault.jpg');
                chromecastAvailable = true;
                paused = false;
                mobile_beginning = false;
                var _seekTo;
                try{
                    _seekTo = Player.player.getCurrentTime();
                } catch(e){
                    _seekTo = seekTo;
                }
                castSession.sendMessage("urn:x-cast:zoff.me", {type: "loadVideo", start: Player.np.start, end: Player.np.end, videoId: video_id, seekTo: _seekTo, channel: chan.toLowerCase()})
                castSession.sendMessage("urn:x-cast:zoff.me", {type: "nextVideo", videoId: full_playlist[0].id, title: full_playlist[0].title})
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
                $('.tap-target').tapTarget();
                $('.tap-target').tapTarget('open');
                tap_target_timeout = setTimeout(function() {
                    $('.tap-target').tapTarget('close');
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

addListener("click", "#player_overlay", function(e) {
    if(chromecastAvailable) {
        Player.playPauseVideo();
    }
});

addListener("click", "#bitcoin-address", function(e) {
    var copyTextarea = document.querySelector('#bitcoin-address');
    copyTextarea.select();
    var successful = document.execCommand('copy');
    if(successful) {
        M.toast({html: "Copied!", displayLength: 2000, classes: "green lighten"});
    } else {
        M.toast({html: "Error copying..", displayLength: 2000, classes: "red lighten"});
    }
});

addListener("click", "#ethereum-address", function(e) {
    var copyTextarea = document.querySelector('#ethereum-address');
    copyTextarea.select();
    var successful = document.execCommand('copy');
    if(successful) {
        M.toast({html: "Copied!", displayLength: 2000, classes: "green lighten"});
    } else {
        M.toast({html: "Error copying..",displayLength: 2000, classes: "red lighten"});
    }
});

addListener("click", ".pagination-results a", function(e) {
    event.preventDefault();
    var that = $(this);
    var pageToken = that.attr("data-pagination");
    var searchInput = that.attr("data-original-search");

    Helper.addClass(".pagination-results a", "disabled");
    Search.search(searchInput, false, false, pageToken);
});

addListener("click", "#settings", function(e) {
    event.preventDefault();
    var sidenavElem = document.getElementsByClassName("sidenav")[0];
    if(!M.Sidenav.getInstance($(".sidenav")).isOpen) {
        M.Sidenav.getInstance(sidenavElem).open();
    } else {
        M.Sidenav.getInstance(sidenavElem).close();
    }
});

addListener("click", ".accept-delete", function(e) {
    event.preventDefault();
    emit("delete_all", {channel: chan.toLowerCase()});
    M.Modal.getInstance(document.getElementById("delete_song_alert")).close();
});

$(document).keyup(function(event) {
    if(event.keyCode == 27){
        //$("#results").html("");
        if($("#search-wrapper").length != 0 && !Helper.contains($("#search-wrapper").attr("class").split(" "), "hide"))
        $("#search-wrapper").toggleClass("hide");
        if($("#song-title").length != 0 && Helper.contains($("#song-title").attr("class").split(" "), "hide"))
        $("#song-title").toggleClass("hide");

        if($("#search-btn i").html() == "close")
        {
            $("#results").slideUp({
                complete: function() {
                    $("#results").empty();
                }
            });
            document.getElementsByTagName("body")[0].setAttribute("style", "overflow-y:auto")
            $("#search-btn i").html("search");
            $(".search_input").val("");
        }
        if($(".search-container").length != 0 && !Helper.contains($(".search-container").attr("class").split(" "), "hide")){
            $("#results").toggleClass("hide");
        }
    } else if(event.keyCode == 13 && $("#search").val() == "fireplace" && !$(".search-container").hasClass("hide") && window.location.pathname != "/") {
        clearTimeout(timeout_search);
        Helper.setHtml("#results", "");
        $("#search").val("");
        if($("#search-wrapper").length != 0 && !Helper.contains($("#search-wrapper").attr("class").split(" "), "hide"))
        $("#search-wrapper").toggleClass("hide");
        if($("#song-title").length != 0 && Helper.contains($("#song-title").attr("class").split(" "), "hide"))
        $("#song-title").toggleClass("hide");

        if($("#search-btn i").html() == "close")
        {
            $("#search-btn i").html("search");
        }
        if($(".search-container").length != 0 && !Helper.contains($(".search-container").attr("class").split(" "), "hide")){
            $("#results").toggleClass("hide");
        }
        if(fireplace_initiated) {
            fireplace_initiated = false;
            Player.fireplace.destroy();
            Helper.css("#fireplace_player", "display", "none");
        } else {
            fireplace_initiated = true;
            Helper.css("#fireplace_player", "display", "block");
            Player.createFireplacePlayer();
        }
    }
});

$(document).on("mouseenter", ".card.sticky-action", function(e){
    var that = this;
    $(that).find(".card-reveal").attr("style", "display: block;");
    clearTimeout(image_timeout);
    image_timeout = setTimeout(function(){
        $(that).find(".card-reveal").attr("style", "display: block;transform: translateY(-100%);");
    }, 50);
});

addListener("click", "#chat_submit", function(e){
    event.preventDefault();
    $("#chatForm").submit();
});

$(document).on("mouseleave", ".card.sticky-action", function(e){
    var that = this;
    $(that).find(".card-reveal").attr("style", "display: block;transform: translateY(0%);");
    clearTimeout(image_timeout);
    image_timeout = setTimeout(function(){
        $(that).find(".card-reveal").attr("style", "display: none;");
    }, 100);
});

addListener("click", "#offline-mode", function(e){
    event.preventDefault();
    if(!Crypt.get_offline()){
        change_offline(true, offline);
    } else{
        change_offline(false, offline);
    }
});

addListener("submit", "#thumbnail_form", function(e){
    event.preventDefault();
    emit("suggest_thumbnail", {channel: chan, thumbnail: $("#chan_thumbnail").val()});
    $("#chan_thumbnail").val("");
});

addListener("submit", "#description_form", function(e){
    event.preventDefault();
    emit("suggest_description", {channel: chan, description: $("#chan_description").val()});
    $("#chan_description").val("");
});

addListener("click", "#playpause-overlay", function(){
    if($("#play-overlay").hasClass("hide")){
        Player.pauseVideo();
        $("#play-overlay").toggleClass("hide");
        $("#pause-overlay").toggleClass("hide");
    } else if($("#pause-overlay").hasClass("hide")){
        Player.playVideo();
        $("#play-overlay").toggleClass("hide");
        $("#pause-overlay").toggleClass("hide");
    }
});

addListener("click", '#cookieok', function(e) {
    event.preventDefault();
    $(this).fadeOut(function(){
        $(this).remove();
        localStorage.ok_cookie = true;
    });
});

addListener("click", ".connect_error", function(e){
    event.preventDefault();
    $(this).fadeOut(function(){
        $(this).remove();
        connect_error = false;
    });
});

addListener("click", ".extra-button-search", function(e){
    event.preventDefault();
    $("#search").val($(this).attr("data-text"));
    Search.search($(this).attr("data-text"));
});

addListener("click", ".extra-button-delete", function(e){
    event.preventDefault();
    $(this).parent().remove();
    if($(".not-imported-container").children().length === 0){
        $(".not-imported").toggleClass("hide");
    }
});

addListener("click", "#context-menu-overlay", function(e) {
    $(".context-menu-root").addClass("hide");
    $("#context-menu-overlay").addClass("hide");
    $(".context-menu-root").attr("data-id", "");
});

addListener("click", ".copy-context-menu", function(e) {
    event.preventDefault();
    var that = this;
    var parent = $(that).parent();
    var id = parent.attr("data-id");
    if(id != "") {
        $(".copy_video_id").css("display", "block");
        $(".copy_video_id").text("https://www.youtube.com/watch?v=" + id);
        var copyTextarea = document.querySelector('.copy_video_id');
        copyTextarea.select();
        var successful = document.execCommand('copy');
        if(successful) {
            M.toast({html: "Copied!", displayLength: 2000, classes: "green lighten"});
        } else {
            M.toast({html: "Error copying..", displayLength: 2000, classes: "red lighten"});
        }
        $(".copy_video_id").css("display", "none");
    }
    $(".context-menu-root").addClass("hide");
    $("#context-menu-overlay").addClass("hide");
    $(".context-menu-root").attr("data-id", "");
});

addListener("click", ".find-context-menu", function(e) {
    event.preventDefault();
    var that = this;
    var parent = $(that).parent();
    var id = parent.attr("data-id");
    Search.search(id, false, true);
    if(Helper.contains($(".search-container").attr("class").split(" "), "hide")) {
        Search.showSearch();
    }
    $(".context-menu-root").addClass("hide");
    $("#context-menu-overlay").addClass("hide");
    $(".context-menu-root").attr("data-id", "");
});

addListener("click", ".delete-context-menu", function(e) {
    var that = this;
    if($(that).hasClass("context-menu-disabled")) {
        return;
    }
    var parent = $(that).parent();
    var id = parent.attr("data-id");
    var suggested = parent.attr("data-suggested");

    if(suggested == "true") {
        number_suggested = number_suggested - 1;
        if(number_suggested < 0) number_suggested = 0;

        var to_display = number_suggested > 9 ? "9+" : number_suggested;
        if(!$(".suggested-link span.badge.new.white").hasClass("hide") && to_display == 0){
            $(".suggested-link span.badge.new.white").addClass("hide");
        }

        $(".suggested-link span.badge.new.white").text(to_display);
    }

    List.vote(id, "del");
    $(".context-menu-root").addClass("hide");
    $("#context-menu-overlay").addClass("hide");
    $(".context-menu-root").attr("data-id", "");
})

addListener("click", "#closePlayer", function(e){
    event.preventDefault();
    socket.emit("change_channel");
    try{
        if(chromecastAvailable){
            var castSession = cast.framework.CastContext.getInstance().getCurrentSession();
            castSession.endSession(true);
        }
        Player.player.destroy();
        $("#player_bottom_overlay").toggleClass("hide");
        $("#player").remove();
    } catch(error){}
    socket.removeEventListener("np");
    socket.removeEventListener("id");
    socket.removeEventListener(id);
    $("#alreadychannel").remove();
    Player.player = "";
    document.title = "Zoff - the shared YouTube based radio";
    $("#closePlayer").remove();
});


document.addEventListener("click", function(e) {
    handleEvent(e, e.target, false);
}, false);

document.addEventListener("input", function(e) {
    handleEvent(e, e.target, false);
}, true);

document.addEventListener("change", function(e) {
    handleEvent(e, e.target, false);
}, true);

document.addEventListener("submit", function(e) {
    handleEvent(e, e.target, false);
}, true);

addListener("click", ".prev_page", function(e) {
//addListener("click", ".prev_page", function(e){
    event.preventDefault();
    List.dynamicContentPage(-1);
});

addListener("click", ".modal-close", function(e){
    event.preventDefault();
});

addListener("change", ".password_protected", function(e) {
    event.preventDefault();
    if(this.checked) {
        M.Modal.getInstance(document.getElementById("user_password")).open();
        $("#user-pass-input").focus();
    } else {
        userpass = "";
        if(!$(".change_user_pass").hasClass("hide")) $(".change_user_pass").addClass("hide");
        Admin.save(true);
    }
});

addListener("submit", "#user-password-channel-form", function(e) {
    event.preventDefault();
    if(user_auth_started) {
        temp_user_pass = $("#user-pass-input").val();

        $("#user-pass-input").val("");
        socket.emit("list", {version: parseInt(localStorage.getItem("VERSION")), channel: chan.toLowerCase(), pass: Crypt.crypt_pass(temp_user_pass)});
    } else {
        M.Modal.getInstance(document.getElementById("user_password")).close();
        userpass = $("#user-pass-input").val();
        user_change_password = false;
        $("#user-pass-input").val("");
        Admin.save(true);
    }
});

addListener("click", ".change_user_pass_btn", function(e) {
    event.preventDefault();
    user_change_password = true;
    M.Modal.getInstance(document.getElementById("user_password")).open();
    $("#user-pass-input").focus();
});

addListener("contextmenu", "#context-menu-overlay", function(e) {
    event.preventDefault();
});

addListener("click", ".submit-user-password", function(e) {
    event.preventDefault();
    if(user_auth_started) {
        temp_user_pass = $("#user-pass-input").val();
        $("#user-pass-input").val("");
        socket.emit("list", {version: parseInt(localStorage.getItem("VERSION")), channel: chan.toLowerCase(), pass: Crypt.crypt_pass(temp_user_pass)});
    } else {
        M.Modal.getInstance(document.getElementById("user_password")).close();
        userpass = $("#user-pass-input").val();
        user_change_password = false;
        $("#user-pass-input").val("");
        Admin.save(true);
    }
});

addListener("click", ".close-user-password", function() {
    if(user_auth_started) {
        Player.stopInterval = true;
        user_auth_avoid = true;
        if(!Helper.mobilecheck()) {
            Helper.tooltip('.castButton', "destroy");
            Helper.tooltip("#viewers", "destroy");
            //$('.castButton-unactive').tooltip("destroy");
            Helper.tooltip("#offline-mode", "destroy");
            Helper.tooltip('#chan_thumbnail', "destroy");
            Helper.tooltip('#admin-lock', "destroy");
        }
        window.history.pushState("to the frontpage!", "Title", "/");
        Channel.onepage_load();
    } else {
        $("#user-pass-input").val("");
        if(!user_change_password) {
            $(".password_protected").prop("checked", false);
        }
        user_change_password = false;
    }
});

addListener("click", ".delete-all-songs", function(e){
    event.preventDefault();
    M.Modal.getInstance(document.getElementById("delete_song_alert")).open();
});

addListener("click", ".not-exported-container .not-exported-element #extra-export-container-text .extra-add-text", function(){
    this.select();
});

addListener("click", ".next_page", function(e){
    event.preventDefault();
    List.dynamicContentPage(1);
});

addListener("click", ".last_page", function(e){
    event.preventDefault();
    List.dynamicContentPage(10);
});

addListener("click", ".first_page", function(e){
    event.preventDefault();
    List.dynamicContentPage(-10);
});

addListener("click", ".donate-button", function(e) {
    event.preventDefault();
    ga('send', 'event', "button-click", "donate");
    M.Modal.getInstance(document.getElementById("donate")).open();
});

addListener("click", '#toast-container', function(){
    before_toast();
});

addListener("click", "#aprilfools", function(){
    $(".mega").css("-webkit-transform", "rotate(0deg)");
    $(".mega").css("-moz-transform", "rotate(0deg)");
});

addListener("change", '#view_channels_select', function(e) {
    var that = this;
    if(currently_showing_channels != parseInt(that.value)) {

        Frontpage.populate_channels(Frontpage.all_channels, (parseInt(that.value) == 1 ? true : false));
    }
    currently_showing_channels = parseInt(that.value);
});

$(document).on('keyup mouseup', '#width_embed', function(){
    var that = $(this);
    embed_width = that.val();
    $("#embed-area").val(embed_code(embed_autoplay, embed_width, embed_height, color, embed_videoonly));
});

$(document).on('keyup mouseup', '#height_embed', function(){
    var that = $(this);
    embed_height = that.val();
    $("#embed-area").val(embed_code(embed_autoplay, embed_width, embed_height, color, embed_videoonly));
});

addListener("input", '#color_embed', function(){
    var that = $(this);
    color = that.val().substring(1);
    $("#embed-area").val(embed_code(embed_autoplay, embed_width, embed_height, color, embed_videoonly));
});

addListener("click", ".chan-link", function(e){
    event.preventDefault();
    var href = this.href.replace(window.location.protocol + "//" +  window.location.hostname + "/", "");
    console.log(href, e);
    Frontpage.to_channel(href, false);
});

addListener("click", ".listen-button", function(e){
    if($(".room-namer").val() === ""){
        event.preventDefault();
        Frontpage.to_channel($(".room-namer").attr("placeholder"));
    }
});

addListener("submit", ".channel-finder", function(e){
    event.preventDefault();
    Frontpage.to_channel($(".room-namer").val());
    return false;
});

addListener("submit", ".channel-finder-mobile", function(e){
    event.preventDefault();
    Frontpage.to_channel($("#searchFrontpage").val());
    return false;
});

addListener("change", 'input[class=remote_switch_class]', function()
{
    Hostcontroller.change_enabled(document.getElementsByName("remote_switch")[0].checked);
    Crypt.set_remote(enabled);
});

addListener("change", 'input[class=offline_switch_class]', function()
{
    offline = document.getElementsByName("offline_switch")[0].checked;
    change_offline(offline, !offline);
});

addListener("change", 'input[class=conf]', function()
{
    Admin.save(false);
});

$("#clickme").click(function(){
    Player.playVideo();
});

addListener("click", "#listExport", function(e){
    event.preventDefault();
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

addListener("click", ".export-spotify-auth", function(e){
    event.preventDefault();
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

addListener("submit", "#listImport", function(e){
    event.preventDefault();
    var url = $("#import").val().split("https://www.youtube.com/playlist?list=");
    if($("#import").val() !== "" && url.length == 2){
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

addListener("submit", "#listImportZoff", function(e) {
    event.preventDefault();
    var new_channel = $("#import_zoff").val();
    if(new_channel == "") {
        M.toast({html: "It seems you've entered a invalid channel-name.", displayLength: 4000});
        return;
    }
    socket.emit("import_zoff", {channel: chan.toLowerCase(), new_channel: new_channel.toLowerCase()});
});

addListener("click", ".import-zoff", function(e) {
    event.preventDefault();
    Helper.addClass(".import-zoff-container", "hide");
    Helper.removeClass(".zoff_add_field", "hide");
});

addListener("submit", "#listImportSpotify", function(e){
    event.preventDefault();
    if(spotify_authenticated && $("#import_spotify").val() !== ""){
        var url = $("#import_spotify").val().split("https://open.spotify.com/user/");
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

$(window).focus(function(){
    document.getElementById("favicon").setAttribute("href", "/assets/images/favicon.png");
    unseen = false;
});

addListener("change", "#autoplay", function() {
    if(this.checked) embed_autoplay = "&autoplay";
    else embed_autoplay = "";
    $("#embed-area").val(embed_code(embed_autoplay, embed_width, embed_height, color, embed_videoonly));
});

addListener("change", "#videoonly", function() {
    if(this.checked) embed_videoonly = "&videoonly";
    else embed_videoonly = "";
    $("#embed-area").val(embed_code(embed_autoplay, embed_width, embed_height, color, embed_videoonly));
});

addListener("click", "#playbutton_remote", function(e) {
    event.preventDefault();
    Mobile_remote.play_remote();
});

addListener("click", "#pausebutton_remote", function(e) {
    event.preventDefault();
    Mobile_remote.pause_remote();
});

addListener("click", "#skipbutton_remote", function(e) {
    event.preventDefault();
    Mobile_remote.skip_remote();
});

addListener("click", ".skip_next_client", function(e) {
    event.preventDefault();
});

addListener("submit", "#remoteform", function(e) {
    event.preventDefault();
    Mobile_remote.get_input($("#remote_channel").val());
});

addListener("click", ".chat-link", function(){
    $("#text-chat-input").focus();
    $("#chat-btn i").css("opacity", 1);
    Chat.channel_received = 0;
    Chat.all_received = 0;
    Helper.addClass(".chat-link span badge new white", "hide");
    unseen = false;
    document.getElementById("favicon").setAttribute("href", "/assets/images/favicon.png");

    scrollChat();
});

addListener("click", ".chat-tab-li", function() {
    scrollChat();
});

$(document).on('keyup', ".search_input", function(event) {
    searchTimeout(event);
});

addListener("click", ".chat-tab", function(){
    $("#text-chat-input").focus();
});

addListener("click", ".prev", function(e){
    event.preventDefault();
    List.skip(false);
});

addListener("click", ".skip", function(e){
    event.preventDefault();
    List.skip(true);
});

addListener("click", "#chan", function(e){
    event.preventDefault();
    List.show();
});

addListener("submit", "#adminForm", function(e){
    event.preventDefault();
    Admin.pass_save();
});

addListener("click", "#channel-share-modal", function(){
    M.Modal.getInstance(document.getElementById("channel-share-modal")).close();
});

addListener("click", ".shareface", function(e) {
    ga('send', 'event', "button-click", "share-facebook");
});

addListener("click", ".android-image-link", function() {
    ga('send', 'event', "button-click", "android-playstore-link");
});

addListener("click", "#twitter-code-link", function() {
    ga('send', 'event', "button-click", "share-twitter");
});

addListener("click", ".help-button-footer", function() {
    ga('send', 'event', "button-click", "help-footer");
});

addListener("click", "#embed-button", function() {
    ga('send', 'event', "button-click", "embed-channel", "channel-name", chan.toLowerCase());
})

addListener("click", ".chat-link", function(e){
    chat_active = true;
    unseen = false;
    chat_unseen = false;
    document.getElementsByClassName("chat-link")[0].setAttribute("style", "color: white !important;");
    blinking = false;
    document.getElementById("favicon").setAttribute("href", "/assets/images/favicon.png");
    Helper.css("#chat-container", "display", "block");
    Helper.css("#wrapper", "display", "none");
    Helper.css("#suggestions", "display", "none");
    $("#text-chat-input").focus();
    Helper.css("#pageButtons", "display", "none");
});

addListener("click", ".playlist-link", function(e){
    chat_active = false;
    Helper.css("#chat-container", "display", "none");
    Helper.css("#wrapper", "display", "block");
    Helper.css("#suggestions", "display", "none");
    Helper.css("#pageButtons", "display", "flex");
});

addListener("click", ".suggested-link", function(e){
    chat_active = false;
    Helper.css("#chat-container", "display", "none");
    Helper.css("#wrapper", "display", "none");
    Helper.css("#suggestions", "display", "block");
    Helper.css("#pageButtons", "display", "none");
});

addListener("click", ".import-spotify-auth", function(e){
    event.preventDefault();
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

addListener("click", ".import-youtube", function(e){
    event.preventDefault();
    Helper.css(".youtube_unclicked", "display", "none");
    Helper.css(".youtube_clicked", "display", "block");
});

addListener("submit", "#chatForm", function(e){
    event.preventDefault();
    Chat.chat(document.getElementById("chatForm").input);
});

addListener("click", "#shuffle", function(e)
{
    event.preventDefault();
    Admin.shuffle();
});

addListener("click", "#search-btn", function(e)
{
    //event.preventDefault();
    Search.showSearch();
});

addListener("click", "#song-title", function(e)
{
    event.preventDefault();
    Search.showSearch();
});

addListener("click", "#admin-lock", function(e)
{
    event.preventDefault();
    Admin.log_out();
});

addListener("click", "#closeSettings", function(e)
{
    event.preventDefault();
    Admin.hide_settings();
});

$(window).resize(function(){
    if(chan && !Helper.mobilecheck()){
        var temp_fit = Math.round(($("#wrapper").height()) / 71)+1;
        if(temp_fit > List.can_fit || temp_fit < List.can_fit){
            List.dynamicContentPage(-10);
        }
        if(List.can_fit < temp_fit){
            $($("#wrapper").children()[List.page + temp_fit - 1]).css("display", "inline-flex");
        } else if(List.can_fit > temp_fit){
            $($("#wrapper").children()[List.page + temp_fit]).css("display", "none");
        }
        List.can_fit = temp_fit;
        List.element_height = (($("#wrapper").height()) / List.can_fit)-5.3;
        Helper.css(".list-song", "height", List.element_height + "px");
        //$("#player_overlay").width($("#player").width()+1);
        Channel.set_title_width();
        if($("#controls").length > 0 && !Helper.mobilecheck()) $("#seekToDuration").css("top", $("#controls").position().top - 55);
        else if($("#controls").length > 0) $("#seekToDuration").css("top", $("#controls").position().top - 20);

        Channel.window_width_volume_slider();
    }
});

$(document).on( "click", ".result-object", function(e){
    var $html  = $(e.target);

    var substr = $html.prop('outerHTML').substring(0,4);
    if(substr != "<i c" && $html.prop('class').indexOf("waves-effect") == -1 && $html.attr("class") != "result-start" && $html.attr("class") != "result-end" && $html.attr("class") != "result-get-more-info"){
        var id 		= $(this).attr("data-video-id");
        var title 	= $(this).attr("data-video-title");
        var original_length 	= $(this).attr("data-video-length");
        var start   = parseInt($(this).find(".result-start").val());
        var end     = parseInt($(this).find(".result-end").val());
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
                Search.submitAndClose(id, title, length, start, end);
            } catch(e) {
                M.toast({html: "Only numbers are accepted as song start and end parameters..", displayLength: 3000, classes: "red lighten"});
            }
        }
    }
});

addListener("click", ".result-get-more-info", function(e) {
    event.preventDefault();
    var that = $(this);
    var parent = that.parent().parent().parent().parent();

    var to_toggle = $("#inner-results").find("[data-video-id='" + parent.attr("data-video-id") + "']")[0];
    to_toggle = $(to_toggle).children()[0];
    $(to_toggle).toggleClass("result-object-slid");
    if($(that.children()[0]).text() == "keyboard_arrow_right") {
        $(that.children()[0]).text("keyboard_arrow_left")
    } else {
        $(that.children()[0]).text("keyboard_arrow_right")
    }
})

addListener("click", '#submit-contact-form', function(e) {
    event.preventDefault();
    $("#contact-form").submit();
});

addListener("submit", '#contact-form', function(e){
    event.preventDefault();
    var message = $("#contact-form-message").val();
    var from    = $("#contact-form-from").val();

    Helper.send_mail(from, message);
});

addListener("click", ".send-error-modal", function(e) {
    event.preventDefault();
    $("#error-report-form").submit();
})

addListener("submit", "#error-report-form", function(e) {
    event.preventDefault();
    var captcha_response = grecaptcha.getResponse();
    Helper.removeClass("#send-loader", "hide");
    Helper.ajax({
        type: "POST",
        data: {
            from: "no-reply@zoff.me",
            message: $("#error-report-code").text(),
            "g-recaptcha-response": captcha_response,
        },
        url: "/api/mail",
        success: function(data){
            if(data == "success"){
                Helper.removeElement(".send-error-modal");
                Helper.removeElement("#error-report-form");
                Helper.removeElement(".error-code-container");
                $(".error-report-success").text("Error report sent!");
                Helper.setHtml("#contact-container", "Mail has been sent, we'll be back with you shortly.");
                window.location.reload(true);
            }else{
                $(".error-report-success").text("Mail was not sent, try again");
            }
            Helper.addClass("#send-loader", "hide");
        }
    });
});

$(document).on( "click", "#add-many", function(e){
    var id 		= $(this).attr("data-video-id");
    var title 	= $(this).attr("data-video-title");
    var original_length = $(this).attr("data-video-length");
    var parent = $(this).parent().parent();

    var start   = parseInt($(parent).find(".result-start").val());
    var end     = parseInt($(parent).find(".result-end").val());
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
            $(this).parent().parent().parent().remove();
            Search.submit(id, title, length, false, 0, 1, start, end);
        } catch(e) {
            M.toast({html: "Only numbers are accepted as song start and end parameters..", displayLength: 3000, classes: "red lighten"});
        }
    }

});

$(document).on( "click", ".vote-container", function(e){
    if(!$(this).parent().hasClass("side_away")) {
        var id = $(this).attr("data-video-id");
        List.vote(id, "pos");
    }
});

$(document).on( "click", ".delete_button", function(e){
    var id = $(this).attr("data-video-id");
    List.vote(id, "del");
});

$(document).on( "click", ".add-suggested", function(e){
    var id 		= $(this).attr("data-video-id");
    var title 	= $(this).attr("data-video-title");
    var length 	= $(this).attr("data-video-length");
    var added_by = $(this).attr("data-added-by");
    Search.submit(id, title, parseInt(length), false, 0, 1, 0, parseInt(length));
    if(added_by == "user") {
        number_suggested = number_suggested - 1;
        if(number_suggested < 0) number_suggested = 0;

        var to_display = number_suggested > 9 ? "9+" : number_suggested;
        if(!$(".suggested-link span.badge.new.white").hasClass("hide") && to_display == 0){
            Helper.addClass(".suggested-link span badge new white", "hide");
            Helper.addClass("#user_suggests", "hide");
            Helper.addClass("#suggest_bar", "hide");
        }

        $(".suggested-link span.badge.new.white").text(to_display);
    }
    Helper.removeElement("#suggested-" + id);
});

$(document).on( "click", ".del_suggested", function(e){
    var id = $(this).attr("data-video-id");

    Helper.removeElement("#suggested-" + id);
});

$(document).on( "click", ".del_user_suggested", function(e){
    var id = $(this).attr("data-video-id");
    Helper.removeElement("#suggested-" + id);

    number_suggested = number_suggested - 1;
    if(number_suggested < 0) number_suggested = 0;

    var to_display = number_suggested > 9 ? "9+" : number_suggested;
    if(to_display == 0){
        Helper.addClass(".suggested-link span badge new white", "hide");
    }

    $(".suggested-link span.badge.new.white").text(to_display);

    List.vote(id, "del");
});

addListener("click", '#toast-container', function(){
    $(this).fadeOut(function(){
        $(this).remove();
    });
});

addListener("click", "#embed-area", function(){
    this.select();
});

addListener("click", ".brand-logo-navigate", function(e){
    event.preventDefault();

    window.history.pushState("to the frontpage!", "Title", "/");
    Channel.onepage_load();
});

addListener("click", "#player_bottom_overlay", function(e){
    if($(e.target).attr("id") == "closePlayer") return;
    Frontpage.to_channel(chan.toLowerCase(), false);
});

addListener("click", ".generate-channel-name", function(e) {
    event.preventDefault();
    Helper.ajax({
        type: "GET",
        url: "/api/generate_name",
        success: function(response) {
            $(".room_namer").val("");
            $(".room-namer").val(response);
        }
    });

    ga('send', 'event', "button-click", "generate-channel");
});

$(document).keydown(function(event) {
    if(window.location.pathname != "/"){
        if(event.keyCode == 91 || event.keyCode == 17){
            find_start = true;
        } else if(find_start && event.keyCode == 70){
            find_start = false;
            find_started = !find_started;
            event.preventDefault();
            if(find_started){
                $("#find_div").toggleClass("hide");
                $("#find_input").focus();
                find_word = "";
            } else {
                $("#find_div").toggleClass("hide");
                $("#find_input").val("");
                $("#find_input").blur();
                Helper.removeClass(".highlight", "highlight");
                found_array = [];
                found_array_index = 0;
                find_word = "";
            }
        } else if(event.keyCode == 32 && $(".search-container").hasClass("hide") && window.location.pathname != "/" &&
        !$("#text-chat-input").is(":focus") &&
        !$("#password").is(":focus") &&
        !$("#user-pass-input").is(":focus") &&
        !$("#chan_thumbnail").is(":focus") &&
        !$("#chan_description").is(":focus") &&
        !$("#contact-form-from").is(":focus") &&
        !$("#contact-form-message").is(":focus") &&
        !$("#remote_channel").is(":focus") &&
        !$("#import").is(":focus") &&
        !$("#find_input").is(":focus") &&
        !$("#import_spotify").is(":focus")) {
            if(Player.player.getPlayerState() == 1) {
                event.preventDefault();
                Player.player.pauseVideo();
                return false;
            } else if(Player.player.getPlayerState() == 2 || Player.player.getPlayerState() == 5) {
                event.preventDefault();
                Player.player.playVideo();
                return false;
            }
        } else {
            find_start = false;
        }
    }
});

addListener("click", "#close_find_form_button", function(e) {
    event.preventDefault();
    find_start = false;
    find_started = false;
    $("#find_div").toggleClass("hide");
    $("#find_input").val("");
    $("#find_input").blur();
    Helper.removeClass(".highlight", "highlight");
    found_array = [];
    found_array_index = 0;
    find_word = "";
});

$(document).keyup(function(event){
    if((event.keyCode == 91 || event.keyCode == 17) && !find_started){
        find_start = false;
    }
});

addListener("submit", "#find_form", function(e){
    event.preventDefault();
    if(this.find_value.value != find_word) {
        find_word = this.find_value.value;
        found_array = [];
        found_array_index = 0;
    }
    if(found_array.length == 0){
        var that = this;
        found_array_index = 0;
        found_array = $.map(full_playlist, function(obj, index) {
            if(obj.title.toLowerCase().indexOf(that.find_value.value.toLowerCase()) >= 0 && index != full_playlist.length-1) {
                return index;
            }
        });
        $("#num_found").text(found_array_index + 1);
        $("#of_total_found").text(found_array.length);
    } else {
        found_array_index = found_array_index + 1;
        if(found_array.length - 1 < found_array_index){
            found_array_index = 0;
        }
        $("#num_found").text(found_array_index + 1);
        $("#of_total_found").text(found_array.length);
    }
    if(found_array.length > 0 && found_array[found_array_index] != full_playlist.length - 1){
        Helper.removeClass(".highlight", "highlight");
        var jump_to_page = Math.floor(found_array[found_array_index] / List.can_fit);
        $($("#wrapper").children()[found_array[found_array_index]]).addClass("highlight");
        List.dynamicContentPageJumpTo(jump_to_page);
    } else {
        Helper.removeClass(".highlight", "highlight");
        Helper.log(["none found"]);
    }
});
