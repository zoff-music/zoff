var list_html;
var git_info;

/*
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
}
*/

var Nochan = {

  populate_channels: function(lists)
  {
      var output = "";
      var num = 0;
      lists.sort(Nochan.sortFunction);

      pre_card = $(list_html);

      for(x in lists)
      {

          var chan = lists[x][3];
          if(num<20)
          {
            var id = lists[x][1];
            var viewers = lists[x][0];
            var img = "background-image:url('https://img.youtube.com/vi/"+id+"/hqdefault.jpg');";
            var song_count = lists[x][4];

            //$("#channels").append(list_html);

            var card = pre_card;
            card.find(".chan-name").text(chan);
            card.find(".chan-name").attr("title", chan);
            card.find(".chan-views").text(viewers);
            card.find(".chan-songs").text(song_count);
            card.find(".chan-bg").attr("style", img);
            card.find(".chan-link").attr("href", chan);

            $("#channels").append(card.html());

            //$("#channels").append(card);
            //console.log(chan);
          }
          output+="<option value='"+chan+"'> ";
          num++;
          //if(num>19)break;
      }
      document.getElementById("preloader").style.display = "none";
      document.getElementById("searches").innerHTML = output;
      //Materialize.fadeInImage('#channels');
      $("#channels").fadeIn(800);
      $("#search").focus();
  },

  sortFunction: function(a, b) {
    var o1 = a[0];
    var o2 = b[0];

    var p1 = a[4];
    var p2 = b[4];

    if (o1 < o2) return 1;
    if (o1 > o2) return -1;
    if (p1 < p2) return 1;
    if (p1 > p2) return -1;
    return 0;
  },



}



String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

$(document).ready(function (){

    //Materialize.toast("<a href='/remote' style='color:white;'>Try out our new feature, remote!</a>", 8000)

    list_html = $("#channels").html();
    $("#channels").empty();

    var socket = io.connect('//'+window.location.hostname+':3000');
    socket.emit('frontpage_lists');
    socket.on('playlists', function(msg){
        Nochan.populate_channels(msg);
    })



    var pad = 0;
    document.getElementById("zicon").addEventListener("click", function(){
        pad+=10;
        document.getElementById("zicon").style.paddingLeft = pad+"%";
        if(pad >= 100)
            window.location.href = 'https://www.youtube.com/v/0IGsNdVoEh0?autoplay=1&showinfo=0&autohide=1';
    });

    //Not in use since the app is outdated

    /*if(navigator.userAgent.toLowerCase().indexOf("android") > -1){
        //console.log("android");
        var ca = document.cookie.split(';');
        if(getCookie("show_prompt") == ""){
            var r = confirm("Do you want to download the native app for this webpage?");
            if(r)
                window.location.href = 'https://play.google.com/store/apps/details?id=no.lqasse.zoff';
            else
            {
                var d = new Date();
                d.setTime(d.getTime() + (10*24*60*60*1000));
                var expires = "expires="+d.toUTCString();
                document.cookie = "show_prompt=false;"+expires;
            }
        }
     }*/

     git_info = $.ajax({ type: "GET",
		     url: "https://api.github.com/repos/zoff-music/zoff/commits",
		     async: false
	   }).responseText;

     git_info = $.parseJSON(git_info);
     $("#latest-commit").html("Latest Commit: <br>"
 				+ git_info[0].commit.author.date.substring(0,10)
 				+ ": " + git_info[0].committer.login
 				+ "<br><a href='"+git_info[0].html_url+"'>"
 				+ git_info[0].sha.substring(0,10) + "</a>: "
 				+ git_info[0].commit.message+"<br");

});
