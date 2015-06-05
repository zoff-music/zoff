var start = true;
var id;
//var socket;

$(document).ready(function (){
    setTimeout(function(){$("#code-input").focus();},500);
    socket = io.connect('http://'+window.location.hostname+':3000');
    id = window.location.pathname.split("/")[2];
    if(id)
      control();
});

document.getElementById("remote_play").addEventListener("click", function()
{
  socket.emit("id", [id, "play", "mock"]);
});

document.getElementById("remote_pause").addEventListener("click", function()
{
  socket.emit("id", [id, "pause", "mock"]);
});

document.getElementById("remote_skip").addEventListener("click", function()
{
  socket.emit("id", [id, "skip", "mock"]);
});

document.getElementById("volume-control").addEventListener("click", function()
{
   socket.emit("id", [id, "volume", $("#volume-control").val()]);
});

function control()
{
  if(start)
  {
    if(!id)id = $("#code-input").val().toLowerCase();
    $("#code-input").val("");
    start = false;

    $("#volume-control").css("display", "block");
    $("#remote-controls").css("display", "block");
    $("#remote-text").text("Controlling "+ id.toUpperCase())
    $("#code-input").attr("length", "18");
    $("#code-input").attr("maxlength", "18");
    $("#forsearch").html("Type new channel name to change to");
  }else
  {
    socket.emit("id", [id, "channel", $("#code-input").val().toLowerCase()]);
    $("#code-input").val("");
  }

}
