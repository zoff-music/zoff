//script for frontpage

var channel_list;
var git_info;
var frontpage = true;
var socket;

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

window.mobilecheck = function() {
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check; 
};

var Nochan = {

  blob_list: [],

  winter: false,

  times_rotated: 0,

  populate_channels: function(lists)
  {
      var output = "";
      var num = 0;
      var pinned;
      if(lists[0][5] == 1){
        pinned = lists.shift();
      }
      lists.sort(Nochan.sortFunction);
      if(pinned !== undefined){
        lists.unshift(pinned);
      }
      pre_card = $(channel_list);

      if(!window.mobilecheck())
        Nochan.add_backdrop(lists, 0);

      for(x in lists)
      {

          var chan = lists[x][3];
          if(num<12)
          {
            var id = lists[x][1];
            var viewers = lists[x][0];
            var img = "background-image:url('https://img.youtube.com/vi/"+id+"/hqdefault.jpg');";
            var song_count = lists[x][4];

            //$("#channels").append(channel_list);

            var card = pre_card;
            if(lists[x][5] == 1) 
            {
              card.find(".pin").attr("style", "display:block;");
              card.find(".card").attr("title", "Pinned!");
            }
            else 
            {
              card.find(".pin").attr("style", "display:none;");
              card.find(".card").attr("title", "");
            }
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
      $("#searchFrontpage").focus();
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

  getCookie: function(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
  },

  add_backdrop: function(list, i) {
    if(i >= list.length || i >= 8) i = 0;

    var id = list[i][1];

    if(Nochan.blob_list[i] !== undefined){
      //$(".room-namer").css("opacity", 0);
      setTimeout(function(){ 
        if(frontpage){
          $("#mega-background").css("background", "url(data:image/png;base64,"+Nochan.blob_list[i]+")");
          $("#mega-background").css("background-size" , "200%");
          $("#mega-background").css("opacity", 1);
          $("#searchFrontpage").attr("placeholder", list[i][3]);
          //$(".room-namer").css("opacity", 1);
        }
      },500); 
    }else{

      var img = new Image();
      img.src = "/static/images/thumbnails/"+id+".jpg";

      img.onerror = function(){ // Failed to load
          $.ajax({
            type: "POST",
            data: {id:id},
            url: "/php/imageblob.php",
            success: function(data){
                Nochan.blob_list.push(data);
               //data will contain the vote count echoed by the controller i.e.
                //$(".room-namer").css("opacity", 0);
                setTimeout(function(){ 
                  $("#mega-background").css("background", "url(data:image/png;base64,"+data+")");
                  $("#mega-background").css("background-size" , "200%");
                  $("#mega-background").css("opacity", 1);
                  $("#searchFrontpage").attr("placeholder", list[i][3]);
                  //$(".room-namer").css("opacity", 1);
                },500); 
              //then append the result where ever you want like
              //$("span#votes_number").html(data); //data will be containing the vote count which you have echoed from the controller

              }
          });
      };
      img.onload = function(){ // Loaded successfully
          $("#mega-background").css("background", "url("+img.src+")");
          $("#mega-background").css("background-size" , "200%");
          $("#mega-background").css("opacity", 1);
          $("#searchFrontpage").attr("placeholder", list[i][3]);
      };
   
    }
    setTimeout(function(){
      if(Nochan.times_rotated == 50 && frontpage){
        Nochan.times_rotated = 0;
        i = 0;
        socket.emit("frontpage_lists");
      }else if(frontpage){
        Nochan.times_rotated += 1;
        Nochan.add_backdrop(list, i+1);
      }
    },6000);
    
  },

  start_snowfall: function(){
    setTimeout(function(){
      var x = Math.floor((Math.random() * window.innerWidth) + 1);
      var snow = document.createElement("div");
      var parent = document.getElementsByClassName("mega")[0];

      snow.className = "snow";
      //snow.attr("left", x);
      snow.style.left = x+"px";
      snow.style.top = "0px";
      parent.appendChild(snow);
      Nochan.fall_snow(snow);
      Nochan.start_snowfall();
    }, 800);
  },

  fall_snow: function(corn){
    corn.style.top = (parseInt(corn.style.top.replace("px", ""))+2)+"px";
    if(parseInt(corn.style.top.replace("px", "")) < document.getElementById("mega-background").offsetHeight-2.5){
      setTimeout(function(){
        Nochan.fall_snow(corn);
      },50);
    }else{
      corn.remove();
    }
  },

  set_viewers: function(viewers){
    if(viewers > 0){
      var to_add = viewers > 1 ? "listeners" : "listener";
      $("#frontpage-viewer-counter").html(viewers + " " + to_add);
    }
  },

  to_channel: function(chan, popstate){

    $("#channel-load").css("display", "block");
    window.scrollTo(0, 0);
    frontpage = false;
    //socket.removeAllListeners();
    $("body").css("background-color", "#2d2d2d"); 
    $.ajax({
      url: chan + "/php/index.php",
      
      success: function(e){

        if(Player.ytplayer != ""){
          Player.ytplayer.destroy();
          socket.emit("change_channel");
        }
        $("#frontpage_player").empty();
        //socket.disconnect();

        if(!popstate){
          window.history.pushState("to the channel!", "Title", "/" + chan);
          window.chan = chan;
        }

        $(".mega").remove();
        $(".mobile-search").remove();
        $("main").attr("class", "container center-align main");
        $("body").attr("id", "channelpage");
        $("header").html($($(e)[61]).html());
        $("main").html($($(e)[65]).html());
        $("#search").attr("placeholder", "Find song on YouTube...");
        $(".page-footer").addClass("padding-bottom-novideo");
        if($("#alreadychannel").length == 1){
          window.init();
        }else{
          window.fromFront = true;
          window.init();
        }
        if($("#alreadyfp").length == 0) $("head").append("<div id='alreadyfp'></div>");
        
      }
    });
  }
}

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

$().ready(function(){
  if(!window.fromChannel && window.location.pathname == "/") initfp();
});

function share_link_modifier_frontpage(){
  $("#facebook-code-link").attr("href", "https://www.facebook.com/sharer/sharer.php?u=https://zoff.no/");
  $("#facebook-code-link").attr("onclick", "window.open('https://www.facebook.com/sharer/sharer.php?u=https://zoff.no/', 'Share Zöff','width=600,height=300'); return false;");
  $("#twitter-code-link").attr("href", "http://twitter.com/intent/tweet?url=https://zoff.no/&amp;text=Check%20out%20Zöff!&amp;via=zoffmusic")
  $("#twitter-code-link").attr("onclick", "window.open('http://twitter.com/intent/tweet?url=https://zoff.no/&amp;text=Check%20out%20Zöff!&amp;via=zoffmusic','Share Playlist','width=600,height=300'); return false;");
  $("#qr-code-link").attr("href", "//chart.googleapis.com/chart?chs=500x500&cht=qr&chl=https://zoff.no/&choe=UTF-8&chld=L%7C1");
  $("#qr-code-image-link").attr("src", "//chart.googleapis.com/chart?chs=150x150&cht=qr&chl=https://zoff.no/&choe=UTF-8&chld=L%7C1");
}

function initfp(){

    var date = new Date();

    if(date.getMonth() == 3 && date.getDate() == 1){
      $(".mega").css("-webkit-transform", "rotate(180deg)");
      $(".mega").css("-moz-transform", "rotate(180deg)");
      //Materialize.toast('<p id="aprilfools">We suck at pranks..<a class="waves-effect waves-light btn light-green" style="pointer-events:none;">Agreed</a></p>', 100000);
    }
    

    window.onpopstate = function(e){
      var url_split = window.location.href.split("/");

      if(url_split[3] != "" && url_split[3].substring(0,1) != "#"){
        Nochan.to_channel(url_split[3], true);
      }
    }

    channel_list = $("#channel-list-container").html();

    share_link_modifier_frontpage();

    var connection_options = {
      'secure': true,
      'force new connection': true 
    };

    if(window.location.hostname == "zoff.no") add = "https://zoff.no";
    else add = window.location.hostname;
    socket = io.connect(''+add+':8880', connection_options);
    socket.on('playlists', function(msg){
        $("#channels").empty();


        Nochan.populate_channels(msg.channels);

        Nochan.set_viewers(msg.viewers);
    });


    socket.emit('frontpage_lists');

    $("#channel-load").css("display", "none");
    //Materialize.toast("<a href='/remote' style='color:white;'>Try out our new feature, remote!</a>", 8000)
    if(window.location.hash == "#donation")
    {
      window.location.hash = "#";
      $('#donation').openModal()
    }
    //window.channel_list = channel_list;


    if(!localStorage["ok_cookie"])
      Materialize.toast("We're using cookies to enhance your experience!  <a class='waves-effect waves-light btn light-green' href='#' id='cookieok' style='cursor:pointer;pointer-events:all;'> ok</a>", 10000);

    var pad = 0;
    document.getElementById("zicon").addEventListener("click", function(){
        pad+=10;
        document.getElementById("zicon").style.paddingLeft = pad+"%";
        if(pad >= 100)
            window.location.href = 'http://etys.no';
    });

    if(!window.mobilecheck() && Nochan.winter) Nochan.start_snowfall();

    /*if(navigator.userAgent.toLowerCase().indexOf("android") > -1){
        //console.log("android");
        if(Nochan.getCookie("show_prompt") == ""){
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


}

window.initfp = initfp;

$(document).on('click', '#cookieok', function() {
    $(this).fadeOut(function(){
        $(this).remove();
        localStorage["ok_cookie"] = true;
    });
});

$(document).on("click", "#closePlayer", function(e){
  e.preventDefault();
  socket.emit("change_channel");
  Player.ytplayer.destroy();
  Player.ytplayer = "";
  document.title = "Zöff";
  $("#frontpage_player").empty();
});

$(document).on('click', '#toast-container', function(){
  $(this).fadeOut(function(){
        $(this).remove();
    });
});

$(document).on('click', "#aprilfools", function(){
  $(".mega").css("-webkit-transform", "rotate(0deg)");
  $(".mega").css("-moz-transform", "rotate(0deg)");
});

$(document).on('click', ".chan-link", function(e){
  e.preventDefault();

  Nochan.to_channel($(this).attr("href"), false);
});

$(document).on("click", ".listen-button", function(e){
  //console.log($(".room-namer").attr("placeholder"));
  if($(".room-namer").val() == ""){
    e.preventDefault();
    //window.location = "?chan="+
    
    Nochan.to_channel($(".room-namer").attr("placeholder"));
  }
});

$(document).on("submit", ".channel-finder", function(e){
  e.preventDefault();
  Nochan.to_channel($(".room-namer").val());
  return false;
});

$(document).on("submit", "#base", function(e){
  e.preventDefault();
  Nochan.to_channel($("#search-mobile").val());
  return false;
});

