// Service Worker – Tahfidh Tracker
const CACHE = 'tahfidh-v4';

const PRECACHE = [
  '/',
  '/index.html',
  '/class.html',
  '/record.html',
  '/add-class.html',
  '/add-student.html',
  '/settings.html',
  '/contact.html',
  '/quran.html',
  '/css/style.css',
  '/js/js/db.js',
  '/js/js/i18n.js',
  '/js/js/ui.js',
  '/js/js/home.js',
  '/js/js/class.js',
  '/js/js/records.js',
  '/js/js/reports.js',
  '/js/js/export.js',
  '/js/js/add-class.js',
  '/js/js/add-student.js',
  '/js/js/settings.js',
  '/js/js/quran.js',
  '/assets_icons/appicon-192.png',
  '/assets_icons/appicon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
