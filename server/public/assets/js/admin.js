var Admin = {

    beginning:true,
    logged_in: false,

    pw: function(msg) {
        Admin.logged_in = msg;
        if(!msg) return;
        w_p = false;

        if(Admin.logged_in) {
            $("#thumbnail_form").css("display", "inline-block");
            $("#description_form").css("display", "inline-block");
            $("#user_suggests").removeClass("hide");
            $("#user-suggest-html").removeClass("hide");
            if($(".suggested-badge").text() != "0" && $(".suggested-badge").text() != "") {
                $(".suggested-badge").removeClass("hide");
            }
            if(!Helper.mobilecheck()) {
                $('#chan_thumbnail').tooltip({
                    delay: 5,
                    position: "left",
                    html: "imgur link"
                });
            }
        } else {
            Admin.hideUserSuggested();
        }
        $(".delete-context-menu").removeClass("context-menu-disabled");
        names     = ["vote","addsongs","longsongs","frontpage", "allvideos",
        "removeplay", "skip", "shuffle", "userpass"];
        //Crypt.set_pass(chan.toLowerCase(), Crypt.tmp_pass);

        for (var i = 0; i < names.length; i++) {
            $("input[name="+names[i]+"]").attr("disabled", false);
        }

        $(".card-action").removeClass("hide");
        $("#admin-lock").addClass("clickable");
        $("#admin-lock").html("lock_open");
        if(!Helper.mobilecheck()){
            $('#admin-lock').tooltip({
                delay: 5,
                position: "left",
                html: "Logout"
            });
        }
        $("#password").val("");
        $("#password").attr("placeholder", "Change admin password");
        $(".user-password-li").removeClass("hide");
        $(".delete-all").removeClass("hide");
        if($(".password_protected").prop("checked")) {
            $(".change_user_pass").removeClass("hide");
        }

        if($("#admin-lock").html() != "lock_open"){
            $("#admin-lock").addClass("clickable");
            $("#admin-lock").html("lock_open");
            if(!Helper.mobilecheck()){
                $('#admin-lock').tooltip({
                    delay: 5,
                    position: "left",
                    html: "Logout"
                });
            }
        }
    },

    hideUserSuggested: function() {
        if(!$("#user_suggests").hasClass("hide")) {
            $("#user_suggests").addClass("hide")
        }
        if(!$("#user-suggest-html").hasClass("hide")) {
            $("#user-suggest-html").addClass("hide");
        }
        if(!$(".suggested-badge").hasClass("hide")) {
            $(".suggested-badge").addClass("hide");
        }
    },

    conf: function(msg) {
        if(msg[0].adminpass == ""){
            ////Crypt.remove_pass(chan.toLowerCase());
        }
        Admin.set_conf(msg[0]);
        if(msg[0].adminpass !== "" && Admin.beginning){
            //emit("password", {password: Crypt.crypt_pass(Crypt.get_pass(chan.toLowerCase())), channel: chan.toLowerCase()});
            Admin.beginning = false;
        }
    },

    pass_save: function() {
        if(!w_p) {
            //emit('password', {password: Crypt.crypt_pass(CryptoJS.SHA256(document.getElementById("password").value).toString()), channel: chan.toLowerCase(), oldpass: Crypt.crypt_pass(Crypt.get_pass(chan.toLowerCase()))});
            emit('password', {password: Crypt.crypt_pass(document.getElementById("password").value), channel: chan.toLowerCase()});
        } else {
            //emit('password', {password: Crypt.crypt_pass(CryptoJS.SHA256(document.getElementById("password").value).toString()), channel: chan.toLowerCase()});
            emit('password', {password: Crypt.crypt_pass(document.getElementById("password").value), channel: chan.toLowerCase()});
        }
    },

    log_out: function() {
        before_toast();
        /*if(Crypt.get_pass(chan.toLowerCase())) {*/
            //Crypt.remove_pass(chan.toLowerCase());
        if(Admin.logged_in) {
            socket.emit("logout");
            M.toast({html: "Logged out", displayLength: 4000});
            Admin.display_logged_out();
        } else {
            M.toast({html: "Not logged in", displayLength: 4000});
        }
    },

    display_logged_out: function() {
        Admin.logged_in = false;
        w_p       = true;
        adminpass = "";
        names     = ["vote","addsongs","longsongs","frontpage", "allvideos",
        "removeplay", "skip", "shuffle"];
        document.getElementById("password").value = "";
        $("#thumbnail_form").css("display", "none");
        $("#description_form").css("display", "none");
        for (i = 0; i < names.length; i++) {
            $("input[name="+names[i]+"]").attr("disabled", true);
        }

        if($("#admin-lock").html() != "lock") {
            if(!Helper.mobilecheck()) {
                $('#admin-lock').tooltip("destroy");
                //$('#admin-lock').tooltip('destroy');
            }
            $("#admin-lock").removeClass("clickable");
            $("#admin-lock").html("lock");
        }

        if(!$(".user-password-li").hasClass("hide")) {
            $(".user-password-li").addClass("hide")
        }

        if(!$(".delete-all").hasClass("hide")) {
          $(".delete-all").addClass("hide");
        }

        if($(".password_protected").prop("checked")) {
            $(".change_user_pass").removeClass("hide");
        }

        if(!$(".change_user_pass").hasClass("hide")) {
            $(".change_user_pass").addClass("hide");
        }
        Admin.hideUserSuggested();

        $("#admin-lock").removeClass("clickable");
        $("#password").attr("placeholder", "Enter admin password");
        if(!$(".delete-context-menu").hasClass("context-menu-disabled")) {
            $(".delete-context-menu").addClass("context-menu-disabled");
        }
    },

    save: function(userpass) {
        Admin.submitAdmin(document.getElementById("adminForm").elements, userpass);
    },

    set_conf: function(conf_array) {
        music     = conf_array.allvideos;
        longsongs = conf_array.longsongs;
        names     = ["vote","addsongs","longsongs","frontpage", "allvideos",
        "removeplay", "skip", "shuffle", "userpass"];


        hasadmin = conf_array.adminpass != "";
        var show_disabled = true;
        if(hasadmin && Admin.logged_in || !hasadmin) {
            show_disabled = false;
        }

        for (var i = 0; i < names.length; i++) {
            document.getElementsByName(names[i])[0].checked = (conf_array[names[i]] === true);
            $("input[name="+names[i]+"]").attr("disabled", show_disabled);
        }
        if((hasadmin) && !Admin.logged_in) {
            if($("#admin-lock").html() != "lock") Admin.display_logged_out();
        } else if(!hasadmin) {
            $("#password").attr("placeholder", "Create admin password");
        } else {
            if($(".password_protected").prop("checked")) {
                $(".change_user_pass").removeClass("hide");
            }
        }

        if(!$(".password_protected").prop("checked") && !$(".change_user_pass").hasClass("hide")) {
            $(".change_user_pass").addClass("hide");
            //Crypt.remove_userpass(chan.toLowerCase());
        }

        if(conf_array.thumbnail != undefined && conf_array.thumbnail != "") {
            $("#thumbnail_image").html("<img id='thumbnail_image_channel' src='" + conf_array.thumbnail + "' alt='thumbnail' />");
        }

        if(conf_array.description != undefined && conf_array.description != "") {
            $("#description_area").html(conf_array.description);
        }

    },

    submitAdmin: function(form, userpass_changed) {
        voting     = form.vote.checked;
        addsongs   = form.addsongs.checked;
        longsongs  = form.longsongs.checked;
        frontpage  = form.frontpage.checked;
        allvideos  = form.allvideos.checked;
        removeplay = form.removeplay.checked;
        skipping   = form.skip.checked;
        shuffling  = form.shuffle.checked;
        var pass_send = userpass_changed && !form.userpass.checked ? "" : userpass;
        configs = {
            channel: chan.toLowerCase(),
            voting: voting,
            addsongs: addsongs,
            longsongs: longsongs,
            frontpage: frontpage,
            allvideos: allvideos,
            removeplay: removeplay,
            adminpass: adminpass == "" ? "" : Crypt.crypt_pass(adminpass),
            skipping: skipping,
            shuffling: shuffling,
            userpass: Crypt.crypt_pass(pass_send),
            userpass_changed: userpass_changed
        };

        emit("conf", configs);
    },

    hide_settings: function() {
        $('.sidenav').sidenav('close');
    },

    shuffle: function() {
        if(!offline) {
            //var u = Crypt.crypt_pass(Crypt.get_userpass(chan.toLowerCase()), true);
            //if(u == undefined) u = "";
            emit('shuffle', {channel: chan.toLowerCase()});
        } else {
            for(var x = 0; x < full_playlist.length; x++){
                var num = Math.floor(Math.random()*1000000);
                full_playlist[x].added = num;
            }
            List.sortList();
            List.populate_list(full_playlist);
        }
    },

    get_admin:function() {
        return [w_p, hasadmin];
    }

};
