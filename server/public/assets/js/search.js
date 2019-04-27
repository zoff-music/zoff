var Search = {

    submitArray: [],
    submitArrayExpected: null,
    submitYouTubeArrayIds: [],
    submitYouTubeArray: [],
    submitYouTubeExpected: 0,
    submitYouTubeError: false,

    showSearch: function(){
        Helper.toggleClass("#search-wrapper", "hide");
        if(Helper.mobilecheck())
        {
            document.querySelector(".search_input").focus();
        }
        Helper.toggleClass("#song-title", "hide");
        //$("#results").empty();
        if(document.querySelector("#search-btn i").innerText == "close") {
            document.querySelector("body").setAttribute("style", "overflow-y:auto")

            document.getElementById("results").innerHTML = "";
            document.getElementById("results_soundcloud").innerHTML = "";
            Helper.css(".search_results", "display", "none");
            //Helper.css(".results-tabs", "display", "none");
            document.querySelector(".search_input").value =  "";
            document.querySelector("#search-btn i").innerText = "search";
            //Helper.css(document.querySelector(".search_results .col.s12"), "display", "none");
        } else {
            document.querySelector("#search-btn i").innerText = "close";
            //Helper.css(".search_results", "display", "block");
        }
        document.querySelector("#search").focus();

    },

    search: function(search_input, retried, related, pagination){
        if(result_html === undefined || empty_results_html === undefined) {
            result_html = document.getElementById("temp-results-container");
            empty_results_html = Helper.html("#empty-results-container");
        }
        if(!pagination && document.querySelectorAll("#inner-results").length == 0) {
            Helper.setHtml("#results", '');
        }
        if(search_input !== ""){
            searching = true;
            var keyword= encodeURIComponent(search_input);
            var yt_url = "https://www.googleapis.com/youtube/v3/search?key="+api_key.youtube+"&videoEmbeddable=true&part=id&type=video&order=relevance&safeSearch=none&maxResults=25";
            yt_url+="&q="+keyword;
            if(music)yt_url+="&videoCategoryId=10";
            if(pagination) yt_url += "&pageToken=" + pagination;
            var vid_url = "https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet,id&fields=pageInfo,items(id,contentDetails,snippet(categoryId,channelTitle,publishedAt,title,description,thumbnails))&key="+api_key.youtube+"&id=";
            if(related) {
                var yt_url 	= "https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&relatedToVideoId="+keyword+"&type=video&key="+api_key.youtube;
                var vid_url	= "https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet,id&key="+api_key.youtube+"&id=";
            }
            //https://www.googleapis.com/youtube/v3/videos?key={API-key}&fields=items(snippet(title,description))&part=snippet&id={video_id}

            Helper.addClass(document.querySelector("#search-btn .material-icons"), "hide");
            Helper.removeClass("#search_loader", "hide");
            Helper.addClass(".search_loader_spinner", "active");
            //Helper.removeClass(".search_results", "hide");
            //Helper.css(".results-tabs", "display", "none");

            Helper.ajax({
                type: "GET",
                url: yt_url,
                dataType: "jsonp",
                success: function(response){
                    response = JSON.parse(response);
                    var nextPageToken = response.nextPageToken;
                    var prevPageToken = response.prevPageToken;
                    //Helper.css(document.querySelector(".search_results .col.s12"), "display", "block");
                    if(response.items.length === 0) {
                        document.getElementById("results").innerHTML = "";
                        Helper.css("#results", "display", "block");
                        //Helper.css(".results-tabs", "display", "block");
                        //$("<div style='display:none;' id='inner-results' class='empty-inner-results'>"+empty_results_html+"</div>").appendTo($("#results")).show("blind", 83.33);
                        document.getElementById("results").insertAdjacentHTML("beforeend", "<div style='display:block;' id='inner-results' style='height:calc(100vh - 64px);' class='empty-inner-results'>"+empty_results_html+"</div>");
                        Helper.removeClass(document.querySelector("#search-btn .material-icons"), "hide");
                        Helper.addClass("#search_loader", "hide");
                        Helper.removeClass(".search_loader_spinner", "active");

                    } else if(response.items){
                        for(var i = 0; i < response.items.length; i++) {
                            vid_url += response.items[i].id.videoId+",";
                        }

                        Helper.ajax({
                            type: "GET",
                            url: vid_url,
                            dataType:"jsonp",
                            success: function(response){
                                response = JSON.parse(response);
                                var output = "";
                                var pre_result = document.createElement("div");
                                pre_result.innerHTML = result_html.outerHTML;

                                //$("#results").append(result_html);
                                for(var i = 0; i < response.items.length; i++) {
                                    var song = response.items[i];
                                    var duration=song.contentDetails.duration;
                                    var secs=Search.durationToSeconds(duration);
                                    var _temp_duration = Helper.secondsToOther(secs);
                                    if((longsongs != undefined && !longsongs) || secs<720){
                                        var title=song.snippet.title;
                                        var enc_title=title;//encodeURIComponent(title).replace(/'/g, "\\\'");
                                        var id=song.id;
                                        duration = duration.replace("PT","").replace("H","h ").replace("M","m ").replace("S","s");
                                        var thumb=song.snippet.thumbnails.medium.url;
                                        //$("#results").append(result_html);
                                        var songs = pre_result.cloneNode(true);
                                        songs.querySelector(".search-title").innerText = title;
                                        songs.querySelector(".result_info").innerText = Helper.pad(_temp_duration[0]) + ":" + Helper.pad(_temp_duration[1]);
                                        songs.querySelector(".thumb").setAttribute("src", thumb);
                                        //songs.querySelector(".add-many").attr("onclick", "submit('"+id+"','"+enc_title+"',"+secs+");");
                                        songs.querySelector("#add-many").setAttribute("data-video-id", id);
                                        songs.querySelector("#add-many").setAttribute("data-video-title", enc_title);
                                        songs.querySelector("#add-many").setAttribute("data-video-length", secs);
                                        //$($(songs).querySelector("div")[0]).setAttribute("onclick", "submitAndClose('"+id+"','"+enc_title+"',"+secs+");");
                                        songs.querySelector("#temp-results").setAttribute("data-video-id", id);
                                        songs.querySelector("#temp-results").setAttribute("data-video-title", enc_title);
                                        songs.querySelector("#temp-results").setAttribute("data-video-length", secs);
                                        songs.querySelector(".open-externally").setAttribute("href", "https://www.youtube.com/watch?v=" + id);
                                        songs.querySelector(".result-end").setAttribute("value", secs);
                                        //$($(songs).querySelector("div")[0]).setAttribute("id", id)
                                        //output += undefined;
                                        if(songs.innerHTML != undefined && songs.innerHTML != "") {
                                            output += songs.innerHTML;
                                        }
                                    }
                                }
                                var fresh = false;
                                if(document.querySelectorAll("#inner-results").length == 0) {
                                    fresh = true;
                                }
                                document.getElementById("results").innerHTML = "";
                                if(output.length > 0) {
                                    //$(window).scrollTop(0);
                                    if(!pagination && fresh) {
                                        Helper.css(".search_results", "display", "none");
                                    }
                                    document.getElementById("results").insertAdjacentHTML("beforeend", pagination_buttons_html);
                                    //$("<div id='inner-results'>"+output+"</div>").prependTo($("#results"));
                                    document.getElementById("results").insertAdjacentHTML("afterbegin", "<div id='inner-results'>"+output+"</div>");
                                    /*if(!pagination && fresh) {
                                        $(".search_results").slideDown();
                                    }*/
                                    document.getElementsByTagName("body")[0].setAttribute("style", "overflow-y:hidden !important")

                                    if(nextPageToken) {
                                        document.querySelector(".next-results-button").setAttribute("data-pagination", nextPageToken);
                                    } else {
                                        Helper.addClass(".next-results-button", "disabled");
                                    }
                                    if(prevPageToken) {
                                        document.querySelector(".prev-results-button").setAttribute("data-pagination", prevPageToken);
                                    } else {
                                        Helper.addClass(".prev-results-button", "disabled");
                                    }

                                    document.querySelectorAll(".pagination-results a")[0].setAttribute("data-original-search", search_input);
                                    document.querySelectorAll(".pagination-results a")[1].setAttribute("data-original-search", search_input);
                                    //setTimeout(function(){$(".thumb").lazyload({container: $("#results")});}, 250);
                                    Helper.removeClass(document.querySelector("#search-btn .material-icons"), "hide");
                                    Helper.addClass("#search_loader", "hide");
                                    Helper.removeClass(".search_loader_spinner", "active");
                                    if(document.querySelector("#results_soundcloud").innerHTML.length > 0 || related) {
                                        Helper.css(".search_results", "display", "block");
                                    }
                                    Helper.css(".results-tabs", "display", "block");

                                } else if(!retried){
                                    Search.search(search_input, true);
                                } else {
                                    //$("<div style='display:none;' id='inner-results'>"+empty_results_html+"</div>").appendTo($("#results")).show("blind", 83.33);
                                    document.getElementById("results").insertAdjacentHTML("beforeend", "<div style='display:block;' id='inner-results' style='height:calc(100vh - 64px);'>"+empty_results_html+"</div>");
                                    Helper.css("#results", "display", "block");
                                    if(document.querySelector("#results_soundcloud").innerHTML.length > 0) {
                                        Helper.css(".search_results", "display", "block");
                                    }
                                    Helper.removeClass(document.querySelector("#search-btn .material-icons"), "hide");
                                    Helper.addClass("#search_loader", "hide");
                                    Helper.removeClass(".search_loader_spinner", "active");
                                }
                            }
                        });
                    }
                }
            });
        } else {
            Helper.removeClass(".main", "blurT");
            Helper.removeClass("#controls", "blurT");
            Helper.removeClass(".main", "clickthrough");
            //Helper.css(".results-tabs", "display", "none");
            Helper.css(".search_results", "display", "none");
        }
    },

    soundcloudSearch: function(keyword) {
        if(!soundcloud_enabled) {
            document.querySelector("#results_soundcloud").innerHTML = '<div style="display:block;" id="inner-results" class="empty-inner-results"><div id="empty-results" class="valign-wrapper><span class="valign">No SoundCloud API-key, search disabled..</span></div></div>';

            return;
        }
        if(keyword.length == 0) return;
        SC_player.get('/tracks', {
            q: keyword
        }).then(function(tracks) {
            var pre_result = document.createElement("div");
            pre_result.innerHTML = result_html.outerHTML;
            //$("#results").append(result_html);
            //Helper.css(document.querySelector(".search_results .col.s12"), "display", "block");
            var output = "";
            for(var i = 0; i < tracks.length; i++) {
                var song = tracks[i];
                if(!song.streamable) continue;
                var duration=Math.floor(song.duration / 1000);
                //var secs=Search.durationToSeconds(duration);
                var secs = duration;
                var _temp_duration = Helper.secondsToOther(secs);
                if(longsongs == undefined) longsongs = true;
                if((longsongs != undefined && !longsongs) || secs<720){
                    var title=song.title;
                    if(title.indexOf(song.user.username) == -1) {
                        title = song.user.username +  " - " + title;
                    }
                    var enc_title=title;//encodeURIComponent(title).replace(/'/g, "\\\'");
                    var id=song.id;
                    //duration = duration.replace("PT","").replace("H","h ").replace("M","m ").replace("S","s");
                    var thumb=song.artwork_url;
                    //var thumb = null;
                    if(thumb == null) thumb = song.waveform_url;
                    else thumb = thumb.replace("-large.jpg", "-t500x500.jpg");
                    //$("#results").append(result_html);
                    var songs = pre_result.cloneNode(true);
                    songs.querySelector(".search-title").innerText = title;
                    songs.querySelector(".result_info").innerText = Helper.pad(_temp_duration[0]) + ":" + Helper.pad(_temp_duration[1]);
                    songs.querySelector(".thumb").setAttribute("src", thumb);
                    //songs.querySelector(".add-many").attr("onclick", "submit('"+id+"','"+enc_title+"',"+secs+");");
                    songs.querySelector("#add-many").setAttribute("data-type-source", "soundcloud");
                    songs.querySelector("#add-many").setAttribute("data-type-thumbnail", thumb);
                    songs.querySelector("#add-many").setAttribute("data-video-id", id);
                    songs.querySelector("#add-many").setAttribute("data-video-title", enc_title);
                    songs.querySelector("#add-many").setAttribute("data-video-length", secs);
                    //$($(songs).querySelector("div")[0]).setAttribute("onclick", "submitAndClose('"+id+"','"+enc_title+"',"+secs+");");
                    songs.querySelector("#temp-results").setAttribute("data-video-id", id);
                    songs.querySelector("#temp-results").setAttribute("data-video-title", enc_title);
                    songs.querySelector("#temp-results").setAttribute("data-video-length", secs);
                    songs.querySelector(".open-externally").setAttribute("href", song.permalink_url);
                    songs.querySelector(".result-end").setAttribute("value", secs);
                    songs.querySelector("#temp-results").setAttribute("data-type-source", "soundcloud");
                    songs.querySelector("#temp-results").setAttribute("data-type-thumbnail", thumb);
                    //$($(songs).querySelector("div")[0]).setAttribute("id", id)
                    //output += undefined;
                    if(songs.innerHTML != undefined && songs.innerHTML != "") {
                        output += songs.innerHTML;
                    }
                }
            }
            var fresh = false;
            if(document.querySelectorAll("#inner-results").length == 0) {
                fresh = true;
            }
            document.getElementById("results_soundcloud").innerHTML = "";
            if(output.length > 0) {

                //$(window).scrollTop(0);
                /*if(!pagination && fresh) {
                    //Helper.css(".search_results", "display", "none");
                }*/
                //document.getElementById("results_soundcloud").insertAdjacentHTML("beforeend", pagination_buttons_html);
                //$("<div id='inner-results'>"+output+"</div>").prependTo($("#results"));
                document.getElementById("results_soundcloud").insertAdjacentHTML("afterbegin", "<div id='inner-results'>"+output+"</div>");
                if(!pagination && fresh) {
                    //$(".search_results").slideDown();
                }

                /*if(nextPageToken) {
                    document.querySelector(".next-results-button").setAttribute("data-pagination", nextPageToken);
                } else {
                    Helper.addClass(".next-results-button", "disabled");
                }
                if(prevPageToken) {
                    document.querySelector(".prev-results-button").setAttribute("data-pagination", prevPageToken);
                } else {
                    Helper.addClass(".prev-results-button", "disabled");
                }

                document.querySelector(".pagination-results a").setAttribute("data-original-search", search_input);
                */
                //setTimeout(function(){$(".thumb").lazyload({container: $("#results")});}, 250);

                /*Helper.removeClass(".search_loader_spinner", "active");
                Helper.css(".search_results", "display", "block");*/

            } else {
                document.getElementById("results_soundcloud").insertAdjacentHTML("afterbegin", "<div id='inner-results' style='height:calc(100vh - 64px);'>"+empty_results_html+"</div>");
                document.getElementsByTagName("body")[0].setAttribute("style", "overflow-y:hidden !important")
            }
            if(document.querySelector("#results").innerHTML.length > 0) {
                Helper.css(".search_results", "display", "block");
            }
             /*else if(!retried){
                Search.search(search_input, true);
            } else {
                //$("<div style='display:none;' id='inner-results'>"+empty_results_html+"</div>").appendTo($("#results_soundcloud")).show("blind", 83.33);
                document.getElementById("results_soundcloud").insertAdjacentHTML("beforeend", "<div style='display:block;' id='inner-results' style='height:calc(100vh - 64px);'>"+empty_results_html+"</div>");
                Helper.css("#results_soundcloud", "display", "block");
                Helper.removeClass(".search_loader_spinner", "active");
            }*/
        });
    },

    backgroundSearch: function(title, artist, length, totalNumber, current){
        var keyword= encodeURIComponent(title + " " + artist);
        var yt_url = "https://www.googleapis.com/youtube/v3/search?key="+api_key.youtube+"&videoEmbeddable=true&part=id,snippet&fields=items(id,snippet)&type=video&order=relevance&safeSearch=none&maxResults=10&videoCategoryId=10";
        yt_url+="&q="+keyword;
        var vid_url = "https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet,id&key="+api_key.youtube+"&id=";
        artist = artist.split(" ");
        var temptitle = title.split("-");
        temptitle = temptitle.join(" ").split(" ");
        Helper.ajax({
            type: "GET",
            url: yt_url,
            dataType:"jsonp",
            success: function(response){
                response = JSON.parse(response);
                //Helper.log(response);
                if(response.items.length === 0){
                    Search.readySubmit(false, {totalLength: totalNumber - 1});
                    Helper.log([
                        "NO MATCH FOR:",
                        "Spotify title: " + title + " " + artist.join(" "),
                        "Spotify length: " + length
                    ]);
                    var not_added_song = document.createElement("div");
                    not_added_song.innerHTML = not_import_html;

                    not_added_song.querySelector(".extra-add-text").innerText = title + " - " + artist.join(" ");
                    not_added_song.querySelector(".extra-add-text").setAttribute("title", title + " - " + artist.join(" "));
                    not_added_song.querySelector(".extra-button-search").setAttribute("data-text", title + " - " + artist.join(" "));
                    document.querySelector(".not-imported-container").insertAdjacentHTML("beforeend", not_added_song.innerHTML);
                    Helper.removeClass(".not-imported", "hide");
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
                                    if(data.contentDetails == undefined || data.contentDetails.duration == undefined) {
                                        Search.readySubmit(false, {totalLength: totalNumber - 1});
                                        Helper.log([
                                            "NO MATCH FOR:",
                                            "Spotify title: " + title + " " + artist.join(" "),
                                            "Spotify length: " + length
                                        ]);
                                        var not_added_song = document.createElement("div");
                                        not_added_song.innerHTML = not_import_html;
                                        not_added_song.querySelector(".extra-add-text").innerText = title + " - " + artist.join(" ");
                                        not_added_song.querySelector(".extra-add-text").setAttribute("title", title + " - " + artist.join(" "));
                                        not_added_song.querySelector(".extra-button-search").setAttribute("data-text", title + " - " + artist.join(" "));
                                        document.querySelector(".not-imported-container").insertAdjacentHTML("beforeend", not_added_song.innerHTML);
                                        Helper.removeClass(".not-imported", "hide");
                                    }
                                    var duration = Search.durationToSeconds(data.contentDetails.duration);
                                    var not_matched = false;
                                    if(similarity(data.snippet.title, artist + " - " + title) > 0.75) {
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
                                                (data.snippet.channelTitle.toLowerCase().indexOf(artist[0].toLowerCase()) == -1 &&
                                                data.snippet.channelTitle.toLowerCase().indexOf("vevo") == -1)))
                                            ))
                                            not_matched = true;
                                            else if(duration > 1800) not_matched = true;
                                        }
                                    }

                                    if((!not_matched)){
                                        matched = true;
                                        Search.readySubmit(true, { id: data.id, title: data.snippet.title, source: "youtube", thumbnail: "https://img.youtube.com/vi/" + data.id + "/mqdefault.jpg", duration: duration, totalLength: totalNumber - 1});
                                        break;
                                    }
                                }
                                if(!matched){
                                    Search.readySubmit(false, {totalLength: totalNumber - 1});
                                    Helper.log([
                                        "NO MATCH FOR:",
                                        "Spotify title: " + title + " " + artist.join(" "),
                                        "Spotify length: " + length
                                    ]);
                                    var not_added_song = document.createElement("div");
                                    not_added_song.innerHTML = not_import_html;
                                    not_added_song.querySelector(".extra-add-text").innerText = title + " - " + artist.join(" ");
                                    not_added_song.querySelector(".extra-add-text").setAttribute("title", title + " - " + artist.join(" "));
                                    not_added_song.querySelector(".extra-button-search").setAttribute("data-text", title + " - " + artist.join(" "));
                                    document.querySelector(".not-imported-container").insertAdjacentHTML("beforeend", not_added_song.innerHTML);
                                    Helper.removeClass(".not-imported", "hide");
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
    },

    readySubmit: function(found, obj){
        if(Search.submitArrayExpected === null){
            Search.submitArrayExpected = obj.totalLength;
        }
        if(found){
            Search.submitArray.push(obj);
        } else {
            Search.submitArrayExpected -= 1;
        }
        if((Search.submitArray.length - 1) == Search.submitArrayExpected) {
            socket.emit("addPlaylist", {channel: chan.toLowerCase(), songs: Search.submitArray});
            /*$.each(Search.submitArray, function(i, data){
            Search.submit(data.id, data.title, data.duration, true, i, Search.submitArray.length - 1, 0, data.duration);
        });*/
        document.getElementById("import_spotify").disabled = false;
        Helper.removeClass("#import_spotify", "hide");
        Helper.addClass("#playlist_loader_spotify", "hide");
        Search.submitArray = [];
        Search.submitArrayExpected = null;
    }
},

submitAndClose: function(id,title,duration, start, end, source, thumbnail){
    Search.submit(id,title, duration, false, 0, 1, start, end, source, thumbnail);
    Helper.setHtml("#results", '');
    Search.showSearch();
    document.getElementById("search").value = "";
    document.getElementsByTagName("body")[0].setAttribute("style", "overflow-y:auto")
    Helper.setHtml("#results","");
    Helper.setHtml("#results-soundcloud", "");
    Helper.removeClass(".main", "blurT");
    Helper.removeClass("#controls", "blurT");
    Helper.removeClass(".main", "clickthrough");
    Helper.css(".search_results", "display", "none");
},

importPlaylist: function(pId,pageToken){
    token = "";
    var headers;
    var datatype;
    if(pageToken !== undefined)
    token = "&pageToken="+pageToken;
    playlist_url = "https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=49&key="+api_key.youtube+"&playlistId="+pId+token;
    if(youtube_authenticated) {
        datatype = "html";
        headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + access_token_data_youtube.access_token
        };
    } else {
        headers = {};//'Content-Type': 'application/json'};
        datatype = "jsonp";
    }
    Helper.ajax({
        type: "GET",
        url: playlist_url,
        dataType: datatype,
        //dataType:"jsonp",
        headers: headers,
        success: function(response) {
            response = JSON.parse(response);
            if(response.error){
                if(response.error.errors[0].reason == "playlistItemsNotAccessible"){
                    var nonce = Helper.randomString(29);
                    window.callback = function(data) {
                        access_token_data_youtube = data;
                        if(access_token_data_youtube.state == nonce){
                            youtube_authenticated = true;
                            setTimeout(function(){
                                youtube_authenticated = false;
                                access_token_data_youtube = {};
                            }, access_token_data_youtube.expires_in * 1000);
                            Search.importPlaylist(pId, pageToken);
                        } else {
                            access_token_data_youtube = "";
                            console.error("Nonce doesn't match");
                        }
                        youtube_window.close();
                        window.callback = "";
                    };
                    youtube_window = window.open("/api/oauth#youtube=true&nonce=" + nonce, "", "width=600, height=600");
                } else {
                    Helper.log([
                        "import list error: ",
                        response.error
                    ]);
                    document.getElementById("import").disabled = false;
                    Helper.addClass("#playlist_loader", "hide");
                    Helper.removeClass("#import", "hide");
                    before_toast();
                    M.toast({html: "It seems you've entered a invalid url.", displayLength: 4000});
                }

            }  else {
                var ids="";
                var this_length = 0;
                if(typeof(response) == "string") response = JSON.parse(response);
                //Search.addVideos(response.items[0].contentDetails.videoId);
                //response.items.shift();
                for(var i = 0; i < response.items.length; i++) {
                    var data = response.items[i];
                    ids+=data.contentDetails.videoId+",";
                    Search.submitYouTubeArrayIds.push(data.contentDetails.videoId);
                    this_length += 1;
                    Search.submitYouTubeExpected += 1;
                }

                if(response.nextPageToken) {
                    //Search.addVideos(ids, true, 0, false, this_length);
                    Search.importPlaylist(pId, response.nextPageToken);
                } else {
                    Search.addVideos(Search.submitYouTubeArrayIds);
                    //Search.addVideos(ids, true, Search.submitYouTubeExpected, true, this_length);
                    //Search.submitYouTubeExpected = 0;
                }
                document.getElementById("import").value = "";
            }
        },
        error: function(e) {
            if(e.status == 403){
                var nonce = Helper.randomString(29);
                window.callback = function(data) {
                    access_token_data_youtube = data;
                    if(access_token_data_youtube.state == nonce){
                        youtube_authenticated = true;
                        setTimeout(function(){
                            youtube_authenticated = false;
                            access_token_data_youtube = {};
                        }, access_token_data_youtube.expires_in * 1000);
                        Search.importPlaylist(pId, pageToken);
                    } else {
                        access_token_data_youtube = "";
                        console.error("Nonce doesn't match");
                    }
                    youtube_window.close();
                    window.callback = "";
                };
                youtube_window = window.open("/api/oauth#youtube=true&nonce=" + nonce, "", "width=600, height=600");
            } else {
                Helper.log([
                    "import list error: ",
                    response.error
                ]);
                document.getElementById("import").disabled = false;
                Helper.addClass("#playlist_loader", "hide");
                Helper.removeClass("#import", "hide");
                before_toast();
                M.toast({html: "It seems you've entered a invalid url.", displayLength: 4000});
            }
        }
    });
},

importSpotifyPlaylist: function(url){
    Helper.ajax({
        method: "get",
        url: url,
        headers: {
            'Authorization': 'Bearer ' + access_token_data.access_token
        },
        success: function(response) {
            response = JSON.parse(response);
            for(var i = 0; i < response.items.length; i++) {
                var data = response.items[i];
                //ids+=data.contentDetails.videoId+",";
                Search.backgroundSearch(data.track.name, data.track.artists.map(function(elem){return elem.name;}).join(" "), Math.floor(data.track.duration_ms/1000), response.total, i + response.offset);

            }
            if(response.next){
                Search.importSpotifyPlaylist(response.next);
            }
        },
        error: function(e) {
            document.getElementById("import_spotify").disabled = false;
            Helper.removeClass("#import_spotify", "hide");
            Helper.addClass("#playlist_loader_spotify", "hide");
            before_toast();
            M.toast({html: "It seems you've entered a invalid url.", displayLength: 4000});
        }
    });
},

addVideos: function(ids){
    var more = false;
    var next_ids = [];
    var request_url="https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet,id&key=" + api_key.youtube + "&id=";
    for(var i = 0; i < ids.length; i++) {
        if(i > 48) {
            more = true;
            next_ids = ids.slice(i, ids.length);
            break;
        }
        request_url += ids[i] + ",";
    }
    Helper.ajax({
        type: "GET",
        url: request_url,
        success: function(response){
            response = JSON.parse(response);
            var x = 0;
            if(response.error) {
                Search.submitYouTubeError = true;
            }
            for(var i = 0; i < response.items.length; i++) {
                var song = response.items[i];
                var duration=Search.durationToSeconds(song.contentDetails.duration);
                if((longsongs != undefined && !longsongs) || duration<720){
                    enc_title= song.snippet.title;//encodeURIComponent(song.snippet.title);
                    //Search.submit(song.id, enc_title, duration, playlist, i);
                    x += 1;
                    Search.submitYouTubeArray.push({id: song.id, title: enc_title, duration: duration, source: "youtube", thumbnail: "https://img.youtube.com/vi/" + song.id + "/mqdefault.jpg"});
                }
            }
            if(more) Search.addVideos(next_ids);
            else {
                socket.emit("addPlaylist", {channel: chan.toLowerCase(), songs: Search.submitYouTubeArray});
                Search.submitYouTubeArray = [];
                Search.submitYouTubeExpected = 0;
            }
        },
        error: function(e) {
            console.error(e);
        }
    });
},

submit: function(id,title,duration, playlist, num, full_num, start, end, source, thumbnail){
    if((client || Helper.mobilecheck()) && !socket_connected) {
        add_ajax(id, title, duration, playlist, num, full_num, start, end, source, thumbnail);
        return;
    }
    if(offline && document.getElementsByName("addsongs")[0].checked && document.getElementsByName("addsongs")[0].disabled){
        var found_array = [];
        for(var i = 0; i < full_playlist.length; i++) {
            if(full_playlist[i].id == id) found_array.push(i);
        }
        if(found_array.length == 0){
            List.channel_function({
                type: "added",
                start: start,
                end: end,
                value: {
                    added: (new Date).getTime()/1000,
                    guids: [1],
                    id: id,
                    title: title,
                    duration: duration,
                    now_playing: false,
                    votes: 1
                }
            });
        } else {
            List.vote(id, "pos");
        }
    } else {
        /*var u = Crypt.crypt_pass(Crypt.get_userpass(chan.toLowerCase()), true);
        if(u == undefined) u = "";*/
        emit("add", {
            id: id,
            start: start,
            end: end,
            title: title,
            list: chan.toLowerCase(),
            duration: duration,
            source: source,
            thumbnail: thumbnail
        });
    }//[id, decodeURIComponent(title), adminpass, duration, playlist]);
},

durationToSeconds: function(duration) {
    var matches = duration.match(time_regex);
    hours= parseInt(matches[12])||0;
    minutes= parseInt(matches[14])||0;
    seconds= parseInt(matches[16])||0;
    return hours*60*60+minutes*60+seconds;
}
};
