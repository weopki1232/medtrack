// MedTrack service worker — app-shell caching for offline use.
// Bump CACHE_VERSION on every deploy that changes app files.
const CACHE_VERSION = 'medtrack-v1';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/styles.css',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './js/data/exam-data.js',
  './js/data/subjects.js',
  './js/data/generations.js',
  './js/data/strings.js',
  './js/core/i18n.js',
  './js/core/storage.js',
  './js/core/state.js',
  './js/data/achievements-data.js',
  './js/core/helpers.js',
  './js/core/router.js',
  './js/pages/schedule.js',
  './js/pages/dashboard.js',
  './js/pages/timer.js',
  './js/pages/subjects.js',
  './js/pages/analytics.js',
  './js/pages/tasks.js',
  './js/pages/diagrams.js',
  './js/pages/settings.js',
  './js/pages/insights.js',
  './js/pages/journey.js',
  './js/pages/vault.js',
  './js/features/focus-mode.js',
  './js/features/achievements.js',
  './js/features/notes-mistakes.js',
  './js/features/flashcards.js',
  './js/features/media-notify.js',
  './js/sync/supabase-config.js',
  './js/sync/supabase-client.js',
  './js/sync/auth.js',
  './js/sync/sync.js',
  './js/app.js',
  './js/features/ambient-effects.js',
  './js/boot.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_VERSION).then((c) => c.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // Never intercept Supabase API calls
  if (url.hostname.endsWith('.supabase.co')) return;

  // CDN libraries + fonts: cache-first (immutable versioned URLs)
  if (url.hostname === 'cdn.jsdelivr.net' || url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(
      caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then((c) => c.put(e.request, copy));
        return res;
      }))
    );
    return;
  }

  // App shell: network-first so deploys arrive promptly, cache fallback offline
  if (url.origin === location.origin) {
    e.respondWith(
      fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then((c) => c.put(e.request, copy));
        return res;
      }).catch(() => caches.match(e.request).then((hit) => hit || caches.match('./index.html')))
    );
  }
});
