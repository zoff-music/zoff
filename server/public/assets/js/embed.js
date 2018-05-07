var slider_type = "horizontal";
var timed_remove_check;
var gotten_np = false;
var song_title = "";
var paused = false;
var client = false;
var startTime = 0;
var socket_connected = false;
var dynamicListeners = {};
var player_ready = false;
var previousSoundcloud;
var empty_clear = false;
var fix_too_far = false;
var beginning = false;
var soundcloud_loading = false;
var firstLoad = "";
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

SC.initialize({
  client_id: '***REMOVED***'
}, function() {
});

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
  console.log("Loaded DOMContent");
})
window.addEventListener("load", function() {
  console.log("Window loaded");
  if(hash.length >= 3 && hash[2] == "autoplay"){
      autoplay = true;
      Helper.css("#player", "visibility", "hidden");
  } else {
      //paused = true;
  }
    if(hash.indexOf("videoonly") > -1) {
        Helper.addClass("#wrapper", "hide");
        Helper.addClass("#controls", "hide");
        Helper.addClass("#player", "video_only");
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
      setTimeout(function() {
        if(videoSource == "youtube") {
          Player.player.playVideo();
        } else {
          Player.soundcloud_player.play();
        }
      }, 1000);
    }

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


function handleEvent(e, target, tried, type) {
    for(var y = 0; y < e.path.length; y++) {
        var target = e.path[y];
        if(dynamicListeners[type] && dynamicListeners[type]["#" + target.id]) {
            dynamicListeners[type]["#" + target.id].call(target);
            return;
        } else {
            if(target.classList == undefined) return;
            for(var i = 0; i < target.classList.length; i++) {
                if(dynamicListeners[type] && dynamicListeners[type]["." + target.classList[i]]) {
                    dynamicListeners[type]["." + target.classList[i]].call(target);
                    return;
                }
            }
        }
    }
}

function addListener(type, element, callback) {
    if(dynamicListeners[type] == undefined) dynamicListeners[type] = {};
    dynamicListeners[type][element] = callback;
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
    var id = this.getAttribute("data-video-id");
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

addListener("click", ".last_page", function(e){
    event.preventDefault();
    List.dynamicContentPage(10);
});

addListener("click", ".first_page", function(e){
    event.preventDefault();
    List.dynamicContentPage(-10);
});
