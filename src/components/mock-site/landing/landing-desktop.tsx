/** Landing ≥520px — Landing.dc.html section by section. Prices come from the catalog (C1). */
import { getLocale, getTranslations } from 'next-intl/server';
import { dirOf, htmlLang, type MockLocale } from '@/i18n/locales';
import { sx } from '@/lib/mock/sx';
import { CatalogError } from '../catalog-error';
import { Price } from '../price';
import { FaqDesktop } from './faq';
import { WaitlistForm } from './waitlist';

const SEC = sx('max-width:1280px;margin:0 auto;padding:clamp(40px,5vw,72px) 20px');
const CARD = 'm-card';
const FACT = sx('display:flex;flex-direction:column;gap:2px');
const FACT_V = sx('font-size:18px;color:var(--ink);font-weight:800');
const QBTN = sx('padding:6px 10px;border-radius:9px;box-shadow:var(--raise-sm);font-weight:700');
const PAL = sx('width:22px;height:22px;border-radius:6px;box-shadow:var(--inset);font-size:10px;font-weight:800;display:grid;place-items:center');

export async function LandingDesktop() {
  const t = await getTranslations('landing');
  const tc = await getTranslations('common');
  const lang = await getLocale();
  const h = (p: string) => `/${lang}${p}`;
  const features: Array<[string, string, string]> = [
    ['tagIelts', 'f1', 'var(--ielts)'], ['tagIelts', 'f2', 'var(--ielts)'], ['tagIelts', 'f3', 'var(--ielts)'],
    ['tagSat', 'f4', 'var(--sat)'], ['tagSat', 'f5', 'var(--sat)'], ['tagSat', 'f6', 'var(--sat)'],
    ['tagBoth', 'f7', 'var(--blue)'], ['tagBoth', 'f8', 'var(--blue)'], ['tagBoth', 'f9', 'var(--blue)'],
    ['tagAi', 'f10', 'var(--ai)'], ['tagBoth', 'f11', 'var(--blue)'],
  ];
  const acc: Array<[string, number]> = [['t1', 88], ['t2', 80], ['t3', 70], ['t4', 62], ['t5', 50]];

  return (
    <div className="m-desk">
      {/* ---------- hero ---------- */}
      <section style={sx('max-width:1280px;margin:0 auto;padding:clamp(36px,6vw,80px) 20px clamp(48px,6vw,88px);display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,480px),1fr));gap:clamp(40px,5vw,64px);align-items:center')}>
        <div style={sx('display:flex;flex-direction:column;gap:24px;min-width:0')}>
          <div style={sx('display:flex;gap:8px;flex-wrap:wrap')}>
            <span className="m-chip" style={sx('color:var(--ielts)')} lang="en">IELTS Academic</span>
            <span className="m-chip" style={sx('color:var(--sat)')} lang="en">Digital SAT</span>
          </div>
          <h1 className="m-hero-h1 m-hyph">{t('hero.h1')}</h1>
          <p style={sx('margin:0;font-size:clamp(16px,1.4vw,19px);line-height:var(--lh-body);color:var(--ink2);max-width:560px;text-wrap:pretty')}>{t('hero.sub')}</p>
          <div style={sx('display:flex;gap:12px;flex-wrap:wrap')}>
            <a className="m-btn m-btn--primary" href={h('/signup?next=free')} style={sx('height:54px;padding:0 26px;font-weight:700;font-size:16px;box-shadow:0 10px 22px -8px rgba(46,107,230,.7)')}>{t('hero.cta1')}</a>
            <a className="m-btn m-btn--soft" href={h('/sample-result')} style={sx('height:54px;padding:0 24px;font-size:16px')}>{t('hero.cta2')}</a>
          </div>
          <div style={sx('display:flex;gap:8px 20px;flex-wrap:wrap;font-size:13px;color:var(--mut);font-weight:600')}>
            <span>{t('hero.trust1')}</span><span>{t('hero.trust2')}</span><span>{t('hero.trust3')}</span>
          </div>
        </div>

        {/* decorative mini player: always LTR (exam UI); the result card stays physically right (addendum §2) */}
        <div className="m-visual" dir="ltr" aria-hidden style={sx('position:relative;padding-bottom:72px;min-width:0')}>
          <div lang="en" style={sx('border-radius:24px;box-shadow:var(--raise);background:var(--bg);overflow:hidden')}>
            <div style={sx('display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid var(--line);font-size:12px;font-weight:700')}>
              <span style={sx('width:22px;height:22px;border-radius:7px;background:var(--grad);color:#fff;display:grid;place-items:center;font-size:12px')}>e</span>
              <span style={sx('color:var(--ink2)')}>IELTS Academic · Reading</span>
              <span style={sx('margin-inline-start:auto;padding:5px 10px;border-radius:9px;box-shadow:var(--inset);font-variant-numeric:tabular-nums')}>42:18</span>
            </div>
            <div style={sx('display:grid;grid-template-columns:1.15fr 1fr;min-height:280px')}>
              <div className="m-serif" style={sx('padding:18px 20px;border-inline-end:1px solid var(--line);font-size:13px;line-height:1.65;color:var(--ink)')}>
                <div style={sx('font-weight:600;font-size:15px;margin-bottom:8px')}>The Return of the Urban Orchard</div>
                <p style={sx('margin:0 0 8px')}>Across northern Europe, city councils have begun planting fruit trees in public parks, <span className="m-hl">a practice largely abandoned in the 1960s</span> when maintenance costs rose.</p>
                <p style={sx('margin:0;color:var(--ink2)')}>Early results suggest the orchards attract volunteers who would not otherwise take part in neighbourhood projects, and that fruit loss to vandalism is lower than planners expected.</p>
              </div>
              <div style={sx('padding:18px 18px;display:flex;flex-direction:column;gap:10px;font-size:12px')}>
                <div style={sx('font-weight:800;color:var(--ink2)')}>Questions 1–4</div>
                <div style={sx('font-weight:600;line-height:1.45')}>1. Urban orchards were common before the 1960s.</div>
                <div style={sx('display:flex;gap:6px;flex-wrap:wrap')}>
                  <span style={sx('padding:6px 10px;border-radius:9px;background:var(--blue);color:#fff;font-weight:700')}>TRUE</span>
                  <span style={QBTN}>FALSE</span><span style={QBTN}>NOT GIVEN</span>
                </div>
                <div style={sx('font-weight:600;line-height:1.45;margin-top:6px')}>2. Volunteers in the projects were mostly retired.</div>
                <div style={sx('display:flex;gap:6px;flex-wrap:wrap')}>
                  <span style={QBTN}>TRUE</span><span style={QBTN}>FALSE</span><span style={QBTN}>NOT GIVEN</span>
                </div>
              </div>
            </div>
            <div style={sx('display:flex;gap:5px;padding:10px 16px;border-top:1px solid var(--line);flex-wrap:wrap')}>
              <span style={sx('width:22px;height:22px;border-radius:6px;background:var(--blue);color:#fff;font-size:10px;font-weight:800;display:grid;place-items:center')}>1</span>
              <span style={PAL}>2</span>
              <span style={{ ...PAL, ...sx('outline:2px solid var(--warn);outline-offset:-2px') }}>3</span>
              <span style={PAL}>4</span><span style={PAL}>5</span><span style={PAL}>6</span>
            </div>
          </div>
          <div dir={dirOf(lang)} lang={htmlLang(lang as MockLocale)} style={sx('position:absolute;right:-8px;bottom:0;width:min(280px,72%);border-radius:24px;background:var(--bg);box-shadow:var(--raise);padding:18px 20px;display:flex;flex-direction:column;gap:12px')}>
            <div style={sx('display:flex;justify-content:space-between;align-items:center;font-size:12px;font-weight:700;color:var(--mut)')}>
              <span>{t('visual.overall')}</span><span style={sx('padding:4px 9px;border-radius:999px;background:var(--okBg);color:var(--ok)')}>CEFR B2</span>
            </div>
            <div style={sx('font-size:52px;font-weight:800;letter-spacing:var(--ls-score);line-height:1')}><bdi dir="ltr">6.5</bdi></div>
            <div dir="ltr" style={sx('display:grid;grid-template-columns:repeat(3,1fr);gap:8px;font-size:11px;font-weight:700;color:var(--ink2)')}>
              <div style={FACT}><span>{t('visual.listening')}</span><span style={sx('font-size:17px;color:var(--ink)')}>7.0</span></div>
              <div style={FACT}><span>{t('visual.reading')}</span><span style={sx('font-size:17px;color:var(--ink)')}>6.5</span></div>
              <div style={FACT}><span style={sx('display:flex;gap:4px;align-items:center')}>{t('visual.writing')} <span className="m-ai">{tc('chips.ai')}</span></span><span style={sx('font-size:17px;color:var(--ink)')}>6.0</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- exams ---------- */}
      <section id="exams" style={SEC}>
        <div style={sx('display:flex;flex-direction:column;gap:10px;margin-bottom:32px;max-width:640px')}>
          <h2 className="m-h2">{t('exams.title')}</h2>
          <p className="m-lead">{t('exams.sub')}</p>
        </div>
        <div style={sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:24px')}>
          {(['ielts', 'sat'] as const).map((ex) => {
            const f = ex === 'ielts' ? 'exams.ieltsFacts' : 'exams.satFacts';
            return (
              <div key={ex} className={CARD} style={sx('padding:28px;display:flex;flex-direction:column;gap:18px')}>
                <div style={sx('display:flex;justify-content:space-between;align-items:center;gap:8px')}>
                  <span className="m-eyebrow" style={{ ...sx('font-size:13px;letter-spacing:var(--ls-eyebrow-sm)'), color: `var(--${ex})` }} lang="en">{ex === 'ielts' ? 'IELTS ACADEMIC' : 'DIGITAL SAT'}</span>
                  <span className="m-pill m-pill--ok" style={sx('font-weight:700')}>{t('exams.freeSection')}</span>
                </div>
                <div style={sx('font-size:24px;font-weight:800;letter-spacing:var(--ls-t)')}>{t(ex === 'ielts' ? 'exams.ieltsName' : 'exams.satName')}</div>
                <div style={sx('display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:14px;border-radius:16px;box-shadow:var(--inset);font-size:12px;color:var(--ink2);font-weight:600')}>
                  {(['a', 'b', 'c'] as const).map((k) => (
                    <div key={k} style={FACT}><span style={FACT_V}><bdi dir="ltr">{t(`${f}.${k}`)}</bdi></span>{t(`${f}.${k}Label`)}</div>
                  ))}
                </div>
                <div style={sx('display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:auto;flex-wrap:wrap')}>
                  <span style={sx('font-size:14px;color:var(--ink2)')}>{t('exams.fullMock')} <b style={sx('color:var(--ink);font-size:18px')}><Price exam={ex} kind="examFull" /></b></span>
                  <a className="m-btn m-btn--soft" href={h(`/${ex}`)} style={sx('height:46px;padding:0 18px;border-radius:13px;font-size:14px')}>{t(ex === 'ielts' ? 'exams.viewIelts' : 'exams.viewSat')}</a>
                </div>
              </div>
            );
          })}
        </div>
        <div style={sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:20px;margin-top:24px')}>
          {([['cefr', 'CEFR', 'cefrDesc'], ['toefl', 'TOEFL iBT', 'toeflDesc'], ['hsk', 'HSK', 'hskDesc']] as const).map(([k, name, desc]) => (
            <div key={k} style={sx('border-radius:24px;padding:22px 24px;box-shadow:var(--inset);display:flex;flex-direction:column;gap:14px')}>
              <div style={sx('display:flex;justify-content:space-between;align-items:center;gap:8px')}>
                <span style={{ ...sx('font-size:13px;font-weight:800;letter-spacing:var(--ls-eyebrow-sm)'), color: `var(--${k})` }} lang="en">{name}</span>
                <span className="m-pill m-pill--warn" style={sx('font-weight:700')}>{t('exams.comingSoon')}</span>
              </div>
              <div style={sx('font-size:14px;color:var(--ink2);line-height:1.5')}>{t(`exams.${desc}`)}</div>
              <WaitlistForm exam={k} />
            </div>
          ))}
        </div>
      </section>

      {/* ---------- how it works ---------- */}
      <section id="how" style={SEC}>
        <h2 className="m-h2" style={sx('margin:0 0 32px')}>{t('how.title')}</h2>
        <div style={sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:20px')}>
          {(['s1', 's2', 's3', 's4'] as const).map((s, i) => (
            <div key={s} className={CARD} style={sx('display:flex;flex-direction:column;gap:12px;padding:24px')}>
              <span style={sx('width:40px;height:40px;border-radius:12px;box-shadow:var(--inset);display:grid;place-items:center;font-weight:800;color:var(--blue)')}>{i + 1}</span>
              <div style={sx('font-weight:800;font-size:18px')}>{t(`how.${s}.title`)}</div>
              <div style={sx('color:var(--ink2);font-size:14px;line-height:var(--lh-body)')}>{t(`how.${s}.text`)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- what you get ---------- */}
      <section style={SEC}>
        <h2 className="m-h2" style={sx('margin:0 0 32px')}>{t('get.title')}</h2>
        <div style={sx('display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr));gap:2px;border-radius:24px;overflow:hidden;box-shadow:var(--raise)')}>
          {features.map(([tag, key, color]) => (
            <div key={key} style={sx('padding:22px 24px;display:flex;flex-direction:column;gap:8px;background:var(--bg);outline:1px solid var(--line)')}>
              <span className="m-mono" style={{ ...sx('font-size:11px;font-weight:700;letter-spacing:.06em'), color }}>{t(`get.${tag}`)}</span>
              <span style={sx('font-weight:700;font-size:15px;line-height:1.4')}>{t(`get.${key}`)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- sample result ---------- */}
      <section style={SEC}>
        <div style={sx('display:flex;justify-content:space-between;align-items:end;gap:16px;flex-wrap:wrap;margin-bottom:28px')}>
          <div style={sx('display:flex;flex-direction:column;gap:10px;max-width:620px')}>
            <h2 className="m-h2">{t('sample.title')}</h2>
            <p className="m-lead">{t('sample.sub')}</p>
          </div>
          <a href={h('/sample-result')} style={sx('font-weight:700;font-size:15px')}>{t('sample.open')}</a>
        </div>
        <div style={sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:24px')}>
          <div className={CARD} style={sx('padding:28px;display:flex;flex-direction:column;gap:20px')}>
            <div style={sx('display:flex;justify-content:space-between;align-items:start;gap:12px')}>
              <div style={sx('display:flex;flex-direction:column;gap:6px')}>
                <span style={sx('font-size:13px;font-weight:700;color:var(--mut)')}>{t('sample.overallLabel')}</span>
                <span style={sx('font-size:72px;font-weight:800;letter-spacing:var(--ls-score-xl);line-height:1')}><bdi dir="ltr">6.5</bdi></span>
              </div>
              <span className="m-pill m-pill--ok" style={sx('padding:6px 12px;font-size:13px')}>CEFR B2</span>
            </div>
            <div style={sx('display:grid;grid-template-columns:repeat(3,1fr);gap:10px')}>
              {([['visual.listening', '7.0', 32], ['visual.reading', '6.5', 28]] as const).map(([k, v, n]) => (
                <div key={k} style={sx('padding:14px;border-radius:16px;box-shadow:var(--inset);display:flex;flex-direction:column;gap:4px')}>
                  <span style={sx('font-size:12px;font-weight:700;color:var(--ink2)')}>{t(k)}</span>
                  <span style={sx('font-size:24px;font-weight:800')}><bdi dir="ltr">{v}</bdi></span>
                  <span style={sx('font-size:11px;color:var(--mut)')}>{t('sample.correct', { n, total: 40 })}</span>
                </div>
              ))}
              <div style={sx('padding:14px;border-radius:16px;box-shadow:var(--inset);display:flex;flex-direction:column;gap:4px')}>
                <span style={sx('font-size:12px;font-weight:700;color:var(--ink2);display:flex;gap:4px;align-items:center')}>{t('visual.writing')}<span className="m-ai" style={sx('font-size:10px')}>{tc('chips.ai')}</span></span>
                <span style={sx('font-size:24px;font-weight:800')}><bdi dir="ltr">6.0</bdi></span>
                <span style={sx('font-size:11px;color:var(--mut)')}>{t('sample.tasks', { n: 2 })}</span>
              </div>
            </div>
          </div>
          <div className={CARD} style={sx('padding:28px;display:flex;flex-direction:column;gap:14px')}>
            <div style={sx('font-weight:800;font-size:16px')}>{t('sample.accTitle')}</div>
            {acc.map(([k, p]) => (
              <div key={k} style={sx('display:grid;grid-template-columns:minmax(0,1fr) 44px;gap:6px 12px;align-items:center')}>
                <span style={sx('font-size:13px;font-weight:600;color:var(--ink2)')}>{t(`sample.${k}`)}</span>
                <span style={sx('font-size:13px;font-weight:800;text-align:end')}><bdi dir="ltr">{p}%</bdi></span>
                <div className="m-bar" style={sx('grid-column:1 / -1')}><span className={p < 65 ? 'is-low' : ''} style={{ width: `${p}%`, ...(p < 65 ? {} : { background: 'var(--blue)' }) }} /></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- pricing teaser ---------- */}
      <section style={SEC}>
        <div style={sx('display:flex;justify-content:space-between;align-items:end;gap:16px;flex-wrap:wrap;margin-bottom:28px')}>
          <h2 className="m-h2">{t('pricing.title')}</h2>
          <a href={h('/pricing')} style={sx('font-weight:700;font-size:15px')}>{t('pricing.compare')}</a>
        </div>
        <div style={sx('margin-bottom:16px')}><CatalogError text={t('pricing.loadError')} retry={t('pricing.retry')} /></div>
        <div style={sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:24px')}>
          <div className={CARD} style={sx('padding:28px;display:flex;flex-direction:column;gap:10px')}>
            <span style={sx('font-weight:700;color:var(--ink2)')}>{t('pricing.section')}</span>
            <span style={sx('font-size:32px;font-weight:800;letter-spacing:var(--ls-h)')}><Price exam="ielts" kind="section" splitUnit unitStyle={sx('font-size:16px')} skelWidth={150} /></span>
            <span style={sx('font-size:14px;color:var(--mut)')}>{t('pricing.sectionNote')}</span>
          </div>
          <div className={CARD} style={sx('padding:28px;display:flex;flex-direction:column;gap:10px;outline:2px solid var(--blue);outline-offset:-2px')}>
            <span style={sx('font-weight:700;color:var(--blue)')}>{t('pricing.full')}</span>
            <span style={sx('font-size:32px;font-weight:800;letter-spacing:var(--ls-h)')}><Price exam="ielts" kind="full" splitUnit unitStyle={sx('font-size:16px')} skelWidth={150} /></span>
            <span style={sx('font-size:14px;color:var(--mut)')}>{t('pricing.fullNote')}</span>
          </div>
          <div className={CARD} style={sx('padding:28px;display:flex;flex-direction:column;gap:10px')}>
            <span style={sx('font-weight:700;color:var(--ink2)')}>{t('pricing.bundle', { n: 5 })}</span>
            <span style={sx('font-size:32px;font-weight:800;letter-spacing:var(--ls-h)')}><Price exam="ielts" kind="bundle" qty={5} splitUnit unitStyle={sx('font-size:16px')} skelWidth={170} /></span>
            <span style={sx('font-size:14px;color:var(--mut)')}>{t.rich('pricing.bundleNote', { per: () => <Price exam="ielts" kind="bundle" qty={5} field="perMock" skelWidth={80} />, months: 12 })}</span>
          </div>
        </div>
      </section>

      {/* ---------- testimonials (placeholders until real quotes are supplied — README "Assets") ---------- */}
      <section style={SEC}>
        <h2 className="m-h2" style={sx('margin:0 0 28px')}>{t('quotes.title')}</h2>
        <div style={sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:24px')}>
          {(['m1', 'm2', 'm3'] as const).map((m) => (
            <div key={m} className={CARD} style={sx('padding:24px;display:flex;flex-direction:column;gap:16px')}>
              <div className="m-mono" style={sx('height:96px;border-radius:16px;background:repeating-linear-gradient(135deg,var(--hover) 0 8px,transparent 8px 16px);display:grid;place-items:center;font-size:11px;color:var(--mut)')}>{t('quotes.placeholder')}</div>
              <div style={sx('display:flex;gap:12px;align-items:center')}>
                <span style={sx('width:40px;height:40px;border-radius:50%;background:repeating-linear-gradient(135deg,var(--hover) 0 4px,transparent 4px 8px);box-shadow:var(--inset);flex:none')} />
                <div style={sx('display:flex;flex-direction:column;gap:2px;font-size:13px')}><span style={sx('font-weight:700')}>{t('quotes.name')}</span><span style={sx('color:var(--mut)')}>{t(`quotes.${m}`)}</span></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section style={sx('max-width:880px;margin:0 auto;padding:clamp(40px,5vw,72px) 20px')}>
        <h2 className="m-h2" style={sx('margin:0 0 28px')}>{t('faq.title')}</h2>
        <FaqDesktop items={([1, 2, 3, 4, 5, 6] as const).map((i) => ({ q: t(`faq.q${i}`), a: t(`faq.a${i}`) }))} />
      </section>

      {/* ---------- for centers ---------- */}
      <section id="centers" style={sx('max-width:1280px;margin:0 auto;padding:clamp(24px,4vw,48px) 20px')}>
        <div style={sx('border-radius:24px;box-shadow:var(--inset);padding:clamp(24px,4vw,40px);display:flex;justify-content:space-between;align-items:center;gap:24px;flex-wrap:wrap')}>
          <div style={sx('display:flex;flex-direction:column;gap:8px;max-width:640px')}>
            <span className="m-eyebrow" style={sx('font-size:13px;color:var(--blue)')}>{t('centers.eyebrow')}</span>
            <span style={sx('font-size:clamp(20px,2.2vw,26px);font-weight:800;letter-spacing:var(--ls-t);line-height:var(--lh-h)')}>{t('centers.title')}</span>
            <span style={sx('color:var(--ink2);font-size:15px;line-height:var(--lh-body)')}>{t('centers.body')}</span>
          </div>
          <a className="m-btn m-btn--soft" href="https://eduvo.uz" style={sx('height:50px;border-radius:14px;font-size:16px')}>{t('centers.cta')}</a>
        </div>
      </section>
    </div>
  );
}
