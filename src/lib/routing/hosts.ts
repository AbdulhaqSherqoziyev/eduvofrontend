/** Hosts that serve mock.eduvo.uz (edge-safe; shared by the middleware and route handlers). */
const MOCK_HOSTS = new Set(
  ['mock.eduvo.uz', 'mock.dev.eduvo.uz', ...(process.env.MOCK_HOSTS ?? '').split(',')].map((h) => h.trim().toLowerCase()).filter(Boolean),
);
/** `host` without port, lowercase. */
export const isMockHost = (host: string) => MOCK_HOSTS.has(host);

/** The production admin panel of the mock site; every other admin-mock host is DEV. */
export const ADMIN_MOCK_PROD_HOST = 'admin-mock.eduvo.uz';
/**
 * Hosts that serve admin-mock.eduvo.uz (+ ADMIN_MOCK_HOSTS env). `admin-mock.localhost` is allowed
 * outside production builds only, so local dev needs no env.
 */
const ADMIN_MOCK_HOSTS = new Set(
  [
    ADMIN_MOCK_PROD_HOST,
    'admin-mock.dev.eduvo.uz',
    ...(process.env.NODE_ENV === 'production' ? [] : ['admin-mock.localhost']),
    ...(process.env.ADMIN_MOCK_HOSTS ?? '').split(','),
  ].map((h) => h.trim().toLowerCase()).filter(Boolean),
);
/** `host` without port, lowercase. */
export const isAdminMockHost = (host: string) => ADMIN_MOCK_HOSTS.has(host);
/** PROD/DEV pill of the admin topbar: only the production host is PROD. */
export const adminMockEnv = (host: string): 'PROD' | 'DEV' => (host === ADMIN_MOCK_PROD_HOST ? 'PROD' : 'DEV');
