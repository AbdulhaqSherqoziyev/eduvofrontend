/** Edge-safe route matching for src/middleware.ts (patterns come from scripts/gen-routes.mjs). */
import { ERP_ROUTES, MOCK_ROUTES, PUBLIC_FILES } from './routes.generated';

const erp = ERP_ROUTES.map((s) => new RegExp(s));
const mock = MOCK_ROUTES.map((s) => new RegExp(s));

/** true when `pathname` is a real ERP page. */
export const isErpRoute = (pathname: string) => erp.some((re) => re.test(pathname));
/** `rest` = the path after `/{lang}` ('' for the locale home). */
export const isMockRoute = (rest: string) => mock.some((re) => re.test(rest));

const publicFiles = new Set(PUBLIC_FILES);
/** true when `pathname` is a file Next serves as-is (public/, robots.txt, sitemap.xml). */
export const isPublicFile = (pathname: string) => publicFiles.has(pathname);
/** a path that looks like a file (`/x.png`, `/a/b.js`) — never a page */
export const looksLikeFile = (pathname: string) => /\.[a-zA-Z0-9]+$/.test(pathname);
