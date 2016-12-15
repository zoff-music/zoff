var Crypt = {

	conf_pass: undefined,

	init: function(){

		document.cookie = chan.toLowerCase() + '=; path=/' + chan.toLowerCase() + ';secure;expires=' + new Date(0).toUTCString();

		try{
        	conf_arr = Crypt.decrypt(Crypt.getCookie("_opt"), "_opt");
        }catch(err){
        	conf_arr = Crypt.decrypt(Crypt.create_cookie("_opt"), "_opt");
        }
        try{
        	Crypt.conf_pass = Crypt.decrypt(Crypt.getCookie(chan.toLowerCase()), chan.toLowerCase());
        }catch(err){
        	Crypt.conf_pass = Crypt.decrypt(Crypt.create_cookie(chan.toLowerCase()), chan.toLowerCase());
        }
        Hostcontroller.change_enabled(conf_arr.remote);
        if(conf_arr.width != 100) Player.set_width(conf_arr.width);
        if(conf_arr.name !== undefined && conf_arr.name !== "") Chat.namechange(conf_arr.name);
	},

	decrypt: function(cookie, name){
		if(Crypt.getCookie(name) === undefined) {
			cookie = Crypt.create_cookie(name);
		}

		var decrypted = CryptoJS.AES.decrypt(
	        cookie,"0103060703080703080701",
	        {
	            mode: CryptoJS.mode.CBC,
	            padding: CryptoJS.pad.Pkcs7
			}
		);

    	return $.parseJSON(decrypted.toString(CryptoJS.enc.Utf8));
	},

	decrypt_pass: function(pass){
		var decrypted = CryptoJS.AES.decrypt(
        pass,socket.id,
        {
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        }
    	);

    	return decrypted.toString(CryptoJS.enc.Utf8);
	},

	encrypt: function(json_formated, cookie){
		var to_encrypt = JSON.stringify(json_formated);

        var encrypted = CryptoJS.AES.encrypt(
		  to_encrypt,
		  "0103060703080703080701",
		  {
		    mode: CryptoJS.mode.CBC,
		    padding: CryptoJS.pad.Pkcs7
		  }
		);

        var CookieDate = new Date();
        CookieDate.setFullYear(CookieDate.getFullYear( ) +1);
        document.cookie = cookie+"="+encrypted.toString()+";secure;expires="+CookieDate.toGMTString()+";path=/;";
	},

	encrypt_string: function(string){
		var encrypted = CryptoJS.AES.encrypt(
		  string,
		  socket.id,
		  {
		    mode: CryptoJS.mode.CBC,
		    padding: CryptoJS.pad.Pkcs7
		  }
		);
		return encrypted.toString();
	},

	get_volume: function(){
		return Crypt.decrypt(Crypt.getCookie("_opt"), "_opt").volume;
		//return conf_arr.volume;
	},

	set_volume: function(val){
		conf_arr.volume = val;
		Crypt.encrypt(conf_arr, "_opt");
	},

	create_cookie: function(name){
		if(name == "_opt") cookie_object = {volume: 100, width: 100, remote: true, name: ""};
		else cookie_object = {passwords: {}};

        var string_it = JSON.stringify(cookie_object);

        var encrypted = CryptoJS.AES.encrypt(
		  string_it,
		  "0103060703080703080701",
		  {
		    mode: CryptoJS.mode.CBC,
		    padding: CryptoJS.pad.Pkcs7
		  }
		);

        var CookieDate = new Date();
        CookieDate.setFullYear(CookieDate.getFullYear( ) +1);

        document.cookie = name+"="+encrypted.toString()+";secure;expires="+CookieDate.toGMTString()+";path=/;";
        //document.cookie = name+"="+encrypted.toString()+";expires="+CookieDate.toGMTString()+";path=/;"
        //document.cookie = na"="+encrypted.toString()+";expires="+CookieDate.toGMTString()+";path=/;"
        return Crypt.getCookie(name);
	},

	set_pass: function(chan, pass){
		Crypt.conf_pass.passwords[chan] = pass;
		Crypt.encrypt(Crypt.conf_pass, chan);
	},

	remove_pass:function(chan){
		delete Crypt.conf_pass.passwords[chan];
		Crypt.encrypt(Crypt.conf_pass, chan.toLowerCase());
	},

	set_name:function(name){
		conf_arr.name = encodeURIComponent(name).replace(/\W/g, '');
		Crypt.encrypt(conf_arr, "_opt");
	},

	remove_name:function(){
		conf_arr.name = "";
		Crypt.encrypt(conf_arr, "_opt");
	},

	get_pass: function(chan){
		if(Crypt.conf_pass !== undefined) return Crypt.conf_pass.passwords[chan];
		return undefined;
	},

	set_remote: function(val){
		conf_arr.remote = val;
		Crypt.encrypt(conf_arr, "_opt");
	},

	get_remote: function(val){
		return conf_arr.remote;
	},

	crypt_pass: function(pass){
        var encrypted = CryptoJS.AES.encrypt(
		  pass,
		  socket.id,
		  {
		    mode: CryptoJS.mode.CBC,
		    padding: CryptoJS.pad.Pkcs7
		  }
		);
		return encrypted.toString();
	},

	get_width: function(){
		return conf_arr.width;
	},

	set_width: function(val){
		conf_arr.width = val;
		Crypt.encrypt(conf_arr, "_opt");
	},

	getCookie: function(name) {
	  	var value = "; " + document.cookie;
	  	var parts = value.split("; " + name + "=");
	  	if (parts.length == 2) return parts.pop().split(";").shift();
	}
};
