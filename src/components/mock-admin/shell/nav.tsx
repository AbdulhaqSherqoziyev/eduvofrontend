/** Sidebar items of admin-mock.eduvo.uz (design/mock-admin/AdminSidebar.dc.html, same order, labels and icons). */
export type AdminNavKey = 'dash' | 'orders' | 'learners' | 'attempts' | 'tests' | 'prices' | 'promo' | 'tickets' | 'stats' | 'audit' | 'settings';

export interface AdminNavItem {
  key: AdminNavKey;
  label: string;
  href: string;
  /** svg path `d` (24×24, stroke) */
  d: string;
  /** badge colour when the item has a count (orders: pending transfers, tickets: open tickets) */
  tone?: 'warn' | 'blue';
}

export const ADMIN_NAV: readonly AdminNavItem[] = [
  { key: 'dash', label: 'Bosh sahifa', href: '/', d: 'M3 12l9-8 9 8M5 10v10h14V10' },
  { key: 'orders', label: "To'lovlar", href: '/orders', d: 'M3 6h18v12H3zM3 10h18M7 15h4', tone: 'warn' },
  { key: 'learners', label: "O'quvchilar", href: '/learners', d: 'M16 20v-1a4 4 0 00-8 0v1M12 11a3 3 0 100-6 3 3 0 000 6' },
  { key: 'attempts', label: 'Urinishlar', href: '/attempts', d: 'M9 11l3 3 8-8M20 12v7H4V5h11' },
  { key: 'tests', label: 'Testlar', href: '/tests', d: 'M4 4h12l4 4v12H4zM8 12h8M8 16h5' },
  { key: 'prices', label: 'Narxlar', href: '/prices', d: 'M12 3v18M17 7H9.5a3 3 0 000 6h5a3 3 0 010 6H6' },
  { key: 'promo', label: 'Promo-kodlar', href: '/promo', d: 'M3 12V4h8l10 10-8 8zM7.5 7.5h.01' },
  { key: 'tickets', label: 'Murojaatlar', href: '/tickets', d: 'M4 5h16v11H8l-4 4z', tone: 'blue' },
  { key: 'stats', label: 'Statistika', href: '/stats', d: 'M4 20V10M10 20V4M16 20v-7M22 20H2' },
  { key: 'audit', label: 'Audit jurnali', href: '/audit', d: 'M12 8v4l3 2M12 21a9 9 0 100-18 9 9 0 000 18' },
  {
    key: 'settings', label: 'Sozlamalar', href: '/settings',
    d: 'M12 15a3 3 0 100-6 3 3 0 000 6M19 12a7 7 0 00-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 00-2-1.2L14 3h-4l-.5 2.6a7 7 0 00-2 1.2l-2.4-1-2 3.4 2 1.6a7 7 0 000 2.4l-2 1.6 2 3.4 2.4-1a7 7 0 002 1.2L10 21h4l.5-2.6a7 7 0 002-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2',
  },
];

/** Mobile bottom nav (< 760px): 4 items with their short labels. */
export const ADMIN_MOBILE_NAV: readonly { key: AdminNavKey; label: string }[] = [
  { key: 'dash', label: 'Bosh' },
  { key: 'orders', label: "To'lovlar" },
  { key: 'learners', label: "O'quvchilar" },
  { key: 'tickets', label: 'Murojaat' },
];

export interface Crumb { label: string; href?: string }
/** First breadcrumb of every screen ("Admin"). */
export const ROOT_CRUMB: Crumb = { label: 'Admin', href: '/' };

/** URL segment → display text (a malformed escape is shown as is). */
export function segText(v: string) {
  try { return decodeURIComponent(v); } catch { return v; }
}

export const navItem = (key: AdminNavKey) => ADMIN_NAV.find((i) => i.key === key)!;

/** Badge counts per nav item (from the API later; 0/undefined = no badge). */
export type AdminNavBadges = Partial<Record<AdminNavKey, number>>;

export function NavIcon({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}
