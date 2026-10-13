import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** Local dev only: proxy the mock site's same-origin `/api/mock/*` and player endpoints to a backend. */
const MOCK_API_PROXY = process.env.MOCK_API_PROXY;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  async rewrites() {
    if (!MOCK_API_PROXY) return [];
    return [
      { source: '/api/mock/:path*', destination: `${MOCK_API_PROXY}/mock/:path*` },
      { source: '/api/portal/exams/:path*', destination: `${MOCK_API_PROXY}/portal/exams/:path*` },
    ];
  },
};

export default withNextIntl(nextConfig);
