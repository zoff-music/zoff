var Crypt = {

	conf_arr: {},

	init: function(){
		try{
        	conf_arr = Crypt.decrypt(Crypt.getCookie("_opt"), "_opt");
        	conf_pass = Crypt.decrypt(Crypt.getCookie(chan.toLowerCase()), chan.toLowerCase());
        }catch(err){
        	conf_arr = Crypt.decrypt(Crypt.create_cookie("_opt"), "_opt");
        	conf_pass = Crypt.decrypt(Crypt.create_cookie(chan.toLowerCase()), chan.toLowerCase());
        }
        Hostcontroller.change_enabled(conf_arr.remote);
        Youtube.set_width(conf_arr["width"]);
	},

	decrypt: function(cookie, name){
		if(Crypt.getCookie(name) === undefined) {
			cookie = Crypt.create_cookie(name);
		}

		var decrypted = CryptoJS.AES.decrypt(
	        cookie,navigator.userAgent+navigator.languages,
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
		  navigator.userAgent+navigator.languages,
		  {
		    mode: CryptoJS.mode.CBC,
		    padding: CryptoJS.pad.Pkcs7
		  }
		);
		
        var CookieDate = new Date;
        CookieDate.setFullYear(CookieDate.getFullYear( ) +1);
        if(cookie != "_opt") add = chan.toLowerCase()+";";
        else add = ";"
        document.cookie = cookie+"="+encrypted.toString()+";expires="+CookieDate.toGMTString()+";path=/"+add
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
		if(name == "_opt") cookie_object = {volume: 100, width: 100, remote: true};
		else cookie_object = {passwords: {}};
		

        var string_it = JSON.stringify(cookie_object);

        var encrypted = CryptoJS.AES.encrypt(
		  string_it,
		  navigator.userAgent+navigator.languages,
		  {
		    mode: CryptoJS.mode.CBC,
		    padding: CryptoJS.pad.Pkcs7
		  }
		);

        var CookieDate = new Date;
        CookieDate.setFullYear(CookieDate.getFullYear( ) +1);

        if(name != "_opt") add = chan.toLowerCase();
        else add = ";"
        document.cookie = name+"="+encrypted.toString()+";expires="+CookieDate.toGMTString()+";path=/"+add
        //document.cookie = name+"="+encrypted.toString()+";expires="+CookieDate.toGMTString()+";path=/;"
        //document.cookie = na"="+encrypted.toString()+";expires="+CookieDate.toGMTString()+";path=/;"
        return Crypt.getCookie(name);
	},

	set_pass: function(chan, pass){
		conf_pass.passwords[chan] = pass;
		Crypt.encrypt(conf_pass, chan);
	},

	remove_pass:function(chan){
		delete conf_pass.passwords[chan];
		Crypt.encrypt(conf_pass, chan.toLowerCase());
	},

	get_pass: function(chan){
		return conf_pass.passwords[chan];
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
		return conf_arr["width"];
	},

	set_width: function(val){
		conf_arr["width"] = val;
		Crypt.encrypt(conf_arr, "_opt");
	},

	getCookie: function(name) {
	  	var value = "; " + document.cookie;
	  	var parts = value.split("; " + name + "=");
	  	if (parts.length == 2) return parts.pop().split(";").shift();
	}
}