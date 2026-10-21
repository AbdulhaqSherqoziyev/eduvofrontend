/** Landing <520px — Mobile Landing.dc.html (app bar + sticky CTA are rendered by the page). */
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { sx } from '@/lib/mock/sx';
import { CatalogError } from '../catalog-error';
import { Price } from '../price';
import { FaqCards } from './faq';
import { Chevron, PhoneHow, PhoneSample, ThemeLink } from './landing-phone-parts';
import { WaitlistRows } from './waitlist';

const H = sx('margin:0;font-size:22px;font-weight:800;letter-spacing:-0.025em');

export async function LandingPhone() {
  const t = await getTranslations('landing');
  const tc = await getTranslations('common');
  const lang = await getLocale();
  const h = (p: string) => `/${lang}${p}`;
  const features: Array<[string, string]> = [
    ['f1', 'var(--ielts)'], ['f2', 'var(--ielts)'], ['f3', 'var(--ielts)'], ['f4', 'var(--sat)'],
    ['f5', 'var(--sat)'], ['f6', 'var(--blue)'], ['f7', 'var(--blue)'], ['f8', 'var(--ai)'],
  ];
  const PRICE = sx('border-radius:18px;box-shadow:var(--raise-sm);padding:14px 16px;display:flex;align-items:center;gap:12px;color:var(--ink)');
  const NOTE = sx('font-size:12px;color:var(--mut);font-weight:600');
  return (
    <div className="m-phone" style={sx('display:flex;flex-direction:column')}>
      <section style={sx('padding:14px 18px 8px;display:flex;flex-direction:column;gap:16px')}>
        <div style={sx('display:flex;align-items:center;gap:8px;padding:6px 12px 6px 8px;border-radius:999px;box-shadow:var(--inset);align-self:flex-start;font-size:12px;font-weight:800;color:var(--ink2)')}>
          <span style={sx('width:8px;height:8px;border-radius:50%;background:var(--ok);animation:m-pulse 2s infinite')} />{t('phone.live')}
        </div>
        <h1 className="m-hyph" style={sx('margin:0;font-size:33px;line-height:1.08;letter-spacing:-0.035em;font-weight:800;text-wrap:balance')}>{t('phone.h1a')} <span style={sx('color:var(--blue)')}>{t('phone.h1b')}</span></h1>
        <p style={sx('margin:0;font-size:15px;line-height:1.55;color:var(--ink2);text-wrap:pretty')}>{t('phone.sub')}</p>
      </section>

      <section style={sx('padding:10px 18px 4px;display:flex;flex-direction:column;gap:14px')}>
        <PhoneSample />
        <div style={sx('display:grid;grid-template-columns:repeat(3,1fr);gap:8px')}>
          {([1, 2, 3] as const).map((i) => (
            <div key={i} style={sx('padding:12px 8px;border-radius:16px;box-shadow:var(--raise-sm);display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center')}>
              <b style={sx('font-size:16px;letter-spacing:-0.02em')}>{t(`phone.perk${i}v`)}</b>
              <span style={sx('font-size:11px;font-weight:700;color:var(--mut);line-height:1.3')}>{t(`phone.perk${i}`)}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="exams" style={sx('padding:32px 18px 0;display:flex;flex-direction:column;gap:12px')}>
        <div style={sx('display:flex;justify-content:space-between;align-items:baseline')}>
          <h2 style={H}>{t('exams.title')}</h2><span style={sx('font-size:12px;font-weight:700;color:var(--mut)')}>{t('phone.swipe')}</span>
        </div>
        <div style={sx('display:flex;gap:14px;overflow-x:auto;scrollbar-width:none;scroll-snap-type:x mandatory;padding:8px 18px 20px;scroll-padding:0 18px;margin:0 -18px')}>
          {(['ielts', 'sat'] as const).map((ex) => {
            const f = ex === 'ielts' ? 'phone.ieltsFacts' : 'phone.satFacts';
            return (
              <Link key={ex} href={h(`/${ex}`)} style={sx('flex:none;width:82%;scroll-snap-align:start;border-radius:24px;box-shadow:var(--raise);background:var(--bg);color:var(--ink);padding:18px;display:flex;flex-direction:column;gap:14px')}>
                <div style={sx('display:flex;justify-content:space-between;align-items:center;gap:8px')}>
                  <span lang="en" style={{ ...sx('display:flex;align-items:center;gap:8px;font-size:12px;font-weight:800;letter-spacing:.05em;white-space:nowrap'), color: `var(--${ex})` }}>
                    <span style={sx('width:28px;height:28px;border-radius:9px;box-shadow:var(--inset);display:grid;place-items:center;font-size:11px')}>{ex === 'ielts' ? 'IE' : 'SAT'}</span>
                    {ex === 'ielts' ? 'IELTS ACADEMIC' : 'DIGITAL SAT'}
                  </span>
                  <span className="m-pill m-pill--ok" style={sx('padding:3px 9px;font-size:11px')}>{tc('chips.freeSection')}</span>
                </div>
                <span style={sx('font-size:19px;font-weight:800;line-height:1.25;letter-spacing:-0.015em')}>{t(ex === 'ielts' ? 'exams.ieltsName' : 'phone.satName')}</span>
                <div style={sx('display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:12px;border-radius:16px;box-shadow:var(--inset)')}>
                  {(['a', 'b', 'c'] as const).map((k) => (
                    <span key={k} style={sx('display:flex;flex-direction:column;gap:1px;font-size:11px;font-weight:700;color:var(--mut)')}><b style={sx('font-size:15px;color:var(--ink);white-space:nowrap')}><bdi dir="ltr">{t(`${f}.${k}`)}</bdi></b>{t(`${f}.${k}Label`)}</span>
                  ))}
                </div>
                <div style={sx('display:flex;justify-content:space-between;align-items:center;gap:8px')}>
                  <span style={sx('font-size:13px;color:var(--ink2);font-weight:600')}>{t.rich('phone.fullFrom', { b: (c) => <b style={sx('color:var(--ink);font-size:15px')}>{c}</b>, price: () => <Price exam={ex} kind="examFull" skelWidth={80} /> })}</span>
                  <span style={sx('width:36px;height:36px;border-radius:12px;box-shadow:var(--raise-sm);display:grid;place-items:center;color:var(--blue);flex:none')}><span style={sx('display:flex;margin-inline-end:3px')}><Chevron /></span></span>
                </div>
              </Link>
            );
          })}
        </div>
        <WaitlistRows items={[{ exam: 'cefr', name: 'CEFR', color: 'var(--cefr)' }, { exam: 'toefl', name: 'TOEFL iBT', color: 'var(--toefl)' }, { exam: 'hsk', name: 'HSK', color: 'var(--hsk)' }]} />
      </section>

      <section style={sx('padding:36px 18px 0;display:flex;flex-direction:column;gap:12px')}>
        <h2 style={H}>{t('how.title')}</h2>
        <PhoneHow items={(['how1', 'how2', 'how3', 'how4'] as const).map((k) => ({ title: t(`phone.${k}.title`), text: t(`phone.${k}.text`) }))} />
      </section>

      <section style={sx('padding:28px 18px 0')}>
        <div style={sx('border-radius:20px;box-shadow:var(--inset);padding:16px;display:flex;gap:14px;align-items:flex-start')}>
          <span style={sx('width:40px;height:40px;flex:none;border-radius:12px;box-shadow:var(--raise-sm);display:grid;place-items:center')}><span style={sx('width:20px;height:14px;border-radius:3px;border:2px solid var(--blue)')} /></span>
          <span style={sx('display:flex;flex-direction:column;gap:4px')}><b style={sx('font-size:15px')}>{t('phone.laptopT')}</b><span style={sx('font-size:13px;color:var(--ink2);line-height:1.5')}>{t('phone.laptopB')}</span></span>
        </div>
      </section>

      <section style={sx('padding:36px 18px 0;display:flex;flex-direction:column;gap:12px')}>
        <h2 style={H}>{t('get.title')}</h2>
        <div style={sx('display:flex;flex-wrap:wrap;gap:8px')}>
          {features.map(([key, color]) => (
            <span key={key} style={sx('padding:9px 12px;border-radius:12px;box-shadow:var(--raise-sm);font-size:13px;font-weight:700;display:flex;gap:7px;align-items:center;line-height:1.3')}>
              <span style={{ ...sx('width:7px;height:7px;flex:none;border-radius:50%'), background: color }} />{t(`phone.${key}`)}
            </span>
          ))}
        </div>
      </section>

      <section style={sx('padding:36px 18px 0;display:flex;flex-direction:column;gap:12px')}>
        <div style={sx('display:flex;justify-content:space-between;align-items:baseline')}>
          <h2 style={H}>{t('pricing.title')}</h2>
          <Link href={h('/pricing')} style={sx('font-weight:800;font-size:14px')}>{t('phone.seeAll')}</Link>
        </div>
        <CatalogError text={t('pricing.loadError')} retry={t('pricing.retry')} />
        <div style={sx('display:flex;flex-direction:column;gap:10px')}>
          <Link href={h('/pricing')} style={PRICE}>
            <span style={sx('flex:1;display:flex;flex-direction:column;gap:2px;min-width:0')}><b style={sx('font-size:15px')}>{t('phone.pSection')}</b><span style={NOTE}>{t('phone.pSectionNote')}</span></span>
            <b style={sx('font-size:16px;white-space:nowrap;letter-spacing:-0.01em')}><Price exam="ielts" kind="section" skelWidth={80} /></b>
          </Link>
          <Link href={h('/pricing')} style={{ ...PRICE, ...sx('outline:2px solid var(--blue);outline-offset:-2px') }}>
            <span style={sx('flex:1;display:flex;flex-direction:column;gap:2px;min-width:0')}>
              <span style={sx('display:flex;gap:8px;align-items:center')}><b style={sx('font-size:15px')}>{t('phone.pFull')}</b><span className="m-pill m-pill--blue" style={sx('padding:2px 8px;font-size:10px;font-weight:800')}>{t('phone.popular')}</span></span>
              <span style={NOTE}>{t('phone.pFullNote')}</span>
            </span>
            <b style={sx('font-size:16px;white-space:nowrap;letter-spacing:-0.01em')}><Price exam="ielts" kind="full" skelWidth={80} /></b>
          </Link>
          <Link href={h('/pricing')} style={PRICE}>
            <span style={sx('flex:1;display:flex;flex-direction:column;gap:2px;min-width:0')}><b style={sx('font-size:15px')}>{t('phone.pBundle', { n: 5 })}</b><span style={NOTE}>{t.rich('phone.pBundleNote', { per: () => <Price exam="ielts" kind="bundle" qty={5} field="perMock" skelWidth={70} /> })}</span></span>
            <b style={sx('font-size:16px;white-space:nowrap;letter-spacing:-0.01em')}><Price exam="ielts" kind="bundle" qty={5} skelWidth={80} /></b>
          </Link>
        </div>
      </section>

      <section style={sx('padding:36px 18px 0;display:flex;flex-direction:column;gap:12px')}>
        <h2 style={H}>{t('faq.title')}</h2>
        <FaqCards items={([1, 2, 3, 4, 5] as const).map((i) => ({ q: t(`phone.fq${i}`), a: t(`phone.fa${i}`) }))} />
      </section>

      <section id="centers" style={sx('padding:28px 18px 0')}>
        <a href="https://eduvo.uz" style={sx('border-radius:20px;box-shadow:var(--raise-sm);padding:16px;display:flex;align-items:center;gap:12px;color:var(--ink)')}>
          <span style={sx('flex:1;display:flex;flex-direction:column;gap:3px')}><span className="m-eyebrow" style={sx('font-size:11px;color:var(--blue)')}>{t('centers.eyebrow')}</span><b style={sx('font-size:15px;line-height:1.35')}>{t('centers.title')}</b></span>
          <Chevron color="var(--ink2)" />
        </a>
      </section>

      <footer style={sx('padding:32px 18px 28px;display:flex;flex-direction:column;gap:14px;align-items:center;text-align:center;font-size:12px;color:var(--mut);font-weight:600')}>
        <div style={sx('display:flex;gap:16px;flex-wrap:wrap;justify-content:center')}>
          <Link href={h('/help')} style={sx('color:var(--ink2)')}>{tc('footer.help')}</Link>
          <Link href={h('/terms')} style={sx('color:var(--ink2)')}>{tc('footer.terms')}</Link>
          <Link href={h('/privacy')} style={sx('color:var(--ink2)')}>{tc('footer.privacy')}</Link>
          <ThemeLink />
        </div>
        <span style={sx('font-size:11px;line-height:1.5;padding:0 8px')}>{tc('legalLine')}</span>
        <span>© 2026 Eduvo · Tashkent</span>
      </footer>
    </div>
  );
}
