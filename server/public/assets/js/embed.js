var slider_type = "horizontal";
var timed_remove_check;
var gotten_np = false;
var song_title = "";
var paused = false;
var client = false;
var _VERSION;
try {
    _VERSION = localStorage.getItem("VERSION");
    if(_VERSION == null || _VERSION == undefined) throw "Some error";
} catch(e) {
    _VERSION = 6;
}
var startTime = 0;
var small = false;
var small_player = false;
var full_playlist;
var hostMode = false;
var soundcloud_enabled = true;
var socket_connected = false;
var dynamicListeners = {};
var player_ready = false;
var previousSoundcloud;
var buffering = false;
var prev_chan_list = "";
var local_new_channel = false;
var empty_clear = false;
var fix_too_far = false;
var beginning = false;
var soundcloud_loading = false;
var videoSource = "";
var list_html = document.getElementById("list-song-html").innerHTML;
var w_p		= true;
var lazy_load	= false;
var end_programmatically = false;
var embed = true;
var vol	= 100;
var adminpass = "";
var mobile_beginning = false;
var durationBegun = false;
var chromecastAvailable = false;
var private_channel = false;
var was_stopped = false;
var offline = false;
var began = false;
var seekTo;
var socket;
var video_id;
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
window.addEventListener("DOMContentLoaded", function() {
});
window.addEventListener("load", function() {
    if(hash.length >= 2 && hash.indexOf("autoplay") > 0){
        autoplay = true;
        Helper.css("#player", "visibility", "hidden");
    } else {
        //paused = true;
    }
    if(hash.indexOf("videoonly") > -1) {
        Helper.addClass("#wrapper", "hide");
        Helper.addClass("#controls", "hide");
        Helper.addClass("#player", "video_only");
        Helper.addClass("#player_overlay", "video_only");
        Helper.css("#zoffbutton", "bottom", "0px");
    }

    M.Modal.init(document.getElementById("locked_channel"), {
        dismissible: false
    });
    color = "#" + hash[1];
    add = "https://zoff.me";
    //if(window.location.hostname == "localhost") add = "localhost";
    //add = "localhost";
    socket = io.connect(''+add+':8080', connection_options);

    if(hash.indexOf("localmode") > 1) {
        change_offline(true, false);
    }

    socket.on('auth_required', function() {
        M.Modal.getInstance(document.getElementById("locked_channel")).open();
    });

    socket.on("get_list", function() {
        setTimeout(function(){socket.emit('list', {version: VERSION, channel: chan.toLowerCase(), pass: ''});},1000);
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

    Player.loadPlayer();
    setup_host_initialization();
    setup_now_playing_listener();
    setup_list_listener();

    if(autoplay) {
        startWaitTimerPlay();
    }

    List.calculate_song_heights();

    window.onYouTubeIframeAPIReady = Player.onYouTubeIframeAPIReady;
    socket.on("toast", toast);

    Playercontrols.initSlider();
    document.getElementById("playpause").addEventListener("click", Playercontrols.play_pause);
    window.setVolume = setVolume;
    //Helper.css("#controls", "background-color", color);

    document.querySelector("body").style.backgroundColor = color;
    if(hash.indexOf("controll") > -1) {
        Hostcontroller.change_enabled(true);
    } else {
        Hostcontroller.change_enabled(false);
    }
});

function resizePlaylistPlaying(){};

function startWaitTimerPlay() {
    setTimeout(function() {
        if(videoSource == "youtube") {
            Player.player.playVideo();
        } else if(videoSource == "soundcloud"){
            Player.soundcloud_player.play();
        }
    }, 5000);
}

function setup_host_listener(id) {
    socket.on(id, Hostcontroller.host_on_action);
}

function setup_host_initialization() {
    socket.on("id", Hostcontroller.host_listener);
}

function setup_now_playing_listener() {
    socket.on("np", Player.now_playing_listener);
}

function setup_list_listener() {
    socket.on("channel", List.channel_function);
}

function setVolume(val) {
    Playercontrols.visualVolume(val);
    Playercontrols.setVolume(val);
}

function updateChromecastMetadata(){}
function loadChromecastVideo(){}

function toast(msg) {
    switch(msg) {
        case "suggested_thumbnail":
        if(embed) return;
        msg = "The thumbnail has been suggested!";
        break;
        case "faulty_start_end":
        if(embed) return;
        break;
        case "wait_longer":
        if(embed) return;
        break;
        case "suggested_description":
        if(embed) return;
        break;
        case "thumbnail_denied":
        if(embed) return;
        break;
        case "description_denied":
        if(embed) return;
        break;
        case "addedsong":
        if(embed) return;
        break;
        case "addedplaylist":
        if(embed) return;
        break;
        case "savedsettings":
        if(embed) return;
        break;
        case "wrongpass":
        if(embed) return;
        break;
        case "deleted_songs":
        if(embed) return;
        break;
        case "shuffled":
        if(embed) return;
        break;
        case "deletesong":
        if(embed) return;
        break;
        case "voted":
        msg=Helper.rnd(["You voted!", "You vote like a boss", "Voting is the key to democracy", "May you get your song to the very top!", "I love that song! I vouch for you.", "Only you vote that good", "I like the way you vote...", "Up the video goes!", "Voted Zoff for president", "Only 999 more to go!"]);
        break;
        case "alreadyvoted":
        msg=Helper.rnd(["You can't vote twice on that song!", "I see you have voted on that song before", "One vote per person!", "I know you want to hear your song, but have patience!", "I'm sorry, but I can't let you vote twice, Dave."]);
        break;
        case "skip":
        if(embed) return;
        break;
        case "listhaspass":
        if(embed) return;
        break;
        case "noskip":
        if(embed) return;
        break;
        case "alreadyskip":
        if(embed) return;
        break;
        case "notyetskip":
        if(embed) return;
        break;
        case "correctpass":
        if(embed) return;
        break;
        case "changedpass":
        if(embed) return;
        break;
        case "suggested":
        if(embed) return;
        break;
        case "alreadyplay":
        if(embed) return;
        break;
    }
    before_toast();
    M.toast({html: msg, displayLength: 4000});
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

function change_offline(enabled, already_offline){
    if(client) {
        offline = false;
        return;
    }
    offline = enabled;
    socket.emit("offline", {status: enabled, channel: chan != undefined ? chan.toLowerCase() : ""});
    if(!Helper.mobilecheck()) {
        if(document.querySelectorAll("#offline-mode").length == 1 && M.Tooltip.getInstance(document.getElementById("offline-mode"))) {
            Helper.tooltip("#offline-mode", 'destroy');
        }
    }

    var mouseEnter = function(e){
        Helper.removeClass("#seekToDuration", "hide");
    };

    var mouseLeave = function(e){
        dragging = false;
        Helper.addClass("#seekToDuration", "hide");
    };

    var mouseDown = function(e) {
        var acceptable = ["bar", "controls", "duration"];
        if(acceptable.indexOf(e.target.id) >= 0) {
            dragging = true;
        }
    };

    var mouseUp = function(e) {
        dragging = false;
    };

    if(enabled){
        Helper.addClass("#viewers", "hide");
        Helper.removeClass(".margin-playbar", "margin-playbar");
        Helper.addClass(".prev playbar", "margin-playbar");
        Helper.removeClass(".prev playbar", "hide");
        Helper.removeClass(".skip playbar", "hide");
        Helper.removeClass("#offline-mode", "waves-cyan");
        Helper.addClass("#offline-mode", "cyan");
        Helper.removeClass(".delete-context-menu", "context-menu-disabled");
        if(!Helper.mobilecheck()) {
            Helper.tooltip("#offline-mode", {
                delay: 5,
                position: "bottom",
                html: "Disable local mode"
            });
        }

        if(window.location.pathname != "/"){
            socket.removeEventListener("color");
            document.getElementById("controls").addEventListener("mouseenter", mouseEnter, false);
            document.getElementById("controls").addEventListener("mouseleave", mouseLeave, false);
            document.getElementById("controls").addEventListener("mousedown", mouseDown, false);
            document.getElementById("controls").addEventListener("mouseup", mouseUp, false);
            document.getElementById("controls").addEventListener("mousemove", seekToMove);
            document.getElementById("controls").addEventListener("click", seekToClick);

            document.querySelector("#main_components").insertAdjacentHTML("beforeend", "<div id='seekToDuration' class='hide'>00:00/01:00</div>");
            var controlElement = document.querySelector("#controls");
            Helper.css("#seekToDuration", "bottom", "50px");
            Helper.addClass("#controls", "ewresize");
        }
        if(full_playlist != undefined && !already_offline){
            for(var x = 0; x < full_playlist.length; x++){
                full_playlist[x].votes = 0;
            }
            List.sortList();
            List.populate_list(full_playlist);
        }
    } else {

        if(!Admin.logged_in) Helper.addClass(".delete-context-menu", "context-menu-disabled");
        Helper.removeClass(".margin-playbar", "margin-playbar");
        Helper.addClass("#playpause", "margin-playbar");
        Helper.removeClass("#viewers", "hide");
        Helper.addClass(".prev playbar", "hide");
        Helper.addClass(".skip playbar", "hide");
        Helper.addClass("#offline-mode", "waves-cyan");
        Helper.removeClass("#offline-mode", "cyan");
        if(!Helper.mobilecheck()) {
            Helper.tooltip("#offline-mode", {
                delay: 5,
                position: "bottom",
                html: "Enable local mode"
            });
        }

        if(window.location.pathname != "/"){
            document.getElementById("controls").removeEventListener("mouseenter", mouseEnter, false);
            document.getElementById("controls").removeEventListener("mouseleave", mouseLeave, false);
            document.getElementById("controls").removeEventListener("mousedown", mouseDown, false);
            document.getElementById("controls").removeEventListener("mouseup", mouseUp, false);
            document.getElementById("controls").removeEventListener("mousemove", seekToMove);
            document.getElementById("controls").removeEventListener("click", seekToClick);
            Helper.removeElement("#seekToDuration");
            socket.on("color", Player.setBGimage);
            socket.emit("pos", {channel: chan.toLowerCase()});
            var add = "";
            //if(private_channel) add = Crypt.getCookie("_uI") + "_";
            socket.emit("list", {version: parseInt(_VERSION), channel: add + chan.toLowerCase()});
            Helper.removeClass("#controls", "ewresize");
        }
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

document.addEventListener("click", function(e) {
    handleEvent(e, e.target, false, "click");
}, false);

addListener("click", "#zoffbutton", function(e) {
    Player.pauseVideo();
    window.open("https://zoff.me/" + chan.toLowerCase() + "/", '_blank');
});

addListener("click", ".vote-container", function(e) {
    var that = e;
    var id = that.getAttribute("data-video-id");
    List.vote(id, "pos");
});

addListener("click", ".prev_page", function(e) {
    event.preventDefault();
    List.dynamicContentPage(-1);
});

addListener("click", "#player_overlay", function(event) {
    if(videoSource == "soundcloud") Playercontrols.play_pause();
});

addListener("click", ".next_page", function(e) {
    event.preventDefault();
    List.dynamicContentPage(1);
});

addListener("click", ".prev", function(event){
    this.preventDefault();
    if(!offline) return;
    List.skip(false);
});

addListener("click", ".skip", function(event){
    this.preventDefault();
    if(!offline) return;
    List.skip(true);
});

addListener("click", ".last_page", function(e){
    event.preventDefault();
    List.dynamicContentPage(10);
});

addListener("click", ".first_page", function(e){
    event.preventDefault();
    List.dynamicContentPage(-10);
});
