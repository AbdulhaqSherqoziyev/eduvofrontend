'use client';
/**
 * AdminSidebar.dc.html: 248px / 76px (collapsed), collapses by itself below 1200px, replaced by the
 * 4-item bottom nav below 760px. Open/closed and light/dark labels are switched by CSS classes so the
 * server HTML is already right (no width or label jump on hydration).
 */
import Link from 'next/link';
import { ADMIN_MOBILE_NAV, ADMIN_NAV, NavIcon, navItem, type AdminNavKey } from './nav';
import { useAdminShell } from './context';
import { toggleAdminTheme } from './theme';

const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('');

export function AdminSidebar({ active }: { active: AdminNavKey }) {
  const { side, toggleSide, badges, user, logout } = useAdminShell();
  const cls = side === 'auto' ? 'is-auto' : side === 'open' ? 'is-open' : 'is-closed';
  return (
    <aside className={`ma-side ${cls}`} aria-label="Asosiy menyu">
      <div className="ma-side-head">
        <div className="ma-logo" aria-hidden="true">E</div>
        <div className="ma-brand ma-open-only">
          <span className="ma-brand-name">Eduvo Mock</span>
          <span className="ma-brand-tag">Admin</span>
        </div>
        <button type="button" className="ma-side-toggle" onClick={toggleSide} title="Yig'ish" aria-label="Yig'ish">
          <span className="ma-long" aria-hidden="true">‹</span>
          <span className="ma-short" aria-hidden="true">›</span>
        </button>
      </div>
      <nav className="ma-side-nav">
        {ADMIN_NAV.map((it) => {
          const on = it.key === active;
          const n = badges[it.key] ?? 0;
          return (
            <Link key={it.key} href={it.href} title={it.label} className={`ma-nav-item${on ? ' is-active' : ''}`} aria-current={on ? 'page' : undefined}>
              <NavIcon d={it.d} />
              <span className="ma-nav-label ma-open-only">{it.label}</span>
              {n > 0 && (
                <>
                  <span className={`ma-nav-dot tone-${it.tone ?? 'blue'}`} aria-hidden="true" />
                  <span className={`ma-badge t-${it.tone ?? 'blue'} ma-open-only`}>{n}</span>
                </>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="ma-side-user">
        <div className="ma-side-who">
          <div className="ma-avatar" aria-hidden="true">{user ? initials(user.name) : ''}</div>
          <div className="ma-side-who-text ma-open-only">
            {user ? (
              <>
                <span className="ma-side-name">{user.name}</span>
                <span className="ma-side-role">{user.role}</span>
              </>
            ) : (
              <>
                <span className="ma-skel ma-shimmer" style={{ width: 120, height: 13 }} />
                <span className="ma-skel ma-shimmer" style={{ width: 60, height: 12, marginTop: 4 }} />
              </>
            )}
          </div>
        </div>
        <div className="ma-side-actions">
          <button type="button" className="ma-side-btn" onClick={toggleAdminTheme} title="Mavzu">
            <span className="ma-long"><span className="ma-if-light">Qorong&apos;i</span><span className="ma-if-dark">Yorug&apos;</span></span>
            <span className="ma-short" aria-hidden="true"><span className="ma-if-light">◐</span><span className="ma-if-dark">☀</span></span>
          </button>
          <button type="button" className="ma-side-btn is-err" onClick={logout} title="Chiqish">
            <span className="ma-long">Chiqish</span>
            <span className="ma-short" aria-hidden="true">⏻</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export function AdminMobileNav({ active }: { active: AdminNavKey }) {
  const { badges } = useAdminShell();
  return (
    <nav className="ma-mnav" aria-label="Asosiy menyu">
      {ADMIN_MOBILE_NAV.map(({ key, label }) => {
        const it = navItem(key);
        const on = key === active;
        const n = badges[key] ?? 0;
        return (
          <Link key={key} href={it.href} className={`ma-mnav-item${on ? ' is-active' : ''}`} aria-current={on ? 'page' : undefined}>
            <NavIcon d={it.d} size={20} />
            <span>{label}</span>
            {n > 0 && <span className="ma-mnav-badge">{n}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
