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
		$("#volume-control-remote").css("display", "inline-block");
		$(".slider-vol-mobile").attr("style", "display: inline-block !important");
	},

	set_channel: function(channel_name) {
		socket.emit("id", {id: Mobile_remote.id, type: "channel", value: channel_name});
	},

	play_remote: function() {
		socket.emit("id", {id: Mobile_remote.id, type: "play", value: "mock"});
	},

	pause_remote: function() {
		socket.emit("id", {id: Mobile_remote.id, type: "pause", value: "mock"});
	},

	skip_remote: function() {
		socket.emit("id", {id: Mobile_remote.id, type: "skip", value: "mock"});
	},

	initiate_volume: function() {
		var vol = 100;
        $("#volume-control-remote").append("<div class='volume-slid-remote'></div>");
        $("#volume-control-remote").append("<div class='volume-handle-remote'></div>");
            $(".volume-slid-remote").css("width", vol + "%");
            $(".volume-handle-remote").css("left", "calc(" + vol + "% - 1px)");
        document.getElementById("volume-control-remote").addEventListener("touchstart", function(e) {
			console.log("start");
            e.preventDefault();
            Playercontrols.dragMouseDown(e);
        }, false);

        document.getElementById("volume-control-remote").addEventListener("touchmove", function(e) {
			console.log("move");
            e.preventDefault();
            Playercontrols.elementDrag(e);
        }, false);


	}

};
