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
		document.getElementById("#pausebutton_remote").removeAttribute("disabled");
		document.getElementById("#skipbutton_remote").removeAttribute("disabled", false);
		document.getElementById("#playbutton_remote").removeAttribute("disabled", false);
		document.getElementById("#skipbutton_remote").removeAttribute("disabled", false);
		document.getElementById("#remote_channel").value = "";
		document.getElementById("#remote_channel").setAttribute("placeholder", "Change channel");
		document.getElementById("#remote_header").innerText = "Controlling " + id;
		Helper.css("#volume-control-remote", "display", "inline-block");
		document.querySelector(".slider-vol-mobile").setAttribute("style", "display: inline-block !important");
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
        document.getElementById("#volume-control-remote").insertAdjacentHTML("beforeend", "<div class='volume-slid-remote'></div>");
        document.getElementById("#volume-control-remote").insertAdjacentHTML("beforeend", "<div class='volume-handle-remote'></div>");
            Helper.css(".volume-slid-remote", "width", vol + "%");
            Helper.css(".volume-handle-remote", "left", "calc(" + vol + "% - 1px)");
        document.getElementById("volume-control-remote").addEventListener("touchstart", function(e) {
            e.preventDefault();
            Playercontrols.dragMouseDown(e);
        }, false);

        document.getElementById("volume-control-remote").addEventListener("touchmove", function(e) {
            e.preventDefault();
            Playercontrols.elementDrag(e);
        }, false);


	}

};
