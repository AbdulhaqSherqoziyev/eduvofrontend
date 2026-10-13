'use client';
/** Header theme toggle (moon glyph from SiteHeader.dc.html). Learner: also saved to the profile. */
import { useTranslations } from 'next-intl';
import { getSession } from '@/lib/mock/api/client';
import { patchMe } from '@/lib/mock/api/endpoints';
import { applyTheme, currentTheme } from '@/lib/mock/theme';

export function ThemeToggle() {
  const t = useTranslations('common');
  const flip = () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    if (getSession().status === 'learner') void patchMe({ theme: next }).catch(() => undefined);
  };
  return (
    <button type="button" className="m-hbtn m-hbtn--icon" aria-label={t('nav.theme')} onClick={flip}>
      <span className="m-moon" aria-hidden />
    </button>
  );
}
