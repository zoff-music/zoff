var Chat = {

    channel_received: 0,
    all_received: 0,
    chat_help: ["/name <new name> <password> to register and save a password for a nickname", "/name <new name> <new_password> <old_password> to change the password on a nickname", "/removename to logout"],//, "There are no commands.. As of now!"],

    namechange: function(data, first, initial) {
        var input = data.split(" ");
        if(input.length == 2) {
            var name = input[0];
            var password = input[1];

            password = Crypt.crypt_chat_pass(password);
            socket.emit("namechange", {name: name, channel: chan.toLowerCase(), password: password, first: first});
        } else if(input.length == 3) {
            var name = input[0];
            var new_password = input[1];
            var old_password = input[2];



            new_password = Crypt.crypt_chat_pass(new_password);
            old_password = Crypt.crypt_chat_pass(old_password);

            socket.emit("namechange", {name: name, channel: chan.toLowerCase(), new_password: new_password, old_password: old_password});
        } else if(first) {
            var to_send = {initial: initial, first: true};
            if(chan != undefined && chan != "") {
                to_send.channel = chan.toLowerCase();
            }
            socket.emit("namechange", to_send);
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
            if(document.querySelector(".chat-tab-li a.active").getAttribute("href") == "#all_chat"){
                if(document.querySelector("#chatall").children.length > 100) {
                    document.querySelector("#chatall").children[0].remove()
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
                    document.querySelector("#chatall").insertAdjacentHTML("beforeend", "<li title='Zoff''><span style='color:"+color_temp+";'>System</span>: </li>");
                    var in_text = document.createTextNode(Chat.chat_help[x]);
                    document.querySelector("#chatall").children[document.querySelector("#chatall").children.length - 1].appendChild(in_text);
                    document.getElementById("chatall").scrollTop = document.getElementById("chatall").scrollHeight;
                }
            } else {
                if(document.querySelector("#chatchannel").children.length > 100) {
                    document.querySelector("#chatchannel").children[0].remove()
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
                    document.querySelector("#chatchannel").insertAdjacentHTML("beforeend", "<li><span style='color:"+color_temp+";'>System</span>: </li>");
                    var in_text = document.createTextNode(Chat.chat_help[x]);
                    document.getElementById("chatchannel").scrollTop = document.getElementById("chatchannel").scrollHeight;
                }
            }
        } else if(data.value.startsWith("/removename")) {
            Chat.removename();
        } else if(document.querySelector(".chat-tab-li a.active").getAttribute("href") == "#all_chat") {
            socket.emit("all,chat", {channel: chan.toLowerCase(), data: data.value});
        } else {
            socket.emit("chat", {channel: chan.toLowerCase(), data: data.value});
        }
        data.value = "";
        return;
    },

    allchat: function(inp, time_sent, disable_blink) {
        if(inp.msg.substring(0,1) == ":" && !chat_active && !disable_blink) {
            Chat.all_received += 1;
            document.querySelector("#favicon").getAttribute("href", "/assets/images/highlogo.png");
            unseen = true;
            chat_unseen = true;
            Helper.removeClass(document.querySelector(".chat-link span.badge.new.white"), "hide");
            var to_display = Chat.channel_received + Chat.all_received > 9 ? "9+" : Chat.channel_received + Chat.all_received;
            Helper.setHtml(document.querySelector(".chat-link span.badge.new.white"), to_display);
        }

        if(document.hidden)	{
            document.getElementById("favicon").setAttribute("href", "/assets/images/highlogo.png");
        }

        if(document.querySelector("#chatall").children.length > 100) {
            document.querySelector("#chatall").children[0].remove()
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
        document.querySelector("#chatall").insertAdjacentHTML("beforeend", "<li title='"+inp.channel+"'><span class='time_color'>" + time + "</span> " + icon_add + "<span style='color:"+color_temp+";'>"+inp.from+"</span><span class='channel-info-all-chat'> " + inp.channel + " </span></li>");
        var in_text = document.createTextNode(inp.msg);
        document.querySelector("#chatall").children[document.querySelector("#chatall").children.length - 1].appendChild(in_text);
        if(!userscroll) {
            programscroll = true;
            document.getElementById("chatall").scrollTop = document.getElementById("chatall").scrollHeight;
            programscroll = false;
        }
    },

    channelchat: function(data, time_sent, disable_blink) {
        if(data.msg.substring(0,1) == ":" && !chat_active && !disable_blink) {
            document.querySelector("#favicon").setAttribute("href", "/assets/images/highlogo.png");
            unseen = true;
            chat_unseen = true;
            Chat.channel_received += 1;
            //blink_interval = setTimeout(Chat.chat_blink, 1000);
            Helper.removeClass(document.querySelector(".chat-link span.badge.new.white"), "hide");
            var to_display = Chat.channel_received + Chat.all_received > 9 ? "9+" : Chat.channel_received + Chat.all_received;
            Helper.setHtml(document.querySelector(".chat-link span.badge.new.white"), to_display);
        }

        if(document.querySelector("#chatchannel").children.length > 100) {
            document.querySelector("#chatchannel").children[0].remove()
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
        document.querySelector("#chatchannel").insertAdjacentHTML("beforeend", "<li><span class='time_color'>" + time + "</span> " + icon_add + "<span style='color:"+color_temp+";'>"+data.from+"</span> </li>");
        var in_text = document.createTextNode(data.msg);
        document.querySelector("#chatchannel").children[document.querySelector("#chatchannel").children.length - 1].appendChild(in_text);
        if(!userscroll) {
            programscroll = true;
            document.getElementById("chatchannel").scrollTop = document.getElementById("chatchannel").scrollHeight;
            programscroll = false;
        }
    }
};
