
var chan 				  		= window.chan === undefined ? $("#chan").html() : window.chan;
var w_p 				  		= true;
var hasadmin			  		= 0;
var showToggle 			  		= true;
var list_html 			  		= $("#list-song-html").html();
var unseen 			   	  		= false;
var api_key 		   	  		= "AIzaSyDvMlC0Kvk76-WO9UrtBaaEYyUw4z-TGqE";
var searching 		   	  		= false;
var time_regex 		   	  		= /P((([0-9]*\.?[0-9]*)Y)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)W)?(([0-9]*\.?[0-9]*)D)?)?(T(([0-9]*\.?[0-9]*)H)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)S)?)?/;
var conf 			   	  		= [];
var private_channel 			= false;
var end_programmatically = false;
var music 			   	  		= 0;
var timed_remove_check;
var slider_type = "horizontal";
var programscroll = false;
var userscroll = false;
var gotten_np   = false;
var frontpage 		   	  		= 1;
var empty_clear = false;
var adminpass 		   	  		= "";
var showDiscovery						= false;
var temp_name = "";
var temp_pass = "";
var player_ready 	   	  		= false;
var viewers 			  		= 1;
var temp_user_pass 				= "";
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

try{/*
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
}*/

navigator.serviceWorker.getRegistration('/').then(function(registration) {
    if(registration) {
        registration.unregister();
    }
});

} catch(e) {}

$.ajaxPrefilter(function( options, original_Options, jqXHR ) {
    options.async = true;
});

$().ready(function(){
    if(!localStorage.getItem("VERSION") || parseInt(localStorage.getItem("VERSION")) != VERSION) {
        localStorage.setItem("VERSION", VERSION);
    }
    if(!fromFront && window.location.pathname != "/") init();
    else if(!fromChannel && window.location.pathname == "/"){
        initfp();
    }

    if(Helper.mobilecheck()) {
        socket.on("guid", function(msg) {
            guid = msg;
        });
    }

    $("#donate").modal();

    socket.on("connect", function(){
        if(connect_error){
            connect_error = false;
            $(".connect_error").fadeOut(function(){
                $(".connect_error").remove();
                Materialize.toast("Connected!", 2000, "green lighten");
                if(offline) {
                    socket.emit("offline", {status: true, channel: chan != undefined ? chan.toLowerCase() : ""});
                }
                if(chan != undefined && (Crypt.get_pass(chan.toLowerCase()) !== undefined && Crypt.get_pass(chan.toLowerCase()) !== "")){
                    socket.emit("password", {password: Crypt.crypt_pass(Crypt.get_pass(chan.toLowerCase())), channel: chan.toLowerCase()});
                }
                if(chan != undefined && conf_arr.name !== undefined && conf_arr.name !== "" && conf_arr.chat_pass !== undefined && conf_arr.chat_pass !== ""){
                    setTimeout(function() {
                        Chat.namechange(conf_arr.name + " " + conf_arr.chat_pass, true);
                    }, 100); //to take height for delay on establishing connection
                }
            });
        }

    });

    socket.on("name", function(data) {
        if(data.type == "name" && data.accepted) {
            Crypt.set_name(temp_name, temp_pass);
            temp_name = "";
            temp_pass = "";
        } else {
            temp_name = "";
            temp_pass = "";
        }
    });

    socket.on("self_ping", function() {
        if(chan != undefined && chan.toLowerCase() != "") {
            socket.emit("self_ping", {channel: chan.toLowerCase()});
        }
    });

    setup_no_connection_listener();
});

function init(){
    number_suggested = 0;
    var no_socket = true;

    chan = $("#chan").html();
    mobile_beginning = Helper.mobilecheck();
    var side = Helper.mobilecheck() ? "left" : "right";

    window.onpopstate = function(e){
        onepage_load();
    };

    if(window.location.hostname == "fb.zoff.me") {
        $("footer").addClass("hide");
    }

    if(window.location.hostname != "fb.zoff.me") share_link_modifier_channel();
    if(window.location.hostname == "zoff.me" || window.location.hostname == "fb.zoff.me") add = "https://zoff.me";
    else add = window.location.hostname;

    if(Player !== undefined) Player.stopInterval= false;

    $('ul.playlist-tabs').tabs();
    $('ul.playlist-tabs-loggedIn').tabs();
    $('ul.chatTabs').tabs();
    $("#settings").sideNav({
        menuWidth: 310,
        edge: side,
        closeOnClick: false,
        onOpen: function(el) {
            if(!$(".hamburger-sidenav").hasClass("open")) {
                $(".hamburger-sidenav").addClass("open");
            }
            $('*[id*=sidenav-overlay]:visible').each(function(i) {
                if(i > 0) {
                    this.remove();
                }
            });
        },
        onClose: function(el) {
            $(".hamburger-sidenav").removeClass("open");
            $('*[id*=sidenav-overlay]:visible').each(function(i) {
                if(i > 0) {
                    this.remove();
                }
            });
        },
    });
    $('.collapsible').collapsible({
        accordion : true
    });
    $("#help").modal();
    $("#contact").modal();
    $("#embed").modal();
    $("#delete_song_alert").modal({
        dismissible: false
    });
    $("#user_password").modal({
        dismissible: false
    });

    spotify_is_authenticated(spotify_authenticated);

    result_html 	   	  = $("#temp-results-container");
    pagination_buttons_html = $("<div>").append($(".pagination-results").clone()).html();
    empty_results_html 	  = $("#empty-results-container").html();
    not_import_html       = $(".not-imported-container").html();
    not_export_html       = $(".not-exported-container").html();
    $(".not-imported-container").empty();
    $(".not-exported-container").empty();

    $(".video-container").resizable({
        start: function(event, ui) {
            $('iframe').css('pointer-events','none');
        },
        stop: function(event, ui) {
            $('iframe').css('pointer-events','auto');
            Crypt.set_width($(this).width());
            set_title_width();
        },
        handles: "e",
        minWidth: 350,
        maxWidth: $(window).width()-241
    });

    if(socket === undefined || Helper.mobilecheck()){
        no_socket = false;
        socket = io.connect(''+add+':8080', connection_options);
        socket.on('update_required', function() {
            window.location.reload(true);
        });
    }

    Crypt.init();
    setup_auth_listener();

    if(Crypt.get_offline()){
        $(".offline_switch_class")[0].checked = true;
        change_offline(true, offline);
    }

    if($("#alreadychannel").length === 0 || Helper.mobilecheck()){
        setup_youtube_listener();
        get_list_listener();
        setup_suggested_listener();
        setup_viewers_listener();

    } else {
        $("#channel-load").css("display", "none");
        $("#player").css("opacity", "1");
        $("#controls").css("opacity", "1");
        $(".playlist").css("opacity", "1");
        Player.readyLooks();
        Playercontrols.initYoutubeControls(Player.player);
        Playercontrols.initSlider();
        Player.player.setVolume(Crypt.get_volume());
        $(".video-container").removeClass("no-opacity");

        var codeURL = "https://remote."+window.location.hostname+"/"+id;
        $("#code-text").text(id);
        $("#code-qr").attr("src", "https://chart.googleapis.com/chart?chs=221x221&cht=qr&choe=UTF-8&chld=L|1&chl="+codeURL);
        $("#code-link").attr("href", codeURL);
    }

    if(no_socket){
        var add = "";
        if(private_channel) add = Crypt.getCookie("_uI") + "_";
        socket.emit("list", {version: parseInt(localStorage.getItem("VERSION")), channel: add + chan.toLowerCase(), pass: embed ? '' : Crypt.crypt_pass(Crypt.get_userpass(chan.toLowerCase()))});
    }

    if(!Helper.mobilecheck()) {
        $("#viewers").tooltip({
            delay: 5,
            position: "top",
            tooltip: "Viewers"
        });

        $("#fullscreen").tooltip({
            delay: 5,
            position: "top",
            tooltip: "Fullscreen"
        });

        $("#search-btn").tooltip({
            delay: 5,
            position: "bottom",
            tooltip: "Search"
        });


        $("#shuffle").tooltip({
            delay: 5,
            position: "bottom",
            tooltip: "Shuffle",
        });

        $("#settings").tooltip({
            delay: 5,
            position: "bottom",
            tooltip: "Settings",
        });
    }

    window.onYouTubeIframeAPIReady = Player.onYouTubeIframeAPIReady;
    if(Player.player === "" || Player.player === undefined || Helper.mobilecheck()) Player.loadPlayer();
    //}

    if(Helper.mobilecheck()) {
        Mobile_remote.initiate_volume();
        $(".close-settings").addClass("hide");
    }	else {
        $('input#chan_description').characterCounter();
        window_width_volume_slider();
    }

    setup_admin_listener();
    setup_list_listener();
    setup_chat_listener();

    socket.emit("get_history", {channel: chan.toLowerCase(), all: false});
    socket.emit("get_history", {channel: chan.toLowerCase(), all: true});

    if(!Helper.mobilecheck() && $("#alreadychannel").length === 0) setup_host_initialization();

    if(!Helper.msieversion() && !Helper.mobilecheck()) Notification.requestPermission();

    $(".search_input").focus();

    Helper.sample();
    if(!Helper.mobilecheck()) {
        $('.castButton').tooltip({
            delay: 5,
            position: "top",
            tooltip: "Cast Zoff to TV"
        });

        $("#color_embed").spectrum({
            color: "#808080",
            change: function(c) {
                color = c.toHexString().substring(1); // #ff0000
                $("#embed-area").val(embed_code(embed_autoplay, embed_width, embed_height, color));
            },
            appendTo: "#embed",
            containerClassName: 'polyfill-color z-depth-4',
            show: function(color) {
            },
        });

        $(".sp-choose").addClass("hide");
        $(".sp-cancel").addClass("btn-flat waves-effect waves-red");
        $(".sp-cancel").removeClass("sp-cancel");
        $(".sp-button-container").append("<a href='#' class='btn-flat waves-effect waves-green sp-choose-link'>CHOOSE</a>");
    }

    $(".sp-choose-link").on("click", function(e) {
        e.preventDefault();
        $(".sp-choose").trigger("click");
    });

    $("#results" ).hover( function() { $("div.result").removeClass("hoverResults"); i = 0; }, function(){ });
    $("#search").focus();
    $("#embed-button").css("display", "inline-block");
    $("#embed-area").val(embed_code(embed_autoplay, embed_width, embed_height, color));
    $("#search").attr("placeholder", "Find song on YouTube...");

    if(!$("footer").hasClass("padding-bottom-novideo")) {
        $("footer").addClass("padding-bottom-novideo");
    }

    if(!/chrom(e|ium)/.test(navigator.userAgent.toLowerCase()) && !Helper.mobilecheck()){
        $(".castButton").css("display", "none");
    }

    Helper.log("chromecastAvailable" + chromecastAvailable);
    Helper.log("chromecastAvailable" + chromecastReady);

    if(chromecastAvailable){
        hide_native(1);
    } else if(chromecastReady) {
        initializeCastApi();
    } else {
        window['__onGCastApiAvailable'] = function(loaded, errorInfo) {
            if (loaded) {
                setTimeout(function(){
                    chromecastReady = true;
                    initializeCastApi();
                }, 1000);
            } else {
                chromecastReady = true;
            }
        }
    }
    channel_listeners(true);
    $.contextMenu({
        selector: '.playlist-element',
        reposition: true,
        autoHide: true,
        items: {
            copy: {
                name: "Copy link",
                callback: function(key, opt){
                    var this_id = $(this[0]).attr("data-video-id");
                    var this_url = "https://www.youtube.com/watch?v=" + this_id;
                    $(".copy_video_id").css("display", "block");
                    $(".copy_video_id").text(this_url);
                    var copyTextarea = document.querySelector('.copy_video_id');
                    copyTextarea.select();
                    var successful = document.execCommand('copy');
                    if(successful) {
                        Materialize.toast("Copied!", 2000, "green lighten");
                    } else {
                        Materialize.toast("Error copying..", 2000, "red lighten");
                    }
                    $(".copy_video_id").css("display", "none");
                }
            },
            similar: {
                name: "Find Similar",
                callback: function(key, opt) {
                    var this_id = $(this[0]).attr("data-video-id");
                    Search.search(this_id, false, true);
                    if(Helper.contains($(".search-container").attr("class").split(" "), "hide")) {
                        Search.showSearch();
                    }
                }
            },
            "sep1": "---------",
            delete: {
                name: "Delete",
                callback: function(key, opt) {
                    var this_id = $(this[0]).attr("data-video-id");
                    var this_type = $(this[0]).attr("data-video-type");

                    if(this_type == "suggested") {
                        number_suggested = number_suggested - 1;
                        if(number_suggested < 0) number_suggested = 0;

                        var to_display = number_suggested > 9 ? "9+" : number_suggested;
                        if(!$(".suggested-link span.badge.new.white").hasClass("hide") && to_display == 0){
                            $(".suggested-link span.badge.new.white").addClass("hide");
                        }

                        $(".suggested-link span.badge.new.white").text(to_display);
                    }

                    List.vote(this_id, "del");
                },
                disabled: function(key, opt) {
                    return w_p;
                }
            }
        }
    });

    if(!Helper.mobilecheck() && navigator.userAgent.match(/iPad/i) == null){
        setTimeout(function(){set_title_width();}, 100);
    }
}

initializeCastApi = function() {
    cast.framework.CastContext.getInstance().setOptions({
        receiverApplicationId: "E6856E24",
        autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
    });
    var context = cast.framework.CastContext.getInstance();
    chromecastReady = true;
    context.addEventListener(cast.framework.CastContextEventType.SESSION_STATE_CHANGED, function(event) {
        Helper.log("session state");
        Helper.log(event.sessionState);
        switch (event.sessionState) {
            case cast.framework.SessionState.SESSION_STARTED:
            castSession = cast.framework.CastContext.getInstance().getCurrentSession();
            castSession.addMessageListener("urn:x-cast:zoff.me", chromecastListener)
            chrome.cast.media.GenericMediaMetadata({title:song_title, image: 'https://img.youtube.com/vi/'+video_id+'/mqdefault.jpg'});
            chrome.cast.Image('https://img.youtube.com/vi/'+video_id+'/mqdefault.jpg');
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
                chromecast_specs_sent = true;
                castSession.sendMessage("urn:x-cast:zoff.me", {type: "mobilespecs", guid: guid, socketid: socket.id, adminpass: adminpass == "" ? "" : Crypt.crypt_pass(adminpass), channel: chan.toLowerCase(), userpass: embed ? '' : Crypt.crypt_pass(Crypt.get_userpass(chan.toLowerCase()))})
            }
            hide_native(1);
            break;
            case cast.framework.SessionState.SESSION_RESUMED:
            castSession = cast.framework.CastContext.getInstance().getCurrentSession();
            castSession.addMessageListener("urn:x-cast:zoff.me", chromecastListener);
            chrome.cast.media.GenericMediaMetadata({title:song_title, image: 'https://img.youtube.com/vi/'+video_id+'/mqdefault.jpg'});
            chrome.cast.Image('https://img.youtube.com/vi/'+video_id+'/mqdefault.jpg');
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
            break;
            case cast.framework.SessionState.SESSION_ENDED:
            chromecastAvailable = false;
            hide_native(0);
            break;
        }
    });

    context.addEventListener(cast.framework.CastContextEventType.CAST_STATE_CHANGED, function(event){
        Helper.log("cast state");
        Helper.log(event.castState);
        if(event.castState == "NOT_CONNECTED"){
            $(".castButton").css("display", "block");
            if(!$(".volume-container").hasClass("volume-container-cast")) {
                $(".volume-container").addClass("volume-container-cast");
            }
            cast_ready_connect = true;
            if(!localStorage.getItem("_chSeen") || localStorage.getItem("_chSeen") != "seen") {
                $(".castButton").css("display", "block");
                showDiscovery = true;
                $('.tap-target').tapTarget('open');
                tap_target_timeout = setTimeout(function() {
                    $('.tap-target').tapTarget('close');
                }, 4000);
                localStorage.setItem("_chSeen", "seen");
                $('.castButton').removeClass('castButton-white-active');
            }
        } else if(event.castState == "NO_DEVICES_AVAILABLE"){
            cast_ready_connect = false;
            $(".volume-container").removeClass("volume-container-cast");
        }
    });

    if(context.getCastState() == "NOT_CONNECTED") {
        $(".castButton").css("display", "block");
        $('.castButton').removeClass('castButton-white-active');
        cast_ready_connect = true;
    }
};

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
        $("#player_overlay").removeClass("hide");
        $("#player_overlay").css("display", "block");
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
        $("#player_overlay").css("background", "url(https://i.ytimg.com/vi/" + video_id + "/maxresdefault.jpg)");
        $("#player_overlay").css("background-position", "center");
        $("#player_overlay").css("background-size", "100%");
        $("#player_overlay").css("background-color", "black");
        $("#player_overlay").css("background-repeat", "no-repeat");
        $("#playing_on").css("display", "flex");
        $("#chromecast_text").html("Playing on<br>" + castSession.La.friendlyName);
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
    var json_parsed = JSON.parse(data);
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
        Helper.log('Connection Failed');
        if(!connect_error){
            connect_error = true;
            Materialize.toast("Error connecting to server, please wait..", 100000000, "red lighten connect_error");
        }
    });

    socket.on("connect_error", function(){
        Helper.log("Connection Failed.");
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
        socket.emit("list", {version: parseInt(localStorage.getItem("VERSION")), channel: add + chan.toLowerCase(), pass: embed ? '' : Crypt.crypt_pass(Crypt.get_userpass(chan.toLowerCase()))});
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
}

function setup_playlist_listener(){
    Helper.log("Setting up playlist_listener");
    socket.on('playlists', Frontpage.frontpage_function);
}

function setup_host_initialization(){
    socket.on("id", Hostcontroller.host_listener);
}

function setup_host_listener(id){
    socket.on(id, Hostcontroller.host_on_action);
}

function enable_debug(){
    localStorage.debug = true;
}

function disable_debug(){
    localStorage.debug = false;
}

function embed_code(autoplay, width, height, color){
    return '<iframe src="https://zoff.me/_embed#' + chan.toLowerCase() + '&' + color + autoplay + '" width="' + width + 'px" height="' + height + 'px"></iframe>';
}

function set_title_width(start){
    if($(window).width() > 760){
        var add_width = $(".brand-logo").outerWidth()
        if(start){
            add_width = $(window).width()*0.15;
        }
        var test_against_width = $(window).width() - $(".control-list").width() - add_width - 33;
        title_width = test_against_width;
        $(".title-container").width(title_width);
    } else {
        $(".title-container").width("100%");
    }
}

function randomString(length){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.-_";
    for(var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

function change_offline(enabled, already_offline){
    Crypt.set_offline(enabled);
    offline = enabled;
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
            $("#controls").on("mousemove", seekToMove);
            $("#controls").on("click", seekToClick);
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
        $("#controls").off("mousemove", seekToMove);
        $("#controls").off("click", seekToClick);
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

function spotify_is_authenticated(bool){
    if(bool){
        Helper.log("------------------------");
        Helper.log("Spotify is authenticated");
        Helper.log("access_token: " + access_token_data.access_token);
        Helper.log("token_type:" + access_token_data.token_type);
        Helper.log("expires_in: " + access_token_data.expires_in);
        Helper.log("------------------------");
        $(".spotify_authenticated").css("display", "block");
        $(".spotify_unauthenticated").css("display", "none");
    } else {
        Helper.log("----------------------------");
        Helper.log("Spotify is not authenticated");
        Helper.log("----------------------------");
        $(".spotify_authenticated").css("display", "none");
        $(".spotify_unauthenticated").css("display", "block");
    }
}

window.zoff = {
    enable_debug: enable_debug,
    disable_debug: disable_debug
}

function seekToMove(e){
    var pos_x = e.clientX - Math.ceil($("#seekToDuration").width() / 2) - 8;
    if(pos_x < 0) pos_x = 0;
    else if(pos_x + $("#seekToDuration").width() > $("#controls").width()) {
        pos_x = $("#controls").width() - $("#seekToDuration").width();
    }
    $("#seekToDuration").css("left", pos_x);
    try{
        var total = full_playlist[full_playlist.length - 1].duration / $("#controls").width();
        total = total * e.clientX;
        var _time = Helper.secondsToOther(total);
        var _minutes = Helper.pad(_time[0]);
        var _seconds = Helper.pad(Math.ceil(_time[1]));
        $("#seekToDuration").text(_minutes + ":" + _seconds);

        var acceptable = ["bar", "controls", "duration"];
        if(acceptable.indexOf($(e.target).attr("id")) >= 0 && dragging) {
            $("#bar").width(((100 / duration) * total) + "%");
        }
    } catch(e){}
}

function seekToClick(e){
    var acceptable = ["bar", "controls", "duration"];

    if(acceptable.indexOf($(e.target).attr("id")) >= 0) {
        var total = full_playlist[full_playlist.length - 1].duration / $("#controls").width();
        total = total * e.clientX;

        Helper.log(total);
        if(!chromecastAvailable){
            Player.player.seekTo(total + Player.np.start);

            dMinutes = Math.floor(duration / 60);
            dSeconds = duration - dMinutes * 60;
            currDurr = total;
            if(currDurr - Player.np.start > duration) {
                currDurr = duration - Player.np.start;
            }
            currDurr = currDurr - Player.np.start;
            minutes = Math.floor(currDurr / 60);
            seconds = currDurr - (minutes * 60);
            document.getElementById("duration").innerHTML = Helper.pad(minutes)+":"+Helper.pad(seconds)+" <span id='dash'>/</span> "+Helper.pad(dMinutes)+":"+Helper.pad(dSeconds);
            per = (100 / duration) * currDurr;
            if(per >= 100)
            per = 100;
            else if(duration === 0)
            per = 0;
            $("#bar").width(per+"%");
        } else {
            castSession.sendMessage("urn:x-cast:zoff.me", {type: "seekTo", seekTo: total});
        }
    }
}

$(document).on("click", "#bitcoin-address", function(e) {
    var copyTextarea = document.querySelector('#bitcoin-address');
    copyTextarea.select();
    var successful = document.execCommand('copy');
    if(successful) {
        Materialize.toast("Copied!", 2000, "green lighten");
    } else {
        Materialize.toast("Error copying..", 2000, "red lighten");
    }
});

$(document).on("click", "#ethereum-address", function(e) {
    var copyTextarea = document.querySelector('#ethereum-address');
    copyTextarea.select();
    var successful = document.execCommand('copy');
    if(successful) {
        Materialize.toast("Copied!", 2000, "green lighten");
    } else {
        Materialize.toast("Error copying..", 2000, "red lighten");
    }
});

$(document).on("click", ".pagination-results a", function(e) {
    e.preventDefault();
    var that = $(this);
    var pageToken = that.attr("data-pagination");
    var searchInput = that.attr("data-original-search");
    $(".pagination-results a").addClass("disabled");
    Search.search(searchInput, false, false, pageToken);
});

$(document).on("click", ".accept-delete", function(e) {
    e.preventDefault();
    /*var delete_id = $(this).attr("data-video-id");
    if(delete_id) {
    List.vote(delete_id, 'del');
}*/
socket.emit("delete_all", {channel: chan.toLowerCase(), adminpass: adminpass == "" ? "" : Crypt.crypt_pass(adminpass), pass: embed ? '' : Crypt.crypt_pass(Crypt.get_userpass(chan.toLowerCase()))});
$("#delete_song_alert").modal("close");
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
            $("body").attr("style", "overflow-y:auto")
            $("#search-btn i").html("search");
            $(".search_input").val("");
        }
        if($(".search-container").length != 0 && !Helper.contains($(".search-container").attr("class").split(" "), "hide")){
            $("#results").toggleClass("hide");
        }
    } else if(event.keyCode == 13 && $("#search").val() == "fireplace" && !$(".search-container").hasClass("hide") && window.location.pathname != "/") {
        clearTimeout(timeout_search);
        $("#results").html("");
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
            $("#fireplace_player").css("display", "none");
        } else {
            fireplace_initiated = true;
            $("#fireplace_player").css("display", "block");
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

$(document).on("click", "#chat_submit", function(e){
    e.preventDefault();
    $("#chatForm").submit();
});

$(document).on("click", ".list-remove", function(e) {
    e.preventDefault();
    $('#' + $(this).parent().attr("id")).contextMenu();
});

$(document).on("mouseleave", ".card.sticky-action", function(e){
    var that = this;
    $(that).find(".card-reveal").attr("style", "display: block;transform: translateY(0%);");
    clearTimeout(image_timeout);
    image_timeout = setTimeout(function(){
        $(that).find(".card-reveal").attr("style", "display: none;");
    }, 100);
});

$(document).on("click", "#offline-mode", function(e){
    e.preventDefault();
    if(!Crypt.get_offline()){
        change_offline(true, offline);
    } else{
        change_offline(false, offline);
    }

});

$(document).on("submit", "#thumbnail_form", function(e){
    e.preventDefault();
    socket.emit("suggest_thumbnail", {channel: chan, thumbnail: $("#chan_thumbnail").val(), adminpass: Crypt.crypt_pass(Crypt.get_pass(chan.toLowerCase())), pass: embed ? '' : Crypt.crypt_pass(Crypt.get_userpass(chan.toLowerCase()))});
    $("#chan_thumbnail").val("");
});

$(document).on("submit", "#description_form", function(e){
    e.preventDefault();
    socket.emit("suggest_description", {channel: chan, description: $("#chan_description").val(), adminpass: Crypt.crypt_pass(Crypt.get_pass(chan.toLowerCase())), pass: embed ? '' : Crypt.crypt_pass(Crypt.get_userpass(chan.toLowerCase()))});
    $("#chan_description").val("");
});

$(document).on("click", "#playpause-overlay", function(){
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

$(document).on('click', '#cookieok', function() {
    $(this).fadeOut(function(){
        $(this).remove();
        localStorage.ok_cookie = true;
    });
});

$(document).on("click", ".connect_error", function(e){
    e.preventDefault();
    $(this).fadeOut(function(){
        $(this).remove();
        connect_error = false;
    });
});

$(document).on("click", ".extra-button-search", function(e){
    e.preventDefault();
    $("#search").val($(this).attr("data-text"));
    Search.search($(this).attr("data-text"));
});

$(document).on("click", ".extra-button-delete", function(e){
    e.preventDefault();
    $(this).parent().remove();
    if($(".not-imported-container").children().length === 0){
        $(".not-imported").toggleClass("hide");
    }
});

$(document).on("click", "#closePlayer", function(e){
    e.preventDefault();
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

$(document).on("click", ".prev_page", function(e){
    e.preventDefault();
    List.dynamicContentPage(-1);
});

$(document).on("click", ".modal-close", function(e){
    e.preventDefault();
});

$(document).on("change", ".password_protected", function(e) {
    e.preventDefault();
    if(this.checked) {
        $("#user_password").modal('open');
        $("#user-pass-input").focus();
    } else {
        userpass = "";
        if(!$(".change_user_pass").hasClass("hide")) $(".change_user_pass").addClass("hide");
        Admin.save(true);
    }
});

$(document).on("submit", "#user-password-channel-form", function(e) {
    e.preventDefault();
    if(user_auth_started) {
        temp_user_pass = CryptoJS.SHA256($("#user-pass-input").val()).toString();
        $("#user-pass-input").val("");
        socket.emit("list", {version: parseInt(localStorage.getItem("VERSION")), channel: chan.toLowerCase(), pass: Crypt.crypt_pass(temp_user_pass)});
    } else {
        $("#user_password").modal('close');
        userpass = $("#user-pass-input").val();
        user_change_password = false;
        $("#user-pass-input").val("");
        Admin.save(true);
    }
});

$(document).on("click", ".change_user_pass_btn", function(e) {
    e.preventDefault();
    user_change_password = true;
    $("#user_password").modal('open');
    $("#user-pass-input").focus();
});

$(document).on("click", ".submit-user-password", function(e) {
    e.preventDefault();
    if(user_auth_started) {
        temp_user_pass = CryptoJS.SHA256($("#user-pass-input").val()).toString();
        $("#user-pass-input").val("");
        socket.emit("list", {version: parseInt(localStorage.getItem("VERSION")), channel: chan.toLowerCase(), pass: Crypt.crypt_pass(temp_user_pass)});
    } else {
        $("#user_password").modal('close');
        userpass = $("#user-pass-input").val();
        user_change_password = false;
        $("#user-pass-input").val("");
        Admin.save(true);
    }
});

$(document).on("click", ".close-user-password", function() {
    if(user_auth_started) {
        Player.stopInterval = true;
        user_auth_avoid = true;
        if(!Helper.mobilecheck()) {
            $('.castButton').tooltip("remove");
            $("#viewers").tooltip("remove");
            //$('.castButton-unactive').tooltip("remove");
            $("#offline-mode").tooltip("remove");
            $('#chan_thumbnail').tooltip("remove");
            $('#admin-lock').tooltip("remove");
        }
        window.history.pushState("to the frontpage!", "Title", "/");
        onepage_load();
    } else {
        $("#user-pass-input").val("");
        if(!user_change_password) {
            $(".password_protected").prop("checked", false);
        }
        user_change_password = false;
    }
});

$(document).on("click", ".delete-all-songs", function(e){
    e.preventDefault();
    $("#delete_song_alert").modal("open");
});

$(document).on("click", ".not-exported-container .not-exported-element #extra-export-container-text .extra-add-text", function(){
    this.select();
});

$(document).on("click", ".next_page", function(e){
    e.preventDefault();
    List.dynamicContentPage(1);
});

$(document).on("click", ".last_page", function(e){
    e.preventDefault();
    List.dynamicContentPage(10);
});

$(document).on("click", ".first_page", function(e){
    e.preventDefault();
    List.dynamicContentPage(-10);
});

$(document).on("click", ".donate-button", function(e) {
    e.preventDefault();
    $("#donate").modal("open");
});

$(document).on('click', '#toast-container', function(){
    before_toast();
});

$(document).on('click', "#aprilfools", function(){
    $(".mega").css("-webkit-transform", "rotate(0deg)");
    $(".mega").css("-moz-transform", "rotate(0deg)");
});

$(document).on('change', '#view_channels_select', function(e) {
    var that = this;
    if(currently_showing_channels != parseInt(that.value)) {

        Frontpage.populate_channels(Frontpage.all_channels, (parseInt(that.value) == 1 ? true : false));
    }
    currently_showing_channels = parseInt(that.value);
});

$(document).on('keyup mouseup', '#width_embed', function(){
    var that = $(this);
    embed_width = that.val();
    $("#embed-area").val(embed_code(embed_autoplay, embed_width, embed_height, color));
});

$(document).on('keyup mouseup', '#height_embed', function(){
    var that = $(this);
    embed_height = that.val();
    $("#embed-area").val(embed_code(embed_autoplay, embed_width, embed_height, color));
});

$(document).on('input', '#color_embed', function(){
    var that = $(this);
    color = that.val().substring(1);
    $("#embed-area").val(embed_code(embed_autoplay, embed_width, embed_height, color));
});

$(document).on('click', ".chan-link", function(e){
    e.preventDefault();
    Frontpage.to_channel($(this).attr("href"), false);
});

$(document).on("click", ".listen-button", function(e){
    if($(".room-namer").val() === ""){
        e.preventDefault();
        Frontpage.to_channel($(".room-namer").attr("placeholder"));
    }
});

$(document).on("submit", ".channel-finder", function(e){
    e.preventDefault();
    Frontpage.to_channel($(".room-namer").val());
    return false;
});

$(document).on("submit", ".channel-finder-mobile", function(e){
    e.preventDefault();
    Frontpage.to_channel($("#searchFrontpage").val());
    return false;
});

$(document).on("change", 'input[class=remote_switch_class]', function()
{
    Hostcontroller.change_enabled(document.getElementsByName("remote_switch")[0].checked);
    Crypt.set_remote(enabled);
});

$(document).on("change", 'input[class=offline_switch_class]', function()
{
    offline = document.getElementsByName("offline_switch")[0].checked;
    change_offline(offline, !offline);
});

$(document).on("change", 'input[class=conf]', function()
{
    Admin.save(false);
});

$("#clickme").click(function(){
    Player.playVideo();
});

$(document).on("click", "#listExport", function(e){
    e.preventDefault();
    Helper.log(full_playlist);
    if(!youtube_authenticated){
        var nonce = randomString(29);
        window.callback = function(data) {
            access_token_data_youtube = data;
            if(access_token_data_youtube.state == nonce){
                youtube_authenticated = true;
                $("#playlist_loader_export").removeClass("hide");
                $(".youtube_export_button").addClass("hide");
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

$(document).on("click", ".export-spotify-auth", function(e){
    e.preventDefault();
    var nonce = randomString(29);
    window.callback = function(data) {
        access_token_data = data;
        if(access_token_data.state == nonce){
            spotify_authenticated = true;
            spotify_is_authenticated(true);
            setTimeout(function(){
                spotify_authenticated = false;
                access_token_data = {};
                spotify_is_authenticated(false);
            }, access_token_data.expires_in * 1000);
            $(".spotify_export_button").css("display", "none");
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

$(document).on("submit", "#listImport", function(e){
    e.preventDefault();
    var url = $("#import").val().split("https://www.youtube.com/playlist?list=");
    if($("#import").val() !== "" && url.length == 2){
        Search.importPlaylist(url[1]);
        document.getElementById("import").value = "";
        document.getElementById("import").disabled = true;
        $("#import").addClass("hide");
        $("#playlist_loader").removeClass("hide");
    } else {
        before_toast();
        Materialize.toast("It seems you've entered a invalid url.", 4000);
    }
    document.getElementById("import").value = "";
});

$(document).on("submit", "#listImportSpotify", function(e){
    e.preventDefault();
    if(spotify_authenticated && $("#import_spotify").val() !== ""){
        var url = $("#import_spotify").val().split("https://open.spotify.com/user/");
        if(url.length == 2) {
            url = url[1].split("/");
            var user = url[0];
            var playlist_id = url[2];

            document.getElementById("import_spotify").disabled = true;
            $("#import_spotify").addClass("hide");
            $("#playlist_loader_spotify").removeClass("hide");

            Search.importSpotifyPlaylist('https://api.spotify.com/v1/users/' + user + '/playlists/' + playlist_id + '/tracks');
        } else {
            before_toast();
            Materialize.toast("It seems you've entered a invalid url.", 4000);
        }
    }
    document.getElementById("import_spotify").value = "";
});

$(window).focus(function(){
    $("#favicon").attr("href", "/assets/images/favicon.png");
    unseen = false;
});

$(document).on("change", "#autoplay", function() {
    if(this.checked) embed_autoplay = "&autoplay";
    else embed_autoplay = "";
    $("#embed-area").val(embed_code(embed_autoplay, embed_width, embed_height, color));
});

$(document).on("click", "#playbutton_remote", function(e) {
    e.preventDefault();
    Mobile_remote.play_remote();
});

$(document).on("click", "#pausebutton_remote", function(e) {
    e.preventDefault();
    Mobile_remote.pause_remote();
});

$(document).on("click", "#skipbutton_remote", function(e) {
    e.preventDefault();
    Mobile_remote.skip_remote();
});

$(document).on("submit", "#remoteform", function(e) {
    e.preventDefault();
    Mobile_remote.get_input($("#remote_channel").val());
});

$(document).on("click", ".chat-link", function(){
    $("#text-chat-input").focus();
    $("#chat-btn i").css("opacity", 1);
    Chat.channel_received = 0;
    Chat.all_received = 0;
    if(!$(".chat-link span.badge.new.white").hasClass("hide")){
        $(".chat-link span.badge.new.white").addClass("hide");
    }
    unseen = false;
    $("#favicon").attr("href", "/assets/images/favicon.png");

    scrollChat();
});

$(document).on("click", ".chat-tab-li", function() {
    scrollChat();
});

function channel_listeners(on) {
    if(on) {
        $("#chatchannel").scroll(function(e) {
            if(!programscroll) {
                userscroll = true;
                if($("#chatchannel").scrollTop() + $("#chatchannel").innerHeight() >= $("#chatchannel")[0].scrollHeight) {
                    userscroll = false;
                }
            }
        });
        $("#chatall").scroll(function(e) {
            if(!programscroll) {
                userscroll = true;
                if($("#chatall").scrollTop() + $("#chatall").innerHeight() >= $("#chatall")[0].scrollHeight) {
                    userscroll = false;
                }
            }
        })
    } else {
        $("#chatchannel").off("scroll");
        $("#chatall").off("scroll");
    }
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

$(document).on('keyup', ".search_input", function(event) {
    searchTimeout(event);
});

$(document).on("click", ".chat-tab", function(){
    $("#text-chat-input").focus();
});

$(document).on("click", ".prev", function(e){
    e.preventDefault();
    List.skip(false);
});

$(document).on("click", ".skip", function(e){
    e.preventDefault();
    List.skip(true);
});

$(document).on("click", "#chan", function(e){
    e.preventDefault();
    List.show();
});

$(document).on("submit", "#adminForm", function(e){
    e.preventDefault();
    Admin.pass_save();
});

$(document).on("click", ".chat-link", function(e){
    chat_active = true;
    unseen = false;
    chat_unseen = false;
    $(".chat-link").attr("style", "color: white !important;");
    blinking = false;
    $("#favicon").attr("href", "/assets/images/favicon.png");
    $("#chat-container").css("display", "block");
    $("#wrapper").css("display", "none");
    $("#suggestions").css("display", "none");
    $("#text-chat-input").focus();
    $("#pageButtons").css("display", "none");
});

$(document).on("click", ".playlist-link", function(e){
    chat_active = false;
    $("#chat-container").css("display", "none");
    $("#wrapper").css("display", "block");
    $("#suggestions").css("display", "none");
    $("#pageButtons").css("display", "flex");
});

$(document).on("click", ".suggested-link", function(e){
    chat_active = false;
    $("#chat-container").css("display", "none");
    $("#wrapper").css("display", "none");
    $("#suggestions").css("display", "block");
    $("#pageButtons").css("display", "none");
});

$(document).on("click", ".import-spotify-auth", function(e){
    e.preventDefault();
    var nonce = randomString(29);
    window.callback = function(data) {
        access_token_data = data;
        if(access_token_data.state == nonce){
            spotify_authenticated = true;
            spotify_is_authenticated(true);
            setTimeout(function(){
                spotify_authenticated = false;
                access_token_data = {};
                spotify_is_authenticated(false);
                $(".spotify_authenticated").css("display", "none");
                $(".spotify_unauthenticated").css("display", "block");
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

$(document).on("click", ".import-youtube", function(e){
    e.preventDefault();
    $(".youtube_unclicked").css("display", "none");
    $(".youtube_clicked").css("display", "block");
});

$(document).on("submit", "#chatForm", function(e){
    e.preventDefault();
    Chat.chat(document.getElementById("chatForm").input);
});

$(document).on("click", "#shuffle", function(e)
{
    e.preventDefault();
    Admin.shuffle();
});

$(document).on("click", "#search-btn", function(e)
{
    e.preventDefault();
    Search.showSearch();
});

$(document).on("click", "#song-title", function(e)
{
    e.preventDefault();
    Search.showSearch();
});

$(document).on("click", "#admin-lock", function(e)
{
    e.preventDefault();
    Admin.log_out();
});

$(document).on("click", "#closeSettings", function(e)
{
    e.preventDefault();
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
        $(".list-song").css("height", List.element_height + "px");
        //$("#player_overlay").width($("#player").width()+1);
        set_title_width();
        if($("#controls").length > 0 && !Helper.mobilecheck()) $("#seekToDuration").css("top", $("#controls").position().top - 55);
        else if($("#controls").length > 0) $("#seekToDuration").css("top", $("#controls").position().top - 20);

        window_width_volume_slider();
    }
});

function window_width_volume_slider() {
    if(window.innerWidth <= 600 && slider_type == "horizontal") {
        slider_type = "vertical";
        Playercontrols.initSlider();
    } else if(window.innerWidth > 600 && slider_type == "vertical") {
        slider_type = "horizontal";
        Playercontrols.initSlider();
        $(".volume-container").removeClass("hide");
    }
}

$(document).on( "click", ".result-object", function(e){
    var $html  = $(e.target);

    var substr = $html.prop('outerHTML').substring(0,4);
    if(substr != "<i c" && $html.prop('class').indexOf("waves-effect") == -1 && $html.attr("class") != "result-start" && $html.attr("class") != "result-end"){
        var id 		= $(this).attr("data-video-id");
        var title 	= $(this).attr("data-video-title");
        var original_length 	= $(this).attr("data-video-length");
        var start   = parseInt($(this).find(".result-start").val());
        var end     = parseInt($(this).find(".result-end").val());
        if(end > original_length) {
            end = original_length;
        }
        if(start > end) {
            Materialize.toast("Start can't be before the end..", 3000, "red lighten");
        } else if(start < 0) {
            Materialize.toast("Start can't be less than 0..", 3000, "red lighten");
        } else {
            try {
                var length = parseInt(end) - parseInt(start);
                Search.submitAndClose(id, title, length, start, end);
            } catch(e) {
                Materialize.toast("Only numbers are accepted as song start and end parameters..", 3000, "red lighten");
            }
        }
    }
});

$(document).on('click', '#submit-contact-form', function(e) {
    e.preventDefault();
    $("#contact-form").submit();
});

$(document).on('submit', '#contact-form', function(e){
    e.preventDefault();
    var message = $("#contact-form-message").val();
    var from    = $("#contact-form-from").val();

    Helper.send_mail(from, message);
});


$(document).on( "click", "#add-many", function(e){
    var id 		= $(this).attr("data-video-id");
    var title 	= $(this).attr("data-video-title");
    var original_length 	= $(this).attr("data-video-length");
    var parent = $(this).parent().parent();

    var start   = parseInt($(parent).find(".result-start").val());
    var end     = parseInt($(parent).find(".result-end").val());
    if(end > original_length) {
        end = original_length;
    }
    if(start > end) {
        Materialize.toast("Start can't be before the end..", 3000, "red lighten");
    } else if(start < 0) {
        Materialize.toast("Start can't be less than 0..", 3000, "red lighten");
    } else {
        try {
            var length = parseInt(end) - parseInt(start);
            $(this).parent().parent().remove();
            Search.submit(id, title, length, false, 0, 1, start, end);
        } catch(e) {
            Materialize.toast("Only numbers are accepted as song start and end parameters..", 3000, "red lighten");
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
    Search.submit(id, title, length, false, 0, 1, 0, length);
    if(added_by == "user") {
        number_suggested = number_suggested - 1;
        if(number_suggested < 0) number_suggested = 0;

        var to_display = number_suggested > 9 ? "9+" : number_suggested;
        if(!$(".suggested-link span.badge.new.white").hasClass("hide") && to_display == 0){
            $(".suggested-link span.badge.new.white").addClass("hide");
        }

        $(".suggested-link span.badge.new.white").text(to_display);
    }
    $("#suggested-" + id).remove();
});

$(document).on( "click", ".del_suggested", function(e){
    var id = $(this).attr("data-video-id");

    $("#suggested-" + id).remove();
});

$(document).on( "click", ".del_user_suggested", function(e){
    var id = $(this).attr("data-video-id");
    $("#suggested-" + id).remove();

    number_suggested = number_suggested - 1;
    if(number_suggested < 0) number_suggested = 0;

    var to_display = number_suggested > 9 ? "9+" : number_suggested;
    if(!$(".suggested-link span.badge.new.white").hasClass("hide") && to_display == 0){
        $(".suggested-link span.badge.new.white").addClass("hide");
    }

    $(".suggested-link span.badge.new.white").text(to_display);

    List.vote(id, "del");
});

$(document).on('click', '#toast-container', function(){
    $(this).fadeOut(function(){
        $(this).remove();
    });
});

$(document).on("click", "#embed-area", function(){
    this.select();
});

$(document).on("click", ".brand-logo-navigate", function(e){
    e.preventDefault();

    window.history.pushState("to the frontpage!", "Title", "/");
    onepage_load();
});

$(document).on("click", "#player_bottom_overlay", function(){
    Frontpage.to_channel(chan.toLowerCase(), false);
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
                $(".highlight").removeClass("highlight");
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

$(document).on("click", "#close_find_form_button", function(e) {
    e.preventDefault();
    find_start = false;
    find_started = false;
    $("#find_div").toggleClass("hide");
    $("#find_input").val("");
    $("#find_input").blur();
    $(".highlight").removeClass("highlight");
    found_array = [];
    found_array_index = 0;
    find_word = "";
});

$(document).keyup(function(event){
    if((event.keyCode == 91 || event.keyCode == 17) && !find_started){
        find_start = false;
    }
});

$(document).on("submit", "#find_form", function(e){
    e.preventDefault();
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
        $(".highlight").removeClass("highlight");
        var jump_to_page = Math.floor(found_array[found_array_index] / List.can_fit);
        $($("#wrapper").children()[found_array[found_array_index]]).addClass("highlight");
        List.dynamicContentPageJumpTo(jump_to_page);
    } else {
        $(".highlight").removeClass("highlight");
        Helper.log("none found");
    }
});

function share_link_modifier_channel(){
    $("#facebook-code-link").attr("href", "https://www.facebook.com/sharer/sharer.php?u=https://zoff.me/" + chan.toLowerCase());
    $("#facebook-code-link").attr("onclick", "window.open('https://www.facebook.com/sharer/sharer.php?u=https://zoff.me/" + chan.toLowerCase() + "', 'Share Playlist','width=600,height=300'); return false;");
    $("#twitter-code-link").attr("href", "https://twitter.com/intent/tweet?url=https://zoff.me/" + chan.toLowerCase() + "&amp;text=Check%20out%20this%20playlist%20" + chan.toLowerCase() + "%20on%20Zoff!&amp;via=zoffmusic");
    $("#twitter-code-link").attr("onclick", "window.open('https://twitter.com/intent/tweet?url=https://zoff.me/" + chan.toLowerCase() + "/&amp;text=Check%20out%20this%20playlist%20" + chan.toLowerCase() + "%20on%20Zoff!&amp;via=zoffmusic','Share Playlist','width=600,height=300'); return false;");
    //$("#qr-code-image-link").attr("src", "//chart.googleapis.com/chart?chs=150x150&cht=qr&chl=https://zoff.me/" + chan.toLowerCase() + "&choe=UTF-8&chld=L%7C1");
}

function before_toast(){
    if($('.toast').length > 0) {
        var toastElement = $('.toast').first()[0];
        var toastInstance = toastElement.M_Toast;
        toastInstance.remove();
    }
    //Materialize.Toast.removeAll();
}

function onepage_load(){

    var url_split = window.location.href.split("/");
    if(url_split[3].substr(0,1) != "#!" && url_split[3] !== "" && !(url_split.length == 5 && url_split[4].substr(0,1) == "#")){

        socket.emit("change_channel");
        Admin.beginning = true;

        chan = url_split[3].replace("#", "");
        $("#chan").html(Helper.upperFirst(chan));
        var add = "";
        w_p = true;
        if(private_channel) add = Crypt.getCookie("_uI") + "_";
        socket.emit("list", {version: parseInt(localStorage.getItem("VERSION")), channel: add + chan.toLowerCase(), pass: embed ? '' : Crypt.crypt_pass(Crypt.get_userpass(chan.toLowerCase()))});
    } else if(url_split[3] === "") {
        clearTimeout(timed_remove_check);
        changing_to_frontpage = true;
        $.contextMenu( 'destroy', ".playlist-element" );
        user_change_password = false;
        clearTimeout(width_timeout);
        if(fireplace_initiated){
            fireplace_initiated = false;
            Player.fireplace.destroy();
            $("#fireplace_player").css("display", "none");
        }
        $("#channel-load").css("display", "block");
        window.scrollTo(0, 0);

        Player.stopInterval = true;
        Admin.display_logged_out();
        Admin.beginning 	 = true;
        began 				 = false;
        durationBegun  		 = false;

        $("#embed-button").css("display", "none");
        if(!Helper.mobilecheck()) {
            $('.castButton').tooltip("remove");
            $("#viewers").tooltip("remove");
            //$('.castButton-unactive').tooltip("remove");
            $("#offline-mode").tooltip("remove");
            $('#chan_thumbnail').tooltip("remove");
            $('#fullscreen').tooltip("remove");
            $('#admin-lock').tooltip("remove");
            $("#search-btn").tooltip("remove");
            $("#shuffle").tooltip("remove");
            $("#settings").tooltip("remove");
        }
        $("#seekToDuration").remove();
        $("#settings").sideNav("destroy");
        $('.tap-target').tapTarget('close');
        clearTimeout(tap_target_timeout);
        before_toast();
        $.ajax({
            url: "/",
            success: function(e){
                if(Helper.mobilecheck() || user_auth_avoid) {
                    Helper.log("Removing all listeners");
                    socket.removeAllListeners();
                    socket.disconnect();
                } else {
                    socket.removeEventListener("chat.all");
                    socket.removeEventListener("chat");
                    socket.removeEventListener("conf");
                    socket.removeEventListener("pw");
                    socket.removeEventListener("toast");
                    //socket.removeEventListener("id");
                    socket.removeEventListener("channel");
                    //socket.removeEventListener(id);
                }
                document.getElementById("volume-button").removeEventListener("click", Playercontrols.mute_video);
                document.getElementById("playpause").removeEventListener("click", Playercontrols.play_pause);
                document.getElementById("fullscreen").removeEventListener("click", Playercontrols.fullscreen);
                channel_listeners(false);
                if(Helper.mobilecheck() || user_auth_avoid) {
                    video_id   = "";
                    song_title = "";
                }

                //$("#snow").remove();

                $("meta[name=theme-color]").attr("content", "#2D2D2D");

                if(!Helper.mobilecheck() && !user_auth_avoid){
                    $(".video-container").resizable("destroy");
                    $("main").append("<a id='closePlayer' title='Close Player'>X</a>");
                    $("#playbar").remove();
                    $(".ui-resizable-handle").remove();
                    $("#main_components").remove();
                    $("#player").addClass("player_bottom");
                    $("#main-row").addClass("frontpage_modified_heights");
                    $("#player").css("opacity", "1");
                    $("#video-container").removeClass("no-opacity");
                    $("#main-row").prepend("<div id='player_bottom_overlay' title='To Channel' class='player player_bottom'></div>");
                    $("#playlist").remove();
                } else {
                    try{
                        Player.player.destroy();
                    } catch(error){}
                    Player.player = "";
                    document.title = "Zoff";
                }

                var response = $("<div>" + e + "</div>");

                //$(".drag-target").remove();
                $("#sidenav-overlay").remove();
                $("main").attr("class", "center-align container");
                $("#main-container").removeClass("channelpage");
                $("#main-container").attr("style", "");
                $("header").html($(response.find("header")).html());
                $($(response.find(".section.mega"))).insertAfter("header");
                $($(response.find(".section.mobile-search"))).insertAfter(".mega");
                if(Helper.mobilecheck() || user_auth_avoid) $("main").html($(response.find("main")).html());
                else $("main").append($(response.find("#main_section_frontpage")).wrap("<div>").parent().html());
                $(".page-footer").removeClass("padding-bottom-extra");
                $(".page-footer").removeClass("padding-bottom-novideo");
                $("#favicon").attr("href", "/assets/images/favicon-32x32.png");

                $(".context-menu-list").remove();
                Helper.log(socket);
                if($("#alreadyfp").length == 1){
                    initfp();
                }else {
                    fromChannel = true;
                    frontpage 	= true;
                    initfp();
                }
                changing_to_frontpage = false;

                if($("#alreadychannel").length === 0 && !user_auth_avoid){
                    $("head").append("<div id='alreadychannel'></div");
                } else if(user_auth_avoid) {
                    $("#alreadychannel").remove();
                }
                $("#channel-load").css("display", "none");
                user_auth_avoid = false;
            }
        });
    }
}
