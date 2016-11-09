//script for frontpage

var channel_list;
var git_info;
var frontpage = true;
var socket;
var rotation_timeout;

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

  blob_list: [],

  winter: false,

  times_rotated: 0,

  frontpage_function: function(msg)
  {
    $("#channels").empty();
    frontpage = true;
    Nochan.populate_channels(msg.channels);

    Nochan.set_viewers(msg.viewers);
  },

  populate_channels: function(lists)
  {
      var output = "";
      var num = 0;
      var pinned;
      if(lists[0].pinned == 1){
        pinned = lists.shift();
      }
      lists.sort(Nochan.sortFunction);
      if(pinned !== undefined){
        lists.unshift(pinned);
      }
      pre_card = $(channel_list);

      if(!Helper.mobilecheck())
        Nochan.add_backdrop(lists, 0);

      for(var x in lists)
      {

          var chan = lists[x].channel;
          if(num<12)
          {
            var id = lists[x].id;
            var viewers = lists[x].viewers;
            var img = "background-image:url('https://img.youtube.com/vi/"+id+"/hqdefault.jpg');";
            var song_count = lists[x].count;

            //$("#channels").append(channel_list);

            var card = pre_card;
            if(lists[x].pinned == 1)
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
    var o1 = a.viewers;
    var o2 = b.viewers;

    var p1 = a.count;
    var p2 = b.count;

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
        if (c.indexOf(name) === 0) return c.substring(name.length,c.length);
    }
    return "";
  },

  add_backdrop: function(list, i) {
    if(i >= list.length || i >= 8) i = 0;

    var id = list[i].id;

    if(Nochan.blob_list[i] !== undefined){
      //$(".room-namer").css("opacity", 0);
      setTimeout(function(){
        if(frontpage){
          $("#mega-background").css("background", "url(data:image/png;base64,"+Nochan.blob_list[i]+")");
          $("#mega-background").css("background-size" , "200%");
          $("#mega-background").css("opacity", 1);
          $("#searchFrontpage").attr("placeholder", list[i].channel);
          //$(".room-namer").css("opacity", 1);
        }
      },500);
    } else {
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
                  $("#searchFrontpage").attr("placeholder", list[i].channel);
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
          $("#searchFrontpage").attr("placeholder", list[i].data);
      };

    }
    rotation_timeout = setTimeout(function(){
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

  to_channel: function(new_channel, popstate){

    $("#channel-load").css("display", "block");
    window.scrollTo(0, 0);
    frontpage = false;
    clearTimeout(rotation_timeout);
    if(Helper.mobilecheck()) socket.removeAllListeners();
    $("body").css("background-color", "#2d2d2d");
    $.ajax({
      url: new_channel + "/php/index.php",

      success: function(e){

        if(Player.player !== ""){
          //Player.player.destroy();
          socket.emit("change_channel", {channel: chan.toLowerCase()});
        }
        $("#frontpage_player").empty();
        if(Helper.mobilecheck()) socket.disconnect();

        if(!popstate){
          window.history.pushState("to the channel!", "Title", "/" + new_channel);
          window.chan = new_channel;
        }

        $(".mega").remove();
        $(".mobile-search").remove();
        $("main").attr("class", "container center-align main");
        $("body").attr("id", "channelpage");
        $("header").html($($(e)[59]).html());
        if($("#alreadychannel").length === 0 || Helper.mobilecheck() || Player.player === undefined){
          $("main").html($($(e)[63]).html());
        } else {
          var main = $($($($($(e)[63]).html())[0]).html());
          $("#main-row").append($(main[2]).wrap("<div>").parent().html());
          $("#video-container").append($($($(main[0]).html())[4]).wrap("<div>").parent().html());
          $("#main-row").append("<div id='playbar'></div>");
          $("#player").removeClass("player_bottom");
          $("#main-row").removeClass("frontpage_modified_heights");
          $("#main_section_frontpage").remove();
          $("#closePlayer").remove();
          $("#player_bottom_overlay").remove();
        }
        $("#search").attr("placeholder", "Find song on YouTube...");
        $(".page-footer").addClass("padding-bottom-novideo");
        if($("#alreadychannel").length == 1){
          init();
        }else{
          fromFront = true;
          init();
        }
        if($("#alreadyfp").length === 0) $("head").append("<div id='alreadyfp'></div>");

      }
    });
  }
};

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

function share_link_modifier_frontpage(){
  $("#facebook-code-link").attr("href", "https://www.facebook.com/sharer/sharer.php?u=https://zoff.no/");
  $("#facebook-code-link").attr("onclick", "window.open('https://www.facebook.com/sharer/sharer.php?u=https://zoff.no/', 'Share Zöff','width=600,height=300'); return false;");
  $("#twitter-code-link").attr("href", "https://twitter.com/intent/tweet?url=https://zoff.no/&amp;text=Check%20out%20Zöff!&amp;via=zoffmusic");
  $("#twitter-code-link").attr("onclick", "window.open('https://twitter.com/intent/tweet?url=https://zoff.no/&amp;text=Check%20out%20Zöff!&amp;via=zoffmusic','Share Playlist','width=600,height=300'); return false;");
  $("#qr-code-link").attr("href", "//chart.googleapis.com/chart?chs=500x500&cht=qr&chl=https://zoff.no/&choe=UTF-8&chld=L%7C1");
  $("#qr-code-image-link").attr("src", "//chart.googleapis.com/chart?chs=150x150&cht=qr&chl=https://zoff.no/&choe=UTF-8&chld=L%7C1");
}

function initfp(){

    var date = new Date();
    Nochan.blob_list = [];
    if(date.getMonth() == 3 && date.getDate() == 1){
      $(".mega").css("-webkit-transform", "rotate(180deg)");
      $(".mega").css("-moz-transform", "rotate(180deg)");
      //Materialize.toast('<p id="aprilfools">We suck at pranks..<a class="waves-effect waves-light btn light-green" style="pointer-events:none;">Agreed</a></p>', 100000);
    }


    window.onpopstate = function(e){
      var url_split = window.location.href.split("/");

      if(url_split[3] !== "" && url_split[3].substring(0,1) != "#"){
        Nochan.to_channel(url_split[3], true);
      }
    };

    channel_list = $("#channel-list-container").html();

    share_link_modifier_frontpage();

    var connection_options = {
      'secure': true,
      'force new connection': true
    };

    if(window.location.hostname == "zoff.no") add = "https://zoff.no";
    else add = window.location.hostname;
    if(socket === undefined || Helper.mobilecheck()) socket = io.connect(''+add+':8880', connection_options);
    if($("#alreadyfp").length === 0 || Helper.mobilecheck()){
      setup_playlist_listener();
    }

    window.socket = socket;

    socket.emit('frontpage_lists');

    $("#channel-load").css("display", "none");
    //Materialize.toast("<a href='/remote' style='color:white;'>Try out our new feature, remote!</a>", 8000)
    if(window.location.hash == "#donation")
    {
      window.location.hash = "#";
      $('#donation').openModal();
    }
    //window.channel_list = channel_list;


    if(!localStorage.ok_cookie)
      Materialize.toast("We're using cookies to enhance your experience!  <a class='waves-effect waves-light btn light-green' href='#' id='cookieok' style='cursor:pointer;pointer-events:all;'> ok</a>", 10000);

    var pad = 0;
    document.getElementById("zicon").addEventListener("click", function(){
        pad+=10;
        document.getElementById("zicon").style.paddingLeft = pad+"%";
        if(pad >= 100)
            window.location.href = 'http://etys.no';
    });

    if(!Helper.mobilecheck() && Nochan.winter) Nochan.start_snowfall();
}
