// Register service worker to control making site work offline
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/timer/sw.js')
    .then(function () {
      console.log('Service Worker Registered');
    });
}
