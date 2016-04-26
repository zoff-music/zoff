importScripts('/static/dist/lib/cache-polyfill.js');

var CACHE_VERSION = 'app-v1';
var CACHE_FILES = [
    '/static/images/favicon.png',
    '/static/css/style.css',
    '/static/css/materialize.min.css',
    'https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/themes/smoothness/jquery-ui.min.css',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js',
    'https://ajax.googleapis.com/ajax/libs/jqueryui/1.11.4/jquery-ui.min.js',
    '/static/dist/lib/materialize.min.js',
    'https://cdn.socket.io/socket.io-1.4.5.js',
    '/static/dist/lib/jquery.lazyload.js',
    '/static/dist/lib/color-thief.js',
    '/static/dist/main.min.js'
];

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_VERSION)
            .then(function (cache) {
                console.log('Opened cache');
                return cache.addAll(CACHE_FILES);
            })
    );
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function(keys){
            return Promise.all(keys.map(function(key, i){
                if(key !== CACHE_VERSION){
                    return caches.delete(keys[i]);
                }
            }))
        })
    )
});

self.addEventListener('fetch', function (event) {
    console.log(event);
    event.respondWith(
        caches.match(event.request).then(function(res){
            if(res){
                return res;
            }
            requestBackend(event);
        })
    )
});

function requestBackend(event){
    var url = event.request.clone();
    return fetch(url).then(function(res){
        //if not a valid response send the error
        if(!res || res.status !== 200 || res.type !== 'basic'){
            return res;
        }

        var response = res.clone();

        caches.open(CACHE_VERSION).then(function(cache){
            cache.put(event.request, response);
        });

        return res;
    })
}