var channel_list;
var frontpage = true;
var socket;
var rotation_timeout;

var Frontpage = {

    blob_list: [],

    winter: (new Date()).getMonth() >= 10 ? true : false,

    times_rotated: 0,

    all_channels: [],

    frontpage_function: function(msg) {
        frontpage = true;

        Helper.log([
            "Frontpage fetch",
            msg
        ]);
        Frontpage.all_channels = msg.channels;
        if(msg.channels.length == 0) {
            Helper.css("#preloader", "display", "none");
            document.getElementById("channel-list-container").insertAdjacentHTML("beforeend", "<p>No channels yet</p>");
        } else {
            Frontpage.populate_channels(msg.channels, true);
        }
        Frontpage.set_viewers(msg.viewers);
    },

    populate_channels: function(lists, popular) {
        document.getElementById("channels").innerHTML = "";

        var num = 0;

        if(popular) {
            lists = lists.sort(Helper.predicate({
                name: 'pinned',
                reverse: true
            }, {
                name: 'viewers',
                reverse: true
            }, {
                name: 'accessed',
                reverse: true
            }, {
                name: 'count',
                reverse: true
            }));
        } else {
            lists = lists.sort(Helper.predicate({
                name: 'viewers',
                reverse: true
            }, {
                name: 'count',
                reverse: true
            }));
        }

        if(!Helper.mobilecheck()) {
            clearTimeout(rotation_timeout);
            Frontpage.add_backdrop(lists, 0);
        }

        pre_card = channel_list;

        Helper.log([
            "Pre_card: ",
            pre_card
        ]);

        for(var x in lists) {
            var chan = lists[x]._id;
            if(num<12 || !popular) {
                var id = lists[x].id;
                var viewers = lists[x].viewers;
                var description = lists[x].description;
                var img = "background-image:url('https://img.youtube.com/vi/"+id+"/hqdefault.jpg');";
                if(lists[x].thumbnail) {
                    img = "background-image:url('" + lists[x].thumbnail + "');";
                }

                var song_count = lists[x].count;
                var card = document.createElement("div");
                card.innerHTML += pre_card;
                //card.innerHTML = card.children[0];
                if(song_count > 4) {
                    if(lists[x].pinned == 1) {
                        card.querySelector(".pin").setAttribute("style", "display:block;");
                        //card.find(".card").attr("title", "Featured list");
                    } else {
                        /*card.find(".pin").attr("style", "display:none;");
                        card.find(".card").attr("title", "");*/
                        card.querySelector(".pin").remove();
                    }
                    card.querySelector(".chan-name").innerText = chan;
                    card.querySelector(".chan-name").setAttribute("title", chan);
                    card.querySelector(".chan-views").innerText = viewers;
                    card.querySelector(".chan-songs").innerText = song_count;
                    card.querySelector(".chan-bg").setAttribute("style", img);
                    card.querySelector(".chan-link").setAttribute("href", chan + "/");

                    if(description != "" && description != undefined && !Helper.mobilecheck()) {
                        card.querySelector(".card-title").innerText = chan;
                        card.querySelector(".description_text").innerText = description;
                        description = "";
                    } else {
                        card.querySelector(".card-reveal").remove();
                        Helper.removeClass(card.querySelector(".card"), "sticky-action")
                    }

                    document.getElementById("channels").insertAdjacentHTML("beforeend", card.children[0].innerHTML);
                } else {
                    num--;
                }

            }
            num++;
        }

        var options_list = lists.slice();

        options_list = options_list.sort(Frontpage.sortFunction_active);
        var data = {};
        for(var x in options_list) {
            data[options_list[x]._id] = null;
        }
        if(document.querySelectorAll(".pin").length == 1 && !Helper.mobilecheck()) {
            Helper.tooltip(document.querySelectorAll(".pin")[0].parentElement.parentElement.parentElement, {
                delay: 5,
                position: "top",
                html: "Featured playlist"
            });
        }

        var to_autocomplete = document.querySelectorAll("input.autocomplete")[0];
        //if(Helper.mobilecheck()) to_autocomplete = "input.mobile-search";

        M.Autocomplete.init(to_autocomplete, {
            data: data,
            limit: 5, // The max amount of results that can be shown at once. Default: Infinity.
            onAutocomplete: function(val) {
                Frontpage.to_channel(val, false);
            },
        });

        document.getElementById("preloader").style.display = "none";
        document.getElementById("channels").style.display = "block";
        //Materialize.fadeInImage('#channels');
        //$("#channels").fadeIn(800);
        document.getElementById("autocomplete-input").focus();
        num = 0;
    },

    sortFunction: function(a, b) {
        var o1 = a.viewers;
        var o2 = b.viewers;

        var p1 = a.count;
        var p2 = b.count;

        if (o1 < o2) return 1;
        if (o1 > o2) return -1;
        if (p1 < p2) return 1;
        if (p1 > p2) return -1;
        return 0;
    },

    sortFunction_active: function(a, b){
        var o1 = a.accessed;
        var o2 = b.accessed;

        var p1 = a.count;
        var p2 = b.count;

        if (o1 < o2) return 1;
        if (o1 > o2) return -1;
        if (p1 < p2) return 1;
        if (p1 > p2) return -1;
        return 0;
    },

    getCookie: function(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i=0; i<ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1);
            if (c.indexOf(name) === 0) return c.substring(name.length,c.length);
        }
        return "";
    },

    add_backdrop: function(list, i) {
        if(i >= list.length || i >= 20) i = 0;
        if(list[i] == undefined) return;
        var id = list[i].id;
        if(Frontpage.blob_list[i] !== undefined){
            //$(".room-namer").css("opacity", 0);
            setTimeout(function(){
                if(frontpage){
                    Helper.css("#mega-background","background", "url(data:image/png;base64,"+Frontpage.blob_list[i]+")");
                    Helper.css("#mega-background","background-size" , "cover");
                    Helper.css("#mega-background","background-repeat" , "no-repeat");
                    Helper.css("#mega-background","opacity", 1);
                    document.querySelector(".autocomplete").setAttribute("placeholder", list[i]._id);
                    //$(".room-namer").css("opacity", 1);
                }
            },500);
        } else {
            var img = new Image();
            img.src = "/assets/images/thumbnails/"+id+".jpg";

            img.onerror = function(e){ // Failed to load
                var add = "";
                if(window.location.hostname == "fb.zoff.me") {
                    add = "https://zoff.me";
                }
                Helper.ajax({
                    type: "POST",
                    data: {id:id},
                    url: add + "/api/imageblob",
                    headers: {"Content-Type": "application/json;charset=UTF-8"},
                    success: function(data){
                        setTimeout(function(){
                            try {
                                Helper.css("#mega-background", "background", "url(/assets/images/thumbnails/"+data+")");
                                Helper.css("#mega-background", "background-size" , "cover");
                                Helper.css("#mega-background", "background-repeat" , "no-repeat");
                                Helper.css("#mega-background", "opacity", 1);
                                document.querySelector(".autocomplete").setAttribute("placeholder", list[i]._id);
                            } catch(e) {}
                        },500);
                    },
                    error: function() {
                        document.querySelector(".autocomplete").setAttribute("placeholder", list[i]._id);
                    }
                });
            };
            img.onload = function(){ // Loaded successfully
                try {
                    Helper.css("#mega-background", "background", "url("+img.src+")");
                    Helper.css("#mega-background", "background-size" , "cover");
                    Helper.css("#mega-background", "background-repeat" , "no-repeat");
                    Helper.css("#mega-background", "opacity", 1);
                    document.querySelector(".autocomplete").setAttribute("placeholder", list[i]._id);
                } catch(e) {}
            };

        }
        rotation_timeout = setTimeout(function(){
            if(Frontpage.times_rotated == 50 && frontpage){
                Frontpage.times_rotated = 0;
                i = 0;
                Frontpage.get_frontpage_lists();
            }else if(frontpage){
                Frontpage.times_rotated += 1;
                Frontpage.add_backdrop(list, i+1);
            }
        },6000);
    },

    get_frontpage_lists: function() {
        var add = "";
        if(window.location.hostname == "fb.zoff.me") {
            add = "https://zoff.me";
        }
        Helper.ajax({
            url: add + "/api/frontpages",
            method: "get",
            success: function(response){
                response = JSON.parse(response);
                Frontpage.frontpage_function(response.results);
            },
            error: function() {
                M.toast({html: "Couldn't fetch lists, trying again in 3 seconds..", displayLength: 3000, classes: "red lighten connect_error"});
                retry_frontpage = setTimeout(function(){
                    Frontpage.get_frontpage_lists();
                }, 3000);
            },
        });
    },

    start_snowfall: function() {
        setTimeout(function(){
            var x = Math.floor((Math.random() * window.innerWidth) + 1);
            var snow = document.createElement("div");
            var parent = document.getElementsByClassName("mega")[0];

            snow.className = "snow";
            //snow.attr("left", x);
            snow.style.left = x+"px";
            snow.style.top = "0px";
            parent.appendChild(snow);
            Frontpage.fall_snow(snow);
            Frontpage.start_snowfall();
        }, 800);
    },

    fall_snow: function(corn) {
        corn.style.top = (parseInt(corn.style.top.replace("px", ""))+2)+"px";
        if(parseInt(corn.style.top.replace("px", "")) < document.getElementById("mega-background").offsetHeight-2.5){
            setTimeout(function(){
                Frontpage.fall_snow(corn);
            },50);
        }else{
            corn.remove();
        }
    },

    set_viewers: function(viewers) {
        document.querySelector("#frontpage-viewer-counter").innerHTML = "<i class='material-icons frontpage-viewers'>visibility</i>" + viewers;
    },

    to_channel: function(new_channel, popstate) {
        Helper.css("#channel-load", "display", "block");
        window.scrollTo(0, 0);
        frontpage = false;
        new_channel = new_channel.toLowerCase();
        clearTimeout(rotation_timeout);
        if(Helper.mobilecheck()){
            Helper.log(["removing all listeners"]);
            removeAllListeners();
        }
        Helper.css("#main-container", "background-color", "#2d2d2d");
        if(!Helper.mobilecheck()) {
            Helper.tooltip("#frontpage-viewer-counter", "destroy");
            Helper.tooltip(".generate-channel-name", "destroy");
            Helper.tooltip("#offline-mode", "destroy");
            Helper.tooltip("#client-mode-button", "destroy");
            if(document.querySelectorAll(".pin").length == 1) {
                Helper.tooltip(document.querySelectorAll(".pin")[0].parentElement.parentElement.parentElement, "destroy");
            }
        }
        currently_showing_channels = 1;
        clearTimeout(retry_frontpage);
        Helper.ajax({
            url: "/" + new_channel,
            method: "get",
            data: {channel: new_channel},
            success: function(e){

                if(Player.player !== ""){
                    //Player.player.destroy();
                    socket.emit("change_channel", {channel: chan.toLowerCase()});
                }
                var _player = document.querySelectorAll("#frontpage_player");
                if(_player.length > 0) _player[0].innerHTML = "";
                if(Helper.mobilecheck()) {
                    //Helper.log("disconnecting");
                    //socket.disconnect();
                    socket.removeAllListeners();
                }

                if(!popstate){
                    window.history.pushState("to the channel!", "Title", "/" + new_channel);
                    if(prev_chan_list == "") prev_chan_list = new_channel;
                    if(prev_chan_player == "") prev_chan_player = new_channel;
                    window.chan = new_channel;
                }

                var response = document.createElement("div");
                response.innerHTML = e;

                M.FormSelect.getInstance(document.querySelector("#view_channels_select")).destroy();
                //$('select').formSelect('destroy');
                Helper.removeElement(".mega");
                Helper.removeElement(".mobile-search");
                document.getElementsByTagName("main")[0].className = "container center-align main";
                Helper.addClass("#main-container", "channelpage");

                document.getElementsByTagName("header")[0].innerHTML = response.querySelectorAll("header")[0].innerHTML;

                if(document.querySelectorAll("#alreadychannel").length === 0 || Helper.mobilecheck() || Player.player === undefined){
                    document.getElementsByTagName("main")[0].innerHTML = response.querySelectorAll("main")[0].innerHTML;
                } else {
                    document.getElementById("main-row").insertAdjacentHTML("beforeend", response.querySelectorAll("#playlist")[0].outerHTML);
                    if(!client) document.getElementById("video-container").insertAdjacentHTML("beforeend", response.querySelectorAll("#main_components")[0].outerHTML);
                    document.getElementById("main-row").insertAdjacentHTML("beforeend", "<div id='playbar'></div>");
                    Helper.removeClass("#player", "player_bottom");
                    Helper.removeClass("#main-row", "frontpage_modified_heights");
                    Helper.removeElement("#main_section_frontpage");
                    Helper.removeElement("#closePlayer");
                    Helper.removeElement("#player_bottom_overlay");
                }
                document.getElementById("search").setAttribute("placeholder", "Find song on YouTube...");
                Helper.addClass(".page-footer", "padding-bottom-novideo");
                from_frontpage = true;
                if(document.querySelectorAll("#alreadychannel").length == 1){
                    Channel.init();
                }else{
                    fromFront = true;
                    Channel.init();
                }
                if(document.querySelectorAll("#alreadyfp").length === 0) document.getElementsByTagName("head")[0].insertAdjacentHTML("beforeend", "<div id='alreadyfp'></div>");

            }
        });
    },

    init: function() {

        var date = new Date();
        Frontpage.blob_list = [];
        if(date.getMonth() == 3 && date.getDate() == 1){
            Helper.css(".mega", "-webkit-transform", "rotate(180deg)");
            Helper.css(".mega", "-moz-transform", "rotate(180deg)");
            //Materialize.toast('<p id="aprilfools">We suck at pranks..<a class="waves-effect waves-light btn light-green" style="pointer-events:none;">Agreed</a></p>', 100000);
        }

        if(window.location.hostname != "localhost") {
            ga('send', 'pageview');
        }

        window.onpopstate = function(e){
            var url_split = window.location.href.split("/");

            if(url_split[3] !== "" && url_split[3].substring(0,1) != "#"){
                Frontpage.to_channel(url_split[3], true);
            }
        };

        if(window.location.hostname == "fb.zoff.me") {
            Helper.addClass("footer", "hide");
        }

        channel_list = document.getElementById("channel-list-container").cloneNode(true).innerHTML;

        if(window.location.hostname != "fb.zoff.me") Frontpage.share_link_modifier();

        if(window.location.hostname == "zoff.me" || window.location.hostname == "fb.zoff.me") add = "https://zoff.me";
        else add = window.location.hostname;
        if(socket === undefined) {
            no_socket = false;
            socket = io.connect(''+add+':8080', connection_options);
            socket.on('update_required', function(msg) {
                if(window.location.hostname == "localhost") {
                    console.log(msg);
                    return;
                }
                window.location.reload(true);
            });
        }
        if(document.querySelectorAll("#alreadyfp").length === 0 || Helper.mobilecheck() || !socket._callbacks.$playlists || user_auth_avoid){
            setup_playlist_listener();
        }

        M.Modal.init(document.getElementById("about"));
        M.Modal.init(document.getElementById("help"));
        M.Modal.init(document.getElementById("contact"));
        var elem = document.querySelector('select');
        var instance = M.FormSelect.init(elem);

        Helper.log([
            "Sending frontpage_lists",
            "Socket"
        ]);

        Crypt.init();
        if(Crypt.get_offline()){
            change_offline(true, offline);
        } else {
            if(!Helper.mobilecheck()) {
                Helper.tooltip("#offline-mode", {
                    delay: 5,
                    position: "bottom",
                    html: "Enable local mode"
                });
            }
        }
        if(!Helper.mobilecheck()) {
            Helper.tooltip("#frontpage-viewer-counter", {
                delay: 5,
                position: "bottom",
                html: "Total Viewers"
            });
            Helper.tooltip("#client-mode-button", {
                delay: 5,
                position: "bottom",
                html: "Client mode"
            });
            Helper.tooltip(".generate-channel-name", {
                delay: 5,
                position: "bottom",
                html: "Generate name"
            });
        }
        Frontpage.get_frontpage_lists();

        Helper.css("#channel-load", "display", "none");
        //Materialize.toast("<a href='/remote' style='color:white;'>Try out our new feature, remote!</a>", 8000)
        if(window.location.hash == "#donation") {
            window.location.hash = "#";
            M.Modal.init(document.getElementById("donation"));;
            M.Modal.getInstance(document.getElementById("donation")).open();
        }

        if(!localStorage.ok_cookie){
            before_toast();
            M.toast({html: "We're using cookies to enhance your experience!  <a class='waves-effect waves-light btn light-green' href='#' id='cookieok' style='cursor:pointer;pointer-events:all;margin-left:10px;'> ok</a>", displayLength: 10000});
        }

        var pad = 0;

        /*$(".zicon").on("click", function(e) {
            e.preventDefault();

            pad += 10;
            Helper.css(".zicon", "padding-left", pad + "vh");
            if(pad >= 80)
            window.location.href = 'http://etys.no';
        });*/

        if(!Helper.mobilecheck() && Frontpage.winter) {
            document.getElementsByClassName("mega")[0].insertAdjacentHTML("afterbegin", '<div id="snow"></div>');
        }

        if(Helper.mobilecheck()){
            //$('input#autocomplete-input').characterCounter();
        }

        window['__onGCastApiAvailable'] = function(loaded, errorInfo) {
            if (loaded) {
                chromecastReady = true;
            } else {
            }
        }
    },

    share_link_modifier: function() {
        document.getElementById("facebook-code-link").setAttribute("href", "https://www.facebook.com/sharer/sharer.php?u=https://zoff.me/");
        document.getElementById("facebook-code-link").setAttribute("onclick", "window.open('https://www.facebook.com/sharer/sharer.php?u=https://zoff.me/', 'Share Zoff','width=600,height=300'); return false;");
        document.getElementById("twitter-code-link").setAttribute("href", "https://twitter.com/intent/tweet?url=https://zoff.me/&amp;text=Check%20out%20Zoff!&amp;via=zoffmusic");
        document.getElementById("twitter-code-link").setAttribute("onclick", "window.open('https://twitter.com/intent/tweet?url=https://zoff.me/&amp;text=Check%20out%20Zoff!&amp;via=zoffmusic','Share Playlist','width=600,height=300'); return false;");
        //$("#qr-code-link").attr("href", "//chart.googleapis.com/chart?chs=500x500&cht=qr&chl=https://zoff.me/&choe=UTF-8&chld=L%7C1");
        //$("#qr-code-image-link").attr("src", "//chart.googleapis.com/chart?chs=150x150&cht=qr&chl=https://zoff.me/&choe=UTF-8&chld=L%7C1");
    }
};

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};
