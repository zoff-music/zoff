var start = true;
var id;
var socket;

$(document).ready(function (){
    setTimeout(function(){$("#search").focus();},500);
    socket = io.connect('http://'+window.location.hostname+':3000');
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

function controll()
{
  if(start)
  {
    id = $("#search").val().toLowerCase();
    $("#search").val("");
    start = false;

    $("#volume-controll").css("display", "block");
    $("#remote-controls").css("display", "block");

    $("#search").attr("length", "18");
    $("#search").attr("maxlength", "18");
    $("#forsearch").html("Type new channel name to change to")
    $("#volume-controll").slider({
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
