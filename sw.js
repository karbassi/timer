const CACHE = "precache-v6";
const precacheFiles = [
  /* Add an array of files to precache for your app */
  "/timer/index.html",
  "/timer/assets/img/icons/icon-180x180.png",
  "/timer/assets/img/icons/icon-192x192.png",
  "/timer/assets/img/icons/icon-512x512.png",
  "/timer/assets/css/style.css",
  "/timer/assets/js/screenfull.min.js",
  "/timer/assets/js/timer.js",
  "/timer/assets/audio/beep.mp3",
  "/timer/assets/audio/beep.ogg",
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(precacheFiles);
    })
  );
});

self.addEventListener('fetch', function (event) {
  console.log(event.request.url);
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    })
  );
});
