// Service Worker – Tahfidh Tracker v77
const CACHE = 'tahfidh-v77';

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
  'js/db.js',
  'js/i18n.js',
  'js/ui.js',
  'js/home.js',
  'js/class.js',
  'js/add-class.js',
  'js/add-student.js',
  'js/student-detail.js',
  'js/fees.js',
  'js/settings.js',
  'js/quran.js',
  'js/records.js',
  'js/reports.js',
  'js/export.js',
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
  'icons/surah-frame.svg',
  'icons/surah-label.svg',
  // Individual surah frames surah-001.svg to surah-114.svg cached on first access
  'icons/star icon.svg',
  'icons/comments icon.svg',
  'icons/printer icon.svg',
  'icons/image icon.svg',
  'icons/whatsapp icon.svg',
  'icons/back icon.svg',
  'icons/globe icon.svg',
  'icons/search icon.svg',
  'icons/close icon.svg',
  'icons/chevron-right icon.svg',
  'icons/chevron-left icon.svg',
  'icons/check-circle icon.svg',
  'icons/x-circle icon.svg',
  'icons/clock icon.svg',
  'icons/shield-check icon.svg',
  'icons/excel icon.svg',
  'icons/calendar icon.svg',
  'icons/crescent icon.svg',
  'icons/star-gold icon.svg',
  'icons/star-outline icon.svg',
  'icons/bookmark icon.svg',
  'icons/menu icon.svg',
  'icons/bank icon.svg',
  'icons/wallet icon.svg',
  'icons/cash icon.svg',
  'icons/receipt icon.svg',
  'icons/bell icon.svg',
  'icons/download icon.svg',
  'icons/upload icon.svg',
  'icons/send icon.svg',
  'icons/user icon.svg',
  'icons/history icon.svg',
  'icons/chart icon.svg',
  'icons/salah-fajr.svg',
  'icons/salah-dhuhr.svg',
  'icons/salah-asr.svg',
  'icons/salah-maghrib.svg',
  'icons/salah-isha.svg',
  'icons/save icon.svg',
  'icons/certificate icon.svg',
  'themes/Pink_theme.png',
  'themes/green_theme.png',
  'themes/puple_theme.png',
  'kfgqpc_hafs_smart_data/hafs_smart_v8.json',
  'kfgqpc_hafs_smart_font/HafsSmart_08.ttf',
];

// ── Never cache these ──────────────────────────────────────────────────────
const NETWORK_ONLY = [
  '/api/',
  'api.telegram.org',
  'wa.me',
  'cloudflareinsights.com',
];

// ── INSTALL ────────────────────────────────────────────────────────────────
self.addEventListener('install', e => {
  console.log('[SW] Installing', CACHE);
  e.waitUntil(
    caches.open(CACHE).then(async cache => {
      // Cache essential files one by one
      for (const url of PRECACHE) {
        try {
          await cache.add(new Request(url, { cache: 'reload' }));
          console.log('[SW] Cached:', url);
        } catch (err) {
          console.error('[SW] Failed to cache essential file:', url, err);
        }
      }
      // Cache optional files — skip silently if missing
      for (const url of OPTIONAL) {
        try {
          await cache.add(new Request(url, { cache: 'reload' }));
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
// App shell (HTML / JS / CSS / manifest) → NETWORK-FIRST so updates show up
// immediately; falls back to cache when offline.
// Heavy static assets (icons, fonts, Quran data, themes) → CACHE-FIRST.
function isAppShell(url, req) {
  if (req.mode === 'navigate') return true;
  return /\.(html|js|css|json)$/i.test(url.pathname) &&
         !url.pathname.includes('kfgqpc_hafs_smart_data');
}

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

  if (isAppShell(url, e.request)) {
    // Network-first
    e.respondWith(
      fetch(e.request, { cache: 'no-cache' }).then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return res;
      }).catch(() =>
        caches.match(e.request, { ignoreSearch: true }).then(cached => {
          if (cached) return cached;
          if (e.request.mode === 'navigate') {
            return caches.match('index.html', { ignoreSearch: true });
          }
        })
      )
    );
    return;
  }

  // Cache-first for static assets
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return res;
      }).catch(() => {
        if (e.request.mode === 'navigate') {
          return caches.match('index.html', { ignoreSearch: true });
        }
      });
    })
  );
});