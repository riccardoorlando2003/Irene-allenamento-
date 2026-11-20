/* Salva l'app sul telefono così si apre anche senza internet. Cambia VERSIONE quando aggiorni l'app. */
const VERSIONE = "irene-v1";
const FILE = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-180.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSIONE).then(c => c.addAll(FILE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSIONE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const pagina = e.request.mode === "navigate";
  e.respondWith(
    /* la pagina: prima prova la versione online (per gli aggiornamenti), se non c'è rete usa quella salvata */
    pagina ? fetch(e.request).then(r => { const c = r.clone(); caches.open(VERSIONE).then(k => k.put("index.html", c)); return r; }).catch(() => caches.match("index.html"))
    /* il resto (icone, caratteri): prima quello salvato */
    : caches.match(e.request).then(hit => hit || fetch(e.request).then(r => { const c = r.clone(); caches.open(VERSIONE).then(k => k.put(e.request, c)); return r; }).catch(() => hit))
  );
});
