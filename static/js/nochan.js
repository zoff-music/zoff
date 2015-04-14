var list_html;

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

function populate_channels(lists)
{
    var output = "";

    lists.sort(sortFunction);


    pre_card = $(list_html);

    for(x in lists)
    {

        var id = lists[x][1];
        var nowplaying = lists[x][2];
        var chan = lists[x][3];
        var viewers = lists[x][0];
        var img = "background-image:url('http://img.youtube.com/vi/"+id+"/hqdefault.jpg');";
        var song_count = lists[x][4];

        //$("#channels").append(list_html);

        var card = pre_card;
        card.find(".chan-name").text(chan);
        card.find(".chan-views").text(viewers);
        card.find(".chan-songs").text(song_count);
        card.find(".chan-bg").attr("style", img);
        card.find(".chan-link").attr("href", chan);

        $("#channels").append(card.html());

        //$("#channels").append(card);
        console.log(chan);

        output+="<option value='"+chan+"'> ";
    }
    document.getElementById("searches").innerHTML = output;
}

String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}


function sortFunction(a, b) {
    if (a[0] === b[0]) {
        return 0;
    }
    else {
        return (a[0] < b[0]) ? 1 : -1;
    }
}

$(document).ready(function (){

    list_html = $("#channels").html();
    $("#channels").empty();

    var socket = io.connect('http://'+window.location.hostname+':3000');
    var playlists = [];
    socket.emit('frontpage_lists');
    socket.on('playlists', function(msg){
        console.log(msg);
        populate_channels(msg);
    })


    Materialize.showStaggeredList('#channels');

    var pad = 0;
    document.getElementById("zicon").addEventListener("click", function(){
        pad+=10;
        document.getElementById("zicon").style.paddingLeft = pad+"%";
        if(pad >= 100)
            window.location.href = 'https://www.youtube.com/v/mK2fNG26xFg?autoplay=1&showinfo=0&autohide=1';
    });
    if(navigator.userAgent.toLowerCase().indexOf("android") > -1){
        console.log("android");
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
     }

});
