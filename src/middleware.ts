/**
 * Routing guard for the two root layouts (src/app/(erp), src/app/(mock)).
 *  - `/m/*` is the internal home of the mock site and is never served directly → 404.
 *  - any other path that is not an ERP page → HTTP 404 (the ERP catch-all renders the 404 UI).
 */
import { NextResponse, type NextRequest } from 'next/server';
import { isErpRoute } from '@/lib/routing/match';

/** Rewrite target for 404s: no page matches it, so the ERP catch-all renders it. */
const ERP_404 = '/__not_found__';

const erpNotFound = (req: NextRequest) => NextResponse.rewrite(new URL(ERP_404, req.url), { status: 404 });

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === '/m' || pathname.startsWith('/m/')) return erpNotFound(req);
  // dev: pages added while `next dev` runs are not in the generated manifest yet
  if (process.env.NODE_ENV !== 'production') return NextResponse.next();
  return isErpRoute(pathname) ? NextResponse.next() : erpNotFound(req);
}

export const config = {
  // skip Next internals, the API proxy and files with an extension (public/, favicon, manifest, sw.js…)
  matcher: ['/((?!_next/|api/|.*\\.[a-zA-Z0-9]+$).*)'],
};
