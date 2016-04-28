//importScripts('/static/dist/lib/cache-polyfill.js');

var version = 'v1.3.1';
var CACHE_FILES = [
    'https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=https://zoff.no/&choe=UTF-8&chld=L%7C1',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    '/static/dist/lib/jquery-2.1.3.min.js',
    '/static/dist/lib/jquery-ui-1.10.3.min.js',
    '/static/images/favicon.png',
    '/static/css/style.css',
    '/static/css/materialize.min.css',
    '/static/dist/lib/materialize.min.js',
    'https://cdn.socket.io/socket.io-1.4.5.js',
    '/static/dist/lib/jquery.lazyload.js',
    '/static/dist/lib/color-thief.js',
    '/static/dist/main.min.js',
    '/static/images/squareicon_small.png',
    '/static/images/GitHub_Logo.png',
    '/static/images/facebook.png',
    '/static/images/twitter.png',
    '/static/offline/offline.html',
    '/static/font/roboto/Roboto-Light.woff2',
    '/static/font/roboto/Roboto-Regular.woff2',
    '/static/font/roboto/Roboto-Thin.woff2',
    '/static/images/loading.png'
];

self.addEventListener("install", function(event) {
    event.waitUntil(
        /* The caches built-in is a promise-based API that helps you cache responses,
            as well as finding and deleting them.
        */
        caches
        /* You can open a cache by name, and this method returns a promise. We use
            a versioned cache name here so that we can remove old cache entries in
            one fell swoop later, when phasing out an older service worker.
        */
        .open(version + '::bare')
        .then(function(cache) {
            /* After the cache is opened, we can fill it with the offline fundamentals.
                The method below will add all resources we've indicated to the cache,
                after making HTTP requests for each of them.
            */
            return cache.addAll(CACHE_FILES);
        })
        .then(function() {
            //console.log('WORKER: install completed');
        })
    );
});

self.addEventListener("activate", function(event) {
    /* Just like with the install event, event.waitUntil blocks activate on a promise.
     Activation will fail unless the promise is fulfilled.
    */
    //console.log('WORKER: activate event in progress.');

    var cacheWhitelist = version;


    event.waitUntil(
        caches.keys().then(function(keyList) {
            return Promise.all(keyList.map(function(key) {
                if (!key.startsWith(cacheWhitelist)) {
                    return caches.delete(key);
                }
            }));
        })
    );
/*
    event.waitUntil(
        caches
        /* This method returns a promise which will resolve to an array of available
                cache keys.
            
        .keys()
        .then(function (keys) {
            // We return a promise that settles when all outdated caches are deleted.
            return Promise.all(
                keys
                .filter(function (key) {
                    // Filter by keys that don't start with the latest version prefix.
                    return !key.startsWith(version);
                })
                .map(function (key) {
                /* Return a promise that's fulfilled
                    when each outdated cache is deleted.
                
                    return caches.delete(key);
                })
            );
        })
        .then(function() {
            //console.log('WORKER: activate completed.');
        })
    );
*/
});

self.addEventListener("fetch", function(event) {
    //console.log('WORKER: fetch event in progress.');

    /* We should only cache GET requests, and deal with the rest of method in the
        client-side, by handling failed POST,PUT,PATCH,etc. requests.
    */
    if (event.request.method !== 'GET') {
        /* If we don't block the event as shown below, then the request will go to
            the network as usual.
        */
        //console.log('WORKER: fetch event ignored.', event.request.method, event.request.url);
        return;
    }
    /* Similar to event.waitUntil in that it blocks the fetch event on a promise.
        Fulfillment result will be used as the response, and rejection will end in a
        HTTP response indicating failure.
    */
    event.respondWith(
        caches
        /* This method returns a promise that resolves to a cache entry matching
            the request. Once the promise is settled, we can then provide a response
            to the fetch request.
        */
        .match(event.request)
        .then(function(cached) {
            /* Even if the response is in our cache, we go to the network as well.
               This pattern is known for producing "eventually fresh" responses,
               where we return cached responses immediately, and meanwhile pull
               a network response and store that in the cache.
               Read more:
               https://ponyfoo.com/articles/progressive-networking-serviceworker
            */
            var networked = fetch(event.request)
            // We handle the network request with success and failure scenarios.
            .then(fetchedFromNetwork, unableToResolve)
            // We should catch errors on the fetchedFromNetwork handler as well.
            .catch(unableToResolve);

            /* We return the cached response immediately if there is one, and fall
                back to waiting on the network as usual.
            */
            //console.log('WORKER: fetch event', cached ? '(cached)' : '(network)', event.request.url);
            return cached || networked;

            function fetchedFromNetwork(response) {
                /* We copy the response before replying to the network request.
                    This is the response that will be stored on the ServiceWorker cache.
                */
                var cacheCopy = response.clone();

                //console.log('WORKER: fetch response from network.', event.request.url);

                //console.log(event.request.url == "http://localhost/");
                caches
                // We open a cache to store the response for this request.
                .open(version + '::plus')
                .then(function add(cache) {
                    /* We store the response for this request. It'll later become
                        available to caches.match(event.request) calls, when looking
                        for cached responses.
                    */
                    if(event.request.url.indexOf(":8880")                      == -1 &&
                        event.request.url.indexOf("img.youtube.com/vi/")       == -1 &&
                        event.request.url.indexOf("static/images/thumbnails")  == -1 &&
                        event.request.url.indexOf("chart.googleapis")          == -1 &&
                        event.request.url != "https://zoff.no/"                      && 
                        event.request.url != "http://localhost/"                     &&
                        event.request.url.indexOf("googleapis.com/youtube/v3") == -1 &&
                        event.request.url.indexOf("google-analytics.com/")     == -1 &&
                        event.request.url.indexOf("google-analytics.com/")     == -1 &&
                        event.request.url.indexOf("i.ytimg.com")               == -1 &&
                        event.request.url.indexOf("php/")                      == -1 &&
                        event.request.url.indexOf("/static/")                  == -1 &&
                        event.request.url.indexOf("https://zoff.no/")          == -1 && 
                        event.request.url.indexOf("http://localhost/")         == -1 &&
                        event.request.url.indexOf("cdn.socket.io")             == -1) {
                        cache.put(event.request, cacheCopy);
                    }
                })
                .then(function() {
                    //console.log('WORKER: fetch response stored in cache.', event.request.url);
                });

                // Return the response so that the promise is settled in fulfillment.
                return response;
            
            }

            /* When this method is called, it means we were unable to produce a response
               from either the cache or the network. This is our opportunity to produce
               a meaningful response even when all else fails. It's the last chance, so
               you probably want to display a "Service Unavailable" view or a generic
               error response.
            */
            function unableToResolve () {
                /* There's a couple of things we can do here.
                    - Test the Accept header and then return one of the `offlineFundamentals`
                     e.g: `return caches.match('/some/cached/image.png')`
                    - You should also consider the origin. It's easier to decide what
                     "unavailable" means for requests against your origins than for requests
                     against a third party, such as an ad provider
                    - Generate a Response programmaticaly, as shown below, and return that
                */

                //console.log('WORKER: fetch request failed in both cache and network.');

                /* Here we're creating a response programmatically. The first parameter is the
                    response body, and the second one defines the options for the response.
                */
                /*return new Response('<h1>Zöff is currently unavailable, sorry</h1>', {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: new Headers({
                        'Content-Type': 'text/html'
                    })
                });*/
                return caches.open(version + "fundamentals").then(function(cache) {
                    return cache.match('/static/offline/offline.html');
                });
            }
        })
  );
});
