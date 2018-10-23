window.addEventListener("load", function() {
    var query = getQueryHash(window.location.hash);
    var redirect  = window.location.protocol + "//" + window.location.hostname + "/api/oauth";
    var client_id;
    var response;
    var scope;

    if(query.spotify) {
        client_id = "b934ecdd173648f5bcd38738af529d58";
        response  = "token";
        scope     = "playlist-read-private ugc-image-upload playlist-read-collaborative user-read-private playlist-modify-public playlist-modify-private";
        state     = query.nonce;
        window.location.href = "https://accounts.spotify.com/authorize?client_id=" + client_id + "&scope=" + scope + "&show_dialog=false&response_type=" + response + "&redirect_uri=" + redirect + "&state=" + state;

    } else if (query.youtube) {
        client_id = "944988770273-butsmlr1aotlsskk8lmgvh0etqqekigf.apps.googleusercontent.com";
        response  = "token";
        scope     = "https://www.googleapis.com/auth/youtube";
        state     = query.nonce;

        //window.opener.callback(query);
        window.location.href = "https://accounts.google.com/o/oauth2/v2/auth?client_id=" + client_id + "&response_type=" + response + "&state=" + state + "&redirect_uri=" + redirect + "&scope=" + scope;
    } else if(query.soundcloud) {
        /*
        SC.initialize({
          client_id: api_key.soundcloud,
          redirect_uri: 'https://zoff.me/api/oauth'
        });

        // initiate auth popup
        console.log("asd ok", api_key.soundcloud);
        SC.connect().then(function() {
          return SC.get('/me');
        }).then(function(me) {
            console.log(me);
          //alert('Hello, ' + me.username);
      }).catch(function(e) {
          console.log(e);
      });*/

      var redirect_uri = encodeURIComponent("https://zoff.me/api/oauth");
      var response_type = "code";
      var scope = "non-expiring";
      var state = query.nonce;
      var url = "https://soundcloud.com/connect?client_id=" + api_key.soundcloud + "&redirect_uri=" + redirect_uri + "&state=" + state + "&display=page&response_type=code&scope=" + scope;
      //console.log(url);
      window.location.href = url;
    } else {
        var query_parameters;
        if(window.location.search.length > 0) {
            query_parameters = getQueryHash(window.location.search);
        } else {
            query_parameters = getQueryHash(window.location.hash);
        }
        try {
            window.opener.callback(query_parameters);
        } catch(e) {
            window.setTimeout(window.opener.SC_player.connectCallback, 1);
        }
    }
});

function getQueryHash(url) {
    if(window.location.search.length > 0) {
        if(url.substring(url.length - 1) == "#") {
            url = url.substring(0, url.length - 1);
        }
        var temp_arr = url.substring(1).split("&");
        var done_obj = {};
        var splitted;
        for(var i in temp_arr) {
            splitted = temp_arr[i].split("=");
            if(splitted.length == 2) {
                done_obj[splitted[0]] = splitted[1];
            }
        }
        return done_obj;
    } else {
        var temp_arr = url.substring(1).split("&");
        var done_obj = {};
        var splitted;
        for(var i in temp_arr) {
            splitted = temp_arr[i].split("=");
            if(splitted.length == 2) {
                done_obj[splitted[0]] = splitted[1];
            }
        }
        return done_obj;
    }
}
