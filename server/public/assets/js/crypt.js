var Crypt = {

    conf_pass: undefined,
    user_pass: undefined,
    tmp_pass_user: "",
    tmp_pass: "",

    init: function() {

        if(window.location.pathname != "/") {
            if (location.protocol != "https:") {
                document.cookie = chan.toLowerCase() + '=;path=/' + chan.toLowerCase() + ';expires=' + new Date(0).toUTCString();
            } else {
                document.cookie = chan.toLowerCase() + '=;path=/' + chan.toLowerCase() + ';secure;expires=' + new Date(0).toUTCString();
            }
        }

        try {
            conf_arr = Crypt.decrypt(Crypt.getCookie("_opt"), "_opt");
        } catch(err) {
            conf_arr = Crypt.decrypt(Crypt.create_cookie("_opt"), "_opt");
        }

        if(window.location.pathname != "/") {
            change_intelligent(Crypt.get_intelligent_list_enabled());
            if(!conf_arr.hasOwnProperty("color")) {
                Crypt.set_background_color("dynamic", true);
            } else {
                document.querySelector(".backround_switch_class").checked = conf_arr.color == "dynamic";
                if(conf_arr.color != "dynamic") {
                    Helper.removeClass(".background_color_container", "hide");
                    document.querySelector("#background_color_choser").value = conf_arr.color;
                }
            }
            Hostcontroller.change_enabled(conf_arr.remote);
            if(conf_arr.width != 100) Player.set_width(conf_arr.width);
        }
    },

    set_background_color: function(value, first) {
        conf_arr.color = value;
        if(value != "dynamic" && !first) {
            Helper.css("#main-container", "background-color", value);
            Helper.css("#nav", "background-color", value);
            Helper.css(".title-container", "background-color", value);
            document.querySelector("meta[name=theme-color]").setAttribute("content", value);
            Helper.css("#controls", "background", value);
        } else if(!first){
            var url = 'https://img.youtube.com/vi/'+Player.np.id+'/mqdefault.jpg';
            if(videoSource == "soundcloud") url = Player.np.thumbnail;
            getColor(url);
        }
        Crypt.encrypt(conf_arr, "_opt");
    },

    get_background_color: function(value) {
        if(!conf_arr.hasOwnProperty("color")) {
            Crypt.set_background_color("dynamic");
        }
        return conf_arr.color;
    },

    get_intelligent_list_enabled: function() {
        if(conf_arr.hasOwnProperty("intelligent")) {
            return conf_arr.intelligent;
        } else {
            conf_arr.intelligent = false;
            Crypt.encrypt(conf_arr, "_opt");
            return false;
        }
    },

    set_intelligent_list_enabled: function(enabled) {
        conf_arr.intelligent = enabled;
        Crypt.encrypt(conf_arr, "_opt");
    },

    decrypt: function(cookie, name) {
        if(Crypt.getCookie(name) === undefined) {
            cookie = Crypt.create_cookie(name);
        }
        if(cookie == undefined && name == "_opt") return {"volume":100,"width":100,"remote":true,"name":"","offline":false};
        /*var key = btoa("0103060703080703080701") + btoa("0103060703080703080701");
        key = key.substring(0,32);
        key = btoa(key);
        var decrypted = CryptoJS.AES.decrypt(
            cookie,key,
            {
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            }
        );*/

        //return $.parseJSON(decrypted.toString(CryptoJS.enc.Utf8));
        return JSON.parse(atob(cookie));
    },

    decrypt_pass: function(pass) {
        if(socket) {
            /*var key = btoa(socket.id) + btoa(socket.id);
            key = key.substring(0,32);
            key = btoa(key);
            var decrypted = CryptoJS.AES.decrypt(
                pass,key,
                {
                    mode: CryptoJS.mode.CBC,
                    padding: CryptoJS.pad.Pkcs7
                }
            );
            return decrypted.toString(CryptoJS.enc.Utf8);*/
            return atob(pass);
        } return false;
    },

    encrypt: function(json_formated, cookie) {
        var to_encrypt = JSON.stringify(json_formated);
        /*var key = btoa("0103060703080703080701") + btoa("0103060703080703080701");
        key = key.substring(0,32);
        key = btoa(key);
        var encrypted = CryptoJS.AES.encrypt(
            to_encrypt,
            key,
            {
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            }
        );*/
        var encrypted = btoa(to_encrypt);
        var CookieDate = new Date();
        CookieDate.setFullYear(CookieDate.getFullYear( ) +1);
        if (location.protocol != "https:"){
            document.cookie = cookie+"="+encrypted.toString()+";expires="+CookieDate.toGMTString()+";path=/;";
        } else {
            document.cookie = cookie+"="+encrypted.toString()+";secure;expires="+CookieDate.toGMTString()+";path=/;";
        }
    },

    get_volume: function() {
        return Crypt.decrypt(Crypt.getCookie("_opt"), "_opt").volume;
        //return conf_arr.volume;
    },

    get_offline: function() {
        var temp_offline = Crypt.decrypt(Crypt.getCookie("_opt"), "_opt").offline;
        if(temp_offline != undefined){
            return Crypt.decrypt(Crypt.getCookie("_opt"), "_opt").offline;
        } else {
            Crypt.set_offline(false);
            return false;
        }
    },

    set_volume: function(val) {
        conf_arr.volume = val;
        Crypt.encrypt(conf_arr, "_opt");
    },

    create_cookie: function(name) {
        if(name == "_opt") cookie_object = {volume: 100, width: 100, remote: true, name: "", offline: false};
        else cookie_object = {passwords: {}};

        var string_it = JSON.stringify(cookie_object);
        /*var key = btoa("0103060703080703080701") + btoa("0103060703080703080701");
        key = key.substring(0,32);
        key = btoa(key);
        var encrypted = CryptoJS.AES.encrypt(
            string_it,
            key,
            {
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            }
        );*/
        var encrypted = btoa(string_it);

        var CookieDate = new Date();
        CookieDate.setFullYear(CookieDate.getFullYear( ) +1);

        if (location.protocol != "https:"){
            document.cookie = name+"="+encrypted.toString()+";expires="+CookieDate.toGMTString()+";path=/;";
        } else {
            document.cookie = name+"="+encrypted.toString()+";secure;expires="+CookieDate.toGMTString()+";path=/;";
        }
        //document.cookie = name+"="+encrypted.toString()+";expires="+CookieDate.toGMTString()+";path=/;"
        //document.cookie = na"="+encrypted.toString()+";expires="+CookieDate.toGMTString()+";path=/;"
        return Crypt.getCookie(name);
    },

    /*set_pass: function(chan, pass) {
        Crypt.conf_pass.passwords[chan] = pass;
        Crypt.encrypt(Crypt.conf_pass, chan);
    },

    remove_pass:function(chan) {
        delete Crypt.conf_pass.passwords[chan];
        Crypt.encrypt(Crypt.conf_pass, chan.toLowerCase());
    },

    set_userpass: function(chan, pass) {
        Crypt.conf_pass.passwords["userpass"] = pass;
        Crypt.encrypt(Crypt.conf_pass, chan);
    },

    remove_userpass:function(chan) {
        delete Crypt.conf_pass.passwords["userpass"];
        Crypt.encrypt(Crypt.conf_pass, chan.toLowerCase());
    },*/

    set_name:function(name, pass) {
        conf_arr.name = encodeURIComponent(name).replace(/\W/g, '');
        conf_arr.chat_pass = pass;
        Crypt.encrypt(conf_arr, "_opt");
    },

    set_offline: function(enabled) {
        conf_arr.offline = enabled;
        Crypt.encrypt(conf_arr, "_opt");
    },

    remove_name:function() {
        conf_arr.name = "";
        conf_arr.chat_pass = "";
        Crypt.encrypt(conf_arr, "_opt");
    },

    get_pass: function(chan) {
        if(Crypt.conf_pass !== undefined) return Crypt.conf_pass.passwords[chan];
        return undefined;
    },

    get_userpass: function(chan) {
        if(Crypt.conf_pass !== undefined) return Crypt.conf_pass.passwords["userpass"];
        return "";
    },

    set_remote: function(val) {
        conf_arr.remote = val;
        Crypt.encrypt(conf_arr, "_opt");
    },

    get_remote: function(val) {
        return conf_arr.remote;
    },

    crypt_chat_pass: function(pass) {
        /*var key = btoa(socket.id) + btoa(socket.id);
        key = key.substring(0,32);
        key = btoa(key);
        var iv = btoa(Crypt.makeiv());
        var encrypted = CryptoJS.AES.encrypt(
            pass,
            CryptoJS.enc.Base64.parse(key),
            {
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7,
                iv: CryptoJS.enc.Base64.parse(iv),
            }
        );*/
        //window.encrypted = encrypted;
        return btoa(pass);
        //return encrypted.toString() + "$" + iv;
    },

    crypt_pass: function(pass, userpass) {
        if(userpass) {
            Crypt.tmp_pass_user = pass;
        } else {
            Crypt.tmp_pass = pass;
        }
        //return Crypt.crypt_chat_pass(pass);
        return btoa(pass);
    },

    makeiv: function() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < 16; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    },

    get_width: function() {
        return conf_arr.width;
    },

    set_width: function(val) {
        conf_arr.width = val;
        Crypt.encrypt(conf_arr, "_opt");
    },

    getCookie: function(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
    }
};
