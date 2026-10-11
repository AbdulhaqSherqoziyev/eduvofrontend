'use client';
/**
 * Question text with KaTeX math (sat.md §7). Plain runs stay React text (no
 * HTML from the bank is ever injected); only KaTeX's own output is set as
 * HTML, rendered with `trust:false` so \href / \url / raw HTML are refused.
 */
import 'katex/dist/katex.min.css';
import katex from 'katex';
import { Fragment, useMemo } from 'react';
import { splitMath, type MathRun } from '@/lib/exam/sat/math-split';
import { BoldText } from '../shell/BoldText';

const cache = new Map<string, string>();

export function renderTex(tex: string, display = false): string {
  const k = `${display ? 'D' : 'I'}${tex}`;
  let html = cache.get(k);
  if (html == null) {
    html = katex.renderToString(tex, { displayMode: display, throwOnError: false, trust: false, strict: 'ignore', output: 'htmlAndMathml' });
    if (cache.size > 500) cache.clear();
    cache.set(k, html);
  }
  return html;
}

/**
 * `text\n$$…$$\nmore` in a pre-line container: the display block already
 * starts/ends its own line, so the newline next to it would add a blank line.
 */
function tidyDisplayBreaks(runs: MathRun[]): MathRun[] {
  return runs.map((r, i) => {
    if (r.math) return r;
    let t = r.text;
    if (runs[i + 1]?.display) t = t.replace(/[^\S\n]*\n[^\S\n]*$/, '');
    if (runs[i - 1]?.display) t = t.replace(/^[^\S\n]*\n/, '');
    return t === r.text ? r : { ...r, text: t };
  }).filter((r) => r.math || r.text !== '');
}

/** `bold`: also render `**bold**` in the plain runs (explanations only). */
export function MathText({ text, enabled = true, bold = false }: { text: string | null | undefined; enabled?: boolean; bold?: boolean }) {
  const runs = useMemo(() => (enabled && text ? tidyDisplayBreaks(splitMath(text)) : null), [text, enabled]);
  if (!text) return null;
  if (!runs) return bold ? <BoldText text={text} /> : <>{text}</>;
  return (
    <>
      {runs.map((r, i) => (r.math
        ? <span key={i} className={r.display ? 'x-math-block' : undefined} style={r.display ? { display: 'block', margin: '8px 0', overflowX: 'auto' } : undefined} dangerouslySetInnerHTML={{ __html: renderTex(r.text, r.display) }} />
        : <Fragment key={i}>{bold ? <BoldText text={r.text} /> : r.text}</Fragment>))}
    </>
  );
}

/** One TeX expression (Answer Preview, reference sheet). */
export function Tex({ tex, display }: { tex: string; display?: boolean }) {
  return <span dangerouslySetInnerHTML={{ __html: renderTex(tex, display) }} />;
}
