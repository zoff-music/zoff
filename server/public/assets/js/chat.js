var Chat = {

    channel_received: 0,
    all_received: 0,
    chat_help: ["/name <new name> <password> to register and save a password for a nickname", "/name <new name> <new_password> <old_password> to change the password on a nickname", "/removename to logout"],//, "There are no commands.. As of now!"],

    namechange: function(data, first) {
        var input = data.split(" ");
        if(input.length == 2) {
            var name = input[0];
            var password = input[1];
            temp_name = name;
            temp_pass = password;
            password = Crypt.crypt_chat_pass(password);
            socket.emit("namechange", {name: name, channel: chan.toLowerCase(), password: password, first: first});
        } else if(input.length == 3) {
            var name = input[0];
            var new_password = input[1];
            var old_password = input[2];

            temp_name = name;
            temp_pass = password;

            new_password = Crypt.crypt_chat_pass(new_password);
            old_password = Crypt.crypt_chat_pass(old_password);

            socket.emit("namechange", {name: name, channel: chan.toLowerCase(), new_password: new_password, old_password: old_password});
        } else {

        }
    },

    removename: function() {
        socket.emit("removename", {channel: chan.toLowerCase()});
        Crypt.remove_name();
    },

    chat: function(data) {
        if(data.value.length > 150) return;
        if(data.value.startsWith("/name ")){
            Chat.namechange(data.value.substring(6), false);
        } else if(data.value.startsWith("/help")) {
            if($(".chat-tab-li a.active").attr("href") == "#all_chat"){
                if($("#chatall").children().length > 100) {
                    $("#chatall").children()[0].remove()
                }
                for(var x = 0; x < Chat.chat_help.length; x++) {
                    var color = Helper.intToARGB(Helper.hashCode("System"));
                    if(color.length < 6) {
                        for(x = color.length; x < 6; x++) {
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
                if($("#chatchannel").children().length > 100) {
                    $("#chatchannel").children()[0].remove()
                }
                for(var x = 0; x < Chat.chat_help.length; x++) {

                    var color = Helper.intToARGB(Helper.hashCode("System"));
                    if(color.length < 6) {
                        for(x = color.length; x < 6; x++) {
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
        } else if(data.value.startsWith("/removename")) {
            Chat.removename();
        } else if($(".chat-tab-li a.active").attr("href") == "#all_chat") {
            socket.emit("all,chat", {channel: chan.toLowerCase(), data: data.value});
        } else {
            socket.emit("chat", {channel: chan.toLowerCase(), data: data.value, pass: embed ? '' : Crypt.crypt_chat_pass(Crypt.get_userpass(chan.toLowerCase()))});
        }
        data.value = "";
        return;
    },

    allchat: function(inp, time_sent, disable_blink) {
        if(inp.msg.substring(0,1) == ":" && !chat_active && !disable_blink) {
            Chat.all_received += 1;
            $("#favicon").attr("href", "/assets/images/highlogo.png");
            unseen = true;
            chat_unseen = true;
            if($(".chat-link span.badge.new.white").hasClass("hide")){
                $(".chat-link span.badge.new.white").removeClass("hide");
            }
            var to_display = Chat.channel_received + Chat.all_received > 9 ? "9+" : Chat.channel_received + Chat.all_received;
            $(".chat-link span.badge.new.white").html(to_display);
        }

        if(document.hidden)	{
            $("#favicon").attr("href", "/assets/images/highlogo.png");
        }

        if($("#chatall").children().length > 100) {
            $("#chatall").children()[0].remove()
        }
        var color = Helper.intToARGB(Helper.hashCode(inp.from));
        if(color.length < 6) {
            for(x = color.length; x < 6; x++){
                color = "0" + color;
            }
        }
        var icon_add = "";
        if(inp.hasOwnProperty("icon") && inp.icon !== false && inp.icon != "") {
            icon_add = "<img class='chat-icon' src='" + inp.icon + "' alt='" + inp.from + "'>";
        }

        color = Helper.hexToRgb(color.substring(0,6));
        var color_temp = Helper.rgbToHsl([color.r, color.g, color.b], false);
        var _time = new Date();
        if(time_sent) {
            _time = new Date(time_sent);
        }
        var time = Helper.pad(_time.getHours()) + ":" + Helper.pad(_time.getMinutes());
        $("#chatall").append("<li title='"+inp.channel+"'><span class='time_color'>" + time + "</span> " + icon_add + "<span style='color:"+color_temp+";'>"+inp.from+"</span><span class='channel-info-all-chat'> " + inp.channel + " </span></li>");
        var in_text = document.createTextNode(inp.msg);
        $("#chatall li:last")[0].appendChild(in_text);
        document.getElementById("chatall").scrollTop = document.getElementById("chatall").scrollHeight;
    },

    channelchat: function(data, time_sent, disable_blink) {
        if(data.msg.substring(0,1) == ":" && !chat_active && !disable_blink) {
            $("#favicon").attr("href", "/assets/images/highlogo.png");
            unseen = true;
            chat_unseen = true;
            Chat.channel_received += 1;
            //blink_interval = setTimeout(Chat.chat_blink, 1000);
            if($(".chat-link span.badge.new.white").hasClass("hide")) {
                $(".chat-link span.badge.new.white").removeClass("hide");
            }
            var to_display = Chat.channel_received + Chat.all_received > 9 ? "9+" : Chat.channel_received + Chat.all_received;
            $(".chat-link span.badge.new.white").html(to_display);
        }

        if($("#chatchannel").children().length > 100) {
            $("#chatchannel").children()[0].remove()
        }

        var icon_add = "";
        if(data.hasOwnProperty("icon") && data.icon !== false && data.icon != "") {
            icon_add = "<img class='chat-icon' src='" + data.icon + "' alt='" + data.from + "'>";
        }

        var color = Helper.intToARGB(Helper.hashCode(data.from));
        if(color.length < 6) {
            for(x = color.length; x < 6; x++) {
                color = "0" + color;
            }
        }
        color = Helper.hexToRgb(color.substring(0,6));
        var color_temp = Helper.rgbToHsl([color.r, color.g, color.b], false);
        var _time = new Date();
        if(time_sent) {
            _time = new Date(time_sent);
        }
        var time = Helper.pad(_time.getHours()) + ":" + Helper.pad(_time.getMinutes());
        $("#chatchannel").append("<li><span class='time_color'>" + time + "</span> " + icon_add + "<span style='color:"+color_temp+";'>"+data.from+"</span></li>");
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
