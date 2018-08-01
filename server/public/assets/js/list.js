var List = {

    empty: false,
    page: 0,
    can_fit: document.querySelectorAll("#wrapper").length > 0 ? Math.round(Helper.computedStyle("#wrapper", "height") / 71) : 0,
    element_height: document.querySelectorAll("#wrapper").length > 0 ? (Helper.computedStyle("#wrapper", "height") / Math.round(Helper.computedStyle("#wrapper", "height") / 71)) - 25 : 0,
    uris: [],
    not_found: [],
    num_songs: 0,

    channel_function: function(msg) {
        if(user_auth_started) {
            user_auth_started = false;
            M.Modal.getInstance(document.getElementById("user_password")).close();
        }
        switch(msg.type)
        {

            case "list":
                //if(full_playlist == undefined || !offline){
                if((!offline || (offline && !msg.shuffled)) && !(offline && prev_chan_list == chan)){
                    prev_chan_list = chan;
                    List.populate_list(msg.playlist);
                    if(full_playlist.length > 0) {
                        Player.sendNext({title: full_playlist[0].title, videoId: full_playlist[0].id, source: full_playlist[0].source, thumbnail: full_playlist[0].thumbnail});
                    }
                } else if(offline && prev_chan_list == chan && full_playlist != undefined && !msg.shuffled){
                    List.populate_list(full_playlist, true);
                    if(full_playlist.length > 0) {
                        Player.sendNext({title: full_playlist[0].title, videoId: full_playlist[0].id, source: full_playlist[0].source, thumbnail: full_playlist[0].thumbnail});
                    }
                }
                break;
            case "added":
                List.added_song(msg.value);
                if(full_playlist.length > 0) {
                    Player.sendNext({title: full_playlist[0].title, videoId: full_playlist[0].id, source: full_playlist[0].source, thumbnail: full_playlist[0].thumbnail});
                }
                found_array = [];
                found_array_index = 0;
                break;
            case "deleted":
                List.deleted_song(msg.value, msg.removed);
                found_array = [];
                found_array_index = 0;
                break;
            case "vote":
                if(!offline){
                    List.voted_song(msg.value, msg.time);
                    if(full_playlist.length > 0) {
                        Player.sendNext({title: full_playlist[0].title, videoId: full_playlist[0].id, source: full_playlist[0].source, thumbnail: full_playlist[0].thumbnail});
                    }
                }
                found_array = [];
                found_array_index = 0;
                break;
            case "song_change":
                if((offline && msg.offline_change) || !offline) {
                    if(window.location.pathname != "/") List.song_change(msg.time, msg.remove);
                    if(full_playlist.length > 0) {
                        Player.sendNext({title: full_playlist[0].title, videoId: full_playlist[0].id, source: full_playlist[0].source, thumbnail: full_playlist[0].thumbnail});
                    }
                    found_array = [];
                    found_array_index = 0;
                }
                break;
            case "changed_values":
                List.changedValues(msg.value);
                break;
            case "song_change_prev":
                if((offline && msg.offline_change) || !offline) {

                    if(window.location.pathname != "/") List.song_change_prev(msg.time);
                    if(full_playlist.length > 0) {
                        Player.sendNext({title: full_playlist[0].title, videoId: full_playlist[0].id, source: full_playlist[0].source, thumbnail: full_playlist[0].thumbnail});
                    }
                    found_array = [];
                    found_array_index = 0;
                }
                break;
        }
    },

    changedValues: function(song) {
        if(song.type == "suggested") {
            document.querySelector("#suggested-" + song.id).querySelector(".vote-container").setAttribute("title", song.title);
            document.querySelector("#suggested-" + song.id).querySelector(".list-title").setAttribute("title", song.title);
            document.querySelector("#suggested-" + song.id).querySelector(".list-title").innerText =  song.title;
            var _temp_duration = Helper.secondsToOther(song.duration);
            document.querySelector("#suggested-" + song.id).querySelector(".card-duration").innerText =  Helper.pad(_temp_duration[0]) + ":" + Helper.pad(_temp_duration[1]);
            document.querySelector("#suggested-" + song.id).querySelector(".list-image").setAttribute("style", "background-image:url('//img.youtube.com/vi/"+song.new_id+"/mqdefault.jpg');");
            document.querySelector("#suggested-" + song.id).setAttribute("id", song.new_id);
            return;
        }
        var i = List.getIndexOfSong(song.id);
        if(i >= 0 && window.location.pathname != "/") {
            full_playlist[i].title = song.title;
            full_playlist[i].duration = song.duration;
            full_playlist[i].start = song.start;
            full_playlist[i].end = song.end;
            full_playlist[i].id = song.new_id;

            document.querySelector("#" + song.id).querySelector(".vote-container").setAttribute("title", song.title);
            document.querySelector("#" + song.id).querySelector(".list-title").setAttribute("title", song.title);
            document.querySelector("#" + song.id).querySelector(".list-title").innerText = song.title;
            var _temp_duration = Helper.secondsToOther(song.duration);
            document.querySelector("#" + song.id).querySelector(".card-duration").innerText = Helper.pad(_temp_duration[0]) + ":" + Helper.pad(_temp_duration[1]);
            document.querySelector("#" + song.id).querySelector(".list-image").setAttribute("style", "background-image:url('//img.youtube.com/vi/"+song.new_id+"/mqdefault.jpg');");
            document.querySelector("#" + song.id).setAttribute("id", song.new_id);
        }
    },

    insertAtBeginning: function(song_info, transition) {
        if(document.querySelector("#wrapper") == null) return;
        var display = List.page == 0 ? "" : "none";
        var add = List.generateSong(song_info, transition, false, true, false, display, false);
        document.querySelector("#wrapper").insertAdjacentHTML("beforeend", add);
    },

    insertAtIndex: function(song_info, transition, change) {
        if(document.querySelector("#wrapper") == null) return;
        var i = List.getIndexOfSong(song_info.id);
        var display = "none";
        if(!song_info.now_playing){
            if(i >= List.page && i < List.page + (List.can_fit)) display = "inline-flex"
            var add = List.generateSong(song_info, transition, false, true, false, display, false);
            if(i === 0) {
                document.querySelector("#wrapper").insertAdjacentHTML("afterbegin", add);
            } else {
                document.querySelector("#wrapper > div:nth-child(" + (i) + ")").insertAdjacentHTML("afterend", add);
            }
            var added = document.querySelector("#wrapper").children[i];
            Helper.css(added, "display", display);
            if(display == "inline-flex" && document.querySelector("#wrapper").children.length >= List.page + List.can_fit + 1){
                Helper.css(document.querySelector("#wrapper").children[List.page + List.can_fit], "display", "none");
            } else if(i < List.page && document.querySelector("#wrapper").children.length - (List.page + 1) >= 0){
                Helper.css(document.querySelector("#wrapper").children[List.page], "display", "inline-flex");
            } else if(document.querySelector("#wrapper").children.length > List.page + List.can_fit){
                Helper.css(document.querySelector("#wrapper").children[List.page + List.can_fit - 1], "display", "inline-flex");
            }
            if(change && List.page > 0){
                Helper.css(document.querySelector("#wrapper").children[List.page - 1], "display", "none");
            }
            if(transition){
                setTimeout(function(){
                    Helper.css(added, "transform", "translateX(0%)");
                    setTimeout(function() {
                        Helper.removeClass(added, "side_away");
                    }, 300);
                },5);
            }
        }
    },

    populate_list: function(msg, no_reset) {
        if(document.querySelector("#wrapper") == null) return;
        // This math is fucked and I don't know how it works. Should be fixed sometime
        if(!Helper.mobilecheck() && !embed && !client){
            List.can_fit = Math.round(Helper.computedStyle("#wrapper", "height") / 71);
            List.element_height = (Helper.computedStyle("#wrapper", "height") / List.can_fit)-5.3;
        } else if(embed) {
            List.can_fit = Math.round(Helper.computedStyle("#wrapper", "height") / 91) + 1;
            List.element_height = (Helper.computedStyle("#wrapper", "height") / List.can_fit)-4;
        } else if(!client){
            List.can_fit = Math.round((Helper.computedStyle(".tabs", "height") - Helper.computedStyle("header", "height") - 64 - 40) / 71)+1;
            List.element_height = ((window.innerHeight - Helper.computedStyle(".tabs", "height") - Helper.computedStyle("header", "height") - 64 - 40) / List.can_fit)-5;
        } else {
            List.can_fit = Math.round(Helper.computedStyle("#wrapper", "height") / 71)+1;
            List.element_height = (Helper.computedStyle("#wrapper", "height") / List.can_fit)-5.3;
        }
        if(List.element_height < 55.2 && !client){
            List.can_fit = List.can_fit - 1;
            List.element_height = 55.2;
            List.can_fit = Math.round((window.innerHeight - Helper.computedStyle(".tabs", "height") - Helper.computedStyle("header", "height") - 64 - 40) / 71);
            List.element_height = ((window.innerHeight - Helper.computedStyle(".tabs", "height") - Helper.computedStyle("header", "height") - 64 - 40) / List.can_fit)-5;
        }
        if(list_html === undefined) list_html = Helper.html("#list-song-html");
        full_playlist = msg;
        if(offline && !no_reset){
            for(var x = 0; x < full_playlist.length; x++){
                full_playlist[x].votes = 0;
            }
        }
        List.sortList();

        Helper.setHtml("#wrapper", "");

        Helper.log([
            "FULL PLAYLIST",
            full_playlist
        ]);
        if(full_playlist.length > 1){
            for(var j = 0; j < full_playlist.length; j++) {
                var _current_song = full_playlist[j];
                if(!_current_song.hasOwnProperty("start")) full_playlist[j].start = 0;
                if(!_current_song.hasOwnProperty("end")) full_playlist[j].end = full_playlist[j].duration;
                if(!_current_song.now_playing && _current_song.type != "suggested"){ //check that the song isnt playing
                    var generated = List.generateSong(_current_song, false, lazy_load, true, false, "inline-flex", true)
                    document.querySelector("#wrapper").insertAdjacentHTML("beforeend", generated);
                }
            }
            if(document.querySelector("#wrapper").children.length > List.can_fit && !document.querySelectorAll("#pageButtons").length){
                Helper.css(".prev_page", "display", "none");
                Helper.css(".first_page", "display", "none");
                Helper.css(".next_page_hide", "display","none");
                Helper.css(".last_page_hide", "display","none");
            } else if(!document.querySelectorAll("#pageButtons").length){
                Helper.css(".prev_page", "display", "none");
                Helper.css(".next_page", "display", "none");
                Helper.css(".last_page", "display", "none");
                Helper.css(".first_page", "display", "none");
                Helper.css(".next_page_hide", "display","inline-flex");
                Helper.css(".prev_page_hide", "display","inline-flex");
            } else {
                Helper.css(".next_page", "display", "none");
                Helper.css(".last_page", "display", "none");
            }

            List.dynamicContentPage(-10);


        } else {
            List.empty = true;
            Helper.setHtml("#wrapper", "<span id='empty-channel-message'>The playlist is empty.</span>");
            Helper.css(".prev_page","display", "none");
            Helper.css(".next_page","display", "none");
            Helper.css(".last_page","display", "none");
            Helper.css(".last_page_hide","display", "inline-flex");
            Helper.css(".first_page","display", "none");
            Helper.css(".next_page_hide", "display","inline-flex");
            Helper.css(".prev_page_hide","display","inline-flex");
        }
        Helper.css("#settings","visibility", "visible");
        Helper.css("#settings","opacity", "1");
        Helper.css("#wrapper","opacity", "1");
        Helper.removeClass("#pageButtons", "hide");

        if(!embed) {
            Helper.log(["Starting empty-checker"]);
            clearTimeout(timed_remove_check);
            timed_remove_check = setTimeout(function() {
                if(full_playlist.length > 0) {
                    List.check_error_videos(0);
                }
            }, 1500);
        }
    },

    check_error_videos: function(i) {
        //Helper.log("Empty-checker at " + i);
        if(full_playlist.length == 0) return;
        else if(full_playlist[i].source == "soundcloud" && full_playlist.length > i + 1 && window.location.pathname != "/") List.check_error_videos(i + 1);
        else {
            Helper.ajax({
                method: "get",
                url: 'https://www.googleapis.com/youtube/v3/videos?id=' + full_playlist[i].id
                       + "&key=" + api_key.youtube + "&part=snippet",
                success:  function (data) {
                    data = JSON.parse(data);
                      //Helper.log("Empty-checker items " + data.items.length);
                    if (data.items.length == 0) {
                        Helper.log(["Emtpy-checker error at " + full_playlist[i].id + " " + full_playlist[i].title]);
                        socket.emit("error_video", {channel: chan.toLowerCase(), id: full_playlist[i].id, title: full_playlist[i].title, source: full_playlist[i].source});
                    }
                    if(full_playlist.length > i + 1 && window.location.pathname != "/") {
                        List.check_error_videos(i + 1);
                    }
                }
            });
        }
    },

    dynamicContentPageJumpTo: function(page) {
        if(document.querySelector("#wrapper") == null) return
        page = page * List.can_fit;
        var wrapperChildren = [].slice.call(document.querySelector("#wrapper").children);
        if(page > List.page || page < List.page){
            Helper.css(wrapperChildren.slice(List.page, List.page + List.can_fit), "display", "none");
            List.page = page;
            Helper.css(wrapperChildren.slice(List.page, List.page + List.can_fit), "display", "inline-flex");
            if(List.page > 0 && document.querySelector(".prev_page").style.display == "none"){
                Helper.css(".prev_page", "display", "inline-flex");
                Helper.css(".prev_page_hide", "display", "none");
                Helper.css(".first_page", "display", "inline-flex");
                Helper.css(".first_page_hide", "display", "none");
            }

            if(List.page + List.can_fit >= wrapperChildren.length){
                Helper.css(".next_page_hide", "display", "inline-flex");
                Helper.css(".next_page", "display", "none");
                Helper.css(".last_page_hide", "display", "inline-flex");
                Helper.css(".last_page", "display", "none");
            }

            Helper.setHtml("#pageNumber", (List.page / List.can_fit) + 1);
        }
    },

    dynamicContentPage: function(way) {
        if(document.querySelector("#wrapper") == null) return
        var wrapperChildren = [].slice.call(document.querySelector("#wrapper").children);
        if(way == 1 || way == 10) {
            Helper.css(wrapperChildren.slice(List.page, List.page + List.can_fit), "display", "none");
            if(way == 1){
                List.page = List.page + List.can_fit;
            } else if(way == 10) {
                List.page = (Math.floor((document.querySelector("#wrapper").children.length - 1)/ List.can_fit) * List.can_fit);

            }
            Helper.css(wrapperChildren.slice(List.page, List.page + List.can_fit), "display", "inline-flex");

            if(List.page > 0 && document.querySelector(".prev_page").style.display  == "none"){
                Helper.css(".prev_page", "display", "inline-flex");
                Helper.css(".prev_page_hide", "display", "none");
                Helper.css(".first_page", "display", "inline-flex");
                Helper.css(".first_page_hide", "display", "none");
            }
            if(List.page + List.can_fit >= document.querySelector("#wrapper").children.length){
                Helper.css(".next_page_hide", "display", "inline-flex");
                Helper.css(".next_page", "display", "none");
                Helper.css(".last_page_hide", "display", "inline-flex");
                Helper.css(".last_page", "display", "none");
            }
        } else {
            if(way==-10) {
                Helper.css(wrapperChildren.slice(List.page, List.page + List.can_fit), "display", "none");
                List.page = 0;
                Helper.css(wrapperChildren.slice(List.page, List.page + List.can_fit), "display", "inline-flex");
            } else {
                Helper.css(wrapperChildren.slice(List.page - List.can_fit, List.page), "display", "inline-flex");
                Helper.css(wrapperChildren.slice(List.page, List.page + List.can_fit), "display", "none");
                List.page = List.page - List.can_fit < 0 ? 0 : List.page - List.can_fit;
            }
            if(List.page == 0 && document.querySelector(".prev_page").style.display  != "none"){
                Helper.css(".prev_page", "display", "none");
                Helper.css(".prev_page_hide", "display", "inline-flex");
                Helper.css(".first_page", "display", "none");
                Helper.css(".first_page_hide", "display", "inline-flex");
            } else if(document.querySelector(".prev_page").style.display == "none"){
                Helper.css(".prev_page_hide", "display", "inline-flex");
                Helper.css(".first_page_hide", "display", "inline-flex");
            } else {
                Helper.css(".prev_page_hide", "display", "none");
                Helper.css(".first_page_hide", "display", "none");
            }
            if(List.page + List.can_fit < document.querySelector("#wrapper").children.length){
                Helper.css(".next_page_hide", "display", "none");
                Helper.css(".next_page", "display", "inline-flex");
                Helper.css(".last_page_hide", "display", "none");
                Helper.css(".last_page", "display", "inline-flex");
            }
        }
        document.querySelector("#pageNumber").innerText = (List.page / List.can_fit) + 1;
    },

    added_song: function(added) {
        var now_playing;
        if(added != undefined){
            if(full_playlist.length !== 0){
                now_playing = full_playlist.pop();
            }
            full_playlist.push(added);
            List.sortList();
            if(now_playing){
                full_playlist.push(now_playing);
            }

            if(hostMode) {
                M.toast({html: "<div style='display:flex;'><img style='height:100px;align-self:center;' src='" + added.thumbnail + "' /><div style='padding-left:32px;padding-right:32px;'><p>New song added</p><p>" + added.title + "</p></div></div>", displayLength: 10000});
                document.querySelector("#toast-container").setAttribute("style", "z-index: 99999999999 !important");
            }
            if(added.source != "soundcloud" && document.querySelectorAll("#suggested-"+added.id).length > 0) {
                number_suggested = number_suggested - 1;
                if(number_suggested < 0) number_suggested = 0;

                var to_display = number_suggested > 9 ? "9+" : number_suggested;
                if(to_display == 0){
                    Helper.addClass(document.querySelector(".suggested-link span.badge.new.white"), "hide");
                }

                document.querySelector(".suggested-link span.badge.new.white").innerText = to_display;
                Helper.removeElement("#suggested-"+added.id);
            }

            if(List.empty){
                List.empty = false;
            }
            if(document.querySelectorAll("#empty-channel-message").length > 0) {
                document.querySelector("#empty-channel-message").remove();
            }
            List.insertAtIndex(added, true);
            Helper.css(document.querySelector("#wrapper").children[List.page + List.can_fit], "display", "none");
            if(document.querySelector("#wrapper").children.length > List.page + List.can_fit){
                Helper.css(".next_page_hide", "display", "none");
                Helper.removeClass(".next_page", "hide");
                Helper.css(".last_page_hide", "display", "none");
                Helper.css(".next_page", "display", "inline-flex");
                Helper.css(".last_page", "display", "inline-flex");
            } else {
                Helper.css(".next_page_hide", "display", "inline-flex");
                Helper.css(".next_page", "display", "none");
            }
        }
    },

    deleted_song: function(deleted, removed) {
        try{
            var index              = List.getIndexOfSong(deleted);
            //if(!removed) to_delete.style.height = 0;
            var nextToChange;
            if(index < List.page && document.querySelector("#wrapper").children.length - (List.page + 2) >= 0){
                //Helper.css(document.querySelector("#wrapper").children[List.page], "height", 0 + "px");
                nextToChange = document.querySelector("#wrapper").children[List.page];
                //Helper.css(document.querySelector("#wrapper").children[List.page], "display", "inline-flex");
                //Helper.css(document.querySelector("#wrapper").children[List.page], "height", List.element_height + "px");
            } else if(document.querySelector("#wrapper").children.length > List.page + (List.can_fit)){
                //Helper.css(document.querySelector("#wrapper").children[List.page + (List.can_fit)], "height", 0 + "px");
                nextToChange = document.querySelector("#wrapper").children[List.page + (List.can_fit)];
                //Helper.css(document.querySelector("#wrapper").children[List.page + (List.can_fit)], "display", "inline-flex");
                //Helper.css(document.querySelector("#wrapper").children[List.page + (List.can_fit)], "height", List.element_height + "px");
            }
            if(List.page >= document.querySelector("#wrapper").children.length - 1){
                List.dynamicContentPage(-1);
                Helper.css(".next_page_hide", "display", "inline-flex");
                Helper.css(".next_page", "display", "none");
                Helper.css(".last_page_hide", "display", "inline-flex");
                Helper.css(".last_page", "display", "none");
            } else if(List.page + List.can_fit + 1 >= document.querySelector("#wrapper").children.length - 1){
                Helper.css(".next_page_hide", "display", "inline-flex");
                Helper.css(".next_page", "display", "none");
                Helper.css(".last_page_hide", "display", "inline-flex");
                Helper.css(".last_page", "display", "none");
            }

            if(List.page <= index && List.page - List.can_fit <= index) {
                Helper.addClass("#" + deleted, "side_away");

                //document.getElementById(deleted).querySelector(".mobile-delete").remove();
                Helper.css("#" + deleted, "transform", "translateX(-100%)");
                setTimeout(function() {
                    Helper.removeElement("#" + deleted);
                    /*var wrapperChildren = [].slice.call(document.querySelector("#wrapper").children);
                    if(wrapperChildren.length > List.can_fit) {
                        Helper.css(wrapperChildren[List.can_fit], "display", "inline-flex");
                    }*/
                    if(nextToChange != undefined) {
                        Helper.css(nextToChange, "display", "inline-flex");
                        Helper.css(nextToChange, "height", List.element_height + "px");
                    }
                }, 300);
            } else {
                Helper.removeElement("#"+deleted);
                if(nextToChange != undefined) {
                    Helper.css(nextToChange, "display", "inline-flex");
                    Helper.css(nextToChange, "height", List.element_height + "px");
                }
            }
            full_playlist.splice(List.getIndexOfSong(deleted), 1);
            Player.sendNext({title: full_playlist[0].title, videoId: full_playlist[0].id, source: full_playlist[0].source, thumbnail: full_playlist[0].thumbnail});
            //}

        } catch(err) {
            full_playlist.splice(List.getIndexOfSong(deleted), 1);
            if(!List.empty){
                try {
                    document.getElementById(deleted).remove();
                }catch(e){}
                if(index < List.page && document.querySelector("#wrapper").children.length - (List.page + 1) >= 0){
                    //Helper.css(document.querySelector("#wrapper").children[List.page - 1], "display", "inline-flex");
                } else if(document.querySelector("#wrapper").children.length > List.page + List.can_fit){
                    //Helper.css(document.querySelector("#wrapper").children[List.page + (List.can_fit - 1)], "display", "inline-flex");
                }
                if(nextToChange != undefined) {
                    Helper.css(nextToChange, "display", "inline-flex");
                    Helper.css(nextToChange, "height", List.element_height + "px");
                }
                Player.sendNext({title: full_playlist[0].title, videoId: full_playlist[0].id, source: full_playlist[0].source, thumbnail: full_playlist[0].thumbnail});
            }
        }
        if(full_playlist.length < 2){
            List.empty = true;
            Helper.setHtml("#wrapper", "<span id='empty-channel-message'>The playlist is empty.</span>");
        }
        Helper.removeElement("#suggested-"+deleted);
        if(List.page + List.can_fit < document.querySelector("#wrapper").children.length + 1){
            //$(".next_page_hide").css("display", "none");
            //$(".next_page").css("display", "flex");
        }
        if(List.page >= document.querySelector("#wrapper").children.length){
            List.dynamicContentPage(-1);
        }
        Suggestions.checkUserEmpty();
    },

    voted_song: function(voted, time) {
        var index_of_song = List.getIndexOfSong(voted);
        var song_voted_on = full_playlist[index_of_song];

        full_playlist[index_of_song].votes += 1;
        full_playlist[index_of_song].added = time;

        List.sortList();
        Helper.removeElement("#"+voted);
        List.insertAtIndex(song_voted_on, false);
    },

    song_change_prev: function(time) {
        full_playlist[full_playlist.length - 1].now_playing = false;
        full_playlist[full_playlist.length - 1].votes = full_playlist[0].votes;
        full_playlist[full_playlist.length - 1].guids = [];
        full_playlist[full_playlist.length - 1].added = full_playlist[0].added - 1;

        full_playlist.unshift(full_playlist.pop());

        full_playlist[full_playlist.length - 1].now_playing = true;

        if(full_playlist.length == 1) return;
        document.querySelector("#wrapper").children[document.querySelector("#wrapper").children.length - 1].remove();

        var length = full_playlist.length - 2;
        if(length < 0) {
            length = 0;
        }

        List.insertAtIndex(full_playlist[0], false, true);
    },

    song_change: function(time, remove) {
        try{
            var length = full_playlist.length - 1;
            document.querySelector("#wrapper").children[0].remove();
            if(full_playlist.length <= 1) {
                List.empty = true;
                Helper.setHtml("#wrapper", "<span id='empty-channel-message'>The playlist is empty.</span>");
            }

            full_playlist[0].now_playing        = true;
            full_playlist[0].votes              = 0;
            full_playlist[0].guids              = [];
            full_playlist[0].added              = time;
            if(!remove){
                full_playlist[length].now_playing   = false;
            } else {
                delete full_playlist[length];
            }
            Helper.log([
                "SONG ON FIRST INDEX",
                full_playlist[0]
            ]);

            full_playlist.push(full_playlist.shift());
            if(!remove){
                List.insertAtIndex(full_playlist[document.querySelector("#wrapper").children.length], false, true);
            }
            /*var wrapperChildren = [].slice.call(document.querySelector("#wrapper").children);
            if(wrapperChildren.length > List.can_fit) {
                //Helper.css(wrapperChildren[List.can_fit], "display", "inline-flex");
            }*/
        } catch(e) {}
    },

    vote: function(id, vote) {
        Helper.log([
            "Voting on video",
            "client " + client,
            "socket_connected " + socket_connected
        ]);
        if((client || Helper.mobilecheck()) && !socket_connected) {
            if(vote != "del") {
                vote_ajax(id);
            } else {
                del_ajax(id);
            }
            return;
        }
        if(!offline || (vote == "del" && (hasadmin && (!w_p && adminpass != "")))){
            /*var u = Crypt.crypt_pass(Crypt.get_userpass(chan.toLowerCase()), true);
            if(u == undefined) u = "";*/
            emit('vote', {channel: chan, id: id, type: vote});
        } else {
            if(vote == "pos"){
                List.voted_song(id, (new Date()).getTime()/1000);
            } else {
                List.deleted_song(id);
            }
        }
        return true;
    },

    skip: function(way) {
        if(!offline){
            /*var u = Crypt.crypt_pass(Crypt.get_userpass(chan.toLowerCase()), true);
            if(u == undefined) u = "";*/
            emit('skip', {id:video_id, channel: chan.toLowerCase()});
        } else {
            if(way) {
                Player.playNext();
            } else {
                Player.playPrev();
            }
        }
        return true;
    },

    exportToSpotify: function() {
        ga('send', 'event', "export", "spotify");

        Helper.ajax({
            type: "GET",
            url: "https://api.spotify.com/v1/me",
            headers: {
                'Authorization': 'Bearer ' + access_token_data.access_token
            },
            success: function(response){
                response = JSON.parse(response);
                var user_id = response.id;
                Helper.removeClass("#playlist_loader_export", "hide");
                Helper.removeClass(".exported-list-container", "hide");
                Helper.ajax({
                    type: "POST",
                    url: "https://api.spotify.com/v1/users/" + user_id + "/playlists",
                    headers: {
                        'Authorization': 'Bearer ' + access_token_data.access_token,
                        'Content-Type': 'application/json'
                    },
                    data: JSON.stringify({
                        name: chan.toLowerCase() + " - Zoff",
                        description: "Playlist exported from Zoff (https://zoff.me/" + chan.toLowerCase() + "/)",
                        public: true
                    }),
                    success: function(response){
                        response = JSON.parse(response);
                        var playlist_id = response.id;
                        Helper.ajax({
                            type: "GET",
                            url: window.location.protocol + "//" + window.location.hostname + "/assets/images/small-square.base64.txt",
                            success: function(base64image) {
                                var image = base64image.substring(0, base64image.length - 1);
                                Helper.ajax({
                                    type: "PUT",
                                    url: "https://api.spotify.com/v1/users/" + user_id + "/playlists/" + playlist_id + "/images",
                                    headers: {
                                        'Authorization': 'Bearer ' + access_token_data.access_token,
                                        'Content-Type': 'image/jpeg'
                                    },
                                    contentType: "image/jpeg",
                                    data: image,
                                    success: function(resp) {
                                    },
                                    error: function(error) {
                                        console.error(error);
                                    }
                                });
                            }
                        });
                        var i = 0;
                        List.searchSpotify(full_playlist[i], playlist_id, user_id, full_playlist, i);
                        //});
                    }, error: function(e) {
                    }
                });
            }, error: function(e) {
                console.error(e);
            }
        })
    },

    searchSpotify: function(curr_song, playlist_id, user_id, full_playlist, current_element) {
        var original_track = curr_song.title;
        var track = (curr_song.title.toLowerCase().replace("-", " "));
        track = Helper.replaceForFind(track);
        track = encodeURIComponent(track);

        Helper.removeClass(".current_number", "hide");
        document.querySelector(".current_number").innerText = (current_element + 1) + " of " + (full_playlist.length);
        Helper.ajax({
            type: "GET",
            url: "https://api.spotify.com/v1/search?q=" + track + "&type=track",
            headers: {
                'Authorization': 'Bearer ' + access_token_data.access_token
            },
            async: true,
            error: function(err){
                if(err.status == 429 || err.status == 502){
                    Helper.log([err.getAllResponseHeaders()]);
                    var retryAfter = err.getResponseHeader("Retry-After");
                    Helper.log([retryAfter]);
                    if (!retryAfter) retryAfter = 5;
                    retryAfter = parseInt(retryAfter, 10);
                    Helper.log(["Retry-After", retryAfter]);
                    setTimeout(function(){
                        List.searchSpotify(curr_song, playlist_id, user_id, full_playlist, current_element);
                    }, retryAfter * 1000);
                }
            },
            success: function(response){
                response = JSON.parse(response);
                var found = false;
                for(var i = 0; i < response.tracks.items.length; i++) {
                    var data = response.tracks.items[i];
                    data.name = Helper.replaceForFind(data.name);
                    data.artists[0].name = Helper.replaceForFind(data.artists[0].name);
                    if(data.name.substring(data.name.length-1) == " ") data.name = data.name.substring(0,data.name.length-1);
                    if(data.name.substring(data.name.length-1) == "." && track.substring(track.length-1) != "."){
                        data.name = data.name.substring(0,data.name.length-1);
                    }
                    if(similarity(data.artists[0].name + " - " + data.name, decodeURIComponent(track)) > 0.60 || (data.artists.length > 1 && similarity(data.artists[0].name + " " + data.artists[1].name + " - " + data.name, decodeURIComponent(track)))) {
                        found = true;
                        List.uris.push(data.uri);
                        Helper.log([
                            "Found",
                            track
                        ]);
                        //List.num_songs = List.num_songs + 1;
                        break;
                    } else if(decodeURIComponent(track).indexOf(data.artists[0].name.toLowerCase()) >= 0 && decodeURIComponent(track).indexOf(data.name.toLowerCase()) >= 0){
                        found = true;
                        List.uris.push(data.uri);
                        Helper.log([
                            "Found",
                            track
                        ]);
                        //List.num_songs = List.num_songs + 1;
                        break;
                    } else {
                        var splitted = data.name.split(" ");
                        var toBreak = false;
                        for(var i = 0; i < splitted.length; i++) {
                            if((splitted[i] == "and" && track.indexOf("&") >= 0) || (splitted[i] == "&" && track.indexOf("and") >= 0)){
                                continue;
                            } else if(track.indexOf(splitted[i]) < 0){
                                toBreak = true;
                                break;
                            }
                        }
                        if(toBreak) break;
                        found = true;
                        List.uris.push(data.uri);
                        Helper.log([
                            "Found",
                            track
                        ]);
                        //List.num_songs = List.num_songs + 1;
                        break;
                    }
                }
                if(!found){
                    List.not_found.push(original_track);
                    List.num_songs = List.num_songs + 1;
                    Helper.log([
                        "Didn't find",
                        original_track
                    ]);
                }
                if(List.num_songs + List.uris.length == full_playlist.length){
                    if(List.uris.length > 100){
                        while(List.uris.length > 100){
                            List.addToSpotifyPlaylist(List.uris.slice(0, 100), playlist_id, user_id);
                            List.uris = List.uris.slice(100, List.uris.length);
                        }
                        List.addToSpotifyPlaylist(List.uris, playlist_id, user_id);
                        Helper.addClass("#playlist_loader_export", "hide");
                    } else {
                        List.addToSpotifyPlaylist(List.uris, playlist_id, user_id);
                        Helper.addClass("#playlist_loader_export", "hide");
                    }
                    if(document.querySelectorAll(".exported-spotify-list").length == 0) {
                        document.querySelector(".exported-list").insertAdjacentHTML("beforeend", "<a target='_blank' class='btn light exported-playlist exported-spotify-list' href='https://open.spotify.com/user/" + user_id + "/playlist/"+ playlist_id + "'>" + chan + "</a>");
                    }
                    for(var i = 0; i < List.not_found.length; i++) {
                        var data = List.not_found[i];
                        var not_added_song = document.createElement("div");
                        not_added_song.innerHTML = not_export_html;
                        not_added_song.querySelector(".extra-add-text").setAttribute("value", data);
                        not_added_song.querySelector(".extra-add-text").setAttribute("title", data);
                        document.querySelector(".not-exported-container").insertAdjacentHTML("beforeend", not_added_song.innerHTML);
                    }
                    Helper.addClass(".current_number", "hide");
                    Helper.removeClass(".not-exported", "hide");
                    Helper.css(".spotify_export_button", "display", "block");
                } else {
                    List.searchSpotify(full_playlist[current_element + 1], playlist_id, user_id, full_playlist, current_element + 1);
                }
            }
        });
    },

    addToSpotifyPlaylist: function(uris, playlist_id, user_id) {
        Helper.ajax({
            type: "POST",
            url: "https://api.spotify.com/v1/users/" + user_id + "/playlists/" + playlist_id + "/tracks",
            headers: {
                'Authorization': 'Bearer ' + access_token_data.access_token,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                uris: uris
            }),
            error: function(response){
                var temp_playlist_id = playlist_id;
                var temp_uris = uris;
                var temp_user_id = user_id;
                setTimeout(function(){
                    List.addToSpotifyPlaylist(temp_uris, temp_playlist_id, temp_user_id);
                }, 3000);
            },
            success: function(response){
                Helper.log(["Added songs"]);
            }
        })
    },

    exportToYoutube: function() {
        ga('send', 'event', "export", "youtube");

        var request_url = "https://www.googleapis.com/youtube/v3/playlists?part=snippet&key=" + api_key.youtube;
        Helper.removeClass(".exported-list-container", "hide");
        Helper.removeClass("#playlist_loader_export", "hide");
        Helper.ajax({
            type: "POST",
            url: request_url,
            headers: {
                'Authorization': 'Bearer ' + access_token_data_youtube.access_token,
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                snippet: {
                    title: Helper.upperFirst(chan.toLowerCase()),
                    description: 'Playlist exported from zoff',
                }
            }),
            success: function(response){
                response = JSON.parse(response);
                var number_added = 0;
                var playlist_id = response.id;
                var request_url = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&key=" + api_key.youtube;
                List.addToYoutubePlaylist(playlist_id, full_playlist, number_added, request_url)
            },
            error: function(response){
                console.error(response);
                response = response.responseText;
                Helper.log([
                    "export to youtube response",
                    response
                ]);
            }
        });
    },

    insertInYouTubePlaylist: function(playlist_id, _videoId, num, request_url) {
        var _data = JSON.stringify({
            'snippet': {
                'playlistId': playlist_id,
                'resourceId': {
                    'kind': 'youtube#video',
                    'videoId': _videoId
                }
            }
        });
        Helper.ajax({
            type: "POST",
            url: request_url,
            headers: {
                'Authorization': 'Bearer ' + access_token_data_youtube.access_token,
                'Content-Type': 'application/json'
            },
            data: _data,
            success: function(response){
                response = JSON.parse(response);
                Helper.log(["Added video: " + full_playlist[num].id + " to playlist id " + playlist_id]);
                if(num == full_playlist.length - 1){
                    Helper.log(["All videoes added!"]);
                    Helper.log(["url: https://www.youtube.com/playlist?list=" + playlist_id]);
                    document.querySelector(".exported-list").insertAdjacentHTML("beforeend", "<a target='_blank' class='btn light exported-playlist' href='https://www.youtube.com/playlist?list=" + playlist_id + "'>" + chan + "</a>");
                    Helper.addClass("#playlist_loader_export", "hide");
                    Helper.addClass(".current_number", "hide");
                    //$(".youtube_export_button").removeClass("hide");
                } else {
                    //setTimeout(function(){
                    Helper.removeClass(".current_number", "hide");
                    document.querySelector(".current_number").innerText = (num + 1) + " of " + (full_playlist.length);
                    List.addToYoutubePlaylist(playlist_id, full_playlist, num + 1, request_url);
                    //}, 50);
                }
            }, error: function(response) {
                console.error(response);
            }

        });
    },

    addToYoutubePlaylist: function(playlist_id, full_playlist, num, request_url) {
        if(num == full_playlist.length - 1){
            Helper.log(["All videoes added!"]);
            Helper.log(["url: https://www.youtube.com/playlist?list=" + playlist_id]);
            document.querySelector(".exported-list").insertAdjacentHTML("beforeend", "<a target='_blank' class='btn light exported-playlist' href='https://www.youtube.com/playlist?list=" + playlist_id + "'>" + chan + "</a>");
            Helper.addClass("#playlist_loader_export", "hide");
            Helper.addClass(".current_number", "hide");
            return;
            //$(".youtube_export_button").removeClass("hide");
        }
        if(full_playlist[num].hasOwnProperty("source") && full_playlist[num].source != "soundcloud") {
            List.insertInYouTubePlaylist(playlist_id, full_playlist[num].id, num, request_url)
        } else {
            var yt_url = "https://www.googleapis.com/youtube/v3/search?key="+api_key.youtube+"&videoEmbeddable=true&part=id,snippet&fields=items(id,snippet)&type=video&order=relevance&safeSearch=none&maxResults=10&videoCategoryId=10";
            yt_url+="&q="+full_playlist[num].title;
            var title = full_playlist[num].title;
            var temptitle = title.split("-");
            temptitle = temptitle.join(" ").split(" ");
            var vid_url = "https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet,id&key="+api_key.youtube+"&id=";
            Helper.ajax({
                type: "GET",
                url: yt_url,
                dataType:"jsonp",
                success: function(response){
                    response = JSON.parse(response);
                    //Helper.log(response);
                    if(response.items.length === 0){
                        Helper.log([
                            "NO MATCH FOR:",
                            "Spotify title: " + title,
                            "Spotify length: " + length
                        ]);
                        var not_added_song = document.createElement("div");
                        not_added_song.innerHTML = not_export_html;

                        not_added_song.querySelector(".extra-add-text").innerText = title;
                        not_added_song.querySelector(".extra-add-text").setAttribute("title", title);
                        not_added_song.querySelector(".extra-button-search").setAttribute("data-text", title);
                        document.querySelector(".not-exported-container").insertAdjacentHTML("beforeend", not_added_song.innerHTML);
                        Helper.removeClass(".not-exported", "hide");
                        if(num == full_playlist.length - 1){
                            Helper.log(["All videoes added!"]);
                            Helper.log(["url: https://www.youtube.com/playlist?list=" + playlist_id]);
                            document.querySelector(".exported-list").insertAdjacentHTML("beforeend", "<a target='_blank' class='btn light exported-playlist' href='https://www.youtube.com/playlist?list=" + playlist_id + "'>" + chan + "</a>");
                            Helper.addClass("#playlist_loader_export", "hide");
                            Helper.addClass(".current_number", "hide");
                            //$(".youtube_export_button").removeClass("hide");
                        } else {
                            //setTimeout(function(){
                            Helper.removeClass(".current_number", "hide");
                            document.querySelector(".current_number").innerText = (num + 1) + " of " + (full_playlist.length);
                            List.addToYoutubePlaylist(playlist_id, full_playlist, num + 1, request_url);
                            //}, 50);
                        }
                    } else if(response.items.length > 0) {
                        for(var i = 0; i < response.items.length; i++) {
                            var data = response.items[i];
                            vid_url += data.id.videoId+",";
                        }

                        Helper.ajax({
                            type: "GET",
                            url: vid_url,
                            dataType:"jsonp",
                            success: function(response){
                                response = JSON.parse(response);
                                if(response.items.length > 0) {
                                    var matched = false;
                                    for(var y = 0; y < response.items.length; y++) {
                                        var data = response.items[y];
                                        //Helper.log(data);
                                        //var title = data.snippet.title;
                                        var duration = Search.durationToSeconds(data.contentDetails.duration);
                                        var not_matched = false;
                                        if(similarity(data.snippet.title,title) > 0.75) {
                                            not_matched = false;
                                        } else {
                                            for(var i = 0; i < temptitle.length; i++) {
                                                var data_title = temptitle[i];

                                                if(data.snippet.title.toLowerCase().indexOf(data_title.toLowerCase()) == -1 || !(
                                                    data.snippet.title.toLowerCase().indexOf("cover") == -1 &&
                                                    title.toLowerCase().indexOf("cover") == -1 &&
                                                    ((data.snippet.title.toLowerCase().indexOf("remix") == -1 &&
                                                    title.toLowerCase().indexOf("remix") == -1) ||
                                                    (data.snippet.title.toLowerCase().indexOf("remix") != -1 &&
                                                    title.toLowerCase().indexOf("remix") != -1) || !(data.snippet.title.toLowerCase().indexOf(artist[0].toLowerCase()) == -1 &&
                                                    data.snippet.channelTitle.toLowerCase().indexOf("vevo") == -1)))
                                                )
                                                not_matched = true;
                                                else if(duration > 1800) not_matched = true;
                                            }
                                        }

                                        if((!not_matched)){
                                            matched = true;
                                            List.insertInYouTubePlaylist(playlist_id, data.id, num, request_url);
                                            break;
                                        }
                                    }
                                    if(!matched){
                                        if(num == full_playlist.length - 1){
                                            Helper.log(["All videoes added!"]);
                                            Helper.log(["url: https://www.youtube.com/playlist?list=" + playlist_id]);
                                            document.querySelector(".exported-list").insertAdjacentHTML("beforeend", "<a target='_blank' class='btn light exported-playlist' href='https://www.youtube.com/playlist?list=" + playlist_id + "'>" + chan + "</a>");
                                            Helper.addClass("#playlist_loader_export", "hide");
                                            Helper.addClass(".current_number", "hide");
                                            //$(".youtube_export_button").removeClass("hide");
                                        } else {
                                            //setTimeout(function(){
                                            Helper.removeClass(".current_number", "hide");
                                            document.querySelector(".current_number").innerText = (num + 1) + " of " + (full_playlist.length);
                                            //}, 50);
                                        }
                                        Helper.log([
                                            "NO MATCH FOR:",
                                            "Spotify title: " + title,
                                            "Spotify length: " + length
                                        ]);
                                        var not_added_song = document.createElement("div");
                                        not_added_song.innerHTML = not_export_html;
                                        not_added_song.querySelector(".extra-add-text").innerText = title;
                                        not_added_song.querySelector(".extra-add-text").setAttribute("title", title);
                                        not_added_song.querySelector(".extra-button-search").setAttribute("data-text", title);
                                        document.querySelector(".not-exported-container").insertAdjacentHTML("beforeend", not_added_song.innerHTML);
                                        Helper.removeClass(".not-exported", "hide");
                                        List.addToYoutubePlaylist(playlist_id, full_playlist, num + 1, request_url);

                                    }
                                }
                            },
                            error: function(e) {
                                console.error(e);
                            }
                        });

                    }
                }, error: function(e) {
                    console.error(e);
                }
            });

        }
    },

    sortList: function() {
        full_playlist.sort(Helper.predicate({
            name: 'votes',
            reverse: true
        }, {
            name: 'added',
            reverse: false
        }, {
            name: 'title',
            reverse: false
        }));
    },

    show: function() {
        if(!Helper.mobilecheck() && !chromecastAvailable) {
            M.Modal.getInstance(document.getElementById("channel-share-modal")).open();
        }
        if(chromecastAvailable) {
            castSession.sendMessage("urn:x-cast:zoff.me", {type: "showJoinInfo"});
        }
    },

    generateSong: function(_song_info, transition, lazy, list, user, display, initial) {
        if(list_html === undefined) list_html = Helper.html("#list-song-html");
        var video_id    = _song_info.id;
        var video_title = _song_info.title;
        var video_votes = _song_info.votes;
        var video_thumb_url = "//img.youtube.com/vi/"+video_id+"/mqdefault.jpg";
        if(_song_info.source == "soundcloud") {
            video_thumb_url = _song_info.thumbnail;
        }
        var video_thumb = "background-image:url('" + video_thumb_url + "');";
        var song = document.createElement("div");
        song.innerHTML = list_html;
        song = song.cloneNode(true);
        var image_attr  = "style";
        if(_song_info.hasOwnProperty("start") && _song_info.hasOwnProperty("end")) {
            _song_info.duration = _song_info.end - _song_info.start;
        }
        var attr;
        var del_attr;
        //song.find(".list-song");
        if(transition) {
            Helper.css(song.querySelector(".list-song"), "transform", "translateX(100%)");
            Helper.addClass(song.querySelector(".list-song"), "side_away");
        }
        Helper.css(song.querySelector(".list-song"), "height", List.element_height + "px");
        if(!w_p) Helper.removeClass(song.querySelector(".card-action"), "hide");
        if(video_votes == 1)song.querySelector(".vote-text").innerText = "vote";
        if(lazy){
            video_thumb = "//img.youtube.com/vi/"+video_id+"/mqdefault.jpg";
            image_attr  = "data-original";
        }

        song.querySelector(".list-image").setAttribute(image_attr,video_thumb);
        if(list){
            song.querySelector("#list-song")
            song.querySelector(".list-votes").innerText = video_votes;
            song.querySelector("#list-song").setAttribute("data-video-id", video_id);
            song.querySelector("#list-song").setAttribute("data-video-type", "song");
            song.querySelector("#list-song").setAttribute("data-video-source", _song_info.source);
            song.querySelector("#list-song").setAttribute("id", video_id);
            song.classList.remove("hide");
            song.querySelector(".vote-container").setAttribute("title", video_title);
            if(((document.querySelector("#wrapper").children.length >= List.can_fit) && initial) || display == "none"){
                Helper.css(song.querySelector(".card"), "display", "none");
            }
            attr     = ".vote-container";
            del_attr = "delete_button";

            var _temp_duration = Helper.secondsToOther(_song_info.duration);
            song.querySelector(".card-duration").innerText = Helper.pad(_temp_duration[0]) + ":" + Helper.pad(_temp_duration[1]);
        }else if(!list){
            //song.querySelector(".card-duration").remove();
            //song.querySelector(".list-song").removeClass("playlist-element");
            //song.querySelector(".more_button").addClass("hide");
            Helper.removeClass(song.querySelector(".suggested_remove"), "hide");
            song.querySelector(".vote-text").innerText = "";
            song.querySelector(".card-duration").innerText = Helper.pad(_song_info.duration[0]) + ":" + Helper.pad(_song_info.duration[1]);
            var added_by = "user";
            attr     = ".add-suggested";
            if(user){
                del_attr = "del_user_suggested";
            } else{
                del_attr = "del_suggested";
                added_by = "system";
            }
            song.querySelector(".vote-container").setAttribute("class", "clickable add-suggested");
            song.querySelector(".add-suggested").setAttribute("title", video_title);
            //Helper.addClass(song.querySelector(".delete_button"), del_attr);
            song.querySelector(attr).setAttribute("data-video-title", video_title);
            song.querySelector(attr).setAttribute("data-video-length", _song_info.length);
            song.querySelector(attr).setAttribute("data-added-by", added_by);
            song.querySelector("#list-song").setAttribute("data-video-type", "suggested");
            song.querySelector("#list-song").setAttribute("data-video-id", video_id);
            Helper.css(song.querySelector("#list-song"), "display", "inline-flex");
            song.querySelector("#list-song").setAttribute("id", "suggested-" + video_id);
            var list_image = song.querySelector(".list-image");
            list_image.classList.remove("list-image");
            list_image.className += " list-suggested-image";
            //song.querySelector(".list-image").setAttribute("class", song.querySelector(".list-image").getAttribute("class").replace("list-image", "list-suggested-image"));
        }
        if(!embed) {
            song.querySelector(".mobile-delete").remove();
        }
        if(hostMode) {
            song.querySelector(".list-remove").style.display = "none";
        }
        song.querySelector(".list-title").innerText = video_title;
        song.querySelector(".list-title").setAttribute("title", video_title);
        song.querySelector(attr).setAttribute("data-video-id", video_id);
        //song.querySelector(".list-image-placeholder").setAttribute("src", video_thumb_url);
        if(song.querySelectorAll(".list-suggested-image").length > 0) {
            song.querySelector(".list-suggested-image").setAttribute(image_attr,video_thumb);
        }
        //song.querySelector("."+del_attr).setAttribute("data-video-id", video_id);
        return song.innerHTML;
    },

    getIndexOfSong: function(id) {
        try {
            for(var i = 0; i < full_playlist.length; i++) {
                if(full_playlist[i].id == id) return i;
            }

        } catch(e) {}
    }
};
