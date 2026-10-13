import type { Metadata } from 'next';
// Serif for the sample question and review explanations, as in the player.
import '@fontsource/source-serif-4/latin-400.css';
import '@fontsource/source-serif-4/latin-600.css';
import { ExamsShell } from '@/components/exams-hub/exams-shell';

export const metadata: Metadata = { title: 'Eduvo — Mock imtihonlar', robots: { index: false, follow: false } };

/** Student hub (/exams/*) — its own light shell, not the dashboard nor the portal (_hub-design.md §1). */
export default function ExamsLayout({ children }: { children: React.ReactNode }) {
  return <ExamsShell>{children}</ExamsShell>;
}
