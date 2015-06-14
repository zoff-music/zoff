var start = true;
var id;
//var socket;

$(document).ready(function (){
    setTimeout(function(){$("#code-input").focus();},500);
    socket = io.connect('//'+window.location.hostname+':3000');
    id = window.location.pathname.split("/")[2];
    if(id)
    {
      id = id.toLowerCase();
      control();
    }
});

function play()
{
  socket.emit("id", [id, "play", "mock"]);
};

function pause()
{
  socket.emit("id", [id, "pause", "mock"]);
};

function skip()
{
  socket.emit("id", [id, "skip", "mock"]);
};
/*
document.getElementById("volume-control").addEventListener("click", function()
{
   socket.emit("id", [id, "volume", $("#volume-control").val()]);
});*/

function control()
{
  if(start)
  {
    if(!id)id = $("#code-input").val().toLowerCase();
    $("#code-input").val("");
    start = false;

    $(".rc").css("display", "block");

    document.getElementById("base").setAttribute("onsubmit", "control(); return false;");
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
          //console.log(ui.value);
        }
    });
  }else
  {
    socket.emit("id", [id, "channel", $("#search").val().toLowerCase()]);
    $("#search").val("");
  }

}
