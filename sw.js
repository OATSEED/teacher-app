const CACHE_NAME = 'teacher-app-popart-v4';
const ASSETS = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(names){
      return Promise.all(
        names.filter(function(n){ return n !== CACHE_NAME; })
             .map(function(n){ return caches.delete(n); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event){
  event.respondWith(
    fetch(event.request).then(function(response){
      // only cache real, successful responses — never cache 404s / errors,
      // so a transient failure (e.g. a build still in progress) can't get stuck forever
      if(response && response.ok){
        try{
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function(cache){ cache.put(event.request, copy); });
        }catch(e){}
      }
      return response;
    }).catch(function(){
      // offline: fall back to whatever we do have cached
      return caches.match(event.request);
    })
  );
});
