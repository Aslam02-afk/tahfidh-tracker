// Service Worker – Tahfidh Tracker
const CACHE = 'tahfidh-v29';

const PRECACHE = [
  './',
  'index.html',
  'class.html',
  'record.html',
  'add-class.html',
  'add-student.html',
  'student-detail.html',
  'fees.html',
  'settings.html',
  'contact.html',
  'quran.html',
  'css/style.css',
  'js/js/db.js',
  'js/js/i18n.js',
  'js/js/ui.js',
  'js/js/home.js',
  'js/js/class.js',
  'js/js/records.js',
  'js/js/reports.js',
  'js/js/export.js',
  'js/js/add-class.js',
  'js/js/add-student.js',
  'js/js/student-detail.js',
  'js/js/fees.js',
  'js/js/settings.js',
  'js/js/quran.js',
  'assets_icons/appicon-64.png',
  'assets_icons/appicon-128.png',
  'assets_icons/appicon-192.png',
  'assets_icons/appicon-512.png',
  'icons/home icon.svg',
  'icons/students icon.svg',
  'icons/Quran icon.svg',
  'icons/setting icon.svg',
  'icons/edit icon.svg',
  'icons/male teacher icon.svg',
  'icons/female teacher icon.svg',
  'icons/day time icon.svg',
  'icons/night time icon.svg',
  'icons/add icon.svg',
  'icons/delete icon.svg',
  'icons/file icon.svg',
  'icons/share icon.svg',
  'themes/Pink_theme.png',
  'themes/green_theme.png',
  'themes/puple_theme.png',
  // Quran data & font — cached so reader works fully offline
  'kfgqpc_hafs_smart_data/hafs_smart_v8.json',
  'kfgqpc_hafs_smart_font/HafsSmart_08.ttf',
];

// These URLs require internet — never cache them
const NETWORK_ONLY = [
  '/api/',              // server endpoints (ratings, config)
  'api.telegram.org',  // Telegram (sending reports)
  'wa.me',             // WhatsApp report sharing
];

// ── INSTALL ──────────────────────────────────────────────────────────────────
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

// ── ACTIVATE ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window', includeUncontrolled: true }))
      .then(clients => Promise.all(
        // Notify open tabs — safer than force reload so teachers don't lose unsaved data
        clients.map(client => client.postMessage({ type: 'UPDATE_AVAILABLE' }))
      ))
  );
});

// ── FETCH ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // NETWORK ONLY — never cache these (Telegram, WhatsApp, API calls)
  const isNetworkOnly = NETWORK_ONLY.some(pattern =>
    url.pathname.startsWith(pattern) || url.hostname.includes(pattern)
  );
  if (isNetworkOnly) return; // let browser handle it normally

  // External requests (CDN etc.) — skip caching
  if (url.origin !== self.location.origin) return;

  // NAVIGATION (HTML pages) — network-first so app always gets latest update
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          caches.open(CACHE).then(c => c.put(e.request, res.clone()));
          return res;
        })
        .catch(() =>
          caches.match(e.request).then(cached => cached || caches.match('index.html'))
        )
    );
    return;
  }

  // QURAN DATA & FONT — cache-first (large files, no need to re-download)
  const isHeavyStatic =
    url.pathname.includes('hafs_smart_v8.json') ||
    url.pathname.includes('HafsSmart_08.ttf');

  if (isHeavyStatic) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        if (cached) return cached;
        return fetch(e.request).then(res => {
          caches.open(CACHE).then(c => c.put(e.request, res.clone()));
          return res;
        });
      })
    );
    return;
  }

  // EVERYTHING ELSE (JS, CSS, icons) — cache-first, fallback to network
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        return res;
      });
    })
  );
});