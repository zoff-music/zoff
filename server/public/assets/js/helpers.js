var Helper = {

    log: function(to_log) {
        if(localStorage.debug === "true") {
            console.log(to_log);
        }
    },

    rnd: function(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    },

    mobilecheck: function() {
        var isMobile = false; //initiate as false
        // device detection
        if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
        || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) isMobile = true;
        return isMobile;
    },

    predicate: function() {
        var fields = [],
        n_fields = arguments.length,
        field, name, cmp;

        var default_cmp = function (a, b) {
            if(a == undefined) a = 0;
            if(b == undefined) b = 0;
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

    intToARGB: function(i) {
        return ((i>>24)&0xFF).toString(16) +
        ((i>>16)&0xFF).toString(16) +
        ((i>>8)&0xFF).toString(16) +
        (i&0xFF).toString(16);
    },

    hexToRgb: function(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },

    hslToRgb: function(h, s, l) {
        var r, g, b;

        if (s == 0) {
            r = g = b = l; // achromatic
        } else {
            function hue2rgb(p, q, t) {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }

            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;

            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return [ r * 255, g * 255, b * 255 ];
    },


    pad: function(n) {
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
            socket.removeAllListeners();
            socket.disconnect();
            socket.connect();
            Player.setup_all_listeners();
        }
        lastSample = Date.now();
        setTimeout(Helper.sample, SAMPLE_RATE);
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

    secondsToOther: function(seconds) {
        var time = seconds;
        var minutes = Math.floor(time/60);
        time = time - (minutes * 60);
        return [minutes, time];
    },

    rgbToHsl: function(arr, light) {
        r = arr[0];
        g = arr[1];
        b = arr[2];
        r /= 255;
        g /= 255;
        b /= 255;
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

        if(l>0.5 && light)l=0.4; //make sure it isnt too light
        else if(l<0.65 && !light)l=0.65;

        return "hsl("+Math.floor(h*360)+", "+Math.floor(s*100)+"%, "+Math.floor(l*100)+"%)";
    },

    componentToHex: function(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    },

    rgbToHex: function(r, g, b) {
        return "#" + Helper.componentToHex(r) + Helper.componentToHex(g) + Helper.componentToHex(b);
    },

    upperFirst: function(string){
        return string.substring(0,1).toUpperCase()+string.substring(1).toLowerCase();
    },

    addClass: function(object, toAdd){
        if(!Helper.contains($(object).attr("class").split(" "), toAdd)){
            $(object).addClass(toAdd);
        }
    },

    send_mail: function(from, message){
        if(from !== "" && message !== ""){

            $("#submit-contact-form").addClass("hide");
            $("#send-loader").removeClass("hide");
            $("#contact-form-from").attr("disabled", "true");
            $("#contact-form-message").attr("disabled", "true");

            $.ajax({
                type: "POST",
                data: {from: from, message: message},
                url: "/api/mail",
                success: function(data){
                    if(data == "success"){
                        $("#contact-container").empty();
                        $("#contact-container").html("Mail has been sent, we'll be back with you shortly.")
                    }else{
                        $("#contact-container").empty();
                        $("#contact-container").html("Something went wrong, sorry about that. You could instead try with your own mail-client: <a title='Open in client' href='mailto:contact@zoff.no?Subject=Contact%20Zoff'>contact@zoff.no</a>")
                    }
                }
            });
        }
    },

    firstY: null,
    lastY: null,
    currentY: null,
    vertScroll: false,
    initAdjustment: 0,

    touchstart: function(event) {
        Helper.lastY = Helper.currentY = Helper.firstY = event.originalEvent.touches[0].pageY;
    },

    touchmove: function(event) {
        Helper.currentY = event.originalEvent.touches[0].pageY;
        var adjustment = Helper.lastY-Helper.currentY;

        // Mimic native vertical scrolling where scrolling only starts after the
        // cursor has moved up or down from its original position by ~30 pixels.
        if (!Helper.vertScroll && Math.abs(Helper.currentY-Helper.firstY) > 30) {
            Helper.vertScroll = true;
            Helper.initAdjustment = Helper.currentY-Helper.firstY;
        }

        // only apply the adjustment if the user has met the threshold for vertical scrolling
        if (Helper.vertScroll) {
            window.scrollBy(0,adjustment + Helper.initAdjustment);
            Helper.lastY = Helper.currentY + adjustment;
        }

    },

    touchend: function(event) {
        Helper.vertScroll = false;
        Helper.firstY = null;
        Helper.currentY = null;
        Helper.vertScroll = false;
        Helper.initAdjustment = 0;
        Helper.currentY = null;
    },

    invertColor: function(hex) {
        if (hex.indexOf('#') === 0) {
            hex = hex.slice(1);
        }
        // convert 3-digit hex to 6-digits.
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        if (hex.length !== 6) {
            throw new Error('Invalid HEX color.');
        }
        // invert color components
        var r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16),
        g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16),
        b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16);
        // pad each with zeros and return
        return '#' + padZero(r) + padZero(g) + padZero(b);
    },

    padZero: function(str, len) {
        len = len || 2;
        var zeros = new Array(len).join('0');
        return (zeros + str).slice(-len);
    },

    replaceForFind: function(str) {
        str = str.toLowerCase();
        if(str.startsWith("the")) {
            str = str.replace("the", "");
        }
        str = str.replace(" hd", "");
        str = str.replace("official hd video", "");
        str = str.replace("unofficial video", "");
        str = str.replace("studio footage", "");
        str = str.replace("great song", "");
        str = str.replace("-", " ");
        str = str.replace("-", " ");
        str = str.replace(" hq", " ");
        str = str.replace("lyric video", "");
        str = str.replace("lyrics video", "");
        str = str.replace("album version", "");
        str = str.replace("drive original movie soundtrack", "");
        str = str.replace("original movie soundtrack", "");
        str = str.replace("live sessions", "");
        str = str.replace("audio only", "");
        str = str.replace("audio", "");
        str = str.replace("(new)", "");
        str = str.replace(" by ", " ");
        str = str.replace(" vs ", " ");
        str = str.replace("(full)", " ");
        str = str.replace("(video)", " ");
        str = str.replace("&", " ");
        str = str.replace("with lyrics", "");
        str = str.replace("lyrics", "");
        str = str.replace("w/", "");
        str = str.replace("w/", "");
        str = str.replace("official video", "");
        str = str.replace("studio version", "");
        str = str.replace("official music video", "");
        str = str.replace("music video", "");
        str = str.replace("musicvideo", "");
        str = str.replace("original video", "");
        str = str.replace("full version", "");
        str = str.replace("full song", "");
        str = str.replace("(official)", "");
        str = str.replace("official", "");
        str = str.replace("(original)", "");
        str = str.replace("(", " ");
        str = str.replace(")", " ");
        str = str.replace("|", "");
        str = str.replace("feat.", " ");
        str = str.replace("feat", " ");
        str = str.replace("ft.", " ");
        str = str.replace("[", " ");
        str = str.replace("]", " ");
        str = str.replace(" free ", "");
        str = str.replace(" hd", "");
        str = str.replace("original mix", " ");
        str = str.replace("radio edit", " ");
        str = str.replace("pop version", " ");
        str = str.replace("  ", " ").replace("  ", " ").replace("  ", " ").replace("  ", " ").replace("  ", " ").replace("  ", " ");
        str = str.replace("(", " ");
        str = str.replace(")", " ");
        str = str.replace("[", " ");
        str = str.replace("]", " ");
        str = str.replace("-", " ");
        str = str.replace("-", " ");
        str = str.replace("-", " ");
        str = str.replace("original mix", " ");
        str = str.replace("album version", " ");
        str = str.replace("abum version", " ");
        str = str.replace("feat.", " ");
        str = str.replace("feat.", " ");
        str = str.replace("feat", " ");
        str = str.replace("feat", " ");
        str = str.replace("ft.", " ");
        str = str.replace("radio edit", " ");
        str = str.replace("pop version", " ");
        str = str.replace("  ", " ").replace("  ", " ").replace("  ", " ").replace("  ", " ").replace("  ", " ").replace("  ", " ").replace("  ", " ").replace("  ", " ");
        str = str.replace("  ", " ").replace("  ", " ").replace("  ", " ").replace("  ", " ").replace("  ", " ").replace("  ", " ").replace("  ", " ").replace("  ", " ");
        return str;
    }

};

Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
};

NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
    for(var i = 0, len = this.length; i < len; i++) {
        if(this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
};

String.prototype.startsWith = function(searchString, position) {
    position = position || 0;
    return this.indexOf(searchString, position) === position;
};

function similarity(s1, s2) {
  var longer = s1;
  var shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  var longerLength = longer.length;
  if (longerLength == 0) {
    return 1.0;
  }
  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  var costs = new Array();
  for (var i = 0; i <= s1.length; i++) {
    var lastValue = i;
    for (var j = 0; j <= s2.length; j++) {
      if (i == 0)
        costs[j] = j;
      else {
        if (j > 0) {
          var newValue = costs[j - 1];
          if (s1.charAt(i - 1) != s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue),
              costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0)
      costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}
