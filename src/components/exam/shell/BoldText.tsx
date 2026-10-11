/**
 * Plain bank text with the one markdown mark explanations use: `**bold**`.
 * Pieces stay React text (nothing injected); an unpaired `**` is shown as-is.
 */
import { Fragment, type ReactNode } from 'react';

const BOLD = /\*\*(?=\S)([\s\S]*?\S)\*\*/g;

export function BoldText({ text }: { text: string }) {
  if (!text.includes('**')) return <>{text}</>;
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(BOLD)) {
    const i = m.index ?? 0;
    if (i > last) out.push(<Fragment key={last}>{text.slice(last, i)}</Fragment>);
    out.push(<strong key={`b${i}`}>{m[1]}</strong>);
    last = i + m[0].length;
  }
  if (last < text.length) out.push(<Fragment key={last}>{text.slice(last)}</Fragment>);
  return <>{out}</>;
}
