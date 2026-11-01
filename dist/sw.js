// Do not cache game modules, player assets, auth requests or multiplayer traffic.
// Fresh deployments remain network-backed; only a small offline explanation is stored.
const CACHE = 'gsg-offline-v1';
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.add('/offline.html')));
});
self.addEventListener('activate',event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('gsg-offline-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||event.request.mode!=='navigate'||new URL(event.request.url).origin!==self.location.origin)return;
 event.respondWith(fetch(event.request).catch(async()=>await caches.match('/offline.html') || new Response('Connect to the internet and reopen Ghana Street Games.',{status:503,headers:{'Content-Type':'text/plain'}})));
});
