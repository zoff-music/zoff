
var song_title = "";
var paused = false;
var player_ready = false;
var list_html = $("#list-song-html").html();
var w_p		= true;
var lazy_load	= false;
var embed = true;
var vol	= 100;
var adminpass = "";
var mobile_beginning = false;
var durationBegun = false;
var chromecastAvailable = false;
var private_channel = false;
var offline = false;
var began = false;
var from_frontpage = false;
var seekTo;
var socket;
var video_id;
var previous_video_id;
var hash = window.location.hash.substring(1).split("&");
var chan = hash[0];
var autoplay = false;
var color = "#808080";
var dragging = false;
var user_auth_started = false;
var user_auth_avoid = false;

var connection_options = {
    'sync disconnect on unload':true,
    'secure': true,
    'force new connection': true
};

var Crypt = {
    crypt_pass: function(pass) {
        return pass;
    }
};

function receiveMessage(event) {
    if(event.data == "parent") {
        //console.log(event);
        window.parentWindow = event.source;
        window.parentOrigin = event.origin;
    }
    if(event.data == "lower") {
        window.setVolume(10);
    }else if(event.data == "reset") {
        window.setVolume(100);
    } else if(event.data == "get_info") {
        window.parentWindow.postMessage({type: "np", title: song_title}, window.parentOrigin);
        window.parentWindow.postMessage({type: "controller", id: Hostcontroller.old_id}, window.parentOrigin);
        if(full_playlist.length > 0) {
            Player.sendNext({title: full_playlist[0].title, videoId: full_playlist[0].id});
        }
    }
}

window.addEventListener("message", receiveMessage, false);

$(document).ready(function() {

    if(hash.length >= 3 && hash[2] == "autoplay"){
        autoplay = true;
    } else {
        paused = true;
    }

    if(hash.indexOf("videoonly") > -1) {
        $("#playlist").addClass("hide");
        $("#controls").addClass("hide");
        $("#player").addClass("video_only");
    }

    $("#locked_channel").modal({
        dismissible: false
    });
    color = "#" + hash[1];
    add = "https://zoff.me";
    socket = io.connect(''+add+':8080', connection_options);

    socket.on('auth_required', function() {
        $("#locked_channel").modal('open');
    });

    socket.on("get_list", function() {
        setTimeout(function(){socket.emit('list', {channel: chan.toLowerCase(), pass: ''});},1000);
    });

    socket.on("self_ping", function() {
        if(chan != undefined && chan.toLowerCase() != "") {
            socket.emit("self_ping", {channel: chan.toLowerCase()});
        }
    });

    socket.on("viewers", function(view) {
        viewers = view;

        if(song_title !== undefined)
        Player.getTitle(song_title, viewers);
    });

    setup_host_initialization();
    setup_youtube_listener();
    setup_list_listener();

    window.onYouTubeIframeAPIReady = Player.onYouTubeIframeAPIReady;

    Player.loadPlayer();

    Playercontrols.initSlider();

    window.setVolume = setVolume;
    $("#controls").css("background-color", color);
    $("#playlist").css("background-color", color);
    if(hash.indexOf("controll") > -1) {
        Hostcontroller.change_enabled(true);
    } else {
        Hostcontroller.change_enabled(false);
    }
});

function setup_host_listener(id) {
    socket.on(id, Hostcontroller.host_on_action);
}

function setup_host_initialization() {
    socket.on("id", Hostcontroller.host_listener);
}

function setup_youtube_listener() {
    socket.on("np", Player.youtube_listener);
}

function setup_list_listener() {
    socket.on("channel", List.channel_function);
}

function setVolume(val) {
    $("#volume").slider('value', val);
    Playercontrols.setVolume(val);
}

$(document).on( "click", "#zoffbutton", function(e) {
    window.open("https://zoff.me/" + chan.toLowerCase() + "/", '_blank');
});

$(document).on( "click", ".vote-container", function(e) {
    var id = $(this).attr("data-video-id");
    List.vote(id, "pos");
});

$(document).on("click", ".prev_page", function(e) {
    e.preventDefault();
    List.dynamicContentPage(-1);
});

$(document).on("click", ".next_page", function(e) {
    e.preventDefault();
    List.dynamicContentPage(1);
});
