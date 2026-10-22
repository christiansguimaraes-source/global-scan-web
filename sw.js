const C='globalscan-v2';const A=['./','index.html','app.js','manifest.webmanifest','icons/icon-192.png','icons/icon-180.png','vendor/jspdf.umd.min.js','vendor/jscanify.js','vendor/opencv.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A)));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));
