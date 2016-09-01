var Mobile_remote = {
	id: "",

	get_input: function(value) {
		if(Mobile_remote.id === "") {
			Mobile_remote.set_id(value.toLowerCase());
		} else {
			Mobile_remote.set_channel(value.toLowerCase());
		}
	},

	set_id: function(id) {
		Mobile_remote.id = id;
		$("#pausebutton_remote").attr("disabled", false);
		$("#skipbutton_remote").attr("disabled", false);
		$("#playbutton_remote").attr("disabled", false);
		$("#skipbutton_remote").attr("disabled", false);
		$("#remote_channel").val("");
		$("#remote_channel").attr("placeholder", "Change channel");
		$("#remote_header").html("Controlling " + id);
		$("#volume-control-remote").css("display", "block");
	},

	set_channel: function(channel_name) {
		socket.emit("id", [Mobile_remote.id, "channel", channel_name]);
	},

	play_remote: function() {
		socket.emit("id", [Mobile_remote.id, "play", "mock"]);
	},

	pause_remote: function() {
		socket.emit("id", [Mobile_remote.id, "pause", "mock"]);
	},

	skip_remote: function() {
		socket.emit("id", [Mobile_remote.id, "skip", "mock"]);
	},

	initiate_volume: function() {
		$("#volume-control-remote").slider({
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
            socket.emit("id", [Mobile_remote.id, "volume", ui.value]);
            Helper.log("volume");
            //console.log(ui.value);
          }
      });
	}

};
