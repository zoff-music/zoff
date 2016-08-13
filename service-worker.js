var version = 'v2.4 ';
var CACHE_FILES = [
    'https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=https://zoff.no/&choe=UTF-8&chld=L%7C1',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    '/static/dist/lib/jquery-2.1.3.min.js',
    '/static/dist/lib/jquery-ui-1.10.3.min.js',
    '/static/images/favicon.png',
    '/static/css/materialize.min.css',
    '/static/css/style.css',
    '/static/dist/lib/materialize.min.js',
    '/static/dist/lib/socket.io-1.4.5.js',
    '/static/dist/lib/jquery.lazyload.js',
    '/static/dist/lib/color-thief.js',
    '/static/dist/main.min.js',
    '/static/images/squareicon_small.png',
    '/static/images/GitHub_Logo.png',
    '/static/images/facebook.png',
    '/static/images/twitter.png',
    '/offline.html',
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

self.addEventListener('fetch', event => {
  // We only want to call event.respondWith() if this is a navigation request
  // for an HTML page.
  // request.mode of 'navigate' is unfortunately not supported in Chrome
  // versions older than 49, so we need to include a less precise fallback,
  // which checks for a GET request with an Accept: text/html header.
  if (event.request.mode === 'navigate' ||
    (event.request.method === 'GET' &&
        (event.request.headers.get('accept').includes('text/html') ||
         event.request.headers.get('accept').includes('text/css') ||
            (event.request.headers.get('accept').includes('*/*') &&
            //event.request.mode == "no-cors" &&
                (event.request.url.includes('localhost') || event.request.url.includes('zoff.no')))))) {
    event.respondWith(
      fetch(event.request.url).catch(error => {
        // The catch is only triggered if fetch() throws an exception, which will most likely
        // happen due to the server being unreachable.
        // If fetch() returns a valid HTTP response with an response code in the 4xx or 5xx
        // range, the catch() will NOT be called. If you need custom handling for 4xx or 5xx
        // errors, see https://github.com/GoogleChrome/samples/tree/gh-pages/service-worker/fallback-response
        return caches.open(version + "::bare").then(function(cache) {
            return cache.match("/offline.html");
        });
      })
    );
  }

  // If our if() condition is false, then this fetch handler won't intercept the request.
  // If there are any other fetch handlers registered, they will get a chance to call
  // event.respondWith(). If no fetch handlers call event.respondWith(), the request will be
  // handled by the browser as if there were no service worker involvement.
});
