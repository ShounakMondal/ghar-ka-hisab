const CACHE = 'songsar-khoroch-v2';

// On install — skip waiting immediately
self.addEventListener('install', e => {
  self.skipWaiting();
});

// On activate — delete ALL old caches and take control
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Fetch — network only for html/js, cache only for fonts/static
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const url = e.request.url;

  // Always go to network for Firebase and the main app files
  if (
    url.includes('firebasedatabase.app') ||
    url.includes('firebaseio.com') ||
    url.includes('firebaseapp.com') ||
    url.includes('gstatic.com/firebasejs') ||
    url.endsWith('index.html') ||
    url.endsWith('sw.js') ||
    url.endsWith('manifest.json') ||
    url.endsWith('/ghar-ka-hisab/') ||
    url.endsWith('/ghar-ka-hisab')
  ) {
    e.respondWith(fetch(e.request));
    return;
  }

  // For everything else — cache with network fallback
  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(e.request).then(cached =>
        cached || fetch(e.request).then(res => {
          cache.put(e.request, res.clone());
          return res;
        })
      )
    )
  );
});
