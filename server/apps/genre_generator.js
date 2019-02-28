var path = require('path');
var publicPath = path.join(__dirname, 'public');
var pathThumbnail = __dirname;
pathThumbnails = __dirname + "/../";
var time_regex = /P((([0-9]*\.?[0-9]*)Y)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)W)?(([0-9]*\.?[0-9]*)D)?)?(T(([0-9]*\.?[0-9]*)H)?(([0-9]*\.?[0-9]*)M)?(([0-9]*\.?[0-9]*)S)?)?/;
try {
    var keys = require(path.join(__dirname, '../config/api_key.js'));
    var key = keys.youtube;
    var soundcloudKey = keys.soundcloud;
} catch(e) {
    console.log("Error - missing file");
    console.log("Seems you forgot to create the file api_key.js in /server/config/. Have a look at api_key.example.js.");
    process.exit(1);
}
var Search = require(pathThumbnail + '/../handlers/search.js');
var request = require('request');
var db = require(pathThumbnail + '/../handlers/db.js');
var currentList = 0;
var listNames = [];
db.getCollectionNames(function(e, d) {
    for(var i = 0; i < d.length; i++) {
        if(d[i].indexOf("_") < 0) {
            listNames.push(d[i]);
        }
    }
    console.log("Number of lists is " + listNames.length);
    /*for(var i = 0; i < listNames.length; i++) {
        getListItems(d[i]);
        if(i > 1000) return;
    }*/
    recursivifyListLooping(listNames, 0);
});

function filterFunction(el) {
    return el != null &&
    el != "" &&
    el != undefined &&
    el.trim() != ''
}

function recursivifyListLooping(listNames, i) {
    if(i > listNames.length) {
        console.log("Done");
        return;
    }
    console.log("List " + i + " of " + listNames.length);
    getListItems(listNames, 0, function() {
        console.log("done");
    });
}

function getListItems(arr, i, callback) {
    console.log("List " + i + " of " + listNames.length + " - " + arr[i]);
    if(i >= arr.length) {
        if(typeof(callback) == "function") callback();
        return;
    }
    try {
        db.collection(arr[i]).find(function(e, d) {
            if(d.length > 0) {
                Search.get_genres_list_recursive(d, arr[i], function(){
                    getListItems(arr, i + 1, callback);
                });
            } else {
                getListItems(arr, i + 1, callback);
            }
        });
    } catch(e) {
        getListItems(arr, i + 1, callback);
    }
}
