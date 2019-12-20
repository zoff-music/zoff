var start = true;
var dynamicListeners = {};

mobilecheck = function() {
  var check = false;
  (function(a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    )
      check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
};


function toast(msg) {
  switch (msg) {
    case "suggested_thumbnail":
      if (embed) return;
      msg = "The thumbnail has been suggested!";
      break;
    case "faulty_start_end":
      if (embed) return;
      break;
    case "wait_longer":
      if (embed) return;
      break;
    case "suggested_description":
      if (embed) return;
      break;
    case "thumbnail_denied":
      if (embed) return;
      break;
    case "description_denied":
      if (embed) return;
      break;
    case "addedsong":
      if (embed) return;
      break;
    case "addedplaylist":
      if (embed) return;
      break;
    case "savedsettings":
      if (embed) return;
      break;
    case "wrongpass":
      if (embed) return;
      break;
    case "deleted_songs":
      if (embed) return;
      break;
    case "shuffled":
      if (embed) return;
      break;
    case "deletesong":
      if (embed) return;
      break;
    case "voted":
      msg = Helper.rnd([
        "You voted!",
        "You vote like a boss",
        "Voting is the key to democracy",
        "May you get your song to the very top!",
        "I love that song! I vouch for you.",
        "Only you vote that good",
        "I like the way you vote...",
        "Up the video goes!",
        "Voted Zoff for president",
        "Only 999 more to go!"
      ]);
      break;
    case "alreadyvoted":
      msg = Helper.rnd([
        "You can't vote twice on that song!",
        "I see you have voted on that song before",
        "One vote per person!",
        "I know you want to hear your song, but have patience!",
        "I'm sorry, but I can't let you vote twice, Dave."
      ]);
      break;
    case "skip":
      if (embed) return;
      break;
    case "listhaspass":
      if (embed) return;
      break;
    case "noskip":
      if (embed) return;
      break;
    case "alreadyskip":
      if (embed) return;
      break;
    case "notyetskip":
      if (embed) return;
      break;
    case "correctpass":
      if (embed) return;
      break;
    case "changedpass":
      if (embed) return;
      break;
    case "suggested":
      if (embed) return;
      break;
    case "alreadyplay":
      if (embed) return;
      break;
  }
  before_toast();
  M.toast({ html: msg, displayLength: 4000 });
}

function before_toast() {
  /*if($('.toast').length > 0) {
    var toastElement = $('.toast').first()[0];
    var toastInstance = toastElement.M_Toast;
    toastInstance.remove();
}*/
  M.Toast.dismissAll();
  //Materialize.Toast.removeAll();
}

window.addEventListener(
  "DOMContentLoaded",
  function() {
    document.title = "Zoff Remote";
    setTimeout(function() {
      document.getElementById("search").focus();
    }, 500);
    var connection_options = {
      "sync disconnect on unload": true,
      secure: true
    };

    M.Modal.init(document.getElementById("about"));
    M.Modal.init(document.getElementById("contact"));
    M.Modal.init(document.getElementById("help"));
    socket = io.connect(
      window.location.protocol + "//" + window.location.host,
      connection_options
    );

    socket.on("toast", toast);
    socket.on("update_required", function() {
      window.location.reload(true);
    });
    id = window.location.pathname.split("/")[1];
    if (id) {
      id = id.toLowerCase();
      Remotecontroller.control();
    }
  },
  false
);

function handleEvent(e, target, tried, type) {
  for (var y = 0; y < e.path.length; y++) {
    var target = e.path[y];
    if (dynamicListeners[type] && dynamicListeners[type]["#" + target.id]) {
      dynamicListeners[type]["#" + target.id].call(target);
      return;
    } else {
      if (target.classList == undefined) return;
      for (var i = 0; i < target.classList.length; i++) {
        if (
          dynamicListeners[type] &&
          dynamicListeners[type]["." + target.classList[i]]
        ) {
          dynamicListeners[type]["." + target.classList[i]].call(target);
          return;
        }
      }
    }
  }
}

function addListener(type, element, callback) {
  if (dynamicListeners[type] == undefined) dynamicListeners[type] = {};
  dynamicListeners[type][element] = callback;
}

document.addEventListener(
  "click",
  function(e) {
    handleEvent(e, e.target, false, "click");
  },
  true
);
document.addEventListener(
  "submit",
  function(e) {
    handleEvent(e, e.target, false, "submit");
  },
  true
);

addListener("click", "#playbutton", function() {
  socket.emit("id", { id: id, type: "play", value: "mock" });
});

addListener("click", "#pausebutton", function() {
  socket.emit("id", { id: id, type: "pause", value: "mock" });
});

addListener("click", "#skipbutton", function() {
  socket.emit("id", { id: id, type: "skip", value: "mock" });
});

addListener("submit", "#remoteform", function(e) {
  event.preventDefault();
  Remotecontroller.control();
});

var Remotecontroller = {
  control: function() {
    if (start) {
      if (!id) {
        id = document.getElementById("remoteform").chan.value;
        window.history.pushState("object or string", "Title", "/" + id);
      }
      document.getElementById("remoteform").chan.value = "";
      start = false;

      Helper.css(".volume-elements", "display", "flex");
      Helper.css(".rc", "display", "block");

      //document.getElementById("base").setAttribute("onsubmit", "control(); return false;");
      document.getElementById("remote-text").innerText =
        "Controlling " + id.toUpperCase();
      document.getElementById("search").setAttribute("length", "18");
      document.getElementById("search").setAttribute("maxlength", "18");
      document.getElementById("forsearch").innerText =
        "Type new channel name to change to";

      //
      /*$("#volume-control").slider({
            min: 0,
            max: 100,
            value: 100,
            range: "min",
            animate: true,
            stop:function(event, ui) {
                socket.emit("id", {id: id, type: "volume", value: ui.value});
            }
            //});*/

      document
        .getElementById("volume")
        .insertAdjacentHTML("beforeend", "<div class='volume-slid'></div>");
      document
        .getElementById("volume")
        .insertAdjacentHTML("beforeend", "<div class='volume-handle'></div>");

      Helper.css(".volume-slid", "width", "100%");
      Helper.css(".volume-handle", "left", "calc(100% - 1px)");
      //document.getElementsByClassName("volume-handle")[0].onmousedown = Remotecontroller.dragMouseDown;
      //$("#volume").slider(slider_values);
      //document.getElementsByClassName("volume-slid")[0].onmousedown = Remotecontroller.dragMouseDown;
      document.getElementById("volume").onmousedown =
        Remotecontroller.dragMouseDown;
      document.getElementById("volume").addEventListener(
        "touchstart",
        function(e) {
          e.preventDefault();
          Remotecontroller.dragMouseDown(e);
        },
        false
      );
      document.getElementById("volume").onclick = function(e) {
        Remotecontroller.elementDrag(e);
        Remotecontroller.closeDragElement();
      };
    } else {
      socket.emit("id", {
        id: id,
        type: "channel",
        value: document.getElementById("search").value.toLowerCase()
      });
      document.getElementById("search").value = "";
    }
  },

  dragMouseDown: function(e) {
    e = e || window.event;
    // get the mouse cursor position at startup:
    document.onmouseup = Remotecontroller.closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = Remotecontroller.elementDrag;
    document.getElementById("volume").addEventListener(
      "touchend",
      function() {
        Remotecontroller.closeDragElement();
      },
      false
    );
    document.getElementById("volume").addEventListener(
      "touchmove",
      function(e) {
        e.preventDefault();
        Remotecontroller.elementDrag(e);
      },
      false
    );
  },

  elementDrag: function(e) {
    var elmnt = document.getElementsByClassName("volume-handle")[0];
    e = e || window.event;

    var pos3 = e.clientX;
    if (pos3 == undefined) {
      pos3 = e.touches[0].clientX;
    }

    if (elmnt.className.indexOf("ui-state-active") == -1) {
      elmnt.className += " ui-state-active";
    }
    var pos = pos3 - document.getElementById("volume").offsetLeft;
    if (pos > -1 && pos < document.getElementById("volume").offsetWidth + 1) {
      elmnt.style.left = pos + "px";
      var volume = pos / document.getElementById("volume").offsetWidth;
      document.getElementsByClassName("volume-slid")[0].style.width =
        volume * 100 + "%";
    } else if (pos < 0) {
      var volume = 0;
      document.getElementsByClassName("volume-slid")[0].style.width =
        volume * 100 + "%";
    } else {
      var volume = 1;
      document.getElementsByClassName("volume-slid")[0].style.width =
        volume * 100 + "%";
    }

    socket.emit("id", { id: id, type: "volume", value: volume * 100 });

    try {
      Crypt.set_volume(volume * 100);
    } catch (e) {}
  },

  closeDragElement: function() {
    /* stop moving when mouse button is released:*/
    var elmnt = document.getElementsByClassName("volume-handle")[0];
    if (elmnt.className.indexOf("ui-state-active") > -1) {
      setTimeout(function() {
        elmnt.classList.remove("ui-state-active");
      }, 1);
    }
    document.onmouseup = null;
    document.onmousemove = null;

    document
      .getElementById("volume")
      .removeEventListener("touchmove", function(e) {
        e.preventDefault();
        Playercontrols.elementDrag(e);
      });
    document.getElementById("volume").removeEventListener(
      "touchend",
      function() {
        Playercontrols.closeDragElement();
      },
      false
    );
  }
};
