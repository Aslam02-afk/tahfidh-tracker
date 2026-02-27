// Service Worker – Tahfidh Tracker v35
const CACHE = 'tahfidh-v37';

// ── ESSENTIAL files only — must exist on server ───────────────────────────
const PRECACHE = [
  'index.html',
  'class.html',
  'record.html',
  'add-class.html',
  'add-student.html',
  'student-detail.html',
  'fees.html',
  'settings.html',
  'quran.html',
  'contact.html',
  'css/style.css',
  'js/js/db.js',
  'js/js/i18n.js',
  'js/js/ui.js',
  'js/js/home.js',
  'js/js/class.js',
  'js/js/add-class.js',
  'js/js/add-student.js',
  'js/js/student-detail.js',
  'js/js/fees.js',
  'js/js/settings.js',
  'js/js/quran.js',
  'js/js/records.js',
  'js/js/reports.js',
  'js/js/export.js',
];

// ── OPTIONAL files — cached if they exist, ignored if not ─────────────────
const OPTIONAL = [
  'manifest.json',
  'assets_icons/appicon.svg',
  'assets_icons/appicon-64.png',
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
  'icons/fee icon.svg',
  'themes/Pink_theme.png',
  'themes/green_theme.png',
  'themes/greenlight_theme.png',
  'themes/puple_theme.png',
  'kfgqpc_hafs_smart_data/hafs_smart_v8.json',
  'kfgqpc_hafs_smart_font/HafsSmart_08.ttf',
];

// ── Never cache these ──────────────────────────────────────────────────────
const NETWORK_ONLY = [
  '/api/',
  'api.telegram.org',
  'wa.me',
];

// ── INSTALL ────────────────────────────────────────────────────────────────
self.addEventListener('install', e => {
  console.log('[SW] Installing', CACHE);
  e.waitUntil(
    caches.open(CACHE).then(async cache => {
      // Cache essential files one by one
      for (const url of PRECACHE) {
        try {
          await cache.add(url);
          console.log('[SW] Cached:', url);
        } catch (err) {
          console.error('[SW] Failed to cache essential file:', url, err);
        }
      }
      // Cache optional files — skip silently if missing
      for (const url of OPTIONAL) {
        try {
          await cache.add(url);
        } catch (err) {
          console.warn('[SW] Optional file not cached:', url);
        }
      }
      console.log('[SW] Install complete');
    }).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE ───────────────────────────────────────────────────────────────
self.addEventListener('activate', e => {
  console.log('[SW] Activating', CACHE);
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => {
          console.log('[SW] Deleting old cache:', k);
          return caches.delete(k);
        })
      ))
      .then(() => self.clients.claim())
  );
});

// ── FETCH ──────────────────────────────────────────────────────────────────
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // Skip network-only requests
  const isNetworkOnly = NETWORK_ONLY.some(p =>
    url.pathname.startsWith(p) || url.hostname.includes(p)
  );
  if (isNetworkOnly) return;

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) return;

  // Cache-first, fallback to network, fallback to index.html
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;

      return fetch(e.request).then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return res;
      }).catch(() => {
        if (e.request.mode === 'navigate') {
          return caches.match('index.html');
        }
      });
    })
  );
});