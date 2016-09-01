window.addEventListener("load", function(){
  var client_id = "b934ecdd173648f5bcd38738af529d58";
  var redirect  = window.location.protocol + "//" + window.location.hostname + "/spotify_callback";
  var response  = "token";
  var scope     = "playlist-read-private playlist-read-collaborative user-read-private";
  if(window.location.hash.length <= 0){
    window.location.href = "https://accounts.spotify.com/authorize?client_id=" + client_id + "&scope=" + scope + "&show_dialog=false&response_type=" + response + "&redirect_uri=" + redirect;
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
