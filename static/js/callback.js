window.addEventListener("load", function(){
  var query = getQueryHash(window.location.hash);
  var redirect  = window.location.protocol + "//" + window.location.hostname + "/o_callback";
  var client_id;
  var response;
  var scope;

  if(query.spotify){
    client_id = "b934ecdd173648f5bcd38738af529d58";
    response  = "token";
    scope     = "playlist-read-private playlist-read-collaborative user-read-private";
    state     = query.nonce;
    window.location.href = "https://accounts.spotify.com/authorize?client_id=" + client_id + "&scope=" + scope + "&show_dialog=false&response_type=" + response + "&redirect_uri=" + redirect + "&state=" + state;

  } else if (query.youtube) {
    client_id = "944988770273-butsmlr1aotlsskk8lmgvh0etqqekigf.apps.googleusercontent.com";
    response  = "token";
    scope     = "https://www.googleapis.com/auth/youtube";
    state     = query.nonce;

    //window.opener.callback(query);
    window.location.href = "https://accounts.google.com/o/oauth2/v2/auth?client_id=" + client_id + "&response_type=" + response + "&state=" + state + "&redirect_uri=" + redirect + "&scope=" + scope;
  } else {
    var query_parameters = getQueryHash(window.location.hash);
    window.opener.callback(query_parameters);
  }
});

function getQueryHash(url){
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
