/**
 * `/ielts`, `/sat` — README §2 "Exam pages (SEO) — specification only, not drawn". Built in the landing's
 * visual language: hero (accent eyebrow, H1, price, Start full mock / Try free section), format table,
 * what's included, sample question preview (player question styles), exam FAQ.
 */
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import type { OpenExamSlug } from '@/lib/mock/api/types';
import { sx } from '@/lib/mock/sx';
import { CatalogError } from './catalog-error';
import { FaqDesktop, FaqPhone } from './landing/faq';
import { Price } from './price';
import { BrandMark } from './logo';

const SEC = sx('max-width:1280px;margin:0 auto;padding:clamp(40px,5vw,72px) 20px');
const QBTN = sx('padding:6px 10px;border-radius:9px;box-shadow:var(--raise-sm);font-weight:700');

function IeltsPreview() {
  return (
    <div lang="en" dir="ltr" className="m-card" style={sx('overflow:hidden')}>
      <div style={sx('display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid var(--line);font-size:12px;font-weight:700')}>
        <BrandMark size={22} shadow={false} />
        <span style={sx('color:var(--ink2)')}>IELTS Academic · Reading</span>
        <span style={sx('margin-inline-start:auto;padding:5px 10px;border-radius:9px;box-shadow:var(--inset)')}>58:40</span>
      </div>
      <div style={sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))')}>
        <div className="m-serif" style={sx('padding:18px 20px;border-inline-end:1px solid var(--line);font-size:14px;line-height:1.7')}>
          <div style={sx('font-weight:600;font-size:16px;margin-bottom:8px')}>B</div>
          Medieval towns often kept common orchards inside their walls, and records from fifteenth-century Ghent describe <span className="m-hl">fines for picking fruit</span> before the official harvest day.
        </div>
        <div style={sx('padding:18px;display:flex;flex-direction:column;gap:10px;font-size:13px')}>
          <div style={sx('font-weight:800;color:var(--ink2)')}>Questions 3–4</div>
          <div style={sx('font-weight:600;line-height:1.45')}>3. Fruit could be picked freely at any time in fifteenth-century Ghent.</div>
          <div style={sx('display:flex;gap:6px;flex-wrap:wrap')}>
            <span style={QBTN}>TRUE</span>
            <span style={sx('padding:6px 10px;border-radius:9px;background:var(--blue);color:#fff;font-weight:700')}>FALSE</span>
            <span style={QBTN}>NOT GIVEN</span>
          </div>
          <div style={sx('font-weight:600;line-height:1.45;margin-top:6px')}>4. Records from Ghent mention ______ for picking fruit early.</div>
          <span style={sx('height:34px;border-radius:9px;box-shadow:var(--inset);display:flex;align-items:center;padding:0 10px;color:var(--mut);font-weight:600')}>fines</span>
        </div>
      </div>
    </div>
  );
}

function SatPreview() {
  const opt = sx('display:flex;gap:10px;align-items:center;padding:10px 12px;border-radius:12px;box-shadow:var(--raise-sm);font-weight:600');
  const letter = sx('width:24px;height:24px;border-radius:50%;border:1.6px solid var(--ink2);display:grid;place-items:center;font-size:12px;font-weight:800;flex:none');
  return (
    <div lang="en" dir="ltr" className="m-card" style={sx('overflow:hidden')}>
      <div style={sx('display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid var(--line);font-size:12px;font-weight:700')}>
        <BrandMark size={22} shadow={false} />
        <span style={sx('color:var(--ink2)')}>Section 1, Module 1: Reading and Writing</span>
        <span style={sx('margin-inline-start:auto;padding:5px 10px;border-radius:9px;box-shadow:var(--inset)')}>27:05</span>
      </div>
      <div style={sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))')}>
        <div className="m-serif" style={sx('padding:18px 20px;border-inline-end:1px solid var(--line);font-size:14px;line-height:1.7')}>
          The city’s first public library opened in 1902. Within a decade, its reading rooms were so crowded that the council voted to build two ______ branches in the growing suburbs.
        </div>
        <div style={sx('padding:18px;display:flex;flex-direction:column;gap:8px;font-size:13px')}>
          <div style={sx('display:flex;align-items:center;gap:8px')}>
            <span style={sx('padding:4px 9px;border-radius:7px;background:var(--ink);color:var(--bg);font-weight:800')}>4</span>
            <span style={sx('color:var(--mut);font-weight:700')}>Mark for Review</span>
            <span style={sx('margin-inline-start:auto;padding:3px 7px;border-radius:7px;box-shadow:var(--inset);font-weight:800;text-decoration:line-through')}>ABC</span>
          </div>
          <div style={sx('font-weight:600;line-height:1.45')}>Which choice completes the text with the most logical and precise word?</div>
          <div style={opt}><span style={letter}>A</span>redundant</div>
          <div style={{ ...opt, ...sx('outline:2px solid var(--blue);outline-offset:-2px') }}><span style={{ ...letter, ...sx('background:var(--blue);border-color:var(--blue);color:#fff') }}>B</span>additional</div>
          <div style={opt}><span style={letter}>C</span>temporary</div>
        </div>
      </div>
    </div>
  );
}

export async function ExamPageDesktop({ exam }: { exam: OpenExamSlug }) {
  const t = await getTranslations('exams');
  const tl = await getTranslations('landing');
  const lang = await getLocale();
  const h = (p: string) => `/${lang}${p}`;
  const f = `format.${exam}`;
  const rows: Array<[string, string, string]> = exam === 'ielts'
    ? [['listening', 'listeningTime', 'listeningQ'], ['reading', 'readingTime', 'readingQ'], ['writing', 'writingTime', 'writingQ']]
    : [['rw', 'rwTime', 'rwQ'], ['break', 'breakTime', ''], ['math', 'mathTime', 'mathQ']];
  const features: Array<[string, string, string]> = exam === 'ielts'
    ? [['tagIelts', 'f1', 'var(--ielts)'], ['tagIelts', 'f2', 'var(--ielts)'], ['tagIelts', 'f3', 'var(--ielts)'], ['tagBoth', 'f7', 'var(--blue)'], ['tagBoth', 'f8', 'var(--blue)'], ['tagBoth', 'f9', 'var(--blue)'], ['tagAi', 'f10', 'var(--ai)'], ['tagBoth', 'f11', 'var(--blue)']]
    : [['tagSat', 'f4', 'var(--sat)'], ['tagSat', 'f5', 'var(--sat)'], ['tagSat', 'f6', 'var(--sat)'], ['tagBoth', 'f7', 'var(--blue)'], ['tagBoth', 'f8', 'var(--blue)'], ['tagBoth', 'f9', 'var(--blue)'], ['tagBoth', 'f11', 'var(--blue)']];
  const faq = ([1, 2, 3, 4] as const).map((i) => ({ q: t(`${exam}.faq.q${i}`), a: t(`${exam}.faq.a${i}`) }));

  return (
    <>
      <div className="m-desk">
        <section style={sx('max-width:1280px;margin:0 auto;padding:clamp(36px,6vw,80px) 20px clamp(32px,4vw,56px);display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,480px),1fr));gap:clamp(40px,5vw,64px);align-items:center')}>
          <div style={sx('display:flex;flex-direction:column;gap:22px;min-width:0')}>
            <span className="m-eyebrow" style={{ ...sx('font-size:13px'), color: `var(--${exam})` }} lang="en">{t(`${exam}.eyebrow`)}</span>
            <h1 className="m-hero-h1 m-hyph" style={sx('font-size:clamp(32px,4vw,52px)')}>{t(`${exam}.h1`)}</h1>
            <p style={sx('margin:0;font-size:clamp(16px,1.4vw,19px);line-height:var(--lh-body);color:var(--ink2);max-width:560px')}>{t(`${exam}.sub`)}</p>
            <span style={sx('font-size:15px;color:var(--ink2)')}>{t.rich('common.fullMockPrice', { b: (c) => <b style={sx('color:var(--ink);font-size:20px')}>{c}</b>, price: () => <Price exam={exam} kind="full" skelWidth={120} /> })}</span>
            <div style={sx('display:flex;gap:12px;flex-wrap:wrap')}>
              <Link className="m-btn m-btn--primary" href={h(`/start/${exam}?mode=full`)} style={sx('height:54px;padding:0 26px;font-weight:700;font-size:16px')}>{t('common.startFull')}</Link>
              <Link className="m-btn m-btn--soft" href={h(`/start/${exam}?mode=section`)} style={sx('height:54px;padding:0 24px;font-size:16px')}>{t('common.tryFree')}</Link>
            </div>
            <CatalogError text={t('common.priceLoadError')} retry={tl('pricing.retry')} />
            <div style={sx('display:flex;gap:8px 20px;flex-wrap:wrap;font-size:13px;color:var(--mut);font-weight:600')}>
              <span>{t('common.trust1')}</span><span>{t('common.trust2')}</span><span>{t('common.trust3')}</span>
            </div>
          </div>
          <div style={sx('min-width:0')} aria-hidden>{exam === 'ielts' ? <IeltsPreview /> : <SatPreview />}</div>
        </section>

        <section style={SEC}>
          <h2 className="m-h2" style={sx('margin:0 0 28px')}>{t('common.formatTitle')}</h2>
          <div className="m-card" style={sx('padding:clamp(16px,3vw,28px);overflow:auto')}>
            <table className="m-table" style={sx('min-width:520px')}>
              <thead><tr><th>{t('common.colSection')}</th><th>{t('common.colTime')}</th><th>{t('common.colQuestions')}</th></tr></thead>
              <tbody>
                {rows.map(([n, time, q]) => (
                  <tr key={n}><td>{t(`${f}.${n}`)}</td><td><bdi dir="ltr">{t(`${f}.${time}`)}</bdi></td><td>{q ? t(`${f}.${q}`) : '—'}</td></tr>
                ))}
                <tr><td>{t('common.scoreLabel')}</td><td colSpan={2}><bdi dir="ltr">{t(`${f}.score`)}</bdi></td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section style={SEC}>
          <h2 className="m-h2" style={sx('margin:0 0 32px')}>{t('common.includedTitle')}</h2>
          <div style={sx('display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr));gap:2px;border-radius:24px;overflow:hidden;box-shadow:var(--raise)')}>
            {features.map(([tag, key, color]) => (
              <div key={key} style={sx('padding:22px 24px;display:flex;flex-direction:column;gap:8px;background:var(--bg);outline:1px solid var(--line)')}>
                <span className="m-mono" style={{ ...sx('font-size:11px;font-weight:700;letter-spacing:.06em'), color }}>{tl(`get.${tag}`)}</span>
                <span style={sx('font-weight:700;font-size:15px;line-height:1.4')}>{tl(`get.${key}`)}</span>
              </div>
            ))}
          </div>
        </section>

        <section style={sx('max-width:880px;margin:0 auto;padding:clamp(40px,5vw,72px) 20px')}>
          <h2 className="m-h2" style={sx('margin:0 0 28px')}>{t('common.faqTitle')}</h2>
          <FaqDesktop items={faq} />
        </section>

        <section style={sx('max-width:1280px;margin:0 auto;padding:clamp(24px,4vw,48px) 20px')}>
          <div style={sx('border-radius:24px;box-shadow:var(--inset);padding:clamp(24px,4vw,40px);display:flex;justify-content:space-between;align-items:center;gap:24px;flex-wrap:wrap')}>
            <div style={sx('display:flex;flex-direction:column;gap:8px;max-width:640px')}>
              <span style={sx('font-size:clamp(20px,2.2vw,26px);font-weight:800;letter-spacing:var(--ls-t)')}>{t('common.ctaTitle')}</span>
              <span style={sx('color:var(--ink2);font-size:15px;line-height:var(--lh-body)')}>{t('common.ctaBody')}</span>
            </div>
            <Link className="m-btn m-btn--primary" href={h(`/start/${exam}?mode=section`)} style={sx('height:50px;font-size:16px;font-weight:700')}>{t('common.tryFree')}</Link>
          </div>
        </section>
      </div>

      {/* phone: app-style stack (Mobile App.dc.html patterns: inset facts, grouped rows, sticky CTA) */}
      <div className="m-phone" style={sx('padding:12px 16px 28px;display:flex;flex-direction:column;gap:24px')}>
        <div style={sx('display:flex;flex-direction:column;gap:12px')}>
          <span className="m-eyebrow" style={{ color: `var(--${exam})` }} lang="en">{t(`${exam}.eyebrow`)}</span>
          <h1 className="m-hyph" style={sx('margin:0;font-size:var(--hero-size-m);line-height:var(--lh-hero-m);letter-spacing:var(--ls-h);font-weight:800')}>{t(`${exam}.h1`)}</h1>
          <p style={sx('margin:0;font-size:15px;line-height:1.55;color:var(--ink2)')}>{t(`${exam}.sub`)}</p>
          <span style={sx('font-size:14px;color:var(--ink2);font-weight:600')}>{t.rich('common.fullMockPrice', { b: (c) => <b style={sx('color:var(--ink)')}>{c}</b>, price: () => <Price exam={exam} kind="full" skelWidth={90} /> })}</span>
          <CatalogError text={t('common.priceLoadError')} retry={tl('pricing.retry')} />
        </div>
        <div style={sx('display:flex;flex-direction:column;gap:12px')}>
          <div style={sx('font-size:20px;font-weight:800;letter-spacing:var(--ls-t)')}>{t('common.formatTitle')}</div>
          <div className="m-rows">
            {rows.map(([n, time, q]) => (
              <div key={n} style={sx('padding:14px 16px;display:flex;align-items:center;gap:12px')}>
                <span style={sx('flex:1;display:flex;flex-direction:column;gap:2px')}><b style={sx('font-size:15px')}>{t(`${f}.${n}`)}</b>{q && <span style={sx('font-size:12px;color:var(--mut);font-weight:600')}>{t(`${f}.${q}`)}</span>}</span>
                <b style={sx('font-size:13px;white-space:nowrap')}><bdi dir="ltr">{t(`${f}.${time}`)}</bdi></b>
              </div>
            ))}
            <div style={sx('padding:14px 16px;display:flex;align-items:center;gap:12px')}>
              <b style={sx('flex:1;font-size:15px')}>{t('common.scoreLabel')}</b><b style={sx('font-size:13px')}><bdi dir="ltr">{t(`${f}.score`)}</bdi></b>
            </div>
          </div>
        </div>
        <div style={sx('display:flex;flex-direction:column;gap:12px')}>
          <div style={sx('font-size:20px;font-weight:800;letter-spacing:var(--ls-t)')}>{t('common.includedTitle')}</div>
          <div className="m-rows">
            {features.map(([tag, key, color]) => (
              <div key={key} style={sx('padding:14px 16px;display:flex;align-items:center;gap:12px')}>
                <span className="m-mono" style={{ ...sx('width:44px;flex:none;font-size:10px;font-weight:800'), color }}>{tl(`get.${tag}`)}</span>
                <span style={sx('font-size:14px;font-weight:700;line-height:1.4')}>{tl(`get.${key}`)}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={sx('display:flex;flex-direction:column;gap:12px')}>
          <div style={sx('font-size:20px;font-weight:800;letter-spacing:var(--ls-t)')}>{t('common.faqTitle')}</div>
          <FaqPhone items={faq} />
        </div>
      </div>
    </>
  );
}
