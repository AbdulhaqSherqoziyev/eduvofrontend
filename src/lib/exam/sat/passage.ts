/**
 * SAT R&W passage (`question.content.passage`, contract §1b): a small HTML
 * subset — <p>, <em>/<i>, <strong>/<b>, <u>, <br>, <sup>/<sub>, <table>.
 * Parsed into text runs with marks (never injected as HTML), so underlined
 * portions survive ("the underlined sentence") and highlight offsets stay
 * plain character offsets inside one paragraph's text.
 *
 * Line breaks (poems, dialogues): <br> is always a break. A raw newline in the
 * text is a break too unless the passage uses <br> anywhere (then newlines are
 * just source formatting and collapse to a space, as in normal HTML).
 */
export interface Marks { u?: boolean; em?: boolean; strong?: boolean; sup?: boolean; sub?: boolean }
export interface Run { text: string; marks: Marks }
export type Block =
  | { kind: 'p'; pid: string; runs: Run[]; text: string }
  | { kind: 'table'; rows: { head: boolean; cells: Run[][] }[] };

const TAG_MARK: Record<string, keyof Marks> = { U: 'u', EM: 'em', I: 'em', STRONG: 'strong', B: 'strong', SUP: 'sup', SUB: 'sub' };

/** Whitespace of one text node: newlines kept as breaks (`keepNl`) or collapsed. */
function normWs(raw: string, keepNl: boolean): string {
  if (!keepNl) return raw.replace(/\s+/g, ' ');
  return raw.replace(/\r\n?/g, '\n').replace(/[^\S\n]+/g, ' ').replace(/ ?\n ?/g, '\n').replace(/\n{3,}/g, '\n\n');
}

function runsOf(node: Node, marks: Marks, out: Run[], keepNl = false) {
  node.childNodes.forEach((ch) => {
    if (ch.nodeType === Node.TEXT_NODE) {
      const text = normWs(ch.textContent ?? '', keepNl);
      if (text) out.push({ text, marks });
    } else if (ch instanceof Element) {
      if (ch.tagName === 'BR') { out.push({ text: '\n', marks }); return; }
      const m = TAG_MARK[ch.tagName];
      runsOf(ch, m ? { ...marks, [m]: true } : marks, out, keepNl);
    }
  });
}

/** Drop leading/trailing spaces and line breaks of a paragraph (across runs). */
function trimRuns(runs: Run[]): Run[] {
  const out = runs.filter((r) => r.text !== '');
  while (out.length) { const t = out[0].text.replace(/^\s+/, ''); if (t) { out[0] = { ...out[0], text: t }; break; } out.shift(); }
  while (out.length) { const l = out.length - 1; const t = out[l].text.replace(/\s+$/, ''); if (t) { out[l] = { ...out[l], text: t }; break; } out.pop(); }
  return out;
}

/** Raw newlines are line breaks unless the author marked breaks with <br>. */
const newlinesAreBreaks = (html: string) => !/<br\b/i.test(html);

export function parseSatPassage(html: string | null | undefined, keepNl = html ? newlinesAreBreaks(html) : false): Block[] {
  if (!html || typeof DOMParser === 'undefined') return [];
  const body = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html').body.firstElementChild!;
  const blocks: Block[] = [];
  let loose: Run[] = [];
  let n = 0;
  const pushP = (runs: Run[]) => {
    const r = trimRuns(runs);
    if (r.length) blocks.push({ kind: 'p', pid: `p${++n}`, runs: r, text: r.map((x) => x.text).join('') });
  };
  const flush = () => { if (loose.length) pushP(loose); loose = []; };
  body.childNodes.forEach((ch) => {
    if (ch instanceof Element && ch.tagName === 'P') { flush(); const r: Run[] = []; runsOf(ch, {}, r, keepNl); pushP(r); }
    else if (ch instanceof Element && ch.tagName === 'TABLE') {
      flush();
      const rows = Array.from(ch.querySelectorAll('tr')).map((tr) => {
        const cells = Array.from(tr.children).filter((c) => c.tagName === 'TD' || c.tagName === 'TH');
        return { head: cells.length > 0 && cells.every((c) => c.tagName === 'TH'), cells: cells.map((c) => { const r: Run[] = []; runsOf(c, {}, r); return trimRuns(r); }) };
      });
      blocks.push({ kind: 'table', rows });
    } else {
      const holder = document.createElement('span');
      holder.appendChild(ch.cloneNode(true));
      runsOf(holder, {}, loose, keepNl);
    }
  });
  flush();
  return blocks;
}

/**
 * Directions / section intro HTML (`sections[].intro`): the passage subset plus
 * <ul>/<ol> lists. Plain text (no tags) becomes one paragraph. Never injected.
 */
export type RichBlock = Block | { kind: 'list'; ordered: boolean; items: Run[][] };

export function parseRichHtml(html: string | null | undefined): RichBlock[] {
  if (!html || typeof DOMParser === 'undefined') return [];
  const body = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html').body.firstElementChild!;
  const out: RichBlock[] = [];
  const lists = Array.from(body.children).filter((el) => el.tagName === 'UL' || el.tagName === 'OL');
  const keepNl = newlinesAreBreaks(html);
  if (!lists.length) return parseSatPassage(html, keepNl);
  // split around each list: everything else goes through the passage parser
  const parts: { html: string; list?: Element }[] = [];
  let buf = '';
  body.childNodes.forEach((ch) => {
    if (ch instanceof Element && (ch.tagName === 'UL' || ch.tagName === 'OL')) { parts.push({ html: buf }); buf = ''; parts.push({ html: '', list: ch }); }
    else buf += ch instanceof Element ? ch.outerHTML : ch.textContent ?? '';
  });
  parts.push({ html: buf });
  for (const p of parts) {
    if (p.list) {
      const items = Array.from(p.list.children).filter((li) => li.tagName === 'LI').map((li) => { const r: Run[] = []; runsOf(li, {}, r); return trimRuns(r); }).filter((r) => r.length);
      if (items.length) out.push({ kind: 'list', ordered: p.list.tagName === 'OL', items });
    } else if (p.html.trim()) out.push(...parseSatPassage(p.html, keepNl));
  }
  return out;
}

/** Cut a paragraph's runs at the given character offsets (highlight edges). */
export function cutRuns(runs: Run[], cuts: number[]): { start: number; end: number; run: Run }[] {
  const out: { start: number; end: number; run: Run }[] = [];
  let pos = 0;
  for (const run of runs) {
    const end = pos + run.text.length;
    const inner = cuts.filter((c) => c > pos && c < end).sort((a, b) => a - b);
    let a = pos;
    for (const c of [...inner, end]) { if (c > a) out.push({ start: a, end: c, run: { text: run.text.slice(a - pos, c - pos), marks: run.marks } }); a = c; }
    pos = end;
  }
  return out;
}
