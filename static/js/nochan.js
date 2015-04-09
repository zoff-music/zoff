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

$(document).ready(function (){
    Materialize.showStaggeredList('#channels');
    var deg = 0;
    var pr = 15;
    document.getElementById("zicon").addEventListener("click", function(){
        deg = deg + 365;
        pr = pr + 0.5;
        document.getElementById("zicon").style.transform = "rotate("+deg+"deg)";
        document.getElementById("zicon").style.width = pr+"%";
        if(pr >= 60)
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
