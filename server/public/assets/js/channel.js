var Channel = {
    init: function() {
        if(client) {
            Helper.addClass(".tabs", "hide");
            Helper.removeClass("#wrapper", "tabs_height");
            Helper.addClass("#wrapper", "client-wrapper");
            if(!Helper.mobilecheck()) {
                Helper.tooltip(".skip_next_client", {
                    delay: 5,
                    position: "bottom",
                    html: "Skip"
                });
            }
            Helper.addClass("#chan", "chan-client");
            Helper.addClass("#results", "client-results-height");
            Helper.addClass(".pagination-results", "client-pagination-height");
            Helper.addClass(".control-list", "client-control-list");
        }
        if(!Admin.logged_in) Admin.display_logged_out();
        number_suggested = 0;
        var no_socket = true;

        chan = Helper.html("#chan");
        mobile_beginning = Helper.mobilecheck();
        var side = Helper.mobilecheck() ? "left" : "right";

        if(window.location.hostname != "localhost") {
            ga('send', 'pageview');
        }

        window.onpopstate = function(e){
            Channel.onepage_load();
        };

        if(window.location.hostname == "fb.zoff.me") {
            Helper.addClass("footer", "hide");
        }

        if(window.location.hostname != "fb.zoff.me") Channel.share_link_modifier();
        if(window.location.hostname == "zoff.me" || window.location.hostname == "fb.zoff.me") add = "https://zoff.me";
        else add = window.location.hostname;

        if(Player !== undefined && !client) Player.stopInterval= false;

        if(!client) {
            //Helper.tabs('.playlist-tabs');
            Helper.tabs('.playlist-tabs-loggedIn', {
                onShow: function(e) {
                    if(this.index == 2) {
                        document.getElementById("text-chat-input").focus();
                        Chat.channel_received = 0;
                        Chat.all_received = 0;
                        Helper.addClass(document.querySelector(".chat-link span.badge.new.white"), "hide");
                        document.getElementById("favicon").setAttribute("href", "/assets/images/favicon.png");

                        chat_active = true;
                        unseen = false;
                        chat_unseen = false;
                        document.getElementsByClassName("chat-link")[0].setAttribute("style", "color: white !important;");
                        blinking = false;
                        //Helper.css("#chat-container", "display", "block");
                        //Helper.css("#wrapper", "display", "none");
                        //Helper.css("#suggestions", "display", "none");
                        document.getElementById("text-chat-input").focus();
                        Helper.css("#pageButtons", "display", "none");
                        scrollChat();
                    }
                }
            });

            if(window.location.hash == "#chat-container") {
                M.Tabs.getInstance(document.querySelector('.playlist-tabs-loggedIn')).select("chat-container");
            } else if(window.location.hash == "#suggestions") {
                M.Tabs.getInstance(document.querySelector('.playlist-tabs-loggedIn')).select("suggestions");
            } else if(window.location.hash == "#wrapper") {
                M.Tabs.getInstance(document.querySelector('.playlist-tabs-loggedIn')).select("wrapper");
            }

            Helper.tabs('.chatTabs');
        }
        var sidenavElem = document.getElementsByClassName("sidenav")[0];
        M.Sidenav.init(sidenavElem, {
            menuWidth: 310,
            edge: side,
            closeOnClick: false,
            draggable: false,
            onOpenStart: function(el) {
                Helper.addClass(".hamburger-sidenav", "open");
            },
            onCloseStart: function(el) {
                Helper.removeClass(".hamburger-sidenav", "open");
            },
        });
        M.Collapsible.init(document.getElementsByClassName("settings-collapsible")[0], {
            accordion : true
        });

        if(!client) {
            M.Modal.init(document.getElementById("embed"));
        } else {
            Helper.removeElement("#embed");
            Helper.removeElement(".embed-button-footer");
            Helper.removeElement(".tabs");
        }
        M.Modal.init(document.getElementById("help"));
        M.Modal.init(document.getElementById("contact"));
        M.Modal.init(document.getElementById("channel-share-modal"));
        M.Modal.init(document.getElementById("delete_song_alert"), {
            dismissible: false
        });
        M.Modal.init(document.getElementById("user_password"), {
            dismissible: false
        });

        Channel.spotify_is_authenticated(spotify_authenticated);

        result_html 	   	  = document.getElementById("temp-results-container");
        pagination_buttons_html = "<div class='pagination-results'>" + document.getElementsByClassName("pagination-results")[0].cloneNode(true).innerHTML + "</div>";
        empty_results_html 	  = Helper.html("#empty-results-container");
        not_import_html       = Helper.html(".not-imported-container");
        not_export_html       = Helper.html(".not-exported-container");
        Helper.setHtml(".not-imported-container", "");
        Helper.setHtml(".not-exported-container", "");

        if(socket === undefined){
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

        Crypt.init();

        setup_auth_listener();

        if(Crypt.get_offline()){
            document.getElementsByClassName("offline_switch_class")[0].checked = true;
            change_offline(true, offline);
        }
        if(!Helper.mobilecheck() && (document.querySelectorAll("#alreadychannel").length === 0 || !Hostcontroller.old_id || document.getElementById("code-text").innerText.toUpperCase() == "ABBADUR")) setup_host_initialization();

        if(document.querySelectorAll("#alreadychannel").length === 0 || Helper.mobilecheck()){
            setup_youtube_listener();
            get_list_listener();
            setup_suggested_listener();
            if(!client) {
                setup_viewers_listener();
            }
        } else {
            Helper.css("#channel-load", "display", "none");
            Helper.css("#player", "opacity", "1");
            Helper.css("#controls", "opacity", "1");
            Helper.css(".playlist", "opacity", "1");
            if(!client) {
                Player.readyLooks();
                Playercontrols.initYoutubeControls(Player.player);
                Playercontrols.initSlider();
                if(player_ready) {
                    Player.player.setVolume(Crypt.get_volume());
                }
                Helper.removeClass(".video-container", "no-opacity");
                var codeURL = "https://remote."+window.location.hostname+"/"+id;
                Helper.setHtml("#code-text", id);
                document.getElementById("code-qr").setAttribute("src", "https://chart.googleapis.com/chart?chs=221x221&cht=qr&choe=UTF-8&chld=L|1&chl="+codeURL);
                document.getElementById("code-link").setAttribute("href", codeURL);
            }
        }


        if(!client) {
            var shareCodeUrl = window.location.protocol + "//client."+window.location.hostname+"/"+chan.toLowerCase();
            document.getElementById("share-join-qr").setAttribute("src", "https://chart.googleapis.com/chart?chs=221x221&cht=qr&choe=UTF-8&chld=L|1&chl="+shareCodeUrl);
            Helper.setHtml("#channel-name-join", "client." + window.location.hostname + "/" + chan.toLowerCase());
        } else {
            Helper.removeElement(".video-container");
            Helper.removeElement(".offline-panel");
            Helper.removeElement(".remote-panel");
            Helper.removeElement(".mobile-remote-panel");
            Helper.removeElement(".import-panel");
            Helper.removeElement(".export-panel");
        }
        if(no_socket || Helper.mobilecheck()){
            emit_list();
        }

        if(!Helper.mobilecheck()) {
            if(!client) {
                Helper.tooltip("#chan", {
                    delay: 5,
                    position: "bottom",
                    html: "Show join URL",
                });
            }

            Helper.tooltip("#viewers", {
                delay: 5,
                position: "top",
                html: "Viewers"
            });

            Helper.tooltip("#fullscreen", {
                delay: 5,
                position: "top",
                html: "Fullscreen"
            });

            Helper.tooltip(".search-btn-container", {
                delay: 5,
                position: "bottom",
                html: "Search"
            });


            Helper.tooltip(".shuffle-btn-container", {
                delay: 5,
                position: "bottom",
                html: "Shuffle",
            });

            Helper.tooltip("#settings", {
                delay: 5,
                position: "bottom",
                html: "Settings",
            });
        }

        if(!client) {
            window.onYouTubeIframeAPIReady = Player.onYouTubeIframeAPIReady;
            if(Player.player === "" || Player.player === undefined || Helper.mobilecheck()) Player.loadPlayer();
        }
        //}

        if(Helper.mobilecheck()) {
            if(!client) {
                Mobile_remote.initiate_volume();
            }
                Helper.addClass(".close-settings", "hide");
        } else {
            if(!client) {
                Channel.window_width_volume_slider();
            }
        }

        setup_admin_listener();
        setup_list_listener();
        if(!client) {
            setup_chat_listener();
            get_history();
        }
        if(client || Helper.mobilecheck()){
            get_list_ajax();
            get_np_ajax();

        }

        if(!Helper.msieversion() && !Helper.mobilecheck() && !client) Notification.requestPermission();

        document.getElementsByClassName("search_input")[0].focus();

        Helper.sample();
        if(!Helper.mobilecheck() && !client) {
            Helper.tooltip('.castButton', {
                delay: 5,
                position: "top",
                html: "Cast Zoff to TV"
            });

            /*$("#color_embed").spectrum({
                color: "#808080",
                change: function(c) {
                    color = c.toHexString().substring(1); // #ff0000
                    document.getElementById("embed-area").value = embed_code(embed_autoplay, embed_width, embed_height, color);
                },
                appendTo: "#embed",
                containerClassName: 'polyfill-color z-depth-4',
                show: function(color) {
                },
            });*/

            /*Helper.addClass(".sp-choose", "hide");
            Helper.addClass(".sp-cancel", "btn-flat waves-effect waves-red");
            Helper.removeClass(".sp-cancel", "sp-cancel");
            document.getElementsByClassName("sp-button-container")[0].insertAdjacentHTML("beforeend", "<a href='#' class='btn-flat waves-effect waves-green sp-choose-link'>CHOOSE</a>");
            */
        }

        addListener("click", ".sp-choose-link", function(e) {
            event.preventDefault();
            document.getElementsByClassName("sp-choose")[0].click();
        });

        //$("#results" ).hover( function() { Helper.removeClass(".result", "hoverResults"); i = 0; }, function(){ });
        document.getElementById("search").focus();
        Helper.css("#embed-button", "display", "inline-block");
        document.getElementById("search").setAttribute("placeholder", "Find song on YouTube...");

        if(!client) {
            Helper.addClass("footer", "padding-bottom-novideo");
            document.getElementById("embed-area").value = embed_code(embed_autoplay, embed_width, embed_height, color);
        }

        if(!/chrom(e|ium)/.test(navigator.userAgent.toLowerCase()) && !Helper.mobilecheck() && !client){
            Helper.css(".castButton", "display", "none");
        }

        Helper.log(["chromecastAvailable " + chromecastAvailable, "chromecastReady " + chromecastReady]);

        if(chromecastAvailable && !client){
            hide_native(1);
        } else if(chromecastReady && !client) {
            initializeCastApi();
        } else if(!client){
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
        Channel.listeners(true);
        Channel.add_context_menu();

        if(!Helper.mobilecheck() && navigator.userAgent.match(/iPad/i) == null){
            setTimeout(function(){Channel.set_title_width();}, 100);
        }
    },

    seekToClick: function(e){
        var acceptable = ["bar", "controls", "duration"];

        if(acceptable.indexOf(e.target.getAttribute("id")) >= 0) {
            var total = full_playlist[full_playlist.length - 1].duration / document.getElementById("controls").offsetWidth;
            total = total * e.clientX;

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
                document.getElementById("bar").style.width = per + "%"
            } else {
                castSession.sendMessage("urn:x-cast:zoff.me", {type: "seekTo", seekTo: total});
            }
        }
    },

    seekToMove: function(e){
        var pos_x = event.clientX - Math.ceil(document.getElementById("seekToDuration").offsetWidth / 2);
        if(pos_x < 0) pos_x = 0;
        else if(pos_x + document.getElementById("seekToDuration").offsetWidth > document.getElementById("controls").offsetWidth) {
            pos_x = document.getElementById("controls").offsetWidth - document.getElementById("seekToDuration").offsetWidth;
        }
        Helper.css("#seekToDuration", "left", pos_x + "px");
        try{
            var total = full_playlist[full_playlist.length - 1].duration / document.getElementById("controls").offsetWidth;
            total = total * event.clientX;
            var _time = Helper.secondsToOther(total);
            var _minutes = Helper.pad(_time[0]);
            var _seconds = Helper.pad(Math.ceil(_time[1]));
            Helper.setHtml("#seekToDuration", _minutes + ":" + _seconds);

            var acceptable = ["bar", "controls", "duration"];
            if(acceptable.indexOf(event.target.getAttribute("id")) >= 0 && dragging) {
                document.getElementById("bar").style.width(((100 / duration) * total) + "%");
            }
        } catch(e){}
    },

    set_title_width: function(start){
        if(window.innerWidth > 600){
            var add_width = document.getElementsByClassName("brand-logo")[0].offsetWidth
            if(start){
                add_width = window.innerWidth * 0.15;
            }
            var test_against_width = window.innerWidth - document.getElementsByClassName("control-list")[0].offsetWidth - add_width - 33;
            title_width = test_against_width;
            document.getElementsByClassName("title-container")[0].style.width = title_width + "px";
        } else {
            document.getElementsByClassName("title-container")[0].style.width = "100%";
        }
    },

    spotify_is_authenticated: function(bool){
        if(bool){
            Helper.log([
                "Spotify is authenticated",
                "access_token: " + access_token_data.access_token,
                "token_type:" + access_token_data.token_type,
                "expires_in: " + access_token_data.expires_in
            ]);

            Helper.css(".spotify_authenticated", "display", "block");
            Helper.css(".spotify_unauthenticated", "display", "none");
        } else {
            Helper.log(["Spotify is not authenticated"]);
            Helper.css(".spotify_authenticated", "display", "none");
            Helper.css(".spotify_unauthenticated", "display", "block");
        }
    },

    add_context_menu: function() {
        addListener("contextmenu", ".vote-container", function(event) {
            //event.preventDefault();
            this.preventDefault();
            var that = this;
            contextListener(event, that);
        });

        addListener("contextmenu", ".add-suggested", function(event) {
            //event.preventDefault();
            var that = this;
            contextListener(event, that);
        });

        addListener("click", ".list-remove", function(event) {
            //event.preventDefault();
            var that = this;
            console.log(that, event);
            contextListener(event, that);
        });
    },

    share_link_modifier: function(){
        document.getElementById("facebook-code-link").setAttribute("href", "https://www.facebook.com/sharer/sharer.php?u=https://zoff.me/" + chan.toLowerCase());
        document.getElementById("facebook-code-link").setAttribute("onclick", "window.open('https://www.facebook.com/sharer/sharer.php?u=https://zoff.me/" + chan.toLowerCase() + "', 'Share Playlist','width=600,height=300'); return false;");
        document.getElementById("twitter-code-link").setAttribute("href", "https://twitter.com/intent/tweet?url=https://zoff.me/" + chan.toLowerCase() + "&amp;text=Check%20out%20this%20playlist%20" + chan.toLowerCase() + "%20on%20Zoff!&amp;via=zoffmusic");
        document.getElementById("twitter-code-link").setAttribute("onclick", "window.open('https://twitter.com/intent/tweet?url=https://zoff.me/" + chan.toLowerCase() + "/&amp;text=Check%20out%20this%20playlist%20" + chan.toLowerCase() + "%20on%20Zoff!&amp;via=zoffmusic','Share Playlist','width=600,height=300'); return false;");
    },

    window_width_volume_slider: function() {
        if(window.innerWidth <= 600 && slider_type == "horizontal") {
            slider_type = "vertical";
            Playercontrols.initSlider();
        } else if(window.innerWidth > 600 && slider_type == "vertical") {
            slider_type = "horizontal";
            Playercontrols.initSlider();
            Helper.removeClass(".volume-container", "hide");
        }
    },

    listeners: function(on) {
        var scrollListener = function(e) {
            if(!programscroll) {
                userscroll = true;
                if(document.getElementById("chatchannel").scrollTop + document.getElementById("chatchannel").offsetHeight >= document.getElementById("chatchannel").scrollHeight) {
                    userscroll = false;
                }
            }
        }
        var scrollAllListener = function(e) {
            if(!programscroll) {
                userscroll = true;
                if(document.getElementById("chatall").scrollTop+ document.getElementById("chatall").offsetHeight >= document.getElementById("chatall").scrollHeight) {
                    userscroll = false;
                }
            }
        }
        if(!client) {
            if(on) {
                document.getElementById("chatchannel").addEventListener("scroll", scrollListener);
                document.getElementById("chatall").addEventListener("scroll", scrollListener);
            } else {
                document.getElementById("chatchannel").removeEventListener("scroll", scrollListener);
                document.getElementById("chatall").removeEventListener("scroll", scrollAllListener);
            }
        }
    },

    onepage_load: function(){
        if(changing_to_frontpage) return;
        var url_split = window.location.href.split("/");
        if(url_split[3].substr(0,1) != "#!" && url_split[3] !== "" && !(url_split.length == 5 && url_split[4].substr(0,1) == "#")){

            socket.emit("change_channel");
            Admin.beginning = true;

            chan = url_split[3].replace("#", "");
            document.getElementById("chan").innerHTML = Helper.upperFirst(chan);
            var add = "";
            w_p = true;
            if(private_channel) add = Crypt.getCookie("_uI") + "_";
            socket.emit("list", {version: parseInt(localStorage.getItem("VERSION")), channel: add + chan.toLowerCase()});
        } else if(url_split[3] === "") {
            /*if(client) {
                var host = window.location.hostname.split(".");
                window.location.hostname = host[host.length -1];
            }*/
            //Admin.display_logged_out();
            var channel_before_move = chan.toLowerCase();
            clearTimeout(timed_remove_check);
            changing_to_frontpage = true;
            user_change_password = false;
            clearTimeout(width_timeout);
            if(fireplace_initiated){
                fireplace_initiated = false;
                Player.fireplace.destroy();
                Helper.css("#fireplace_player", "display", "none");
            }
            Helper.css("#channel-load", "display", "block");
            window.scrollTo(0, 0);

            Player.stopInterval = true;
            Admin.beginning 	 = true;
            began 				 = false;
            durationBegun  		 = false;

            Helper.css("#embed-button", "display", "none");
            if(!Helper.mobilecheck()) {
                Helper.tooltip('.castButton', "destroy");
                Helper.tooltip("#viewers", "destroy");
                Helper.tooltip("#offline-mode", "destroy");
                if(M.Tooltip.getInstance(document.getElementById("chan_thumbnail")) != undefined) {
                    Helper.tooltip('#chan_thumbnail', "destroy");
                }
                Helper.tooltip('#fullscreen', "destroy");
                if(M.Tooltip.getInstance(document.getElementById("admin-lock")) != undefined) {
                    Helper.tooltip('#admin-lock', "destroy");
                }
                Helper.tooltip(".search-btn-container", "destroy");
                Helper.tooltip(".shuffle-btn-container", "destroy");
                Helper.tooltip("#settings", "destroy");
            }
            Helper.removeElement("#seekToDuration");

            M.Sidenav.getInstance(document.getElementsByClassName("sidenav")[0]).destroy();
            if(!client) {
                if(!Helper.mobilecheck()) {
                    Helper.tooltip("#chan", "destroy");
                }
                var tap_1 = document.querySelectorAll(".tap-target")
                if(tap_1.length > 0 && M.TapTarget.getInstance(tap_1[0])) {
                    M.TapTarget.getInstance(tap_1[0]).close();
                }
            }
            clearTimeout(tap_target_timeout);
            before_toast();
            if(Helper.mobilecheck() || user_auth_avoid || client) {
                Helper.log(["Removing all listeners"]);
                //socket.emit("change_channel");
                //removeAllListeners();
                //socket.removeEventListener(id);
                socket.emit("left_channel", {
                    channel: channel_before_move
                });
                socket.emit("change_channel");
                chan = "";
                socket.removeEventListener("np");
                socket.removeEventListener("id");
                socket.removeEventListener(id);
                //socket.disconnect();
            }
            socket.removeEventListener("chat.all");
            socket.removeEventListener("chat");
            socket.removeEventListener("conf");
            socket.removeEventListener("pw");
            socket.removeEventListener("toast");
            //socket.removeEventListener("id");
            socket.removeEventListener("channel");
            socket.removeEventListener("auth_required");
            socket.removeEventListener("auth_accepted");
            socket.removeEventListener("suggested");
            socket.removeEventListener("color");
            socket.removeEventListener("chat_history");
            Helper.ajax({
                url: "/",
                method: "GET",
                success: function(e){

                    if(!client) {
                        document.getElementById("volume-button").removeEventListener("click", Playercontrols.mute_video);
                        document.getElementById("playpause").removeEventListener("click", Playercontrols.play_pause);
                        document.getElementById("fullscreen").removeEventListener("click", Playercontrols.fullscreen);
                    }
                    Channel.listeners(false);
                    if(Helper.mobilecheck() || user_auth_avoid) {
                        video_id   = "";
                        song_title = "";
                    }

                    document.querySelectorAll("meta[name=theme-color]")[0].setAttribute("content", "#2D2D2D");

                    if(!Helper.mobilecheck() && !user_auth_avoid){
                        Helper.removeElement("#playbar");
                        Helper.removeElement("#main_components");
                        Helper.addClass("#player", "player_bottom");
                        Helper.addClass("#main-row", "frontpage_modified_heights");
                        Helper.css("#player", "opacity", "1");
                        Helper.removeClass("#video-container", "no-opacity");
                        document.getElementById("main-row").insertAdjacentHTML("afterbegin", "<div id='player_bottom_overlay' class='player player_bottom'></div>");
                        document.getElementById("player_bottom_overlay").insertAdjacentHTML("afterbegin", "<a id='closePlayer' title='Close Player'>X</a>");
                        Helper.removeElement("#playlist");
                    } else {
                        try{
                            Player.player.destroy();
                        } catch(error){}
                        Player.player = "";
                        document.title = "Zoff";
                    }

                    var response = document.createElement("div");
                    response.innerHTML = e;
                    Helper.removeElement("#sidenav-overlay");
                    document.getElementsByTagName("main")[0].className = "center-align container";
                    Helper.removeClass("#main-container", "channelpage");
                    document.getElementById("main-container").setAttribute("style", "");
                    document.getElementsByTagName("header")[0].innerHTML = response.querySelectorAll("header")[0].outerHTML;

                    document.getElementsByTagName("header")[0].insertAdjacentHTML("afterend", response.querySelectorAll(".section.mega")[0].outerHTML);
                    //document.getElementsByTagName("header")[0].insertAdjacentHTML("afterend", response.querySelectorAll(".section.mobile-search")[0].innerHTML);
                    if(Helper.mobilecheck() || user_auth_avoid) {
                        document.getElementsByTagName("main")[0].innerHTML = response.querySelectorAll("main")[0].innerHTML;
                    } else {
                        document.getElementsByTagName("main")[0].insertAdjacentHTML("beforeend", response.querySelectorAll("#main_section_frontpage")[0].outerHTML);
                    }
                    Helper.removeClass(".page-footer", "padding-bottom-extra");
                    Helper.removeClass(".page-footer", "padding-bottom-novideo");
                    document.getElementById("favicon").setAttribute("href", "/assets/images/favicon-32x32.png");

                    Helper.log(["Socket", socket]);
                    if(document.querySelectorAll("#alreadyfp").length == 1){
                        Frontpage.init();
                    }else {
                        fromChannel = true;
                        frontpage 	= true;
                        Frontpage.init();
                    }

                    changing_to_frontpage = false;

                    if(document.querySelectorAll("#alreadychannel").length === 0 && !user_auth_avoid){
                        document.getElementsByTagName("head")[0].insertAdjacentHTML("beforeend", "<div id='alreadychannel'></div");
                    } else if(user_auth_avoid) {
                        Helper.removeElement("#alreadychannel");
                    }
                    Helper.css("#channel-load", "display", "none");
                    user_auth_avoid = false;
                }
            });
        }
    }
}

function get_history() {
    if(socket && socket.id) {
        /*var p = Crypt.get_userpass();
        if(p == undefined) p = "";
        var c = Crypt.crypt_pass(p, true);
        if(c == undefined) c = "";*/
        socket.emit("get_history", {channel: chan.toLowerCase(), all: false});
        socket.emit("get_history", {channel: chan.toLowerCase(), all: true});
    } else {
        setTimeout(function() {
            get_history();
        }, 50);
    }
}
