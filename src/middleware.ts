/**
 * Host routing for one Next app with two root layouts (src/app/(erp), src/app/(mock)).
 *
 * mock host (mock.eduvo.uz, mock.dev.eduvo.uz, + MOCK_HOSTS env, e.g. `mock.localhost` for dev):
 *   `/`            → 307 `/{lang}` (cookie NEXT_LOCALE, then Accept-Language), `Vary` set
 *   `/{lang}/…`    → rewrite to `/m/{lang}/…`; a path that is not a mock page answers HTTP 404
 *   `/exam/{id}`   → 307 `/{lang}/exam/{id}` (backend `playerUrl`; the B2C player runs in the mock layout)
 *   anything else  → mock-styled 404 in the visitor's language (ERP pages never open here)
 * any other host (admin.eduvo.uz, dev ERP, localhost):
 *   `/m/*`         → 404 (internal home of the mock site)
 *   not an ERP page → HTTP 404 (the ERP catch-all renders the 404 UI)
 *
 * The 404 status comes from here because Next 14.2 cannot SSR notFound() with two root layouts;
 * the page lists are generated from the file tree (scripts/gen-routes.mjs).
 */
import { NextResponse, type NextRequest } from 'next/server';
import { isLocale, negotiate } from '@/i18n/locales';
import { isMockHost } from '@/lib/routing/hosts';
import { isErpRoute, isMockRoute } from '@/lib/routing/match';

const ERP_404 = '/__not_found__';
const PROD = process.env.NODE_ENV === 'production';

/**
 * `Host` only — nginx sends `proxy_set_header Host $host`. X-Forwarded-Host is client-controlled
 * and is ignored; the value is only trusted after it matched the mock host allow-list.
 */
function hostOf(req: NextRequest): { name: string; raw: string } {
  const raw = (req.headers.get('host') ?? '').trim().toLowerCase();
  return { raw, name: raw.replace(/:\d+$/, '') };
}

function pickLocale(req: NextRequest) {
  const cookie = req.cookies.get('NEXT_LOCALE')?.value;
  return isLocale(cookie) ? cookie : negotiate(req.headers.get('accept-language'));
}

/**
 * Public origin for redirects. Behind nginx `req.url` is the upstream address (127.0.0.1:port) and
 * Next 14 rejects a relative Location, so the origin is rebuilt from the allow-listed Host.
 * The scheme is NOT taken from X-Forwarded-Proto: `next start` fills that header with `http` itself
 * when the proxy does not send it, which produced `http://` redirects. Mock hosts are HTTPS-only;
 * only `*.localhost` dev hosts use the incoming scheme.
 */
function publicOrigin(req: NextRequest, host: { name: string; raw: string }) {
  const local = host.name === 'localhost' || host.name.endsWith('.localhost');
  const xfp = (req.headers.get('x-forwarded-proto') ?? '').split(',')[0].trim();
  const proto = local ? (xfp === 'https' ? 'https' : 'http') : 'https';
  return `${proto}://${local ? host.raw : host.name}`;
}

const erpNotFound = (req: NextRequest) => NextResponse.rewrite(new URL(ERP_404, req.url), { status: 404 });

function redirect(req: NextRequest, host: { name: string; raw: string }, path: string) {
  const url = `${publicOrigin(req, host)}${path}${req.nextUrl.search}`;
  const res = NextResponse.redirect(url, 307);
  res.headers.set('Vary', 'Accept-Language, Cookie');
  res.headers.set('Cache-Control', 'private, no-store');
  return res;
}

function mockRoute(req: NextRequest, host: { name: string; raw: string }) {
  const { pathname } = req.nextUrl;
  if (pathname === '/') return redirect(req, host, `/${pickLocale(req)}`);

  const seg = pathname.split('/')[1];
  if (isLocale(seg)) {
    const rest = pathname.slice(seg.length + 1); // '' | '/…'
    const url = req.nextUrl.clone();
    url.pathname = `/m${pathname}`;
    const known = isMockRoute(rest);
    return NextResponse.rewrite(url, PROD && !known ? { status: 404 } : undefined);
  }

  // backend `playerUrl` is '/exam/{attemptId}' (contract S2); the B2C player lives under the locale
  const exam = /^\/exam\/([^/]+)\/?$/.exec(pathname);
  if (exam) return redirect(req, host, `/${pickLocale(req)}/exam/${exam[1]}`);

  const url = req.nextUrl.clone();
  url.pathname = `/m/${pickLocale(req)}/__missing`;
  return NextResponse.rewrite(url, { status: 404 });
}

export function middleware(req: NextRequest) {
  const host = hostOf(req);
  if (isMockHost(host.name)) return mockRoute(req, host);

  const { pathname } = req.nextUrl;
  if (pathname === '/m' || pathname.startsWith('/m/')) return erpNotFound(req);
  // dev: pages added while `next dev` runs are not in the generated manifest yet
  if (!PROD) return NextResponse.next();
  return isErpRoute(pathname) ? NextResponse.next() : erpNotFound(req);
}

export const config = {
  // skip Next internals, the API proxy and files with an extension (public/, robots.txt, sitemap.xml…)
  matcher: ['/((?!_next/|api/|.*\\.[a-zA-Z0-9]+$).*)'],
};
