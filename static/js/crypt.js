var Crypt = {

	conf_arr: {},

	init: function(){
		
		
        conf_arr = Crypt.decrypt(Crypt.getCookie(chan.toLowerCase()));
        Hostcontroller.change_enabled(conf_arr.remote);
	},

	decrypt: function(cookie){

		if(Crypt.getCookie(chan.toLowerCase()) === undefined) {
			cookie = Crypt.create_cookie();
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
        pass,socket.io.engine.id,
        {
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        }
    	);

    	return decrypted.toString(CryptoJS.enc.Utf8);
	},

	encrypt: function(json_formated){
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

        document.cookie = chan.toLowerCase()+"="+encrypted.toString()+";expires="+CookieDate.toGMTString()+";path=/;"
	},

	get_volume: function(){
		return Crypt.decrypt(Crypt.getCookie(chan.toLowerCase())).volume;
		//return conf_arr.volume;
	},

	set_volume: function(val){
		conf_arr.volume = val;
		Crypt.encrypt(conf_arr);
	},

	create_cookie: function(){
		cookie_object = {volume: 100, width: 100, remote: true, passwords: {}};

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


        document.cookie = chan.toLowerCase()+"="+encrypted.toString()+";expires="+CookieDate.toGMTString()+";path=/;"
        return Crypt.getCookie(chan.toLowerCase());
	},

	set_pass: function(chan, pass){
		conf_arr.passwords[chan] = pass;
		Crypt.encrypt(conf_arr);
	},

	remove_pass:function(chan){
		delete conf_arr.passwords[chan];
		Crypt.encrypt(conf_arr);
	},

	get_pass: function(chan){
		return conf_arr.passwords[chan];
	},

	set_remote: function(val){
		conf_arr.remote = val;
		Crypt.encrypt(conf_arr);
	},

	get_remote: function(val){
		return conf_arr.remote;
	},

	crypt_pass: function(pass){
        var encrypted = CryptoJS.AES.encrypt(
		  pass,
		  socket.io.engine.id,
		  {
		    mode: CryptoJS.mode.CBC,
		    padding: CryptoJS.pad.Pkcs7
		  }
		);
		return encrypted.toString();
	},

	getCookie: function(name) {
	  	var value = "; " + document.cookie;
	  	var parts = value.split("; " + name + "=");
	  	if (parts.length == 2) return parts.pop().split(";").shift();
	}
}