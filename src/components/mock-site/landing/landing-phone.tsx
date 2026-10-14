/** Landing <520px — Mobile App.dc.html `landing` screen (app bar + sticky CTA are rendered by the page). */
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { sx } from '@/lib/mock/sx';
import { CatalogError } from '../catalog-error';
import { Price } from '../price';
import { FaqPhone } from './faq';
import { WaitlistRows } from './waitlist';

const H = sx('font-size:20px;font-weight:800;letter-spacing:var(--ls-t)');

export async function LandingPhone() {
  const t = await getTranslations('landing');
  const tc = await getTranslations('common');
  const lang = await getLocale();
  const h = (p: string) => `/${lang}${p}`;
  const features: Array<[string, string, string]> = [
    ['tagIelts', 'f1', 'var(--ielts)'], ['tagIelts', 'f2', 'var(--ielts)'], ['tagIelts', 'f3', 'var(--ielts)'],
    ['tagSat', 'f4', 'var(--sat)'], ['tagSat', 'f5', 'var(--sat)'],
    ['tagBoth', 'f6', 'var(--blue)'], ['tagBoth', 'f7', 'var(--blue)'], ['tagAi', 'f8', 'var(--ai)'],
  ];
  const ROW = sx('width:100%;color:var(--ink);padding:16px;display:flex;align-items:center;gap:12px;text-align:start');
  return (
    <div className="m-phone" style={sx('padding:12px 16px 28px;display:flex;flex-direction:column;gap:28px')}>
      <div style={sx('display:flex;flex-direction:column;gap:14px')}>
        <div style={sx('display:flex;gap:6px')}>
          <span className="m-chip" style={sx('padding:5px 10px;font-size:12px;font-weight:800;color:var(--ielts)')} lang="en">IELTS Academic</span>
          <span className="m-chip" style={sx('padding:5px 10px;font-size:12px;font-weight:800;color:var(--sat)')} lang="en">Digital SAT</span>
        </div>
        <h1 className="m-hyph" style={sx('margin:0;font-size:var(--hero-size-m);line-height:var(--lh-hero-m);letter-spacing:var(--ls-h);font-weight:800;text-wrap:balance')}>{t('phone.h1')}</h1>
        <p style={sx('margin:0;font-size:15px;line-height:1.55;color:var(--ink2);text-wrap:pretty')}>{t('phone.sub')}</p>
      </div>

      <Link href={h('/sample-result')} className="m-card" style={sx('text-align:start;color:var(--ink);padding:18px;display:flex;flex-direction:column;gap:14px')}>
        <div style={sx('display:flex;justify-content:space-between;align-items:center;width:100%')}>
          <span className="m-eyebrow" style={sx('color:var(--mut)')}>{t('phone.sampleResult')}</span>
          <span className="m-pill m-pill--ok">CEFR B2</span>
        </div>
        <div style={sx('display:flex;align-items:flex-end;justify-content:space-between;width:100%;gap:12px')}>
          <div style={sx('display:flex;flex-direction:column')}>
            <span style={sx('font-size:12px;color:var(--ink2);font-weight:700')}>{t('phone.overallBand')}</span>
            <span style={sx('font-size:56px;font-weight:800;letter-spacing:var(--ls-score-xl);line-height:1')}><bdi dir="ltr">6.5</bdi></span>
          </div>
          <div dir="ltr" style={sx('display:grid;grid-template-columns:repeat(3,auto);gap:14px;font-size:11px;font-weight:700;color:var(--ink2)')}>
            <span style={sx('display:flex;flex-direction:column;gap:2px')}>{t('phone.listen')}<b style={sx('font-size:17px;color:var(--ink)')}>7.0</b></span>
            <span style={sx('display:flex;flex-direction:column;gap:2px')}>{t('phone.read')}<b style={sx('font-size:17px;color:var(--ink)')}>6.5</b></span>
            <span style={sx('display:flex;flex-direction:column;gap:2px')}>{t('phone.write')}<b style={sx('font-size:17px;color:var(--ink)')}>6.0</b></span>
          </div>
        </div>
        <span style={sx('font-size:13px;font-weight:800;color:var(--blue)')}>{t('phone.seeSample')}</span>
      </Link>

      <div style={sx('display:flex;flex-direction:column;gap:12px')}>
        <div style={H}>{t('exams.title')}</div>
        <div className="m-carousel">
          {(['ielts', 'sat'] as const).map((ex) => {
            const f = ex === 'ielts' ? 'phone.ieltsFacts' : 'phone.satFacts';
            return (
              <Link key={ex} href={h(`/pricing?exam=${ex}`)} className="m-card" style={sx('flex:none;width:78%;text-align:start;color:var(--ink);padding:18px;display:flex;flex-direction:column;gap:12px')}>
                <div style={sx('display:flex;justify-content:space-between;width:100%;gap:8px')}>
                  <span className="m-eyebrow" style={{ ...sx('letter-spacing:var(--ls-eyebrow-sm)'), color: `var(--${ex})` }} lang="en">{ex === 'ielts' ? 'IELTS ACADEMIC' : 'DIGITAL SAT'}</span>
                  <span className="m-pill m-pill--ok" style={sx('padding:3px 9px;font-size:11px')}>{tc('chips.freeSection')}</span>
                </div>
                <span style={sx('font-size:19px;font-weight:800;line-height:1.25')}>{t(ex === 'ielts' ? 'exams.ieltsName' : 'phone.satName')}</span>
                <div style={sx('display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:12px;border-radius:16px;box-shadow:var(--inset);width:100%')}>
                  {(['a', 'b', 'c'] as const).map((k) => (
                    <span key={k} style={sx('display:flex;flex-direction:column;gap:1px;font-size:11px;font-weight:700;color:var(--mut)')}><b style={sx('font-size:15px;color:var(--ink);white-space:nowrap')}><bdi dir="ltr">{t(`${f}.${k}`)}</bdi></b>{t(`${f}.${k}Label`)}</span>
                  ))}
                </div>
                <span style={sx('font-size:13px;color:var(--ink2);font-weight:600')}>{t.rich('phone.fullFrom', { b: (c) => <b style={sx('color:var(--ink)')}>{c}</b>, price: () => <Price exam={ex} kind="examFull" skelWidth={80} /> })}</span>
              </Link>
            );
          })}
        </div>
        <WaitlistRows items={[{ exam: 'cefr', name: 'CEFR', color: 'var(--cefr)' }, { exam: 'toefl', name: 'TOEFL iBT', color: 'var(--toefl)' }, { exam: 'hsk', name: 'HSK', color: 'var(--hsk)' }]} />
      </div>

      <div style={sx('display:flex;flex-direction:column;gap:14px')}>
        <div style={H}>{t('how.title')}</div>
        <div style={sx('display:flex;flex-direction:column')}>
          {(['how1', 'how2', 'how3', 'how4'] as const).map((k, i) => (
            <div key={k} style={sx('display:grid;grid-template-columns:36px minmax(0,1fr);gap:14px')}>
              <div style={sx('display:flex;flex-direction:column;align-items:center')}>
                <span style={sx('width:36px;height:36px;border-radius:12px;box-shadow:var(--raise-sm);display:grid;place-items:center;font-weight:800;color:var(--blue);flex:none')}>{i + 1}</span>
                <span style={{ ...sx('flex:1;width:2px;background:var(--line);margin:4px 0'), opacity: i === 3 ? 0 : 1 }} />
              </div>
              <div style={sx('padding:6px 0 20px;display:flex;flex-direction:column;gap:4px')}>
                <b style={sx('font-size:16px')}>{t(`phone.${k}.title`)}</b>
                <span style={sx('font-size:14px;color:var(--ink2);line-height:1.5')}>{t(`phone.${k}.text`)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={sx('display:flex;flex-direction:column;gap:12px')}>
        <div style={H}>{t('get.title')}</div>
        <div className="m-rows">
          {features.map(([tag, key, color]) => (
            <div key={key} style={sx('padding:14px 16px;display:flex;align-items:center;gap:12px')}>
              <span className="m-mono" style={{ ...sx('width:44px;flex:none;font-size:10px;font-weight:800'), color }}>{t(`get.${tag}`)}</span>
              <span style={sx('font-size:14px;font-weight:700;line-height:1.4')}>{t(`phone.${key}`)}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={sx('display:flex;flex-direction:column;gap:12px')}>
        <div style={sx('display:flex;justify-content:space-between;align-items:baseline')}>
          <span style={H}>{t('pricing.title')}</span>
          <Link href={h('/pricing')} style={sx('color:var(--blue);font-weight:800;font-size:14px')}>{t('phone.seeAll')}</Link>
        </div>
        <CatalogError text={t('pricing.loadError')} retry={t('pricing.retry')} />
        <div className="m-rows">
          <Link href={h('/pricing')} style={ROW}>
            <span style={sx('flex:1;display:flex;flex-direction:column;gap:2px')}><b style={sx('font-size:15px')}>{t('phone.pSection')}</b><span style={sx('font-size:12px;color:var(--mut);font-weight:600')}>{t('phone.pSectionNote')}</span></span>
            <b style={sx('font-size:15px;white-space:nowrap')}><Price exam="ielts" kind="section" skelWidth={80} /></b>
          </Link>
          <Link href={h('/pricing')} style={ROW}>
            <span style={sx('flex:1;display:flex;flex-direction:column;gap:2px')}><b style={sx('font-size:15px')}>{t('phone.pFull')}</b><span style={sx('font-size:12px;color:var(--mut);font-weight:600')}>{t('phone.pFullNote')}</span></span>
            <b style={sx('font-size:15px;white-space:nowrap')}><Price exam="ielts" kind="full" skelWidth={80} /></b>
          </Link>
          <Link href={h('/pricing')} style={ROW}>
            <span style={sx('flex:1;display:flex;flex-direction:column;gap:2px')}><b style={sx('font-size:15px')}>{t('phone.pBundle', { n: 5 })}</b><span style={sx('font-size:12px;color:var(--mut);font-weight:600')}>{t.rich('phone.pBundleNote', { per: () => <Price exam="ielts" kind="bundle" qty={5} field="perMock" skelWidth={70} /> })}</span></span>
            <b style={sx('font-size:15px;white-space:nowrap')}><Price exam="ielts" kind="bundle" qty={5} skelWidth={80} /></b>
          </Link>
        </div>
      </div>

      <div style={sx('display:flex;flex-direction:column;gap:12px')}>
        <div style={H}>{t('faq.title')}</div>
        <FaqPhone items={([1, 2, 3, 4, 5] as const).map((i) => ({ q: t(`phone.fq${i}`), a: t(`phone.fa${i}`) }))} />
      </div>

      <div style={sx('border-radius:20px;box-shadow:var(--inset);padding:18px;display:flex;flex-direction:column;gap:8px')}>
        <span className="m-eyebrow" style={sx('font-size:11px;color:var(--blue)')}>{t('centers.eyebrow')}</span>
        <b style={sx('font-size:16px;line-height:1.35')}>{t('centers.title')}</b>
        <a href="https://eduvo.uz" style={sx('font-weight:800;font-size:14px')}>eduvo.uz</a>
      </div>
      <div style={sx('font-size:11px;color:var(--mut);line-height:1.5;text-align:center;padding:0 8px')}>{tc('legalLine')}</div>
    </div>
  );
}
