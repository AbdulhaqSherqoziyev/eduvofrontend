/** Hosts that serve mock.eduvo.uz (edge-safe; shared by the middleware and route handlers). */
const MOCK_HOSTS = new Set(
  ['mock.eduvo.uz', 'mock.dev.eduvo.uz', ...(process.env.MOCK_HOSTS ?? '').split(',')].map((h) => h.trim().toLowerCase()).filter(Boolean),
);
/** `host` without port, lowercase. */
export const isMockHost = (host: string) => MOCK_HOSTS.has(host);
