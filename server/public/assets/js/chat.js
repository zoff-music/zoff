var Chat = {

	channel_received: 0,
	all_received: 0,
	chat_help: ["/name <new name> to change name", "/removename to remove name"],

	namechange: function(newName)
	{
		socket.emit("namechange", newName);
		Crypt.set_name(newName);
	},

	removename: function()
	{
		socket.emit("removename");
		Crypt.remove_name();
	},

	chat: function(data)
	{
		if(data.value.length > 150)
		return;
		if(data.value.startsWith("/name ")){
			Chat.namechange(data.value.substring(6));
		} else if(data.value.startsWith("/help")){
			if($(".chat-tab-li a.active").attr("href") == "#all_chat"){
				if($("#chatall").children().length > 100){
					$("#chatall").children()[0].remove()
				}
				for(var x = 0; x < Chat.chat_help.length; x++){
					var color = Helper.intToARGB(Helper.hashCode("System"));
					if(color.length < 6) {
						for(x = color.length; x < 6; x++){
							color = "0" + color;
						}
					}
					color = Helper.hexToRgb(color.substring(0,6));
					var color_temp = Helper.rgbToHsl([color.r, color.g, color.b], false);
					$("#chatall").append("<li title='Zoff''><span style='color:"+color_temp+";'>System</span>: </li>");
					var in_text = document.createTextNode(Chat.chat_help[x]);
					$("#chatall li:last")[0].appendChild(in_text);
					document.getElementById("chatall").scrollTop = document.getElementById("chatall").scrollHeight;
				}
			} else {
				if($("#chatchannel").children().length > 100){
					$("#chatchannel").children()[0].remove()
				}
				for(var x = 0; x < Chat.chat_help.length; x++){

					var color = Helper.intToARGB(Helper.hashCode("System"));
					if(color.length < 6) {
						for(x = color.length; x < 6; x++){
							color = "0" + color;
						}
					}
					color = Helper.hexToRgb(color.substring(0,6));
					var color_temp = Helper.rgbToHsl([color.r, color.g, color.b], false);
					$("#chatchannel").append("<li><span style='color:"+color_temp+";'>System</span>: </li>");
					var in_text = document.createTextNode(Chat.chat_help[x]);
					$("#chatchannel li:last")[0].appendChild(in_text);
					document.getElementById("chatchannel").scrollTop = document.getElementById("chatchannel").scrollHeight;
				}

			}
		} else if(data.value.startsWith("/removename")){
			Chat.removename();
		} else if($(".chat-tab-li a.active").attr("href") == "#all_chat"){
			socket.emit("all,chat", data.value);
		} else {
			socket.emit("chat", {channel: chan.toLowerCase(), data: data.value, pass: embed ? '' : Crypt.crypt_pass(Crypt.get_userpass(chan.toLowerCase()))});
		}
		data.value = "";

		return;
	},

	allchat: function(inp)
	{
		//$("#chat-btn").css("color", "grey");

		if(inp.msg.substring(0,1) == ":" && !chat_active)
		{
			Chat.all_received += 1;
			$("#favicon").attr("href", "assets/images/highlogo.png");
			unseen = true;
			chat_unseen = true;
			if($(".chat-link span.badge.new.white").hasClass("hide")){
				$(".chat-link span.badge.new.white").removeClass("hide");
			}
			var to_display = Chat.channel_received + Chat.all_received > 9 ? "9+" : Chat.channel_received + Chat.all_received;
			$(".chat-link span.badge.new.white").html(to_display);
			//if(!blinking) Chat.chat_blink();
			//blink_interval = setTimeout(Chat.chat_blink, 2000);
		}

		if(document.hidden)
		{
			$("#favicon").attr("href", "assets/images/highlogo.png");
		}

		if($("#chatall").children().length > 100){
			$("#chatall").children()[0].remove()
		}
		var color = Helper.intToARGB(Helper.hashCode(inp.from));
		if(color.length < 6) {
			for(x = color.length; x < 6; x++){
				color = "0" + color;
			}
		}
		color = Helper.hexToRgb(color.substring(0,6));
		var color_temp = Helper.rgbToHsl([color.r, color.g, color.b], false);
		$("#chatall").append("<li title='"+inp.channel+"''><span style='color:"+color_temp+";'>"+inp.from+"</span></li>");
		var in_text = document.createTextNode(inp.msg);
		$("#chatall li:last")[0].appendChild(in_text);
		document.getElementById("chatall").scrollTop = document.getElementById("chatall").scrollHeight;
	},

	channelchat: function(data)
	{
		if(data.msg.substring(0,1) == ":" && !chat_active)
		{
			$("#favicon").attr("href", "assets/images/highlogo.png");
			unseen = true;
			chat_unseen = true;
			Chat.channel_received += 1;
			//blink_interval = setTimeout(Chat.chat_blink, 1000);
			if($(".chat-link span.badge.new.white").hasClass("hide")){
				$(".chat-link span.badge.new.white").removeClass("hide");
			}
			var to_display = Chat.channel_received + Chat.all_received > 9 ? "9+" : Chat.channel_received + Chat.all_received;
			$(".chat-link span.badge.new.white").html(to_display);
		}

		if($("#chatchannel").children().length > 100){
			$("#chatchannel").children()[0].remove()
		}

		var color = Helper.intToARGB(Helper.hashCode(data.from));
		if(color.length < 6) {
			for(x = color.length; x < 6; x++){
				color = "0" + color;
			}
		}
		color = Helper.hexToRgb(color.substring(0,6));
		var color_temp = Helper.rgbToHsl([color.r, color.g, color.b], false);
		$("#chatchannel").append("<li><span style='color:"+color_temp+";'>"+data.from+"</span></li>");
		var in_text = document.createTextNode(data.msg);
		$("#chatchannel li:last")[0].appendChild(in_text);
		document.getElementById("chatchannel").scrollTop = document.getElementById("chatchannel").scrollHeight;
	},

	chat_blink: function() {
		blinking = true;
		$(".chat-link").attr("style", "color: grey !important;");
		setTimeout(function () {
			$(".chat-link").attr("style", "color: white !important;");
			setTimeout(function() {
				if(blinking) Chat.chat_blink();
			}, 1000);
		}, 1000);
	}

};
