var Admin = {

    beginning:true,
    logged_in: false,

    pw: function(msg) {
        Admin.logged_in = msg;
        if(!msg) return;
        w_p = false;

        if(Admin.logged_in) {
            Helper.css("#thumbnail_form", "display", "inline-block");
            Helper.css("#description_form", "display", "inline-block");
            Helper.removeClass("#user_suggests", "hide");
            Helper.removeClass("#user-suggest-html", "hide");
            if(Helper.html(".suggested-badge") != "0" && Helper.html(".suggested-badge") != "") {
                Helper.removeClass(".suggested-badge", "hide");
            }
            if(!Helper.mobilecheck()) {
                Helper.tooltip('#chan_thumbnail', {
                    delay: 5,
                    position: "left",
                    html: "imgur link"
                });
            }
        } else {
            Admin.hideUserSuggested();
        }
        Helper.removeClass(".delete-context-menu", "context-menu-disabled");
        names     = ["vote","addsongs","longsongs","frontpage", "allvideos",
        "removeplay", "skip", "shuffle", "userpass"];
        //Crypt.set_pass(chan.toLowerCase(), Crypt.tmp_pass);

        for (var i = 0; i < names.length; i++) {
            document.getElementsByName(names[i])[0].setAttribute("disabled", false);
        }

        Helper.removeClass(".card-action", "hide");
        Helper.addClass("#admin-lock", "clickable");
        document.getElementById("admin-lock").innerHTML = "lock_open";
        if(!Helper.mobilecheck()){
            Helper.tooltip('#admin-lock', {
                delay: 5,
                position: "left",
                html: "Logout"
            });
        }
        document.getElementById("password").value = "";
        document.getElementById("password").setAttribute("placeholder", "Change admin password");
        Helper.removeClass(".user-password-li", "hide");
        Helper.removeClass(".delete-all", "hide");
        if(document.getElementsByClassName("password_protected")[0].checked) {
            Helper.removeClass(".change_user_pass", "hide");
        }

        if(Helper.html("#admin-lock") != "lock_open"){
            Helper.addClass("#admin-lock", "clickable");
            document.getElementById("admin-lock").innerHTML = "lock_open";
            if(!Helper.mobilecheck()){
                Helper.tooltip('#admin-lock', {
                    delay: 5,
                    position: "left",
                    html: "Logout"
                });
            }
        }
    },

    hideUserSuggested: function() {
        Helper.addClass("#user_suggests", "hide")
        Helper.addClass("#user-suggest-html", "hide");
        Helper.addClass(".suggested-badge", "hide");
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
        Helper.css("#thumbnail_form", "display", "none");
        Helper.css("#description_form", "display", "none");
        for (i = 0; i < names.length; i++) {
            document.getElementsByName(names[i])[0].setAttribute("disabled", true);
        }

        if(Helper.html("#admin-lock") != "lock") {
            if(!Helper.mobilecheck()) {
                Helper.tooltip('#admin-lock', "destroy");
                //$('#admin-lock').tooltip('destroy');
            }
            Helper.removeClass("#admin-lock", "clickable");
            document.getElementById("admin-lock").innerHTML = "lock";
        }


        Helper.addClass(".user-password-li", "hide");
        Helper.addClass(".delete-all", "hide");

        if(document.getElementsByClassName("password_protected")[0].checked) {
            Helper.removeClass(".change_user_pass", "hide");
        }

        Helper.addClass(".change_user_pass", "hide");
        Admin.hideUserSuggested();

        Helper.removeClass("#admin-lock", "clickable");
        document.getElementById("password").setAttribute("placeholder", "Enter admin password");
        Helper.addClass(".delete-context-menu", "context-menu-disabled");
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
            document.getElementsByName(names[i])[0].setAttribute("disabled", show_disabled);
        }
        if((hasadmin) && !Admin.logged_in) {
            if(Helper.html("#admin-lock") != "lock") Admin.display_logged_out();
        } else if(!hasadmin) {
            document.getElementById("password").setAttribute("placeholder", "Create admin password");
        } else {
            if(document.getElementsByClassName("password_protected")[0].checked) {
                Helper.removeClass(".change_user_pass", "hide");
            }
        }

        if(!document.getElementsByClassName("password_protected")[0].checked) {
            Helper.addClass(".change_user_pass", "hide");
            //Crypt.remove_userpass(chan.toLowerCase());
        }

        if(conf_array.thumbnail != undefined && conf_array.thumbnail != "") {
            document.getElementById("thumbnail_image").innerHTML = "<img id='thumbnail_image_channel' src='" + conf_array.thumbnail + "' alt='thumbnail' />";
        }

        if(conf_array.description != undefined && conf_array.description != "") {
            document.getElementById("description_area").innerHTML = conf_array.description;
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
        var sidenavElem = document.getElementsByClassName("sidenav")[0];
        M.Sidenav.getInstance(sidenavElem).close();
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
