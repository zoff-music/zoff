var version = 'v3.4';
var CACHE_FILES = [
    '/assets/html/offline.html',
    '/assets/manifest.json',
    '/assets/images/favicon.png'
];

self.addEventListener("install", function(event) {
    event.waitUntil(
        caches
        .open(version + '::zoff')
        .then(function(cache) {
            return cache.addAll(CACHE_FILES);
        })
        .then(function() {
        })
    );
});

self.addEventListener("activate", function(event) {

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
});

self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate' ||
    (event.request.method === 'GET' &&
        (event.request.headers.get('accept').includes('text/html') ||
         event.request.headers.get('accept').includes('text/css') ||
            (event.request.headers.get('accept').includes('*/*') &&
                (event.request.url.includes('localhost') || event.request.url.includes('zoff.me')))))) {
    event.respondWith(
      fetch(event.request.url).catch(error => {
        if(event.request.url.includes('manifest.json')){
          return caches.open(version + "::zoff").then(function(cache) {
              return cache.match("/assets/manifest.json");
          });
        } else if (event.request.url.includes('favicon')) {
          return caches.open(version + "::zoff").then(function(cache) {
              return cache.match("/assets/images/favicon.png");
          });
        } else if (event.request.url.includes('service-worker')) {
          return caches.open(version + "::zoff").then(function(cache) {
              return cache.match("/service-worker.js");
          });
        } else {
          return caches.open(version + "::zoff").then(function(cache) {
              return cache.match("/assets/html/offline.html");
          });
        }
      })
    );
  }

});
