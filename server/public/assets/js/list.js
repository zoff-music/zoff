var List = {

    empty: false,
    page: 0,
    can_fit: Math.round(($("#wrapper").height()) / 71),
    element_height: (($("#wrapper").height()) / Math.round(($("#wrapper").height()) / 71)) - 25,
    uris: [],
    not_found: [],
    num_songs: 0,

    channel_function: function(msg)
    {
        if(user_auth_started) {
            user_auth_started = false;
            $("#user_password").modal("close");
        }
        switch(msg.type)
        {
            case "list":
                //if(full_playlist == undefined || !offline){
                if((!offline || (offline && !msg.shuffled)) && !(offline && prev_chan_list == chan)){
                    prev_chan_list = chan;
                    List.populate_list(msg.playlist);
                    if(chromecastAvailable){
                      Player.sendNext({title: full_playlist[0].title, videoId: full_playlist[0].id});
                    }
                } else if(offline && prev_chan_list == chan && full_playlist != undefined && !msg.shuffled){
                    List.populate_list(full_playlist, true);
                    if(chromecastAvailable){
                      Player.sendNext({title: full_playlist[0].title, videoId: full_playlist[0].id});
                    }
                }
                break;
            case "added":
                List.added_song(msg.value);
                if(chromecastAvailable){
                  Player.sendNext({title: full_playlist[0].title, videoId: full_playlist[0].id});
                }
                break;
            case "deleted":
                List.deleted_song(msg.value, msg.removed);
                break;
            case "vote":
                if(!offline){
                    List.voted_song(msg.value, msg.time);
                    if(chromecastAvailable){
                      Player.sendNext({title: full_playlist[0].title, videoId: full_playlist[0].id});
                    }
                  }
                break;
            case "song_change":
                if(window.location.pathname != "/") List.song_change(msg.time, msg.remove);
                if(chromecastAvailable){
                  Player.sendNext({title: full_playlist[0].title, videoId: full_playlist[0].id});
                }
                break;
        }
    },

    insertAtBeginning: function(song_info, transition) {
        var display = List.page == 0 ? "" : "none";
        var add = List.generateSong(song_info, transition, false, true, false, display, false);
        $("#wrapper").append(add);
    },

    insertAtIndex: function(song_info, transition, change) {
        var i = List.getIndexOfSong(song_info.id);
        var display = "none";
        if(!song_info.now_playing){
            if(i >= List.page && i < List.page + (List.can_fit)) display = "block"
            var add = List.generateSong(song_info, transition, false, true, false, display, false);
            if(i === 0) {
                $("#wrapper").prepend(add);
            } else {
                $("#wrapper > div:nth-child(" + (i) + ")").after(add);
            }
            var added = $("#wrapper").children()[i];
            $(added).css("display", display);
            if(display == "block" && $("#wrapper").children().length >= List.page + List.can_fit + 1){
                $($("#wrapper").children()[List.page + List.can_fit]).css("display", "none");
            } else if(i < List.page && $("#wrapper").children().length - (List.page + 1) >= 0){
                $($("#wrapper").children()[List.page]).css("display", "block");
            } else if($("#wrapper").children().length > List.page + List.can_fit){
                $($("#wrapper").children()[List.page + List.can_fit - 1]).css("display", "block");
            }
            if(change && List.page > 0){
                $($("#wrapper").children()[List.page - 1]).css("display", "none");
            }
             if(transition){
                 setTimeout(function(){
                     $(added).css("height", List.element_height);
                 },5);
             }
        }
    },

    populate_list: function(msg, no_reset)
    {
        if(!Helper.mobilecheck() && !embed){
            List.can_fit = Math.round(($("#wrapper").height()) / 71)+1;
            List.element_height = (($("#wrapper").height()) / List.can_fit)-5.3;
        } else if(embed) {
            List.can_fit = Math.round(($("#wrapper").height()) / 91) + 1;
            List.element_height = (($("#wrapper").height()) / List.can_fit)-4;
        }else {
            List.can_fit = Math.round(($(window).height() - $(".tabs").height() - $("header").height() -66) / 71)+1;
            List.element_height = (($(window).height() - $(".tabs").height() - $("header").height() -66) / List.can_fit)-6;
        }
        if(List.element_height < 55.2){
            List.element_height = 55.2;
        }
        if(list_html === undefined) list_html = $("#list-song-html").html();
        full_playlist = msg;
        if(offline && !no_reset){
            for(var x = 0; x < full_playlist.length; x++){
                full_playlist[x].votes = 0;
            }
        }
        List.sortList();
	    $("#wrapper").empty();

        Helper.log("---------------------------");
        Helper.log("---------FULL PLAYLIST-----");
        Helper.log(full_playlist);
        Helper.log("---------------------------");

        if(full_playlist.length > 1){
    		$.each(full_playlist, function(j, _current_song){
    			if(!_current_song.now_playing){ //check that the song isnt playing
                    var generated = List.generateSong(_current_song, false, lazy_load, true, false, "", true)
                    $("#wrapper").append(generated);
    			}
    		});
            if($("#wrapper").children().length > List.can_fit && !$("#pageButtons").length){
                $('<div id="pageButtons"><span class="first_page_hide btn-flat"><i class="material-icons">first_page</i></span><a class="first_page waves-effect waves-light btn-flat"><i class="material-icons">first_page</i></a><span class="prev_page_hide btn-flat"><i class="material-icons">navigate_before</i> prev</span><a class="prev_page waves-effect waves-light btn-flat"><i class="material-icons">navigate_before</i> prev</a> <span id="pageNumber">1</span> <a class="next_page waves-effect waves-light btn-flat">next <i class="material-icons">navigate_next</i></a><span class="next_page_hide btn-flat">next <i class="material-icons">navigate_next</i></span><a class="last_page waves-effect waves-light btn-flat"><i class="material-icons">last_page</i></a><span class="last_page_hide btn-flat"><i class="material-icons">last_page</i></span></div>').insertAfter("#wrapper");
                $(".prev_page").css("display", "none");
                $(".first_page").css("display", "none");
                $(".next_page_hide").css("display","none");
                $(".last_page_hide").css("display","none");
                /*if($(".next_page").hasClass("hide")){
                    $(".next_page").removeClass("hide");
                }
                if($(".last_page").hasClass("hide")){
                    $(".last_page").removeClass("hide");
                }*/
            } else if(!$("#pageButtons").length){
                $('<div id="pageButtons"><span class="first_page_hide btn-flat"><i class="material-icons">first_page</i></span><a class="first_page waves-effect waves-light btn-flat"><i class="material-icons">first_page</i></a><span class="prev_page_hide btn-flat"><i class="material-icons">navigate_before</i> prev</span><a class="prev_page waves-effect waves-light btn-flat"><i class="material-icons">navigate_before</i> prev</a> <span id="pageNumber">1</span> <a class="next_page waves-effect waves-light btn-flat">next <i class="material-icons">navigate_next</i></a><span class="next_page_hide btn-flat">next <i class="material-icons">navigate_next</i></span><a class="last_page waves-effect waves-light btn-flat"><i class="material-icons">last_page</i></a><span class="last_page_hide btn-flat"><i class="material-icons">last_page</i></span></div>').insertAfter("#wrapper");
                $(".prev_page").css("display", "none");
                $(".next_page").css("display", "none");
                $(".last_page").css("display", "none");
                $(".first_page").css("display", "none");
                $(".next_page_hide").css("display","inline-flex");
                $(".prev_page_hide").css("display","inline-flex");
            }

            List.dynamicContentPage(-10);

            /*if(lazy_load){
                if(Helper.mobilecheck()) $(".list-image").lazyload({});
                else{
                    $(".list-image").lazyload({container: $("#wrapper")}).removeClass("lazy");

                    document.getElementById('wrapper').scrollTop += 1;
                    document.getElementById('wrapper').scrollTop += -1;
                }
            }*/
        }else{
            List.empty = true;
            $("#wrapper").html("<span id='empty-channel-message'>The playlist is empty.</span>");
            if(!$("#pageButtons").length){
                $('<div id="pageButtons"><span class="first_page_hide btn-flat"><i class="material-icons">first_page</i></span><a class="first_page waves-effect waves-light btn-flat"><i class="material-icons">first_page</i></a><span class="prev_page_hide btn-flat"><i class="material-icons">navigate_before</i> prev</span><a class="prev_page waves-effect waves-light btn-flat"><i class="material-icons">navigate_before</i> prev</a> <span id="pageNumber">1</span> <a class="next_page waves-effect waves-light btn-flat">next <i class="material-icons">navigate_next</i></a><span class="next_page_hide btn-flat">next <i class="material-icons">navigate_next</i></span><a class="last_page waves-effect waves-light btn-flat"><i class="material-icons">last_page</i></a><span class="last_page_hide btn-flat"><i class="material-icons">last_page</i></span></div>').insertAfter("#wrapper");
            }
            $(".prev_page").css("display", "none");
            $(".next_page").css("display", "none");
            $(".last_page").css("display", "none");
            $(".last_page_hide").css("display", "inline-flex");
            $(".first_page").css("display", "none");
            $(".next_page_hide").css("display","inline-flex");
            $(".prev_page_hide").css("display","inline-flex");
        }
		$("#settings").css("visibility", "visible");
		$("#settings").css("opacity", "1");
		$("#wrapper").css("opacity", "1");
    },

    dynamicContentPageJumpTo: function(page){
        page = page * List.can_fit;
      if(page > List.page || page < List.page){
        $("#wrapper").children().slice(List.page, List.page + List.can_fit).hide();
        List.page = page;
        $("#wrapper").children().slice(List.page, List.page + List.can_fit).show();
        if(List.page > 0 && $(".prev_page").css("display") == "none"){
            $(".prev_page").css("display", "inline-flex");
            $(".prev_page_hide").css("display", "none");
            $(".first_page").css("display", "inline-flex");
            $(".first_page_hide").css("display", "none");
        }

        if(List.page + List.can_fit >= $("#wrapper").children().length){
            $(".next_page_hide").css("display", "inline-flex");
            $(".next_page").css("display", "none");
            $(".last_page_hide").css("display", "inline-flex");
            $(".last_page").css("display", "none");
        }

        $("#pageNumber").html((List.page / List.can_fit) + 1);
      }
    },

    dynamicContentPage: function(way){
        if(way == 1){
            $("#wrapper").children().slice(List.page, List.page + List.can_fit).hide();
            List.page = List.page + List.can_fit;
            $("#wrapper").children().slice(List.page, List.page + List.can_fit).show();
            if(List.page > 0 && $(".prev_page").css("display") == "none"){
                $(".prev_page").css("display", "inline-flex");
                $(".prev_page_hide").css("display", "none");
                $(".first_page").css("display", "inline-flex");
                $(".first_page_hide").css("display", "none");
            }

            if(List.page + List.can_fit >= $("#wrapper").children().length){
                $(".next_page_hide").css("display", "inline-flex");
                $(".next_page").css("display", "none");
                $(".last_page_hide").css("display", "inline-flex");
                $(".last_page").css("display", "none");
            }
            //$("#wrapper").scrollTop(0);
        } else if(way == 10){
          $("#wrapper").children().slice(List.page, List.page + List.can_fit).hide();
          List.page = (Math.floor(($("#wrapper").children().length - 1)/ List.can_fit) * List.can_fit);
          $("#wrapper").children().slice(List.page, List.page + List.can_fit).show();

          if(List.page > 0 && $(".prev_page").css("display") == "none"){
              $(".prev_page").css("display", "inline-flex");
              $(".prev_page_hide").css("display", "none");
              $(".first_page").css("display", "inline-flex");
              $(".first_page_hide").css("display", "none");
          }

          if(List.page + List.can_fit >= $("#wrapper").children().length){
              $(".next_page_hide").css("display", "inline-flex");
              $(".next_page").css("display", "none");
              $(".last_page_hide").css("display", "inline-flex");
              $(".last_page").css("display", "none");
          }
        } else if(way==-10){
          $("#wrapper").children().slice(List.page, List.page + List.can_fit).hide();
          List.page = 0;
          $("#wrapper").children().slice(List.page, List.page + List.can_fit).show();
          if(List.page == 0 && $(".prev_page").css("display") != "none"){
              $(".prev_page").css("display", "none");
              $(".prev_page_hide").css("display", "inline-flex");
              $(".first_page").css("display", "none");
              $(".first_page_hide").css("display", "inline-flex");
          } else if($(".prev_page").css("display") == "none"){
              $(".prev_page_hide").css("display", "inline-flex");
              $(".first_page_hide").css("display", "inline-flex");
          } else {
              $(".prev_page_hide").css("display", "none");
              $(".first_page_hide").css("display", "none");
          }
          if(List.page + List.can_fit < $("#wrapper").children().length){
              $(".next_page_hide").css("display", "none");
              $(".next_page").css("display", "inline-flex");
              $(".last_page_hide").css("display", "none");
              $(".last_page").css("display", "inline-flex");
          }
        } else {
            $("#wrapper").children().slice(List.page - List.can_fit, List.page).show();
            $("#wrapper").children().slice(List.page, List.page + List.can_fit).hide();
            List.page = List.page - List.can_fit < 0 ? 0 : List.page - List.can_fit;
            if(List.page == 0 && $(".prev_page").css("display") != "none"){
                $(".prev_page").css("display", "none");
                $(".prev_page_hide").css("display", "inline-flex");
                $(".first_page").css("display", "none");
                $(".first_page_hide").css("display", "inline-flex");
            } else if($(".prev_page").css("display") == "none"){
                $(".prev_page_hide").css("display", "inline-flex");
                $(".first_page_hide").css("display", "inline-flex");
            } else {
                $(".prev_page_hide").css("display", "none");
                $(".first_page_hide").css("display", "none");
            }

            if(List.page + List.can_fit < $("#wrapper").children().length){
                $(".next_page_hide").css("display", "none");
                $(".next_page").css("display", "inline-flex");
                $(".last_page_hide").css("display", "none");
                $(".last_page").css("display", "inline-flex");
            }

        }
        $("#pageNumber").html((List.page / List.can_fit) + 1);
    },

    added_song: function(added){
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

            if($("#suggested-"+added.id).length > 0) {
              number_suggested = number_suggested - 1;
              if(number_suggested < 0) number_suggested = 0;

              var to_display = number_suggested > 9 ? "9+" : number_suggested;
              if(!$(".suggested-link span.badge.new.white").hasClass("hide") && to_display == 0){
                  $(".suggested-link span.badge.new.white").addClass("hide");
              }

              $(".suggested-link span.badge.new.white").text(to_display);
            }

            $("#suggested-"+added.id).remove();
            if(List.empty){
                List.empty = false;
            }
            $("#empty-channel-message").remove();
            List.insertAtIndex(added, true);
            $($("#wrapper").children()[List.page + List.can_fit]).css("display", "none");
            if($("#wrapper").children().length > List.page + List.can_fit){
                $(".next_page_hide").css("display", "none");
                $(".next_page").removeClass("hide");
                $(".last_page_hide").css("display", "none");
                $(".next_page").css("display", "inline-flex");
                $(".last_page").css("display", "inline-flex");
            } else {
                $(".next_page_hide").css("display", "inline-flex");
                $(".next_page").css("display", "none");
            }
        }
    },

    deleted_song: function(deleted, removed){
        try{
            var index              = List.getIndexOfSong(deleted);
            var to_delete          = $("#wrapper").children()[index];
            if(!removed) to_delete.style.height = 0;

            if(index < List.page && $("#wrapper").children().length - (List.page + 2) >= 0){
                $($("#wrapper").children()[List.page]).css("height", 0);
                $($("#wrapper").children()[List.page]).css("display", "block");
                $($("#wrapper").children()[List.page]).css("height", List.element_height);
            } else if($("#wrapper").children().length > List.page + (List.can_fit)){
                $($("#wrapper").children()[List.page + (List.can_fit)]).css("height", 0);
                $($("#wrapper").children()[List.page + (List.can_fit)]).css("display", "block");
                $($("#wrapper").children()[List.page + (List.can_fit)]).css("height", List.element_height);
            }

            if(List.page >= $("#wrapper").children().length - 1){
                List.dynamicContentPage(-1);
                $(".next_page_hide").css("display", "inline-flex");
                $(".next_page").css("display", "none");
                $(".last_page_hide").css("display", "inline-flex");
                $(".last_page").css("display", "none");
            } else if(List.page + List.can_fit + 1 >= $("#wrapper").children().length - 1){
                $(".next_page_hide").css("display", "inline-flex");
                $(".next_page").css("display", "none");
                $(".last_page_hide").css("display", "inline-flex");
                $(".last_page").css("display", "none");
            }
            setTimeout(function()
            {
                if(!removed) $("#"+deleted).remove();
                full_playlist.splice(List.getIndexOfSong(deleted), 1);
                /*if(index < List.page && $("#wrapper").children().length - (List.page + 1) >= 0){
                    $($("#wrapper").children()[List.page - 1]).css("display", "block");
                } else if($("#wrapper").children().length > List.page + (List.can_fit-1)){
                    $($("#wrapper").children()[List.page + (List.can_fit - 1)]).css("display", "block");
                }
                if(List.page >= $("#wrapper").children().length){
                    List.dynamicContentPage(-1);
                } else if(List.page + List.can_fit >= $("#wrapper").children().length){
                    $(".next_page_hide").css("display", "flex");
                    $(".next_page").css("display", "none");
                }*/
                if(chromecastAvailable){
                  Player.sendNext({title: full_playlist[0].title, videoId: full_playlist[0].id});
                }
            }, 305);
            if(removed) $("#"+deleted).remove();

        } catch(err) {
            full_playlist.splice(List.getIndexOfSong(deleted), 1);
            if(!List.empty){
                $("#"+deleted).remove();
                if(index < List.page && $("#wrapper").children().length - (List.page + 1) >= 0){
                    $($("#wrapper").children()[List.page - 1]).css("display", "block");
                } else if($("#wrapper").children().length > List.page + List.can_fit){
                    $($("#wrapper").children()[List.page + (List.can_fit - 1)]).css("display", "block");
                }
                if(chromecastAvailable){
                  Player.sendNext({title: full_playlist[0].title, videoId: full_playlist[0].id});
                }
            }
        }

        if(full_playlist.length <= 2){
            List.empty = true;
            $("#wrapper").html("<span id='empty-channel-message'>The playlist is empty.</span>");
        }
        $("#suggested-"+deleted).remove();
        if(List.page + List.can_fit < $("#wrapper").children().length + 1){
            //$(".next_page_hide").css("display", "none");
            //$(".next_page").css("display", "flex");
        }
        if(List.page >= $("#wrapper").children().length){
            List.dynamicContentPage(-1);
        }
        Suggestions.checkUserEmpty();
    },

    voted_song: function(voted, time){
        var index_of_song = List.getIndexOfSong(voted);
        var song_voted_on = full_playlist[index_of_song];

        full_playlist[index_of_song].votes += 1;
        full_playlist[index_of_song].added = time;

        List.sortList();
        $("#"+voted).remove();
        List.insertAtIndex(song_voted_on, false);
    },

    song_change: function(time, remove){
        try{
            var length = full_playlist.length-1;
            $("#wrapper").children()[0].remove();
            if($("#wrapper").children().length === 0) {
                List.empty = true;
                $("#wrapper").html("<span id='empty-channel-message'>The playlist is empty.</span>");
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
            Helper.log("---------------------------");
            Helper.log("---SONG ON FIRST INDEX-----");
            Helper.log(full_playlist[0]);
            Helper.log("---------------------------");
            full_playlist.push(full_playlist.shift());
            //if(!List.empty)
            if(!remove){
                List.insertAtIndex(full_playlist[length-1], false, true);
            }
            /*if($("#wrapper").children().length >= List.page + List.can_fit){
                $($("#wrapper").children()[List.page + List.can_fit - 1]).css("display", "block");
            }*/

        }catch(e){}
    },

    vote: function(id, vote){
        if(!offline || (vote == "del" && (hasadmin && (!w_p && adminpass != "")))){
            socket.emit('vote', {channel: chan, id: id, type: vote, adminpass: adminpass, pass: embed ? '' : Crypt.crypt_pass(Crypt.get_userpass(chan.toLowerCase()))});
        } else {
            if(vote == "pos"){
                List.voted_song(id, (new Date()).getTime()/1000);
            } else {
                List.deleted_song(id);
            }
        }
        return true;
    },

    skip: function(){
        if(!offline){
            socket.emit('skip', {pass: adminpass, id:video_id, channel: chan.toLowerCase(), pass: embed ? '' : Crypt.crypt_pass(Crypt.get_userpass(chan.toLowerCase()))});
        } else {
            Player.playNext();
        }
    	return true;
    },

    exportToSpotify: function(){
        $.ajax({
            type: "GET",
            url: "https://api.spotify.com/v1/me",
            headers: {
                'Authorization': 'Bearer ' + access_token_data.access_token
            },
            success: function(response){
                var user_id = response.id;
                $("#playlist_loader_export").removeClass("hide");
                $(".exported-list-container").removeClass("hide");
                $.ajax({
                    type: "POST",
                    url: "https://api.spotify.com/v1/users/" + user_id + "/playlists",
                    headers: {
                        'Authorization': 'Bearer ' + access_token_data.access_token,
                        'Content-Type': 'application/json'
                    },
                    data: JSON.stringify({
                            name: chan.toLowerCase() + " - Zoff",
                            public: true
                    }),
                    success: function(response){
                        var playlist_id = response.id;
                        $.each(full_playlist, function(i, curr_song){
                            List.searchSpotify(curr_song, playlist_id, user_id);
                        });
                    }
                });
            }
        })
    },

    searchSpotify: function(curr_song, playlist_id, user_id){
            var original_track = curr_song.title;
            var track = (curr_song.title.toLowerCase().replace("-", " "));
            track = track.replace("official hd video", "");
            track = track.replace("unofficial video", "");
            track = track.replace("studio footage", "");
            track = track.replace("great song", "");
            track = track.replace("-", " ");
            track = track.replace("-", " ");
            track = track.replace(" hq ", " ");
            track = track.replace("lyric video", "");
            track = track.replace("lyrics video", "");
            track = track.replace("album version", "");
            track = track.replace("drive original movie soundtrack", "");
            track = track.replace("original movie soundtrack", "");
            track = track.replace("live sessions", "");
            track = track.replace("audio only", "");
            track = track.replace("audio", "");
            track = track.replace("(new)", "");
            track = track.replace(" by ", " ");
            track = track.replace(" vs ", " ");
            track = track.replace("(full)", " ");
            track = track.replace("(video)", " ");
            track = track.replace("&", " ");
            track = track.replace("with lyrics", "");
            track = track.replace("lyrics", "");
            track = track.replace("w/", "");
            track = track.replace("w/", "");
            track = track.replace("official video", "");
            track = track.replace("studio version", "");
            track = track.replace("official music video", "");
            track = track.replace("music video", "");
            track = track.replace("musicvideo", "");
            track = track.replace("original video", "");
            track = track.replace("full version", "");
            track = track.replace("full song", "");
            track = track.replace("(official)", "");
            track = track.replace("official", "");
            track = track.replace("(original)", "");
            track = track.replace("(", " ");
            track = track.replace(")", " ");
            track = track.replace("feat.", " ");
            track = track.replace("feat", " ");
            track = track.replace("ft.", " ");
            track = track.replace("[", " ");
            track = track.replace("]", " ");
            track = track.replace(" free ", "");
            track = track.replace(" hd ", "");
            track = track.replace("original mix", " ");
            track = track.replace("radio edit", " ");
            track = track.replace("pop version", " ");
            track = track.replace("  ", " ").replace("  ", " ").replace("  ", " ").replace("  ", " ").replace("  ", " ").replace("  ", " ");
            track = encodeURIComponent(track);

            $.ajax({
                type: "GET",
                url: "https://api.spotify.com/v1/search?q=" + track + "&type=track",
                headers: {
                    'Authorization': 'Bearer ' + access_token_data.access_token
                },
                async: true,
                statusCode: {
                    429: function(jqXHR) {
                        console.log(jqXHR.getAllResponseHeaders());
                        var retryAfter = jqXHR.getResponseHeader("Retry-After");
                        console.log(retryAfter);
                        if (!retryAfter) retryAfter = 5;
                        retryAfter = parseInt(retryAfter, 10);
                        Helper.log("Retry-After", retryAfter);
                        setTimeout(function(){
                            List.searchSpotify(curr_song);
                        }, retryAfter * 1000);
                    }
                },
                error: function(err){
                    if(err.status == 429){
                        console.log(err.getAllResponseHeaders());
                        var retryAfter = err.getResponseHeader("Retry-After");
                        console.log(retryAfter);
                        if (!retryAfter) retryAfter = 5;
                        retryAfter = parseInt(retryAfter, 10);
                        Helper.log("Retry-After", retryAfter);
                        setTimeout(function(){
                            List.searchSpotify(curr_song);
                        }, retryAfter * 1000);
                    }
                },
                success: function(response){
                    var found = false;
                    $.each(response.tracks.items, function(i, data){
                        data.name = data.name.toLowerCase();
                        data.name = data.name.replace("(", " ");
                        data.name = data.name.replace(")", " ");
                        data.name = data.name.replace("[", " ");
                        data.name = data.name.replace("]", " ");
                        data.name = data.name.replace("-", " ");
                        data.name = data.name.replace("-", " ");
                        data.name = data.name.replace("-", " ");
                        data.name = data.name.replace("original mix", " ");
                        data.name = data.name.replace("album version", " ");
                        data.name = data.name.replace("abum version", " ");
                        data.name = data.name.replace("feat.", " ");
                        data.artists[0].name = data.artists[0].name.replace("feat.", " ");
                        data.artists[0].name = data.artists[0].name.replace("feat", " ");
                        data.name = data.name.replace("feat", " ");
                        data.name = data.name.replace("ft.", " ");
                        data.name = data.name.replace("radio edit", " ");
                        data.name = data.name.replace("pop version", " ");
                        data.name = data.name.replace("  ", " ").replace("  ", " ").replace("  ", " ").replace("  ", " ").replace("  ", " ").replace("  ", " ").replace("  ", " ").replace("  ", " ");
                        data.artists[0].name = data.artists[0].name.replace("  ", " ").replace("  ", " ").replace("  ", " ").replace("  ", " ").replace("  ", " ").replace("  ", " ").replace("  ", " ").replace("  ", " ");
                        if(data.name.substring(data.name.length-1) == " ") data.name = data.name.substring(0,data.name.length-1);
                        if(data.name.substring(data.name.length-1) == "." && track.substring(track.length-1) != "."){
                            data.name = data.name.substring(0,data.name.length-1);
                        }
                        if(decodeURIComponent(track).indexOf(data.artists[0].name.toLowerCase()) >= 0 && decodeURIComponent(track).indexOf(data.name.toLowerCase()) >= 0){
                            found = true;
                            List.uris.push(data.uri);
                            Helper.log("Found", track);
                            //List.num_songs = List.num_songs + 1;
                            return false;
                        } else {
                            var splitted = data.name.split(" ");
                            for(var i = 0; i < splitted.length; i++){
                                if((splitted[i] == "and" && track.indexOf("&") >= 0) || (splitted[i] == "&" && track.indexOf("and") >= 0)){
                                    continue;
                                } else if(track.indexOf(splitted[i]) < 0){
                                    return true;
                                }
                            }
                            found = true;
                            List.uris.push(data.uri);
                            Helper.log("Found", track);
                            //List.num_songs = List.num_songs + 1;
                            return false;
                        }
                    });
                    if(!found){
                        List.not_found.push(original_track);
                        List.num_songs = List.num_songs + 1;
                        Helper.log("Didn't find", original_track);
                    }
                    if(List.num_songs + List.uris.length == full_playlist.length){
                        if(List.uris.length > 100){
                            while(List.uris.length > 100){
                                List.addToSpotifyPlaylist(List.uris.slice(0, 100), playlist_id, user_id);
                                List.uris = List.uris.slice(100, List.uris.length);
                            }
                            List.addToSpotifyPlaylist(List.uris, playlist_id, user_id);
                            $("#playlist_loader_export").addClass("hide");
                        } else {
                            List.addToSpotifyPlaylist(List.uris, playlist_id, user_id);
                            $("#playlist_loader_export").addClass("hide");
                        }
                        $(".exported-list").append("<a target='_blank' class='btn light exported-playlist' href='https://open.spotify.com/user/" + user_id + "/playlist/"+ playlist_id + "'>" + chan + "</a>");
                        $.each(List.not_found, function(i, data){
                            var not_added_song = $("<div>" + not_export_html + "</div>");
                            not_added_song.find(".extra-add-text").attr("value", data);
                            not_added_song.find(".extra-add-text").attr("title", data);
                            $(".not-exported-container").append(not_added_song.html());
                        })
                        $(".not-exported").removeClass("hide");
                        $(".spotify_export_button").css("display", "block");
                    }
                }
            });
    },

    addToSpotifyPlaylist: function(uris, playlist_id, user_id){
        $.ajax({
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
                setTimeout(function(){
                    List.addToSpotifyPlaylist(uris, playlist_id, user_id);
                }, 3000);
            },
            success: function(response){
                Helper.log("Added songs");
            }
        })
    },

    exportToYoutube: function(){
        var request_url = "https://www.googleapis.com/youtube/v3/playlists?part=snippet";
        $(".exported-list-container").removeClass("hide");
        $("#playlist_loader_export").removeClass("hide");
        $.ajax({
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
                var number_added = 0;
                var playlist_id = response.id;
                var request_url = "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet";
                List.addToYoutubePlaylist(playlist_id, full_playlist, number_added, request_url)
            },
            error: function(response){
                Helper.log(response);
            }
        });
    },

    addToYoutubePlaylist: function(playlist_id, full_playlist, num, request_url){
        var _data = JSON.stringify({
            'snippet': {
                'playlistId': playlist_id,
                'resourceId': {
                    'kind': 'youtube#video',
                    'videoId': full_playlist[num].id
                }
            }
        });
        $.ajax({
            type: "POST",
            url: request_url,
            headers: {
                'Authorization': 'Bearer ' + access_token_data_youtube.access_token,
                'Content-Type': 'application/json'
            },
            data: _data,
            success: function(response){
                Helper.log("Added video: " + full_playlist[num].id + " to playlist id " + playlist_id);
                if(num == full_playlist.length - 1){
                    Helper.log("All videoes added!");
                    Helper.log("url: https://www.youtube.com/playlist?list=" + playlist_id);
                    $(".exported-list").append("<a target='_blank' class='btn light exported-playlist' href='https://www.youtube.com/playlist?list=" + playlist_id + "'>" + chan + "</a>");
                    $("#playlist_loader_export").addClass("hide");
                    $(".current_number").addClass("hide");
                    //$(".youtube_export_button").removeClass("hide");
                } else {
                    //setTimeout(function(){
                    $(".current_number").removeClass("hide");
                    $(".current_number").text((num + 1) + " of " + (full_playlist.length));
                    List.addToYoutubePlaylist(playlist_id, full_playlist, num + 1, request_url)
                    //}, 50);
                }
            }

        });
    },

    importOldList: function(chan){
        var ids="";
        var num=0;

    	playlist_url = "lists/"+chan+".json";

    	list = $.parseJSON($.ajax({
    		      type: "GET",
    		      url: playlist_url,
    		      async: false
    	       }).responseText);

    	$.each(list.songs, function(i,data)
    	{
    		ids+=data.id+",";

    		if(num>45){
    			Search.addVideos(ids);

    			ids = "";
    			num = 0;
    		}
    		num++;
    	});

    	Search.addVideos(ids);
    	document.getElementById("search").value = "";
    },

    sortList: function()
    {
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

    show: function(){
    	if(!Helper.mobilecheck())
    	{
    		if(showToggle){
    	    	showToggle=false;
    	    	$("#toptitle").empty();
    	        $("#chan").addClass("bigChan");
    	        //$("#chan").html("zoff.me/"+encodeURI(chan));
    	        $("#chan").html("zoff.me/"+chan.toLowerCase());
    	    }else{
    	    	showToggle=true;
    	    	$("#toptitle").html("Zoff");
    	    	$("#chan").removeClass("bigChan");
    	    	$("#chan").html(chan);
    	   }
    	}
    },

    generateSong: function(_song_info, transition, lazy, list, user, display, initial)
    {
        if(list_html === undefined) list_html = $("#list-song-html").html();
    	var video_id    = _song_info.id;
    	var video_title = _song_info.title;
    	var video_votes = _song_info.votes;
    	var video_thumb = "background-image:url('//img.youtube.com/vi/"+video_id+"/mqdefault.jpg');";
        var song        = $("<div>"+list_html+"</div>");
        var image_attr  = "style";

        var attr;
        var del_attr;
        //song.find(".list-song");
        if(transition) song.find("#list-song").css("height", 0);
        else song.find(".list-song").css("height", List.element_height);
        if(!w_p) song.find(".card-action").removeClass("hide");
        if(video_votes == 1)song.find(".vote-text").text("vote");
        if(lazy){
            video_thumb = "//img.youtube.com/vi/"+video_id+"/mqdefault.jpg";
            image_attr  = "data-original";
        }
        if(list){
            song.find(".list-votes").text(video_votes);
            song.find("#list-song").attr("id", video_id);
            song.find(".vote-container").attr("title", video_title);
            if((($("#wrapper").children().length >= List.can_fit) && initial) || display == "none"){
                song.find(".card").css("display", "none");
            }
            attr     = ".vote-container";
            del_attr = "delete_button";

            var _temp_duration = Helper.secondsToOther(_song_info.duration);
            song.find(".card-duration").text(Helper.pad(_temp_duration[0]) + ":" + Helper.pad(_temp_duration[1]));
        }else if(!list){
            //song.find(".card-duration").remove();
            song.find(".vote-text").text("");
            song.find(".card-duration").text(Helper.pad(_song_info.duration[0]) + ":" + Helper.pad(_song_info.duration[1]));
            var added_by = "user";
            attr     = ".add-suggested";
            if(user){
                del_attr = "del_user_suggested";
            } else{
                del_attr = "del_suggested";
                added_by = "system";
            }
            song.find(".vote-container").attr("class", "clickable add-suggested");
            song.find(".add-suggested").attr("title", video_title);
            song.find(".delete_button").addClass(del_attr);
            song.find(attr).attr("data-video-title", video_title);
            song.find(attr).attr("data-video-length", _song_info.length);
            song.find(attr).attr("data-added-by", added_by);
            song.find("#list-song").attr("id", "suggested-" + video_id);
            song.find(".list-image").attr("class", song.find(".list-image").attr("class").replace("list-image", "list-suggested-image"));

        }

    	song.find(".list-title").text(video_title);
    	song.find(".list-title").attr("title", video_title);
    	//song.find(".vote-container").attr("onclick", "vote('"+video_id+"','pos')");
        song.find(attr).attr("data-video-id", video_id);
    	song.find(".list-image").attr(image_attr,video_thumb);
        song.find(".list-suggested-image").attr(image_attr,video_thumb);
        song.find("."+del_attr).attr("data-video-id", video_id);
    	//song.find("#del").attr("onclick", "vote('"+video_id+"', 'del')");

    	return song.html();
    },

    getIndexOfSong: function(id)
    {
        try{
        	indexes = $.map(full_playlist, function(obj, index) {
        	    if(obj.id == id) {
        	        return index;
        	    }
        	});
        	return indexes[0];
        }catch(e){}
    },

    scrollTop: function(){
        $("#wrapper").scrollTop(0);
    },

    scrollBottom: function(){
        $("#wrapper").scrollTop($("#wrapper")[0].scrollHeight);
    }
};
