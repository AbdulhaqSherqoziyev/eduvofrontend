/** UI names from the spec (design.md v1.1) — the only place these strings live. */
import type { AnalyticsSite, AnalyticsSiteOrAll } from '@/lib/api/owner-analytics.types';
import { LOCALE_NAMES, isLocale } from '@/i18n/locales';

export const SITES: AnalyticsSite[] = ['landing', 'mock', 'erp'];

/** §2.3 — desktop / phone labels. */
export const SITE_LABEL: Record<AnalyticsSiteOrAll, string> = { landing: 'eduvo.uz', mock: 'mock.eduvo.uz', erp: 'ERP', all: 'Hammasi' };
export const SITE_SHORT: Record<AnalyticsSiteOrAll, string> = { landing: 'eduvo', mock: 'mock', erp: 'ERP', all: 'Hammasi' };
export const SITE_URL: Record<AnalyticsSite, string> = { landing: 'https://eduvo.uz', mock: 'https://mock.eduvo.uz', erp: 'https://admin.eduvo.uz' };

/** §3.3 EmptyState titles. */
export const NOT_TRACKING_TITLE: Record<AnalyticsSite, string> = {
  landing: "eduvo.uz'da kuzatuv hali boshlanmagan",
  mock: "mock.eduvo.uz'da kuzatuv hali boshlanmagan",
  erp: "ERP'da kuzatuv hali boshlanmagan",
};
const HINT = "Tracker o'rnatilgach, birinchi tashrif shu yerda bir necha soniyada ko'rinadi. \"Meni hisobga olma\" yoqilgan bo'lsa, o'z tashrifingiz sanalmaydi.";
export const notTrackingHint = (s: AnalyticsSite) =>
  s === 'erp' ? `${HINT} Owner hisobi ERP'da sanalmaydi — tekshirish uchun xodim hisobi bilan kiring.` : HINT;

/** §8 page names. Unknown path → path only. */
const PAGE_NAMES: Record<'landing' | 'mock', Record<string, string>> = {
  landing: { '/': 'Bosh sahifa', '/signup.html': "Ro'yxatdan o'tish", '/privacy': 'Maxfiylik' },
  mock: {
    '/': 'Bosh sahifa', '/ielts': 'IELTS', '/sat': 'SAT', '/pricing': 'Narxlar', '/checkout': "To'lov",
    '/checkout/orders/:id': 'Buyurtma holati', '/dashboard': 'Kabinet', '/mocks': 'Mening testlarim',
    '/progress': 'Natijalarim', '/start': 'Imtihon tanlash', '/exam/:id': 'Imtihon jarayoni', '/results/:id': 'Natija',
    '/sample-result': 'Namuna natija', '/how-it-works': 'Qanday ishlaydi', '/help': 'Yordam', '/signup': "Ro'yxatdan o'tish",
    '/login': 'Kirish', '/account': 'Hisob', '/cookies': 'Cookie siyosati', '/privacy': 'Maxfiylik',
  },
};
export const pageName = (site: AnalyticsSite, path: string): string | null =>
  site === 'erp' ? null : PAGE_NAMES[site][path] ?? null;

/** §6.3 events (order is the contract's §4.4 order; the API already returns it sorted). */
export const EVENT_NAME: Record<string, string> = {
  tel_click: 'Telefon raqamini bosdi',
  telegram_click: "Telegram'ni bosdi",
  admin_login_click: '"Kirish" (admin.eduvo.uz) ni bosdi',
  signup_page_open: "Ro'yxatdan o'tish sahifasini ochdi",
  pricing_view: "Narxlar sahifasini ko'rdi",
  checkout_open: "To'lov sahifasini ochdi",
  sample_result_view: "Namuna natijani ko'rdi",
  lang_switch: 'Tilni almashtirdi',
};

export const localeName = (k: string) => (isLocale(k) ? LOCALE_NAMES[k] : k);

/** Tabs (§1.1, §2.5). */
export type TabKey = 'overview' | 'sources' | 'centers' | 'pages' | 'funnel' | 'modules' | 'audience' | 'live' | 'recordings';
export const TAB_HREF: Record<TabKey, string> = {
  overview: '/owner/analytics', sources: '/owner/analytics/sources', centers: '/owner/analytics/centers',
  pages: '/owner/analytics/pages', funnel: '/owner/analytics/funnel', modules: '/owner/analytics/modules',
  audience: '/owner/analytics/audience', live: '/owner/analytics/live', recordings: '/owner/analytics/recordings',
};
export const TAB_LABEL: Record<TabKey, string> = {
  overview: 'Umumiy', sources: 'Manbalar', centers: 'Markazlar', pages: 'Sahifalar', funnel: 'Funnel va hodisalar',
  modules: 'Modullar', audience: 'Auditoriya', live: 'Hozir', recordings: 'Yozuvlar',
};
export const TABS_FOR: Record<AnalyticsSiteOrAll, TabKey[]> = {
  landing: ['overview', 'sources', 'pages', 'funnel', 'audience', 'live', 'recordings'],
  mock: ['overview', 'sources', 'pages', 'funnel', 'audience', 'live', 'recordings'],
  erp: ['overview', 'centers', 'pages', 'modules', 'audience', 'live', 'recordings'],
  all: ['overview', 'live', 'recordings'],
};
/** Site switch onto a site without this tab → its pair (§1.1). */
export const TAB_PAIR: Partial<Record<TabKey, TabKey>> = { sources: 'centers', centers: 'sources', funnel: 'modules', modules: 'funnel' };

export function tabOfPath(path: string): TabKey {
  const seg = path.replace(/\/+$/, '').split('/')[3];
  const found = (Object.keys(TAB_HREF) as TabKey[]).find((k) => TAB_HREF[k].split('/')[3] === seg);
  return found ?? 'overview';
}
