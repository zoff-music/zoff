var chan 				  		= window.chan === undefined ? $("#chan").html() : window.chan;
var w_p 				  		= true;
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

window.zoff = {
    enable_debug: enable_debug,
    disable_debug: disable_debug
}

if(!Helper.mobilecheck()) {
    $(window).error(function(e){
        e.preventDefault();
        try {
            Helper.logs.unshift({log: e.originalEvent.error.stack.toString().replace(/(\r\n|\n|\r)/gm,""), date: new Date()});
        }catch(e){}
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
        $("#contact").modal();
        $("#contact").modal("open");
        /*$("#error-report-modal").modal();*/
        $("#error-report-code").text(JSON.stringify(Helper.logs, undefined, 4));
        console.error(e.originalEvent.error);
    });
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

    $("#donate").modal();

    socket.on("connect", function(){
        if(connect_error){
            connect_error = false;
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
            $(".connect_error").fadeOut(function(){
                $(".connect_error").remove();
                Materialize.toast("Connected!", 2000, "green lighten");
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

initializeCastApi = function() {
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
                var customData = [
                    {type: "nextVideo", videoId: full_playlist[0].id, title: full_playlist[0].title},
                    {type: "loadVideo", start: Player.np.start, end: Player.np.end, videoId: video_id, seekTo: _seekTo, channel: chan.toLowerCase()},
                ];
                if(Helper.mobilecheck()) {
                    customData.push({type: "mobilespecs", guid: guid, socketid: socket.id, adminpass: adminpass == "" ? "" : Crypt.crypt_pass(adminpass), channel: chan.toLowerCase(), userpass: embed ? '' : Crypt.crypt_pass(Crypt.get_userpass(chan.toLowerCase()))});
                }
                var request = new chrome.cast.media.LoadRequest({
                    media: {
                        contentId: video_id,
                        contentType: 'video/*',
                    },
                    customData: customData,
                });
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
                    chromecast_specs_sent = true;
                    castSession.sendMessage("urn:x-cast:zoff.me", {type: "mobilespecs", guid: guid, socketid: socket.id, adminpass: adminpass == "" ? "" : Crypt.crypt_pass(adminpass), channel: chan.toLowerCase(), userpass: embed ? '' : Crypt.crypt_pass(Crypt.get_userpass(chan.toLowerCase()))})
                }
                hide_native(1);
                if(Helper.mobilecheck()) {
                    Player.playVideo();
                }
                $("#channel-load").css("display", "none");
                $('.castButton').addClass('castButton-white-active');
                $("#playpause").css("visibility", "visible");
                $("#playpause").css("pointer-events", "all");
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
                $("#channel-load").css("display", "none");
                $('.castButton').addClass('castButton-white-active');
                $("#playpause").css("visibility", "visible");
                $("#playpause").css("pointer-events", "all");
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

$(document).on("click", "#player_overlay", function(e) {
    if(chromecastAvailable) {
        Player.playPauseVideo();
    }
});

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
        Channel.onepage_load();
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
    ga('send', 'event', "button-click", "donate");

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
    $("#embed-area").val(embed_code(embed_autoplay, embed_width, embed_height, color, embed_videoonly));
});

$(document).on('keyup mouseup', '#height_embed', function(){
    var that = $(this);
    embed_height = that.val();
    $("#embed-area").val(embed_code(embed_autoplay, embed_width, embed_height, color, embed_videoonly));
});

$(document).on('input', '#color_embed', function(){
    var that = $(this);
    color = that.val().substring(1);
    $("#embed-area").val(embed_code(embed_autoplay, embed_width, embed_height, color, embed_videoonly));
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
    if(!youtube_authenticated){
        var nonce = Helper.randomString(29);
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

        ga('send', 'event', "import", "youtube");
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
            playlist_id = playlist_id.split("?")[0];

            document.getElementById("import_spotify").disabled = true;
            $("#import_spotify").addClass("hide");
            $("#playlist_loader_spotify").removeClass("hide");

            ga('send', 'event', "import", "spotify");

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
    $("#embed-area").val(embed_code(embed_autoplay, embed_width, embed_height, color, embed_videoonly));
});

$(document).on("change", "#videoonly", function() {
    if(this.checked) embed_videoonly = "&videoonly";
    else embed_videoonly = "";
    $("#embed-area").val(embed_code(embed_autoplay, embed_width, embed_height, color, embed_videoonly));
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

$(document).on("click", "#channel-share-modal", function(){
	$("#channel-share-modal").modal("close")
});

$(document).on("click", ".shareface", function(e) {
    ga('send', 'event', "button-click", "share-facebook");
});

$(document).on("click", ".android-image-link", function() {
    ga('send', 'event', "button-click", "android-playstore-link");
});

$(document).on("click", "#twitter-code-link", function() {
    ga('send', 'event', "button-click", "share-twitter");
});

$(document).on("click", ".help-button-footer", function() {
    ga('send', 'event', "button-click", "help-footer");
});

$(document).on("click", "#embed-button", function() {
    ga('send', 'event', "button-click", "embed-channel", "channel-name", chan.toLowerCase());
})

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

$(document).on("click", ".result-get-more-info", function(e) {
    e.preventDefault();
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

$(document).on('click', ".send-error-modal", function(e) {
    e.preventDefault();
    $("#error-report-form").submit();
})

$(document).on('submit', "#error-report-form", function(e) {
    e.preventDefault();
    var captcha_response = grecaptcha.getResponse();
    $("#send-loader").removeClass("hide");
    $.ajax({
        type: "POST",
        data: {
            from: "no-reply@zoff.me",
            message: $("#error-report-code").text(),
            "g-recaptcha-response": captcha_response,
        },
        url: "/api/mail",
        success: function(data){
            if(data == "success"){
                $(".send-error-modal").remove();
                $("#error-report-form").remove();
                $(".error-code-container").remove();
                $(".error-report-success").text("Error report sent!");
                $("#contact-container").html("Mail has been sent, we'll be back with you shortly.")
            }else{
                $(".error-report-success").text("Mail was not sent, try again");
            }
            $("#send-loader").addClass("hide");
        }
    });
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
    Channel.onepage_load();
});

$(document).on("click", "#player_bottom_overlay", function(e){
    if($(e.target).attr("id") == "closePlayer") return;
    Frontpage.to_channel(chan.toLowerCase(), false);
});

$(document).on("click", ".generate-channel-name", function(e) {
    e.preventDefault();
    $.ajax({
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
        Helper.log(["none found"]);
    }
});
