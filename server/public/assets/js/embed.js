var slider_type = "horizontal";
var timed_remove_check;
var gotten_np = false;
var song_title = "";
var paused = false;
var client = false;
var startTime = 0;
var socket_connected = false;
var player_ready = false;
var list_html = $("#list-song-html").html();
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

$(document).ready(function() {

    if(hash.length >= 3 && hash[2] == "autoplay"){
        autoplay = true;
        $("#player").css("visibility", "hidden");
    } else {
        paused = true;
    }

    if(hash.indexOf("videoonly") > -1) {
        Helper.addClass("#playlist", "hide");
        Helper.addClass("#controls", "hide");
        Helper.addClass("#player", "video_only");
        Helper.css("#zoffbutton", "bottom", "0px");
    }
    M.Modal.init(document.getElementById("locked_channel"), {
        dismissible: false
    });
    color = "#" + hash[1];
    add = "https://zoff.me";
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

    setup_host_initialization();
    setup_youtube_listener();
    setup_list_listener();

    window.onYouTubeIframeAPIReady = Player.onYouTubeIframeAPIReady;
    socket.on("toast", toast);
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
            msg = "You tried to send a faulty start/end value. Try again..";
            break;
        case "wait_longer":
            if(embed) return;
            msg = Helper.rnd(["Have you tried to wait longer between commands?!", "Looks like you're clicking that button too much..", "You need to wait longer between clicks.."]);
            break;
        case "suggested_description":
            if(embed) return;
            msg = "The description has been suggested!";
            break;
        case "thumbnail_denied":
            if(embed) return;
            msg = "The thumbnail will be denied";
            break;
        case "description_denied":
            if(embed) return;
            msg = "The description will be denied";
            break;
        case "addedsong":
            if(embed) return;
            msg=Helper.rnd(["I added your song", "Your song has been added", "Yay, more songs!", "Thats a cool song!", "I added that song for you", "I see you like adding songs..."]);
            break;
        case "addedplaylist":
            if(embed) return;
            msg=Helper.rnd(["I added the playlist", "Your playlist has been added", "Yay, many more songs!", "Thats a cool playlist!", "I added all the songs for you", "I see you like adding songs.."]);
            document.getElementById("import").disabled = false;
            Helper.addClass("#playlist_loader", "hide");
            Helper.removeClass("#import", "hide");
            break;
        case "savedsettings":
            if(embed) return;
            msg=Helper.rnd(["I've saved your settings", "I stored all your settings", "Your settings have been stored in a safe place"]);
            break;
        case "wrongpass":
            if(embed) return;
            msg=Helper.rnd(["That's not the right password!", "Wrong! Better luck next time...", "You seem to have mistyped the password", "Incorrect. Have you tried meditating?","Nope, wrong password!", "Wrong password. The authorities have been notified."]);
            //Crypt.remove_pass(chan.toLowerCase());
            Admin.display_logged_out();
            Helper.css("#thumbnail_form", "display", "none");
            Helper.css("#description_form", "display", "none");
            if(!Helper.mobilecheck()) {
                Helper.tooltip('#chan_thumbnail', "destroy");
            }
            w_p = true;
            break;
        case "deleted_songs":
            if(embed) return;
            msg="All songs in the channel has been deleted!";
            break;
        case "shuffled":
            if(embed) return;
            msg=Helper.rnd(["♫ You stir me right round, baby. ♫","♫ Stir, stir, stir my boat ♫","I vigorously stirred your playlist!", "I hope you like your list stirred, not shaken.", "I shuffled your playlist with the cosmic background radiation as a seed. Enjoy.", "100% randomized, for your listening pleasure!", "I hope you enjoy your fresh playlist!"]);
            break;
        case "deletesong":
            if(embed) return;
            msg=Helper.rnd(["Your song is now in a better place...", "You won't be seeing any more of that video...", "EXTERMINATE! EXTERMINATE! EXTERMINATE!", "I killed it with fire", "Thanks for deleting that song. I didn't like it anyways...", "Removed song securely."]);
            break;
        case "voted":
            msg=Helper.rnd(["You voted!", "You vote like a boss", "Voting is the key to democracy", "May you get your song to the very top!", "I love that song! I vouch for you.", "Only you vote that good", "I like the way you vote...", "Up the video goes!", "Voted Zoff for president", "Only 999 more to go!"]);
            break;
        case "alreadyvoted":
            msg=Helper.rnd(["You can't vote twice on that song!", "I see you have voted on that song before", "One vote per person!", "I know you want to hear your song, but have patience!", "I'm sorry, but I can't let you vote twice, Dave."]);
            break;
        case "skip":
            if(embed) return;
            msg=Helper.rnd(["The song was skipped", "I have skipped a song", "Skipped to the beat", "Skipmaster3000", "They see me skippin', they hatin'"]);
            break;
        case "listhaspass":
            if(embed) return;
            if(!tried_again && lastCommand != undefined && lastCommand.length > 0) {
                if(Crypt.get_pass() != undefined) {
                    tried_again = true;
                    if(lastCommand.length == 1) {
                        socket.emit(lastCommand[0]);
                    } else if(lastCommand.length == 2) {
                        socket.emit(lastCommand[0], lastCommand[1]);
                    }
                    lastCommand = [];
                    return;
                }
            }
            tried_again = false;
            msg=Helper.rnd(["I'm sorry, but you have to be an admin to do that!", "Only admins can do that", "You're not allowed to do that, try logging in!", "I can't let you do that", "Please log in to do that"]);
            //Crypt.remove_pass(chan.toLowerCase());
            Admin.display_logged_out();
            Helper.css("#thumbnail_form", "display", "none");
            Helper.css("#description_form", "display", "none");
            if(!Helper.mobilecheck()) {
                Helper.tooltip('#chan_thumbnail', "destroy");
            }
            w_p = true;
            Helper.addClass("#playlist_loader", "hide");
            Helper.addClass("#playlist_loader_spotify", "hide");
            Helper.removeClass("#import_spotify", "hide");
            Helper.removeClass("#import", "hide");
            break;
        case "noskip":
            if(embed) return;
            if(!tried_again && lastCommand != undefined && lastCommand.length > 0) {
                if(Crypt.get_pass() != undefined) {
                    tried_again = true;
                    if(lastCommand.length == 1) {
                        socket.emit(lastCommand[0]);
                    } else if(lastCommand.length == 2) {
                        socket.emit(lastCommand[0], lastCommand[1]);
                    }
                    lastCommand = [];
                    return;
                }
            }
            tried_again = false;
            msg=Helper.rnd(["Only Admins can skip songs, peasant!", "You have to log in to skip songs on this channel", "Try clicking the settings icon and logging in before you skip"]);
            break;
        case "alreadyskip":
            if(embed) return;
            msg=Helper.rnd(["Skipping is democratic, only one vote per person!", "More people have to vote to skip, not just you!", "Get someone else to skip too! You can't do it on yourself."]);
            break;
        case "notyetskip":
            if(embed) return;
            msg="Skipping is disabled the first 10 seconds.";
            break;
        case "correctpass":
            if(embed) return;
            tried_again = false;
            adminpass = Crypt.get_pass(chan.toLowerCase()) == undefined ? Crypt.tmp_pass : Crypt.get_pass(chan.toLowerCase());
            msg="Correct password. You now have access to the sacred realm of The Admin.";
            $("#thumbnail_form").css("display", "inline-block");
            $("#description_form").css("display", "inline-block");
            if(!Helper.mobilecheck()) {
                Helper.tooltip('#chan_thumbnail', {
                    delay: 5,
                    position: "left",
                    html: "imgur link"
                });
            }
            break;
        case "changedpass":
            if(embed) return;
            msg="Your password has been changed!";
            break;
        case "suggested":
            if(embed) return;
            msg="Your song was suggested!";
            break;
        case "alreadyplay":
            if(embed) return;
            msg="Seems the song you want is already playing. No fooling the system!";
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

function before_toast(){
    /*if($('.toast').length > 0) {
        var toastElement = $('.toast').first()[0];
        var toastInstance = toastElement.M_Toast;
        toastInstance.remove();
    }*/
    M.Toast.dismissAll();
    //Materialize.Toast.removeAll();
}

$(document).on( "click", "#zoffbutton", function(e) {
    Player.pauseVideo();
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

$(document).on("click", ".last_page", function(e){
    e.preventDefault();
    List.dynamicContentPage(10);
});

$(document).on("click", ".first_page", function(e){
    e.preventDefault();
    List.dynamicContentPage(-10);
});
