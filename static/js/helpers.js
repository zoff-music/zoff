var Helper = {
    rnd: function(arr)
    {
    	return arr[Math.floor(Math.random() * arr.length)];
    },

    predicate: function() {
    	var fields = [],
    		n_fields = arguments.length,
    		field, name, cmp;

    	var default_cmp = function (a, b) {
    			if (a === b) return 0;
    			return a < b ? -1 : 1;
    		},
    		getCmpFunc = function (primer, reverse) {
    			var dfc = default_cmp,
    				// closer in scope
    				cmp = default_cmp;
    			if (primer) {
    				cmp = function (a, b) {
    					return dfc(primer(a), primer(b));
    				};
    			}
    			if (reverse) {
    				return function (a, b) {
    					return -1 * cmp(a, b);
    				};
    			}
    			return cmp;
    		};

    	// preprocess sorting options
    	for (var i = 0; i < n_fields; i++) {
    		field = arguments[i];
    		if (typeof field === 'string') {
    			name = field;
    			cmp = default_cmp;
    		} else {
    			name = field.name;
    			cmp = getCmpFunc(field.primer, field.reverse);
    		}
    		fields.push({
    			name: name,
    			cmp: cmp
    		});
    	}

    	// final comparison function
    	return function (A, B) {
    		var name, result;
    		for (var i = 0; i < n_fields; i++) {
    			result = 0;
    			field = fields[i];
    			name = field.name;

    			result = field.cmp(A[name], B[name]);
    			if (result !== 0) break;
    		}
    		return result;
    	};
    },

    hashCode: function(str) { // java String#hashCode
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
           hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return hash;
    },

    intToARGB: function(i){
        return ((i>>24)&0xFF).toString(16) +
               ((i>>16)&0xFF).toString(16) +
               ((i>>8)&0xFF).toString(16) +
               (i&0xFF).toString(16);
    },

    pad: function(n)
    {
    	return n < 10 ? "0"+Math.floor(n) : Math.floor(n);
    },


    contains: function(a, obj) {
        var i = a.length;
        while (i--) {
           if (a[i] === obj) {
               return true;
           }
        }
        return false;
    },

    sample: function() {
    	if (Date.now() - lastSample >= SAMPLE_RATE * 2) {
    		socket.removeAllListeners()
    		socket.disconnect();
    		socket.connect();
    		Youtube.setup_all_listeners();
    	}
    	lastSample = Date.now();
    	setTimeout(Helper.sample, SAMPLE_RATE);
    },

    loadjsfile: function(filename)
    {
    	if (filesadded.indexOf("["+filename+"]")==-1){
    	    var fileref=document.createElement('script');
    	    fileref.setAttribute("type","text/javascript");
    	    fileref.setAttribute("src", filename);
    	    document.getElementsByTagName("head")[0].appendChild(fileref);
    	    filesadded+="["+filename+"]";
    	}
    },

    msieversion: function() {

            var ua = window.navigator.userAgent;
            var msie = ua.indexOf("MSIE ");

            if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))      // If Internet Explorer, return version number
                return true;
            else                 // If another browser, return 0
                return false;
    },

    getRandomInt: function(min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
    },

    rgbToHsl: function(arr){
    		r = arr[0], g = arr[1], b = arr[2];
        r /= 255, g /= 255, b /= 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;

        if(max == min){
            h = s = 0; // achromatic
        }else{
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch(max){
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        if(l>0.5)l=0.5; //make sure it isnt too light

        return "hsl("+Math.floor(h*360)+", "+Math.floor(s*100)+"%, "+Math.floor(l*100)+"%)";
    }

  }

  Element.prototype.remove = function() {
      this.parentElement.removeChild(this);
  }

  NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
      for(var i = 0, len = this.length; i < len; i++) {
          if(this[i] && this[i].parentElement) {
              this[i].parentElement.removeChild(this[i]);
          }
      }
}