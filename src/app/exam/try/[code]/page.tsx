import type { Metadata } from 'next';
import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/latin-500.css';
import '@fontsource/manrope/latin-600.css';
import '@fontsource/manrope/latin-700.css';
import '@fontsource/manrope/latin-800.css';
import '@fontsource/source-serif-4/latin-400.css';
import '@fontsource/source-serif-4/latin-600.css';
import '../../exam-theme.css';
import { TryHost } from '@/components/exams-hub/try-host';

export const metadata: Metadata = { title: 'Eduvo — Interfeysni sinab ko\'ring', robots: { index: false, follow: false } };

/** /exam/try/[code] — 2-minute practice in the real player chrome, not scored, no attempt (design G5). */
export default function TryInterfacePage({ params }: { params: { code: string } }) {
  return <TryHost code={decodeURIComponent(params.code)} />;
}
