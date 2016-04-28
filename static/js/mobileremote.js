var Mobile_remote = {
	id: "",

	get_input: function(value) {
		console.log(value, Mobile_remote.id);
		if(Mobile_remote.id == "") {
			Mobile_remote.set_id(value);
		} else {
			Mobile_remote.set_channel(value);
		}
	},

	set_id: function(id) {
		console.log(id);
		Mobile_remote.id = id;
		$("#pausebutton_remote").attr("disabled", false);
		$("#skipbutton_remote").attr("disabled", false);
		$("#playbutton_remote").attr("disabled", false);
		$("#skipbutton_remote").attr("disabled", false);
		$("#remote_channel").val("");
		$("#remote_channel").attr("placeholder", "Change channel");
	},

	set_channel: function(channel_name) {
		socket.emit("id", [id, "channel", channel_name]);
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
            console.log("volume");
            //console.log(ui.value);
          }
      });
	}

}