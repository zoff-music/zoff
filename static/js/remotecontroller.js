var start = true;

$(document).ready(function (){
    document.title = "Zöff Remote";
    setTimeout(function(){$("#search").focus();},500);
    socket = io.connect('//'+window.location.hostname+':3000');
    id = window.location.pathname.split("/")[2];
    if(id)
    {
      id = id.toLowerCase();
      Remotecontroller.control();
    }

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

    var _isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
    var _isRemoteInstalled = chrome.app.isInstalled;

    if (_isChrome && !_isRemoteInstalled) 
      Materialize.toast("<a href='#' onclick='installRemote();' style='pointer-events:all;color:white;'>Install the extension!</a>", 100000);

    window.installRemote = installRemote;
    window.failed = failed;
    window.success = success;
});

function installRemote()
{
  chrome.webstore.install("", success, failed);
}

function failed(e)
{
  console.log(e);
}

function success()
{
  console.log("Successfully installed");
}

$("#playbutton").on("click", function()
{
  socket.emit("id", [id, "play", "mock"]);
});

$("#pausebutton").on("click", function()
{
  socket.emit("id", [id, "pause", "mock"]);
});

$("#skipbutton").on("click", function()
{
  socket.emit("id", [id, "skip", "mock"]);
});

$("#remoteform").on("submit", function()
{
  /*
  if(start)
    window.location.href = '/remote/'+document.getElementById("remoteform").chan.value;
  else
    Remotecontroller.control();
  */
  Remotecontroller.control();
});

var Remotecontroller = {

  control: function()
  {
    if(start)
    {
      if(!id)
      {
          id = document.getElementById("remoteform").chan.value;
          window.history.pushState("object or string", "Title", "/remote/"+id);
      }
      document.getElementById("remoteform").chan.value = "";
      start = false;

      $(".rc").css("display", "block");

      //document.getElementById("base").setAttribute("onsubmit", "control(); return false;");
      $("#remote-text").text("Controlling "+ id.toUpperCase())
      document.getElementById("search").setAttribute("length", "18");
      document.getElementById("search").setAttribute("maxlength", "18");
      $("#forsearch").html("Type new channel name to change to");

      $("#volume-control").slider({
          min: 0,
          max: 100,
          value: 100,
          range: "min",
          animate: true,
          /*slide: function(event, ui) {
            console.log(ui.value);
            //localStorage.setItem("volume", ui.value);
          },*/
          stop:function(event, ui) {
            socket.emit("id", [id, "volume", ui.value]);
            console.log("volume");
            //console.log(ui.value);
          }
      });
    }else
    {
      socket.emit("id", [id, "channel", $("#search").val().toLowerCase()]);
      $("#search").val("");
    }

  }

}
