/**
 * Long-form policy page (README §12): H1, "Last updated", intro, a sticky table of contents
 * (≥1024 px; a collapsible card above the text on smaller screens) and numbered sections.
 * Server-rendered and static per locale; copy lives in messages/{lang}/legal.json.
 */
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { MockLocale } from '@/i18n/locales';
import { AppBar } from '@/components/mock-site/app-bar';
import { PageShell } from '@/components/mock-site/page-shell';
import { SiteFooter } from '@/components/mock-site/site-footer';
import { SiteHeader } from '@/components/mock-site/site-header';
import { fmtDateLong } from '@/lib/mock/format';
import { publicPageMeta } from '@/lib/mock/seo';
import { LEGAL_DOCS, LEGAL_UPDATED, type LegalDoc, type LegalSection } from '@/lib/mock/legal';
import { sx } from '@/lib/mock/sx';
import { RichLine } from './rich-line';

export async function LegalPage({ doc, lang }: { doc: LegalDoc; lang: MockLocale }) {
  const t = await getTranslations('legal');
  const sections = t.raw(`${doc}.sections`) as LegalSection[];
  const title = t(`${doc}.title`);
  return (
    <PageShell>
      <SiteHeader />
      <AppBar left="back" title={title} />
      <main className="m-main m-legal">
        <header className="m-legal__head">
          <h1 className="m-h1 m-legal__h1">{title}</h1>
          <div style={sx('font-size:13px;font-weight:700;color:var(--mut)')}>{t('updated', { date: fmtDateLong(lang, LEGAL_UPDATED) })}</div>
          <p className="m-lead">{t(`${doc}.intro`)}</p>
        </header>
        <div className="m-legal__grid">
          <details className="m-toc" open>
            <summary><span>{t('toc')}</span><span className="m-chev" aria-hidden /></summary>
            <nav aria-label={t('toc')}>
              <ol>{sections.map((s) => <li key={s.id}><a href={`#${s.id}`}>{s.h}</a></li>)}</ol>
            </nav>
          </details>
          <article className="m-prose">
            {sections.map((s) => (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`}>
                <h2 id={`${s.id}-h`}>{s.h}</h2>
                {s.body.map((b, i) => (Array.isArray(b)
                  ? <ul key={i}>{b.map((li, j) => <li key={j}><RichLine text={li} lang={lang} /></li>)}</ul>
                  : <p key={i}><RichLine text={b} lang={lang} /></p>))}
              </section>
            ))}
            <section style={sx('border-top:1px solid var(--line);padding-top:28px')} aria-label={t('other')}>
              <div style={sx('font-weight:800;font-size:12px;letter-spacing:.08em;text-transform:var(--tt-eyebrow);color:var(--mut)')}>{t('other')}</div>
              <div className="m-legal__more">
                {LEGAL_DOCS.filter((d) => d !== doc).map((d) => (
                  <Link key={d} className="m-btn m-btn--soft m-btn--sm" href={`/${lang}/${d}`}>{t(`${d}.title`)}</Link>
                ))}
              </div>
              <p><RichLine text={t('questions')} lang={lang} /></p>
            </section>
          </article>
        </div>
      </main>
      <SiteFooter />
    </PageShell>
  );
}

export async function legalMetadata(lang: MockLocale, doc: LegalDoc) {
  const t = await getTranslations({ locale: lang, namespace: 'legal.meta' });
  return publicPageMeta(lang, `/${doc}`, { title: t(`${doc}.title`), description: t(`${doc}.description`) });
}
