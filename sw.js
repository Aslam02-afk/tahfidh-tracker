// Service Worker – Tahfidh Tracker
const CACHE = 'tahfidh-v19';

const PRECACHE = [
  './',
  'index.html',
  'class.html',
  'record.html',
  'add-class.html',
  'add-student.html',
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
  'js/js/settings.js',
  'js/js/quran.js',
  'kfgqpc_hafs_smart_data/hafs_smart_v8.json',
  'kfgqpc_hafs_smart_font/HafsSmart_08.ttf',
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
  'student-detail.html',
  'js/js/student-detail.js',
  'themes/arabic-patterns.svg',
  'themes/BG.svg',
  'themes/flower theme.svg'
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
