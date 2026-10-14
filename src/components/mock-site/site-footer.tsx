/** Web footer (SiteFooter.dc.html): brand · Exams · Company · Legal · Languages, then the legal line. Hidden on phones. */
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { LOCALES, LOCALE_NAMES, htmlLang, type MockLocale } from '@/i18n/locales';
import { sx } from '@/lib/mock/sx';
import { SUPPORT_EMAIL, SUPPORT_TELEGRAM } from '@/lib/mock/legal';
import { FooterMoreLangs } from './footer-more-langs';
import { FooterLogo } from './logo';

/** Social profiles with a real URL (TL 10-15: Telegram only for now). */
const SOCIAL: Array<[string, string]> = SUPPORT_TELEGRAM ? [['Telegram', `https://t.me/${SUPPORT_TELEGRAM.slice(1)}`]] : [];

const SHOWN: MockLocale[] = ['en', 'uz', 'ru', 'kk', 'tr', 'ar', 'de'];
const COL = sx('display:flex;flex-direction:column;gap:10px;font-size:14px');
const HEAD = sx('font-weight:800;font-size:12px;letter-spacing:.08em;text-transform:var(--tt-eyebrow);color:var(--mut);margin-bottom:4px');

export async function SiteFooter() {
  const t = await getTranslations('common');
  const lang = await getLocale();
  const h = (p: string) => `/${lang}${p}`;
  return (
    <footer className="m-desk" style={sx('border-top:1px solid var(--line);margin-top:40px')}>
      <div style={sx('max-width:1280px;margin:0 auto;padding:48px 20px 28px;display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:32px')}>
        <div style={sx('display:flex;flex-direction:column;gap:14px;min-width:0')}>
          <FooterLogo href={h('')} label={t('brand.home')} />
          <p style={sx('margin:0;color:var(--ink2);font-size:14px;line-height:var(--lh-body)')}>{t('footer.about')}</p>
          <a href={`mailto:${SUPPORT_EMAIL}`} style={sx('font-size:14px;font-weight:600')}><bdi dir="ltr">{SUPPORT_EMAIL}</bdi></a>
          {/* only networks with a real profile are shown (Instagram / YouTube / LinkedIn have none yet) */}
          {SOCIAL.length > 0 && (
            <div style={sx('display:flex;gap:6px 14px;flex-wrap:wrap;font-size:13px;font-weight:600')}>
              {SOCIAL.map(([n, u]) => <a key={n} className="m-link-soft" href={u} target="_blank" rel="noopener noreferrer">{n}</a>)}
            </div>
          )}
        </div>
        <div style={COL}>
          <div style={HEAD}>{t('footer.exams')}</div>
          <Link className="m-link-soft" href={h('/ielts')}>{t('footer.ieltsAcademic')}</Link>
          <Link className="m-link-soft" href={h('/sat')}>{t('footer.digitalSat')}</Link>
          <span style={sx('color:var(--mut)')}>{t('footer.soon')}</span>
          <Link className="m-link-soft" href={h('/pricing')}>{t('footer.pricing')}</Link>
        </div>
        <div style={COL}>
          <div style={HEAD}>{t('footer.company')}</div>
          <Link className="m-link-soft" href={`${h('')}#centers`}>{t('footer.centers')}</Link>
          <Link className="m-link-soft" href={h('/help')}>{t('footer.help')}</Link>
          <Link className="m-link-soft" href={h('/help/contact')}>{t('footer.contact')}</Link>
          <a className="m-link-soft" href="https://eduvo.uz">{t('footer.erp')}</a>
        </div>
        <div style={COL}>
          <div style={HEAD}>{t('footer.legal')}</div>
          <Link className="m-link-soft" href={h('/terms')}>{t('footer.terms')}</Link>
          <Link className="m-link-soft" href={h('/privacy')}>{t('footer.privacy')}</Link>
          <Link className="m-link-soft" href={h('/refunds')}>{t('footer.refund')}</Link>
          <Link className="m-link-soft" href={h('/cookies')}>{t('footer.cookies')}</Link>
        </div>
        <div style={COL}>
          <div style={HEAD}>{t('footer.languages')}</div>
          <div style={sx('display:flex;flex-wrap:wrap;gap:6px 12px;color:var(--ink2)')}>
            {SHOWN.map((l) => <a key={l} className="m-link-mut" href={`/${l}`} lang={htmlLang(l)} hrefLang={htmlLang(l)}>{LOCALE_NAMES[l]}</a>)}
            <FooterMoreLangs label={t('footer.more', { n: LOCALES.length - SHOWN.length })} />
          </div>
        </div>
      </div>
      <div style={sx('max-width:1280px;margin:0 auto;padding:18px 20px 32px;border-top:1px solid var(--line);display:flex;flex-wrap:wrap;gap:8px 24px;justify-content:space-between;font-size:12px;color:var(--mut);line-height:1.5')}>
        <span>{t('footer.copyright', { year: new Date().getUTCFullYear() })}</span>
        <span style={sx('max-width:640px')}>{t('legalLine')}</span>
      </div>
    </footer>
  );
}
