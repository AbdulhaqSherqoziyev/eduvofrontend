/**
 * Exam player layout — no dashboard/portal shell (desktop-only, own tokens).
 * Fonts are self-hosted (latin subsets) so nothing depends on a CDN mid-exam.
 * The service worker never handles /exam navigations (public/sw.js isAppShellPath).
 */
import type { Metadata } from 'next';
import '@fontsource/manrope/latin-400.css';
import '@fontsource/manrope/latin-500.css';
import '@fontsource/manrope/latin-600.css';
import '@fontsource/manrope/latin-700.css';
import '@fontsource/manrope/latin-800.css';
import '@fontsource/source-serif-4/latin-400.css';
import '@fontsource/source-serif-4/latin-600.css';
import '../exam-theme.css';

export const metadata: Metadata = { title: 'Eduvo — Mock exam', robots: { index: false, follow: false } };

export default function ExamLayout({ children }: { children: React.ReactNode }) {
  return children;
}
