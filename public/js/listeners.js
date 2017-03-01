var chan 				  = window.chan === undefined ? $("#chan").html() : window.chan;
var w_p 				  = true;
var hasadmin			  = 0;
var showToggle 			  = true;
var list_html 			  = $("#list-song-html").html();
var unseen 			   	  = false;
var api_key 		   	  = "AIzaSyDvMlC0Kvk76-WO9UrtBaaEYyUw4z-TGqE";
var searching 		   	  = false;
var time_regex 		   	  = /P((([0-9]*\.?[0-9]*)Y)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)W)?(([0-9]*\.?[0-9]*)D)?)?(T(([0-9]*\.?[0-9]*)H)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)S)?)?/;
var conf 			   	  = [];
var music 			   	  = 0;
var frontpage 		   	  = 1;
var adminpass 		   	  = "";
var filesadded		   	  = "";
var player_ready 	   	  = false;
var viewers 			  = 1;
var paused 				  = false;
var playing 			  = false;
var SAMPLE_RATE 		  = 6000; // 6 seconds
var lastSample 			  = Date.now();
var fireplace_initiated   = false;
var began 				  = false;
var i 					  = -1;
var lazy_load    		  = false;
var embed				  = false;
var autoplay			  = true;
var durationBegun 	      = false;
var chat_active 		  = false;
var chat_unseen 		  = false;
var blinking 			  = false;
var from_frontpage        = false;
var access_token_data     = {};
var spotify_authenticated = false;
var not_import_html       = "";
var not_export_html       = "";
var embed_height          = 300;
var embed_width           = 600;
var embed_autoplay        = "&autoplay";
var connect_error         = false;
var access_token_data_youtube = {};
var youtube_authenticated = false;
var chromecastAvailable = false;
var color               = "808080";
var find_start          = false;
var find_started        = false;
var offline             = false;
var cast_ready_connect  = false;
var prev_chan_list 			= "";
var prev_chan_player 		= "";
var chromecastReady = false;
var found_array = [];
var found_array_index = 0;
var castSession;
var width_timeout;

if(localStorage.debug === undefined){
	var debug = false;
	localStorage.debug = debug;
}

var image_timeout;
var result_html;
var empty_results_html;
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
var list;
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

if (navigator.serviceWorker) {
    navigator.serviceWorker.register('/service-worker.js', {scope: '/'})
        .then(function (registration) {
            Helper.log(registration);
        })
        .catch(function (e) {
            console.error(e);
        });
} else {
    Helper.log('Service Worker is not supported in this browser.');
}

$().ready(function(){
	if(!fromFront && window.location.pathname != "/") init();
	else if(!fromChannel && window.location.pathname == "/"){
		initfp();
	}

    socket.on("connect", function(){
        if(connect_error){
            connect_error = false;
            $(".connect_error").fadeOut(function(){
                $(".connect_error").remove();
                Materialize.toast("Connected!", 2000, "green lighten");
				if((Crypt.get_pass(chan.toLowerCase()) !== undefined && Crypt.get_pass(chan.toLowerCase()) !== "")){
					socket.emit("password", {password: Crypt.crypt_pass(Crypt.get_pass(chan.toLowerCase())), channel: chan.toLowerCase()});
				}
			});
        }
    });

    setup_no_connection_listener();

    try{
        git_info = $.ajax({ type: "GET",
    		     url: "https://api.github.com/users/zoff-music/received_events",
    		     async: false
    	   }).responseText;

        git_info = $.parseJSON(git_info);
        $("#latest-commit").html("Latest Commit: <br>" +
            git_info[0].created_at.substring(0,10) +
            ": " + git_info[0].actor.display_login +
            "<br><a href='https://github.com/"+git_info[0].repo.name+"/commit/" + git_info[0].payload.commits[0].sha + "' target='_blank'>" +
            git_info[0].payload.commits[0].sha.substring(0,10) + "</a>: " +
            git_info[0].payload.commits[0].message+"<br");
    } catch(error){
        Helper.log("Error with fetching GitHub commit info");
    }

    /*******

      MaterializeCSS fix for autocomplete

    ******/

    $.fn.autocomplete = function (options) {
        // Defaults
        var defaults = {
          data: {},
          limit: Infinity,
          onAutocomplete: null
        };

        options = $.extend(defaults, options);

        return this.each(function() {
          var $input = $(this);
          var data = options.data,
              count = 0,
              activeIndex = -1,
              oldVal,
              $inputDiv = $input.closest('.input-field'); // Div to append on

          // Check if data isn't empty
          if (!$.isEmptyObject(data)) {
            var $autocomplete = $('<ul class="autocomplete-content dropdown-content"></ul>');
            var $oldAutocomplete;

            // Append autocomplete element.
            // Prevent double structure init.
            if ($inputDiv.length) {
              $oldAutocomplete = $inputDiv.children('.autocomplete-content.dropdown-content').first();
              if (!$oldAutocomplete.length) {
                $inputDiv.append($autocomplete); // Set ul in body
              }
            } else {
              $oldAutocomplete = $input.next('.autocomplete-content.dropdown-content');
              if (!$oldAutocomplete.length) {
                $input.after($autocomplete);
              }
            }
            if ($oldAutocomplete.length) {
              $autocomplete = $oldAutocomplete;
            }

            // Highlight partial match.
            var highlight = function(string, $el) {
              var img = $el.find('img');
              var matchStart = $el.text().toLowerCase().indexOf("" + string.toLowerCase() + ""),
                  matchEnd = matchStart + string.length - 1,
                  beforeMatch = $el.text().slice(0, matchStart),
                  matchText = $el.text().slice(matchStart, matchEnd + 1),
                  afterMatch = $el.text().slice(matchEnd + 1);
              $el.html("<span>" + beforeMatch + "<span class='highlight'>" + matchText + "</span>" + afterMatch + "</span>");
              if (img.length) {
                $el.prepend(img);
              }
            };

            // Reset current element position
            var resetCurrentElement = function() {
              activeIndex = -1;
              $autocomplete.find('.active').removeClass('active');
            }

            // Perform search
            $input.off('keyup.autocomplete').on('keyup.autocomplete', function (e) {
              // Reset count.
              count = 0;

              // Don't capture enter or arrow key usage.
              if (e.which === 13 ||
                  e.which === 38 ||
                  e.which === 40) {
                return;
              }

              var val = $input.val().toLowerCase();

              // Check if the input isn't empty
              if (oldVal !== val) {
                $autocomplete.empty();
                resetCurrentElement();

                if (val !== '') {
                  for(var key in data) {
                    if (data.hasOwnProperty(key) &&
                        key.toLowerCase().indexOf(val) !== -1 &&
                        key.toLowerCase() !== val) {
                      // Break if past limit
                      if (count >= options.limit) {
                        break;
                      }

                      var autocompleteOption = $('<li></li>');
                      if (!!data[key]) {
                        autocompleteOption.append('<img src="'+ data[key] +'" class="right circle"><span>'+ key +'</span>');
                      } else {
                        autocompleteOption.append('<span>'+ key +'</span>');
                      }

                      $autocomplete.append(autocompleteOption);
                      highlight(val, autocompleteOption);
                      count++;
                    }
                  }
                }
              }

              // Update oldVal
              oldVal = val;
            });

            $input.off('keydown.autocomplete').on('keydown.autocomplete', function (e) {
              // Arrow keys and enter key usage
              var keyCode = e.which,
                  liElement,
                  numItems = $autocomplete.children('li').length,
                  $active = $autocomplete.children('.active').first();

              // select element on Enter
              if (keyCode === 13 && activeIndex >= 0) {
                liElement = $autocomplete.children('li').eq(activeIndex);
                if (liElement.length) {
                  liElement.click();
                  e.preventDefault();
                }
                return;
              }

              // Capture up and down key
              if ( keyCode === 38 || keyCode === 40 ) {
                e.preventDefault();

                if (keyCode === 38 &&
                    activeIndex > 0) {
                  activeIndex--;
                }

                if (keyCode === 40 &&
                    activeIndex < (numItems - 1)) {
                  activeIndex++;
                }

                $active.removeClass('active');
                if (activeIndex >= 0) {
                  $autocomplete.children('li').eq(activeIndex).addClass('active');
                }
              }
            });

            // Set input value
            $autocomplete.on('click', 'li', function () {
              var text = $(this).text().trim();
              $input.val(text);
              $input.trigger('change');
              $autocomplete.empty();
              resetCurrentElement();

              // Handle onAutocomplete callback.
              if (typeof(options.onAutocomplete) === "function") {
                options.onAutocomplete.call(this, text);
              }
            });
          }
        });
    };
});


function init(){

	var no_socket = true;

	chan = $("#chan").html();
	mobile_beginning = Helper.mobilecheck();
	var side = Helper.mobilecheck() ? "left" : "right";

	window.onpopstate = function(e){
		onepage_load();
	};

	share_link_modifier_channel();

	if(window.location.hostname == "zoff.me") add = "https://zoff.me";
	else add = window.location.hostname;

	if(Player !== undefined) Player.stopInterval= false;

	$('ul.playlist-tabs').tabs();
	$('ul.playlist-tabs-loggedIn').tabs();
	$('ul.chatTabs').tabs();
	$("#settings").sideNav({
      menuWidth: 300, // Default is 240
      edge: side, // Choose the horizontal origin
      closeOnClick: false // Closes side-nav on <a> clicks, useful for Angular/Meteor
    });
    $('.collapsible').collapsible({
      accordion : true // A setting that changes the collapsible behavior to expandable instead of the default accordion style
    });
	$("#help").modal();
    $("#contact").modal();
	$("#embed").modal();

    spotify_is_authenticated(spotify_authenticated);

    result_html 	   	  = $("#temp-results-container");
	empty_results_html 	  = $("#empty-results-container").html();
    not_import_html       = $(".not-imported-container").html();
    not_export_html       = $(".not-exported-container").html();
    $(".not-imported-container").empty();
    $(".not-exported-container").empty();

    $(".video-container").resizable({
    	start: function(event, ui) {
        	$('iframe').css('pointer-events','none');
        },
    	stop: function(event, ui) {
        	$('iframe').css('pointer-events','auto');
        	Crypt.set_width($(this).width());
            set_title_width();
      	},
        handles: "e",
        minWidth: 350,
        maxWidth: $(window).width()-241
    });

		if(socket === undefined || Helper.mobilecheck()){
			no_socket = false;
			socket = io.connect(''+add+':8080', connection_options);
		}

	    Crypt.init();
	    if(Crypt.get_offline()){
	        $(".offline_switch_class")[0].checked = true;
	        change_offline(true, offline);
	    }

		if($("#alreadychannel").length === 0 || Helper.mobilecheck()){
			setup_youtube_listener();
			get_list_listener();
			setup_suggested_listener();
			setup_viewers_listener();

		} else {
	        $("#channel-load").css("display", "none");
			$("#player").css("opacity", "1");
			$("#controls").css("opacity", "1");
			$(".playlist").css("opacity", "1");
			Player.readyLooks();
			Playercontrols.initYoutubeControls(Player.player);
			Playercontrols.initSlider();
			Player.player.setVolume(Crypt.get_volume());
	        $(".video-container").removeClass("no-opacity");

	        var codeURL = "https://remote."+window.location.hostname+"/"+id;
		    $("#code-text").text(id);
		    $("#code-qr").attr("src", "https://chart.googleapis.com/chart?chs=221x221&cht=qr&choe=UTF-8&chld=L|1&chl="+codeURL);
		    $("#code-link").attr("href", codeURL);
		}

		if(no_socket) socket.emit('list', chan.toLowerCase());
        $("#viewers").tooltip({
          delay: 5,
          position: "top",
          tooltip: "Viewers"
        });

		//if(/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream){
	    /*if(!Helper.mobilecheck() && !window.MSStream){
			document.getElementById("search").blur();
			$("#channel-load").css("display", "none");
	 	} else {*/
	 		window.onYouTubeIframeAPIReady = Player.onYouTubeIframeAPIReady;
	 		if(Player.player === "" || Player.player === undefined || Helper.mobilecheck()) Player.loadPlayer();
	 	//}

	 	if(Helper.mobilecheck()) Mobile_remote.initiate_volume();
        else {
            $('input#chan_description').characterCounter();
        }

	 	setup_admin_listener();
		setup_list_listener();
		setup_chat_listener();

		if(!Helper.mobilecheck() && $("#alreadychannel").length === 0) setup_host_initialization();

		if(!Helper.msieversion() && !Helper.mobilecheck()) Notification.requestPermission();

		$(".search_input").focus();

		Helper.sample();

        $('.castButton-unactive').tooltip({
            delay: 5,
            position: "top",
            tooltip: "Cast Zoff to TV"
        });

        $('.castButton-active').tooltip({
            delay: 5,
            position: "top",
            tooltip: "Stop casting"
        });

    $( "#results" ).hover( function() { $("div.result").removeClass("hoverResults"); i = 0; }, function(){ });
		$("#search").focus();
		$("#embed-button").css("display", "inline-block");
		$("#embed-area").val(embed_code(embed_autoplay, embed_width, embed_height, color));
		$("#search").attr("placeholder", "Find song on YouTube...");

		if(!/chrom(e|ium)/.test(navigator.userAgent.toLowerCase()) && !Helper.mobilecheck()){
			$(".castButton-unactive").css("display", "none");
		}

    if(chromecastAvailable){
        hide_native(1);
    } else if(chromecastReady) {
        initializeCastApi();
    } else {
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

    if(!Helper.mobilecheck() && navigator.userAgent.match(/iPad/i) == null){
        setTimeout(function(){set_title_width();}, 100);

    }
}

initializeCastApi = function() {
    cast.framework.CastContext.getInstance().setOptions({
        receiverApplicationId: "E6856E24",
        autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED});
    var context = cast.framework.CastContext.getInstance();
		chromecastReady = true
    //$(".castButton-unactive").css("display", "block");
    context.addEventListener(
        cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
        function(event) {
            switch (event.sessionState) {
                case cast.framework.SessionState.SESSION_STARTED:
                    castSession = cast.framework.CastContext.getInstance().getCurrentSession();
                    castSession.addMessageListener("urn:x-cast:zoff.me", chromecastListener)
                    chrome.cast.media.GenericMediaMetadata({title:song_title, image: 'https://img.youtube.com/vi/'+video_id+'/mqdefault.jpg'});
                    chrome.cast.Image('https://img.youtube.com/vi/'+video_id+'/mqdefault.jpg');
                    chromecastAvailable = true;
                    paused = false;
                    mobile_beginning = false;
                    var _seekTo;
                    try{
                        _seekTo = Player.player.getCurrentTime();
                    } catch(e){
                        _seekTo = seekTo;
                    }
                    castSession.sendMessage("urn:x-cast:zoff.me", {type: "loadVideo", videoId: video_id, seekTo: _seekTo})
                    castSession.sendMessage("urn:x-cast:zoff.me", {type: "nextVideo", videoId: full_playlist[0].id, title: full_playlist[0].title})
                    hide_native(1);
                    break;
                case cast.framework.SessionState.SESSION_RESUMED:
                    castSession = cast.framework.CastContext.getInstance().getCurrentSession();
                    castSession.addMessageListener("urn:x-cast:zoff.me", chromecastListener);
                    chrome.cast.media.GenericMediaMetadata({title:song_title, image: 'https://img.youtube.com/vi/'+video_id+'/mqdefault.jpg'});
                    chrome.cast.Image('https://img.youtube.com/vi/'+video_id+'/mqdefault.jpg');
                    chromecastAvailable = true;
                    paused = false;
                    mobile_beginning = false;
                    var _seekTo;
                    try{
                        _seekTo = Player.player.getCurrentTime();
                    } catch(e){
                        _seekTo = seekTo;
                    }
                    castSession.sendMessage("urn:x-cast:zoff.me", {type: "loadVideo", videoId: video_id, seekTo: _seekTo})
                    castSession.sendMessage("urn:x-cast:zoff.me", {type: "nextVideo", videoId: full_playlist[0].id, title: full_playlist[0].title})
                    hide_native(1);
                    break;
                case cast.framework.SessionState.SESSION_ENDED:
                    chromecastAvailable = false;
                    hide_native(0);
                    // Update locally as necessary
                    break;
            }
    });

    if(cast_ready_connect){
        $(".castButton-unactive").css("display", "block");
    }

    var cast_state = cast.framework.CastContext.getInstance();
    cast_state.addEventListener(cast.framework.CastContextEventType.CAST_STATE_CHANGED, function(event){
        if(event.castState == "NOT_CONNECTED"){
            $(".castButton-unactive").css("display", "block");
            cast_ready_connect = true;
        } else if(event.castState == "NO_DEVICES_AVAILABLE"){
            $(".castButton-unactive").css("display", "none");
            cast_ready_connect = false;
        }
    });
};

function hide_native(way){
    $(".castButton-unactive").toggleClass("hide");
    $(".castButton-active").toggleClass("hide");
    if(way == 1){
        $("#duration").toggleClass("hide");
        $("#fullscreen").toggleClass("hide");
        try{
            Player.player.stopVideo();
        } catch(e){}
        Player.stopInterval = true;
        $("#player_overlay").removeClass("hide");
        $("#player_overlay").css("display", "block");
        if(Helper.mobilecheck()){
            if($("#pause").hasClass("hide")){
                $("#play").toggleClass("hide");
                $("#pause").toggleClass("hide");
            } else if($("#play").hasClass("hide")){
                $("#play").toggleClass("hide");
                $("#pause").toggleClass("hide");
            }
        } else {
            $("#volume").slider("value", 100);
            $("#player_overlay").width($("#player").width() + 1);
        }
        $("#player_overlay").css("background", "url(https://i.ytimg.com/vi/" + video_id + "/maxresdefault.jpg)");
        $("#player_overlay").css("background-position", "center");
        $("#player_overlay").css("background-size", "100%");
        $("#player_overlay").css("background-color", "black");
        $("#player_overlay").css("background-repeat", "no-repeat");
        $("#player_overlay").css("height", "calc(100% - 32px)");
        $("#playing_on").css("display", "flex");
        $("#chromecast_text").html("Playing on<br>" + castSession.La.friendlyName);
        Player.player.setVolume(100);

        $("#player_overlay_text").toggleClass("hide");
    } else if(way == 0){
        $("#duration").toggleClass("hide");
        $("#fullscreen").toggleClass("hide");
        Player.player.playVideo();
        Player.stopInterval = false;
				duration = Player.player.getDuration();
        Player.durationSetter();
        if(!Helper.mobilecheck()){
            Player.player.setVolume(Crypt.get_volume());
            $("#volume").slider("value", Crypt.get_volume());
        }
        $("#player_overlay").addClass("hide");
        $("#player_overlay_text").toggleClass("hide");
        $("#chromecast_text").html("");
        $("#playing_on").css("display", "none");
		if(!offline){
	       socket.emit('pos', {channel: chan.toLowerCase()});
		} else {
			Player.loadVideoById(video_id);
		}
    }
}

function chromecastListener(evt, data){
    var json_parsed = JSON.parse(data);
    switch(json_parsed.type){
        case -1:
			if(offline){
				Player.playNext();
			} else {
        	       socket.emit("end", {id: json_parsed.videoId, channel: chan.toLowerCase()});
			}
            break;
		case 0:
			if(offline){
				Player.playNext();
			} else {
				socket.emit("skip", {error: json_parsed.data_code, id: json_parsed.videoId, pass: adminpass, channel: chan.toLowerCase});
			}
			break;
    }
}

function setup_no_connection_listener(){
    socket.on('connect_failed', function(){
        Helper.log('Connection Failed');
        if(!connect_error){
            connect_error = true;
            Materialize.toast("Error connecting to server, please wait..", 100000000, "red lighten connect_error");
        }
    });

    socket.on("connect_error", function(){
        Helper.log("Connection Failed.");
        if(!connect_error){
            connect_error = true;
            Materialize.toast("Error connecting to server, please wait..", 100000000, "red lighten connect_error");
        }
    });
}

function setup_youtube_listener(){
	socket.on("np", Player.youtube_listener);
}

function get_list_listener(){
	socket.on("get_list", function(){
    	socket.emit('list', chan.toLowerCase());
	});
}

function setup_suggested_listener(){
	socket.on("suggested", function(params){
		var single = true;
		if(params.id === undefined)
			single = false;
			Suggestions.catchUserSuggests(params, single);
	});
}

function setup_viewers_listener(){
	socket.on("viewers", function(view){
		viewers = view;

		if(song_title !== undefined)
			Player.getTitle(song_title, viewers);
	});
}

function setup_admin_listener(){
	socket.on("toast", Admin.toast);
	socket.on("pw", Admin.pw);
	socket.on("conf", Admin.conf);
}

function setup_chat_listener(){
	socket.on("chat.all", Chat.allchat);
	socket.on("chat", Chat.channelchat);
}

function setup_list_listener(){
	socket.on("channel", List.channel_function);
}

function setup_playlist_listener(){
    Helper.log("Setting up playlist_listener");
	socket.on('playlists', Frontpage.frontpage_function);
}

function setup_host_initialization(){
	socket.on("id", Hostcontroller.host_listener);
}

function setup_host_listener(id){
	socket.on(id, Hostcontroller.host_on_action);
}

function enable_debug(){
	localStorage.debug = true;
}

function disable_debug(){
	localStorage.debug = false;
}

function embed_code(autoplay, width, height, color){
    return '<embed src="https://zoff.me/_embed#' + chan.toLowerCase() + '&' + color + autoplay + '" width="' + width + 'px" height="' + height + 'px">';
}

function set_title_width(start){
    if($(window).width() > 760){
        var add_width = $(".brand-logo").outerWidth()
        if(start){
            add_width = $(window).width()*0.15;
        }
        var test_against_width = $(window).width() - $(".control-list").width() - add_width - 66;
            title_width = test_against_width;
        $(".title-container").width(title_width);
    } else {
        $(".title-container").width("100%");
    }
}

function randomString(length){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.-_";
    for(var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

function change_offline(enabled, already_offline){
    Crypt.set_offline(enabled);
    offline = enabled;
		socket.emit("offline", enabled);
    $("#offline-mode").tooltip('remove');
    if(enabled){
			if(list_html){
				list_html = $("<div>" + list_html + "</div>");
				//list_html.find(".card-content").css("display", "flex");
        //list_html.find(".card-content").css("height", "100%");
        //list_html.find(".list-title").css("align-self", "center");
        //list_html.find(".vote-span").addClass("hide");
				list_html.find(".list-remove").removeClass("hide");
				list_html = list_html.html();
			}
        //$(".card-content").css("display", "flex");
        //$(".card-content").css("height", "100%");
        //$(".list-title").css("align-self", "center");
				$(".list-remove").removeClass("hide");
        //$(".vote-span").addClass("hide");
        $("#viewers").addClass("hide");
        $("#offline-mode").removeClass("waves-cyan");
        $("#offline-mode").addClass("cyan");
        $("#offline-mode").tooltip({
          delay: 5,
          position: "bottom",
          tooltip: "Disable private mode"
        });
		if(full_playlist != undefined && !already_offline){
			for(var x = 0; x < full_playlist.length; x++){
				full_playlist[x].votes = 0;
			}
			List.sortList();
			List.populate_list(full_playlist);
		}
    } else {
		if(list_html){
			list_html = $("<div>" + list_html + "</div>");
			//list_html.find(".card-content").css("display", "block");
            //list_html.find(".card-content").css("height", "initial");
            //list_html.find(".list-title").css("align-self", "center");
            //list_html.find(".vote-span").removeClass("hide");
    		if(hasadmin && w_p){
    			list_html.find(".list-remove").addClass("hide");
    		}
			list_html = list_html.html();
		}
        //$(".card-content").css("display", "block");
        //$(".card-content").css("height", "initial");
        //$(".list-title").css("align-self", "center");
        //$(".vote-span").removeClass("hide");
        $("#viewers").removeClass("hide");
    	if(hasadmin && w_p){
    		$(".list-remove").addClass("hide");
    	}
        $("#offline-mode").addClass("waves-cyan");
        $("#offline-mode").removeClass("cyan");
        $("#offline-mode").tooltip({
          delay: 5,
          position: "bottom",
          tooltip: "Enable private mode"
        });
		if(window.location.pathname != "/"){
			socket.emit("pos");
			socket.emit('list', chan.toLowerCase());
		}
    }
}

function spotify_is_authenticated(bool){
    if(bool){
        Helper.log("------------------------");
        Helper.log("Spotify is authenticated");
        Helper.log("access_token: " + access_token_data.access_token);
        Helper.log("token_type:" + access_token_data.token_type);
        Helper.log("expires_in: " + access_token_data.expires_in);
        Helper.log("------------------------");
        $(".spotify_authenticated").css("display", "block");
        $(".spotify_unauthenticated").css("display", "none");
    } else {
        Helper.log("----------------------------");
        Helper.log("Spotify is not authenticated");
        Helper.log("----------------------------");
        $(".spotify_authenticated").css("display", "none");
        $(".spotify_unauthenticated").css("display", "block");
    }
}

window.enable_debug = enable_debug;
window.disable_debug = disable_debug;

$(document).keyup(function(e) {
  	if(event.keyCode == 27){
    	$("#results").html("");
    	if($("#search-wrapper").length != 0 && !Helper.contains($("#search-wrapper").attr("class").split(" "), "hide"))
      		$("#search-wrapper").toggleClass("hide");
    	if($("#song-title").length != 0 && Helper.contains($("#song-title").attr("class").split(" "), "hide"))
      		$("#song-title").toggleClass("hide");

    	if($("#search-btn i").html() == "close")
    	{
      		//$("#search-btn i").html("mdi-navigation-close");
      		$("#search-btn i").html("search");
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
      		//$("#search-btn i").html("mdi-navigation-close");
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
})

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
	socket.emit("suggest_thumbnail", {channel: chan, thumbnail: $("#chan_thumbnail").val(), adminpass: Crypt.crypt_pass(Crypt.get_pass(chan.toLowerCase()))});
    $("#chan_thumbnail").val("");
});

$(document).on("submit", "#description_form", function(e){
    e.preventDefault();
    socket.emit("suggest_description", {channel: chan, description: $("#chan_description").val(), adminpass: Crypt.crypt_pass(Crypt.get_pass(chan.toLowerCase()))});
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

$(document).on("click", ".castButton-unactive", function(e){
    $(".castButton").trigger("click");
});

$(document).on("click", ".castButton-active", function(e){
    e.preventDefault();
    var castSession = cast.framework.CastContext.getInstance().getCurrentSession();
    // End the session and pass 'true' to indicate
    // that receiver application should be stopped.
    castSession.endSession(true);
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
    } catch(error){}
    socket.removeEventListener("np");
  	socket.removeEventListener("id");
	socket.removeEventListener(id);
  	$("#alreadychannel").remove();
  	Player.player = "";
  	document.title = "Zoff";
  	$("#closePlayer").remove();
});

$(document).on("click", ".prev_page", function(e){
    e.preventDefault();
    List.dynamicContentPage(-1);
});

$(document).on("click", ".modal-close", function(e){
    e.preventDefault();
});

$(document).on("click", ".not-exported-container .not-exported-element #extra-export-container-text .extra-add-text", function(){
    this.select();
})

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

$(document).on('click', '#toast-container', function(){
    $(".toast").fadeOut(function(){
        $(".toast").remove();
    });
});

$(document).on('click', "#aprilfools", function(){
  $(".mega").css("-webkit-transform", "rotate(0deg)");
  $(".mega").css("-moz-transform", "rotate(0deg)");
});

$(document).on('keyup mouseup', '#width_embed', function(){
    var that = $(this);
    embed_width = that.val();
    $("#embed-area").val(embed_code(embed_autoplay, embed_width, embed_height, color));
});

$(document).on('keyup mouseup', '#height_embed', function(){
    var that = $(this);
    embed_height = that.val();
    $("#embed-area").val(embed_code(embed_autoplay, embed_width, embed_height, color));
});

$(document).on('input', '#color_embed', function(){
    var that = $(this);
    color = that.val().substring(1);
    $("#embed-area").val(embed_code(embed_autoplay, embed_width, embed_height, color));
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
/*
$(document).off("keyup", "keyup.autocomplete", function(e){
    if(e.keyCode == 13){
        e.preventDefault();
        console.log(e.keyCode);
    	console.log($(this).val());
    }
});

$(document).off("keydown", "keydown.autocomplete", function(e){
    if(e.keyCode == 13){
        e.preventDefault();
        console.log(e.keyCode);
    	console.log($(this).val());
    }
});*/

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
 	//Hostcontroller.change_enabled(document.getElementsByName("remote_switch")[0].checked);
    offline = document.getElementsByName("offline_switch")[0].checked;
    change_offline(offline, !offline);
});

$(document).on("change", 'input[class=conf]', function()
{
    Admin.save();
});

$("#clickme").click(function(){
	Player.playVideo();
});

$(document).on("click", "#listExport", function(e){
    e.preventDefault();
    Helper.log(full_playlist);
    if(!youtube_authenticated){
        var nonce = randomString(29);
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
    var nonce = randomString(29);
    window.callback = function(data) {
        access_token_data = data;
        if(access_token_data.state == nonce){
            spotify_authenticated = true;
            spotify_is_authenticated(true);
            setTimeout(function(){
                spotify_authenticated = false;
                access_token_data = {};
                spotify_is_authenticated(false);
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
    } else {
        before_toast();
        Materialize.toast("It seems you've entered a invalid url.", 4000);
    }
    document.getElementById("import").value = "";
});

$(document).on("submit", "#listImportSpotify", function(e){
    e.preventDefault();
    if(spotify_authenticated && $("#import_spotify").val() !== ""){
        //Helper.log("Import this playlist: " + document.getElementById("import_spotify").value);
        var url = $("#import_spotify").val().split("https://open.spotify.com/user/");
        if(url.length == 2) {
            url = url[1].split("/");
            var user = url[0];
            var playlist_id = url[2];

            document.getElementById("import_spotify").disabled = true;
            $("#import_spotify").addClass("hide");
            $("#playlist_loader_spotify").removeClass("hide");

            Search.importSpotifyPlaylist('https://api.spotify.com/v1/users/' + user + '/playlists/' + playlist_id + '/tracks');
        } else {
            before_toast();
            Materialize.toast("It seems you've entered a invalid url.", 4000);
        }
    }
    document.getElementById("import_spotify").value = "";
});

$(window).focus(function(){
    $("#favicon").attr("href", "public/images/favicon.png");
    unseen = false;
});

$(document).on("change", "#autoplay", function() {
    if(this.checked) embed_autoplay = "&autoplay";
    else embed_autoplay = "";
	$("#embed-area").val(embed_code(embed_autoplay, embed_width, embed_height, color));
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
    //clearInterval(blink_interval);
    //blink_interval_exists = false;
    Chat.channel_received = 0;
    Chat.all_received = 0;
    if(!$("span.badge.new.white").hasClass("hide")){
        $("span.badge.new.white").addClass("hide");
    }
    unseen = false;
    $("#favicon").attr("href", "public/images/favicon.png");
});

function searchTimeout(event) {
	search_input = $(".search_input").val();

	code = event.keyCode || event.which;

	if (code != 40 && code != 38 && code != 13 && code != 39 && code != 37 &&
		code != 17 && code != 16 && code != 225 && code != 18 && code != 27) {
		clearTimeout(timeout_search);
		if(search_input.length < 3){$("#results").html("");}
		if(code == 13){
		 	Search.search(search_input);
		}else{
			timeout_search = setTimeout(function(){
				Search.search(search_input);
			}, 1000);
			/*i = 0;
			timer=100;*/
		}
	}
}

/*if(/iPad|iPhone|iPod/.test(navigator.userAgent)){
	$(document).on('touchend', '.search_input', function(event) {
	      searchTimeout(event);
	});
} else {*/
	$(document).on('keyup', ".search_input", function(event) {
	      searchTimeout(event);
	});
//}

$(document).on("click", ".chat-tab", function(){
    $("#text-chat-input").focus();
});


$(document).on("click", "#skip", function(e){
		e.preventDefault();
  	List.skip();
});

$(document).on("click", "#chan", function(e){
	e.preventDefault();
  	List.show();
});

$(document).on("submit", "#adminForm", function(e){
	e.preventDefault();
  	Admin.pass_save();
});

$(document).on("click", ".chat-link", function(e){
	chat_active = true;
	unseen = false;
	chat_unseen = false;
	$(".chat-link").attr("style", "color: white !important;");
	blinking = false;
	$("#favicon").attr("href", "public/images/favicon.png");
	$("#chatPlaylist").css("display", "block");
	$("#wrapper").css("display", "none");
	$("#suggestions").css("display", "none");
	$("#text-chat-input").focus();
    $("#pageButtons").css("display", "none");
});

$(document).on("click", ".playlist-link", function(e){
	chat_active = false;
	$("#chatPlaylist").css("display", "none");
	$("#wrapper").css("display", "block");
	$("#suggestions").css("display", "none");
    $("#pageButtons").css("display", "flex");
});

$(document).on("click", ".suggested-link", function(e){
	chat_active = false;
	$("#chatPlaylist").css("display", "none");
	$("#wrapper").css("display", "none");
	$("#suggestions").css("display", "block");
    $("#pageButtons").css("display", "none");
});

$(document).on("click", ".import-spotify-auth", function(e){
    e.preventDefault();
    var nonce = randomString(29);
    window.callback = function(data) {
        access_token_data = data;
        if(access_token_data.state == nonce){
            spotify_authenticated = true;
            spotify_is_authenticated(true);
            setTimeout(function(){
                spotify_authenticated = false;
                access_token_data = {};
                spotify_is_authenticated(false);
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
            $($("#wrapper").children()[List.page + temp_fit - 1]).css("display", "block");
        } else if(List.can_fit > temp_fit){
            $($("#wrapper").children()[List.page + temp_fit]).css("display", "none");
        }
        List.can_fit = temp_fit;
        List.element_height = (($("#wrapper").height()) / List.can_fit)-5.3;
        $(".list-song").css("height", List.element_height + "px");
        $("#player_overlay").width($("#player").width()+1);
        set_title_width();
    }
})

$(document).on( "click", ".result-object", function(e){
	var $html  = $(e.target);
	var substr = $html.prop('outerHTML').substring(0,4);
	if(substr != "<i c"){
		var id 		= $(this).attr("data-video-id");
		var title 	= $(this).attr("data-video-title");
		var length 	= $(this).attr("data-video-length");

		Search.submitAndClose(id, title, length);
	}
});

$(document).on( "click", "#add-many", function(e){
	var id 		= $(this).attr("data-video-id");
	var title 	= $(this).attr("data-video-title");
	var length 	= $(this).attr("data-video-length");

	Search.submit(id, title, length);
});

$(document).on( "click", ".vote-container", function(e){
	var id = $(this).attr("data-video-id");
	List.vote(id, "pos");
});

$(document).on( "click", ".delete_button", function(e){
	var id = $(this).attr("data-video-id");
	List.vote(id, "del");
});

$(document).on( "click", ".add-suggested", function(e){
	var id 		= $(this).attr("data-video-id");
	var title 	= $(this).attr("data-video-title");
	var length 	= $(this).attr("data-video-length");

	Search.submit(id, title, length);
	$("#suggested-" + id).remove();
});

$(document).on( "click", ".del_suggested", function(e){
	var id = $(this).attr("data-video-id");

	$("#suggested-" + id).remove();
});

$(document).on( "click", ".del_user_suggested", function(e){
	var id = $(this).attr("data-video-id");
	$("#suggested-" + id).remove();
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
	onepage_load();
});

$(document).on("click", "#player_bottom_overlay", function(){
	Frontpage.to_channel(chan.toLowerCase(), false);
});

/*$(document).on("mousemove", "#playlist", function(e)
{
    var y = e.pageY - this.offsetTop;
	if(((y <= 80 && y >= 48)) && $("#wrapper").scrollTop() > 0){
		$("#top-button").removeClass("hide");
		Helper.addClass("#bottom-button", "hide");
	}else if(y >= $("#playlist").height() - 59 && y <= $("#playlist").height() - 32 && $("#wrapper").scrollTop() < $("#wrapper")[0].scrollHeight - $("#wrapper").height() - 1){
		$("#bottom-button").removeClass("hide");
		Helper.addClass("#top-button", "hide");
	}else{
		Helper.addClass("#bottom-button", "hide");
		Helper.addClass("#top-button", "hide");
	}
});

$(document).on("mouseleave", "#playlist", function(){
	Helper.addClass("#bottom-button", "hide");
	Helper.addClass("#top-button", "hide");
});

$(document).on("click", "#top-button", function(){
	List.scrollTop();
});

$(document).on("click", "#bottom-button", function(){
	List.scrollBottom();
});*/


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
            } else {
                $("#find_div").toggleClass("hide");
                $("#find_input").val("");
                $("#find_input").blur();
                $(".highlight").removeClass("highlight");
                found_array = [];
                found_array_index = 0;
            }
        } else {
            find_start = false;
        }
    }
});

$(document).keyup(function(event){
    if((event.keyCode == 91 || event.keyCode == 17) && !find_started){
        find_start = false;
    }
});

$(document).on("submit", "#find_form", function(e){
    e.preventDefault();
    if(found_array.length == 0){
        var that = this;
        found_array_index = 0;
        /*var result = $.grep(full_playlist, function(v,i) {
            return v.title.toLowerCase().indexOf(that.find_value.value.toLowerCase()) >= 0;
        });*/
        found_array = $.map(full_playlist, function(obj, index) {
            if(obj.title.toLowerCase().indexOf(that.find_value.value.toLowerCase()) >= 0) {
                return index;
            }
        });
    } else {
        found_array_index = found_array_index + 1;
        if(found_array.length - 1 < found_array_index){
            found_array_index = 0;
        }
    }
    if(found_array.length > 0 && found_array[found_array_index] != full_playlist.length - 1){
        $(".highlight").removeClass("highlight");
        var jump_to_page = Math.floor(found_array[found_array_index] / List.can_fit);
        $($("#wrapper").children()[found_array[found_array_index]]).addClass("highlight");
        List.dynamicContentPageJumpTo(jump_to_page);
    } else {
        Helper.log("none found");
    }
});


function share_link_modifier_channel(){
	$("#facebook-code-link").attr("href", "https://www.facebook.com/sharer/sharer.php?u=https://zoff.me/" + chan.toLowerCase());
    $("#facebook-code-link").attr("onclick", "window.open('https://www.facebook.com/sharer/sharer.php?u=https://zoff.me/" + chan.toLowerCase() + "', 'Share Playlist','width=600,height=300'); return false;");
    $("#twitter-code-link").attr("href", "https://twitter.com/intent/tweet?url=https://zoff.me/" + chan.toLowerCase() + "&amp;text=Check%20out%20this%20playlist%20" + chan.toLowerCase() + "%20on%20Zoff!&amp;via=zoffmusic");
    $("#twitter-code-link").attr("onclick", "window.open('https://twitter.com/intent/tweet?url=https://zoff.me/" + chan.toLowerCase() + "/&amp;text=Check%20out%20this%20playlist%20" + chan.toLowerCase() + "%20on%20Zoff!&amp;via=zoffmusic','Share Playlist','width=600,height=300'); return false;");
    $("#qr-code-link").attr("href", "//chart.googleapis.com/chart?chs=500x500&cht=qr&chl=https://zoff.me/" + chan.toLowerCase() + "&choe=UTF-8&chld=L%7C1");
    $("#qr-code-image-link").attr("src", "//chart.googleapis.com/chart?chs=150x150&cht=qr&chl=https://zoff.me/" + chan.toLowerCase() + "&choe=UTF-8&chld=L%7C1");
}

function before_toast(){
    $("#toast-container").remove();
}

function onepage_load(){

	var url_split = window.location.href.split("/");

	if(url_split[3].substr(0,1) != "#!" && url_split[3] !== "" && !(url_split.length == 5 && url_split[4].substr(0,1) == "#")){

			socket.emit("change_channel");
	    Admin.beginning = true;

	    chan = url_split[3].replace("#", "");
	    $("#chan").html(Helper.upperFirst(chan));

	    w_p = true;
	    socket.emit("list", chan.toLowerCase());
	}else if(url_split[3] === ""){
        clearTimeout(width_timeout);
		if(fireplace_initiated){
        fireplace_initiated = false;
        Player.fireplace.destroy();
        $("#fireplace_player").css("display", "none");
		}
		$("#channel-load").css("display", "block");
		window.scrollTo(0, 0);

		Player.stopInterval = true;
		Admin.display_logged_out();
		Admin.beginning 	 = true;
		began 				 = false;
		durationBegun  		 = false;
		$("#embed-button").css("display", "none");

		$.ajax({
		    url: "public/php/frontpage.php",
		    success: function(e){

		    	if(Helper.mobilecheck()) {
                    Helper.log("Removing all listeners");
		    		socket.removeAllListeners();
		    		socket.disconnect();
		    	} else {
			    	socket.removeEventListener("chat.all");
			    	socket.removeEventListener("chat");
			    	socket.removeEventListener("conf");
			    	socket.removeEventListener("pw");
			    	socket.removeEventListener("toast");
			    	//socket.removeEventListener("id");
			    	socket.removeEventListener("channel");
			    	//socket.removeEventListener(id);
			    }
		    	document.getElementById("volume-button").removeEventListener("click", Playercontrols.mute_video);
    			document.getElementById("playpause").removeEventListener("click", Playercontrols.play_pause);
    			document.getElementById("fullscreen").removeEventListener("click", Playercontrols.fullscreen);

			    if(Helper.mobilecheck()) {
			    	video_id   = "";
			    	song_title = "";
		    	}

		    	$("meta[name=theme-color]").attr("content", "#2D2D2D");

		    	if(!Helper.mobilecheck()){
                    $(".video-container").resizable("destroy");
		    		$("main").append("<a id='closePlayer' title='Close Player'>X</a>");
		    		$("#playbar").remove();
		    		$("#playlist").remove();
		    		$(".ui-resizable-handle").remove();
		    		$("#main_components").remove();
		    		$("#player").addClass("player_bottom");
		    		$("#main-row").addClass("frontpage_modified_heights");
		    		$("#player").css("opacity", "1");
		    		$("#video-container").removeClass("no-opacity");
		    		$("#main-row").prepend("<div id='player_bottom_overlay' title='To Channel' class='player player_bottom'></div>");
		    	} else {
                    try{
                    	Player.player.destroy();
                    } catch(error){
                        //No player to destroy
                    }
                    Player.player = "";
		    		document.title = "Zoff";
		    	}

				var response = $("<div>" + e + "</div>");

				$(".drag-target").remove();
				$("#sidenav-overlay").remove();
		    	$("main").attr("class", "center-align container");
		    	$("body").attr("id", "");
		    	$("body").attr("style", "");
                $("header").html($(response.find("header")).html());
                $($(response.find(".section.mega"))).insertAfter("header");
                $($(response.find(".section.mobile-search"))).insertAfter(".mega");
                if(Helper.mobilecheck()) $("main").html($(response.find("main")).html());
                else $("main").append($(response.find("#main_section_frontpage")).wrap("<div>").parent().html());
		      	$(".page-footer").removeClass("padding-bottom-extra");
		      	$(".page-footer").removeClass("padding-bottom-novideo");
		      	$("#favicon").attr("href", "public/images/favicon.png");

                Helper.log(socket);
		      	if($("#alreadyfp").length == 1){
		      		initfp();
		      	}else {
					fromChannel = true;
					frontpage 	= true;
		            initfp();
		        }

		      	if($("#alreadychannel").length === 0){
		      		$("head").append("<div id='alreadychannel'></div");
		      	}
		      	$("#channel-load").css("display", "none");

		    }
		});
	}
}
