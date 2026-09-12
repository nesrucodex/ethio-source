const CACHE = "ethiosource-offline-v1";
const OFFLINE = "/offline.html";
self.addEventListener("install", event => {
 event.waitUntil(caches.open(CACHE).then(cache => cache.addAll([OFFLINE, "/icon-192.png", "/icon-512.png"])));
});
self.addEventListener("activate", event => {
 event.waitUntil(Promise.all([caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("ethiosource-offline-") && key !== CACHE).map(key => caches.delete(key)))), self.clients.claim()]));
});
self.addEventListener("fetch", event => {
 const url = new URL(event.request.url);
 if (url.origin === self.location.origin && ["/icon-192.png", "/icon-512.png"].includes(url.pathname) && event.request.method === "GET") { event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request))); return; }
 // Never cache account pages, order details, API requests, or payment responses.
 if (event.request.mode !== "navigate" || event.request.method !== "GET") return;
 event.respondWith(fetch(event.request).catch(async () => (await caches.match(OFFLINE)) || new Response("You’re offline. Reconnect to continue.", {status:503,headers:{"Content-Type":"text/plain"}})));
});
