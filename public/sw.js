/* eslint-disable no-restricted-globals */
/**
 * Eduvo app shell — portal (/portal) and teacher (/t) only.
 *
 * The single rule this file exists for: the app must open. A student on the
 * metro who taps the icon has to see yesterday's screen, never a white page and
 * never "Failed to fetch".
 *
 * What it deliberately does NOT do: cache a single byte of /api. Those answers
 * carry a child's attendance, grades and the family's balance, and Cache
 * Storage survives a logout — on a phone shared inside a family that is a leak.
 * Data caching lives in localStorage instead (see _lib/api.ts), because that is
 * wiped together with the token.
 */

const CACHE = 'eduvo-shell-v1';
const OFFLINE_URL = '/offline';

const PRECACHE = [
  OFFLINE_URL,
  '/favicon.svg',
  '/icon-512.png',
  '/manifest.json',
  '/manifest-portal.json',
  '/manifest-teacher.json',
];

const NAV_TIMEOUT_MS = 3000;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      // addAll is all-or-nothing; one missing file must not break the install.
      .then((c) => Promise.all(PRECACHE.map((u) => c.add(u).catch(() => undefined))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k.startsWith('eduvo-shell-') && k !== CACHE).map((k) => caches.delete(k))),
      )
      // No forced reload: an updated shell must never wipe a half-marked
      // attendance sheet out from under a teacher.
      .then(() => self.clients.claim()),
  );
});

/** Screens this worker is allowed to keep a copy of. */
function isAppShellPath(path) {
  return path === '/portal' || path.startsWith('/portal/') || path === '/t' || path.startsWith('/t/');
}

/** Screens that must always go straight to the network (staff ERP). */
function isExcludedPath(path) {
  return path.startsWith('/dashboard') || path.startsWith('/owner');
}

function isStaticAsset(path) {
  return (
    path.startsWith('/_next/static/') ||
    path === '/favicon.svg' ||
    (path.startsWith('/icon-') && path.endsWith('.png')) ||
    (path.startsWith('/manifest') && path.endsWith('.json'))
  );
}

/** Network first, but never hang: after 3s the cached shell is better than a spinner. */
function navigate(request) {
  const network = fetch(request)
    .then((res) => {
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => undefined);
      }
      return res;
    });

  const timeout = new Promise((resolve) => setTimeout(() => resolve(null), NAV_TIMEOUT_MS));

  return Promise.race([network.catch(() => null), timeout])
    .then((res) => res || caches.match(request))
    .then((res) => res || caches.match(OFFLINE_URL))
    .then((res) => res || network); // last resort: whatever the network eventually says
}

/** Cache first, refresh in the background — build output is content-hashed. */
function staleWhileRevalidate(request) {
  return caches.match(request).then((cached) => {
    const network = fetch(request)
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => undefined);
        }
        return res;
      })
      .catch(() => cached);
    return cached || network;
  });
}

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Anything that changes data is left completely alone — no respondWith, so
  // the browser behaves exactly as if this worker did not exist.
  if (request.method !== 'GET') return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }
  if (url.origin !== self.location.origin) return; // the API lives on another origin
  if (url.pathname.startsWith('/api')) return;
  if (request.headers.has('Authorization')) return;

  if (request.mode === 'navigate') {
    if (isExcludedPath(url.pathname)) return;
    if (!isAppShellPath(url.pathname) && url.pathname !== OFFLINE_URL) return;
    event.respondWith(navigate(request));
    return;
  }

  if (isStaticAsset(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
