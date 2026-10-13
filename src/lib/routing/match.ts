/** Edge-safe route matching for src/middleware.ts (patterns come from scripts/gen-routes.mjs). */
import { ERP_ROUTES, MOCK_ROUTES } from './routes.generated';

const erp = ERP_ROUTES.map((s) => new RegExp(s));
const mock = MOCK_ROUTES.map((s) => new RegExp(s));

/** true when `pathname` is a real ERP page. */
export const isErpRoute = (pathname: string) => erp.some((re) => re.test(pathname));
/** `rest` = the path after `/{lang}` ('' for the locale home). */
export const isMockRoute = (rest: string) => mock.some((re) => re.test(rest));
