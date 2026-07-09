const CACHE_NAME = 'teacher-app-popart-v5';

self.addEventListener('install', function(event){
  // no pre-caching here on purpose — a single failed fetch during install
  // (e.g. a slow network) can silently block the whole worker from ever activating.
  // caching happens opportunistically in the fetch handler below instead.
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
