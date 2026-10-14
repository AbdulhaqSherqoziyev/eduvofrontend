/** /{lang}/exam/{attemptId} — the shared exam player inside the mock site (learner token host). */
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/latin-500.css';
import '@fontsource/manrope/latin-600.css';
import '@fontsource/manrope/latin-700.css';
import '@fontsource/manrope/latin-800.css';
// Russian instruction language (player strings ru column)
import '@fontsource/manrope/cyrillic-400.css';
import '@fontsource/manrope/cyrillic-500.css';
import '@fontsource/manrope/cyrillic-600.css';
import '@fontsource/manrope/cyrillic-700.css';
import '@fontsource/manrope/cyrillic-800.css';
import '@fontsource/source-serif-4/latin-400.css';
import '@fontsource/source-serif-4/latin-600.css';
import '@/app/(erp)/exam/exam-theme.css';
import { PageShell } from '@/components/mock-site/page-shell';
import { MockPlayer } from '@/components/mock-site/player/mock-player';
import { NOINDEX } from '@/lib/mock/seo';

export const metadata: Metadata = { title: 'Mock exam', ...NOINDEX };

export default function MockExamPage({ params: { lang, attemptId } }: { params: { lang: string; attemptId: string } }) {
  setRequestLocale(lang);
  return (
    <PageShell ns={['player']}>
      <MockPlayer attemptId={attemptId} />
    </PageShell>
  );
}
