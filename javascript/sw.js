const C='shelter-v1',F=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png','leaflet/leaflet.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(F.map(u=>c.add(u).catch(()=>0)))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(n=>{if(n.ok&&new URL(e.request.url).origin===location.origin){const c=n.clone();caches.open(C).then(x=>x.put(e.request,c))}return n}).catch(()=>caches.match('index.html'))))});
