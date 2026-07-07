const CACHE_NAME = 'stockcontrol-v55';
const APP_SHELL = ['./index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(CACHE_NAME).then(function(c){ return c.addAll(APP_SHELL); }));
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k !== CACHE_NAME; }).map(function(k){ return caches.delete(k); }));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  var url = e.request.url;
  // Nunca cachear llamadas a Google (GAS, Sheets, OAuth)
  if (url.indexOf('googleapis.com') > -1 || url.indexOf('script.google.com') > -1) return;
  e.respondWith(
    fetch(e.request).then(function(resp){
      var copy = resp.clone();
      caches.open(CACHE_NAME).then(function(c){ c.put(e.request, copy); });
      return resp;
    }).catch(function(){ return caches.match(e.request); })
  );
});
