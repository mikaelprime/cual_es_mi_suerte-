self.addEventListener(`install`, event => {
    event.waitUntil (
        caches.open(`suerte-v1`).then(cache => {
            return cache.addAll([
                `/`
                `/index.html`
                `/misuerte.html`,
                `/style.css`,
                `/script.js`,
                `/frases/frases.json`,
                `/random.wasm`,
                `/android-chrome-192x192.png`,
                `/android-chrome-512x512.png`,
                `/apple-touch-ico.png`,
                `/site.webmanifest`
            ]);
        })
    );
    self.skipWaiting();
});

self.addEventListener(`activate`, event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== `suerte-v1`)
                    .map(key => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener(`fetch`, event => {
    event.respondWith(
        caches.match(event.request).them(Response => {
            return Response || fetch(event.request);
        })
    );
});