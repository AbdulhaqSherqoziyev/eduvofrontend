'use client';
/**
 * Web header (SiteHeader.dc.html) for ≥520px; phones get the AppBar instead (CSS switch, no JS).
 * ≥1024: nav inline. 520–1023: language · theme · burger, nav + Log in / Start free in the menu.
 * Guest nav: IELTS, SAT, Pricing, How it works, For centers. Learner: Dashboard, Take a mock, Progress, Pricing + avatar.
 */
import Link from 'next/link';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLang } from '@/lib/mock/hooks/use-lang';
import { useSession } from '@/lib/mock/hooks/use-session';
import { LanguageMenu } from './language-menu';
import { Logo } from './logo';
import { ThemeToggle } from './theme-toggle';

export type NavKey = '' | 'ielts' | 'sat' | 'pricing' | 'how' | 'centers' | 'dash' | 'mocks' | 'progress';

export function SiteHeader({ active = '' }: { active?: NavKey }) {
  const t = useTranslations('common.nav');
  const tb = useTranslations('common.brand');
  const { href } = useLang();
  const session = useSession();
  const [menu, setMenu] = useState(false);
  const learner = session.status === 'learner' ? session.learner : null;

  const items: Array<[NavKey, string, string]> = learner
    ? [['dash', t('dashboard'), href('/dashboard')], ['mocks', t('takeMock'), href('/start')], ['progress', t('progress'), href('/progress')], ['pricing', t('pricing'), href('/pricing')]]
    : [['ielts', t('ielts'), href('/ielts')], ['sat', t('sat'), href('/sat')], ['pricing', t('pricing'), href('/pricing')], ['how', t('how'), href('/how-it-works')], ['centers', t('centers'), href('#centers')]];
  const initial = (learner?.displayName || learner?.email || '?').trim().charAt(0).toUpperCase();

  return (
    <header className="m-header m-desk">
      <div className="m-header__in">
        <Logo href={href('')} label={tb('home')} />
        <nav className="m-nav m-only-lg" aria-label="Main">
          {items.map(([k, label, h]) => (
            <Link key={k} href={k === 'centers' ? `${href('')}#centers` : h} aria-current={active === k ? 'page' : undefined}>{label}</Link>
          ))}
        </nav>
        <div className="m-header__end">
          <LanguageMenu />
          <ThemeToggle />
          <span className="m-only-lg" style={{ display: 'contents' }}>
            {learner ? (
              <Link className="m-avatar" href={href('/account')} aria-label={t('account')}>{initial}</Link>
            ) : (
              <>
                <Link className="m-login" href={href('/login')}>{t('login')}</Link>
                <Link className="m-startfree" href={href('/signup')}>{t('start')}</Link>
              </>
            )}
          </span>
          <button type="button" className="m-burger m-only-md" aria-label={t('menu')} aria-expanded={menu} onClick={() => setMenu((v) => !v)}>
            <span /><span /><span />
          </button>
        </div>
      </div>
      {menu && (
        <div className="m-menu m-only-md">
          {items.map(([k, label, h]) => (
            <Link key={k} href={k === 'centers' ? `${href('')}#centers` : h} aria-current={active === k ? 'page' : undefined}>{label}</Link>
          ))}
          {learner ? (
            <Link href={href('/account')}>{t('account')}</Link>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
              <Link className="m-btn m-btn--soft" href={href('/login')} style={{ height: 48, fontWeight: 700 }}>{t('login')}</Link>
              <Link className="m-btn m-btn--primary" href={href('/signup')} style={{ height: 48, fontWeight: 700 }}>{t('start')}</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
