/**
 * /how-it-works — not drawn in the design (README nav item points at Landing#how). Built from the
 * landing's own sections: the 4 steps, a scoring explainer card row, What you get and the FAQ.
 */
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { MockLocale } from '@/i18n/locales';
import { AppBar } from '@/components/mock-site/app-bar';
import { FaqDesktop, FaqPhone } from '@/components/mock-site/landing/faq';
import { PageShell } from '@/components/mock-site/page-shell';
import { SiteFooter } from '@/components/mock-site/site-footer';
import { SiteHeader } from '@/components/mock-site/site-header';
import { StickyCta } from '@/components/mock-site/sticky-cta';
import { publicPageMeta } from '@/lib/mock/seo';
import { sx } from '@/lib/mock/sx';

export async function generateMetadata({ params: { lang } }: { params: { lang: MockLocale } }): Promise<Metadata> {
  const t = await getTranslations({ locale: lang, namespace: 'exams.how.meta' });
  return publicPageMeta(lang, '/how-it-works', { title: t('title'), description: t('description') });
}

const SEC = sx('max-width:1280px;margin:0 auto;padding:clamp(40px,5vw,72px) 20px');

export default async function HowItWorksPage({ params: { lang } }: { params: { lang: MockLocale } }) {
  setRequestLocale(lang);
  const t = await getTranslations('exams.how');
  const tl = await getTranslations('landing');
  const tn = await getTranslations('common.nav');
  const steps = (['s1', 's2', 's3', 's4'] as const);
  const scoring = ([['l', 'lText', 'var(--ielts)'], ['w', 'wText', 'var(--ai)'], ['s', 'sText', 'var(--sat)']] as const);
  const features: Array<[string, string, string]> = [
    ['tagIelts', 'f1', 'var(--ielts)'], ['tagIelts', 'f2', 'var(--ielts)'], ['tagIelts', 'f3', 'var(--ielts)'],
    ['tagSat', 'f4', 'var(--sat)'], ['tagSat', 'f5', 'var(--sat)'], ['tagSat', 'f6', 'var(--sat)'],
    ['tagBoth', 'f7', 'var(--blue)'], ['tagBoth', 'f8', 'var(--blue)'], ['tagBoth', 'f9', 'var(--blue)'],
    ['tagAi', 'f10', 'var(--ai)'], ['tagBoth', 'f11', 'var(--blue)'],
  ];
  const faq = ([1, 2, 3, 4, 5, 6] as const).map((i) => ({ q: tl(`faq.q${i}`), a: tl(`faq.a${i}`) }));
  return (
    <PageShell ns={['landing']}>
      <SiteHeader active="how" />
      <AppBar left="back" title={tn('how')} />
      <main className="m-main m-with-cta-phone">
        <div className="m-desk">
          <section style={sx('max-width:1280px;margin:0 auto;padding:clamp(36px,6vw,80px) 20px 0;display:flex;flex-direction:column;gap:14px;max-width:1280px')}>
            <h1 className="m-hero-h1" style={sx('font-size:clamp(32px,4vw,52px)')}>{t('h1')}</h1>
            <p className="m-lead" style={sx('max-width:640px')}>{t('sub')}</p>
          </section>
          <section style={SEC}>
            <div style={sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:20px')}>
              {steps.map((s, i) => (
                <div key={s} className="m-card" style={sx('display:flex;flex-direction:column;gap:12px;padding:24px')}>
                  <span style={sx('width:40px;height:40px;border-radius:12px;box-shadow:var(--inset);display:grid;place-items:center;font-weight:800;color:var(--blue)')}>{i + 1}</span>
                  <div style={sx('font-weight:800;font-size:18px')}>{tl(`how.${s}.title`)}</div>
                  <div style={sx('color:var(--ink2);font-size:14px;line-height:var(--lh-body)')}>{tl(`how.${s}.text`)}</div>
                </div>
              ))}
            </div>
          </section>
          <section style={SEC}>
            <h2 className="m-h2" style={sx('margin:0 0 32px')}>{t('scoringTitle')}</h2>
            <div style={sx('display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:24px')}>
              {scoring.map(([k, text, color]) => (
                <div key={k} className="m-card" style={sx('padding:28px;display:flex;flex-direction:column;gap:12px')}>
                  <span className="m-eyebrow" style={{ ...sx('font-size:13px'), color }}>{t(`scoring.${k}`)}</span>
                  <span style={sx('color:var(--ink2);font-size:15px;line-height:var(--lh-body)')}>{t(`scoring.${text}`)}</span>
                </div>
              ))}
            </div>
          </section>
          <section style={SEC}>
            <h2 className="m-h2" style={sx('margin:0 0 32px')}>{tl('get.title')}</h2>
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
            <h2 className="m-h2" style={sx('margin:0 0 28px')}>{tl('faq.title')}</h2>
            <FaqDesktop items={faq} />
          </section>
        </div>

        <div className="m-phone" style={sx('padding:12px 16px 28px;display:flex;flex-direction:column;gap:24px')}>
          <div style={sx('display:flex;flex-direction:column;gap:10px')}>
            <h1 style={sx('margin:0;font-size:30px;font-weight:800;letter-spacing:var(--ls-h)')}>{t('h1')}</h1>
            <p style={sx('margin:0;font-size:15px;line-height:1.55;color:var(--ink2)')}>{t('sub')}</p>
          </div>
          <div style={sx('display:flex;flex-direction:column')}>
            {steps.map((s, i) => (
              <div key={s} style={sx('display:grid;grid-template-columns:36px minmax(0,1fr);gap:14px')}>
                <div style={sx('display:flex;flex-direction:column;align-items:center')}>
                  <span style={sx('width:36px;height:36px;border-radius:12px;box-shadow:var(--raise-sm);display:grid;place-items:center;font-weight:800;color:var(--blue);flex:none')}>{i + 1}</span>
                  <span style={{ ...sx('flex:1;width:2px;background:var(--line);margin:4px 0'), opacity: i === 3 ? 0 : 1 }} />
                </div>
                <div style={sx('padding:6px 0 20px;display:flex;flex-direction:column;gap:4px')}>
                  <b style={sx('font-size:16px')}>{tl(`how.${s}.title`)}</b>
                  <span style={sx('font-size:14px;color:var(--ink2);line-height:1.5')}>{tl(`how.${s}.text`)}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={sx('display:flex;flex-direction:column;gap:12px')}>
            <div style={sx('font-size:20px;font-weight:800;letter-spacing:var(--ls-t)')}>{t('scoringTitle')}</div>
            <div className="m-rows">
              {scoring.map(([k, text, color]) => (
                <div key={k} style={sx('padding:14px 16px;display:flex;flex-direction:column;gap:4px')}>
                  <b style={{ ...sx('font-size:14px'), color }}>{t(`scoring.${k}`)}</b>
                  <span style={sx('font-size:14px;line-height:1.5;color:var(--ink2)')}>{t(`scoring.${text}`)}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={sx('display:flex;flex-direction:column;gap:12px')}>
            <div style={sx('font-size:20px;font-weight:800;letter-spacing:var(--ls-t)')}>{tl('faq.title')}</div>
            <FaqPhone items={faq} />
          </div>
        </div>
      </main>
      <SiteFooter />
      <StickyCta primary={{ label: tl('phone.startFree'), href: `/${lang}/signup?next=free` }} secondary={{ label: tl('phone.sample'), href: `/${lang}/sample-result` }} />
    </PageShell>
  );
}
