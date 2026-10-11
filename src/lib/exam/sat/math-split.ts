/**
 * Split question text into plain runs and LaTeX runs (sat.md §7 KaTeX):
 * `$...$` inline, `$$...$$` display, `\(...\)` inline. A literal dollar is
 * written `\$` in the test bank (e.g. "\$12.50").
 */
export interface MathRun { text: string; math: boolean; display: boolean }

const RE = /\$\$([\s\S]+?)\$\$|\\\(([\s\S]+?)\\\)|(?<!\\)\$((?:\\\$|[^$\n])+?)\$/g;

export function splitMath(src: string): MathRun[] {
  const out: MathRun[] = [];
  let last = 0;
  const unescape = (t: string) => t.replace(/\\\$/g, '$');
  for (const m of src.matchAll(RE)) {
    const i = m.index ?? 0;
    if (i > last) out.push({ text: unescape(src.slice(last, i)), math: false, display: false });
    const display = m[1] != null;
    out.push({ text: (m[1] ?? m[2] ?? m[3] ?? '').trim(), math: true, display });
    last = i + m[0].length;
  }
  if (last < src.length) out.push({ text: unescape(src.slice(last)), math: false, display: false });
  return out;
}
