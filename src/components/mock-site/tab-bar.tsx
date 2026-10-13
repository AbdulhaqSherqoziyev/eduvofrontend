'use client';
/** Phone bottom tab bar for learners (Home, Mocks, Progress, Profile) — icons are the design's CSS glyphs. */
import { useTranslations } from 'next-intl';
import { useLang } from '@/lib/mock/hooks/use-lang';
import { sx } from '@/lib/mock/sx';

export type TabKey = 'home' | 'mocks' | 'progress' | 'profile';

const Icon = ({ k }: { k: TabKey }) => {
  if (k === 'home') return <span style={sx('width:16px;height:15px;border:2.2px solid currentColor;border-radius:4px 4px 3px 3px')} />;
  if (k === 'mocks') return (
    <span style={sx('width:14px;height:18px;border:2.2px solid currentColor;border-radius:3px;display:flex;flex-direction:column;justify-content:center;gap:2px;padding:0 2px')}>
      <span style={sx('height:2px;background:currentColor;border-radius:1px')} /><span style={sx('height:2px;background:currentColor;border-radius:1px;width:60%')} />
    </span>
  );
  if (k === 'progress') return (
    <span style={sx('display:flex;gap:3px;align-items:flex-end;height:16px')}>
      <span style={sx('width:4px;height:7px;border-radius:2px;background:currentColor')} /><span style={sx('width:4px;height:11px;border-radius:2px;background:currentColor')} /><span style={sx('width:4px;height:16px;border-radius:2px;background:currentColor')} />
    </span>
  );
  return (
    <span style={sx('display:flex;flex-direction:column;align-items:center;gap:1px')}>
      <span style={sx('width:8px;height:8px;border-radius:50%;border:2.2px solid currentColor')} /><span style={sx('width:15px;height:7px;border:2.2px solid currentColor;border-bottom:0;border-radius:8px 8px 0 0')} />
    </span>
  );
};

export function TabBar({ active }: { active: TabKey }) {
  const t = useTranslations('common.tabs');
  const { href } = useLang();
  const tabs: Array<[TabKey, string]> = [['home', '/dashboard'], ['mocks', '/mocks'], ['progress', '/progress'], ['profile', '/account']];
  return (
    <nav className="m-tabbar m-phone" aria-label="Tabs">
      {tabs.map(([k, p]) => (
        <a key={k} href={href(p)} aria-current={active === k ? 'page' : undefined}>
          <span aria-hidden><Icon k={k} /></span>
          {t(k)}
        </a>
      ))}
    </nav>
  );
}
