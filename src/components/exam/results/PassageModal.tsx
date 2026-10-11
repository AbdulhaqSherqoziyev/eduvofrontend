'use client';
/** "Show in passage" (C13): the paragraph with the answer, the evidence highlighted #FFF1C2. */
import { parsePassage, paraLabel } from '@/lib/exam/engine/selectors';
import { t, type Locale } from '@/lib/exam/i18n';
import type { ResultResp } from '@/lib/exam/types';

/** Contract v1.1 #16: "<part>/<pid>[:<start>-<end>]" — no range = whole paragraph. */
export function parseAnchor(a: string) {
  const m = a.match(/^(\d+)\/([^:]+)(?::(\d+)-(\d+))?$/);
  if (!m) return null;
  return { part: Number(m[1]), pid: m[2], start: m[3] ? Number(m[3]) : 0, end: m[4] ? Number(m[4]) : Number.POSITIVE_INFINITY };
}

export function PassageModal({ anchor, sectionKey, passages, locale, onClose }: { anchor: string; sectionKey: string; passages: ResultResp['passages']; locale: Locale; onClose: () => void }) {
  const a = parseAnchor(anchor);
  const pg = passages?.find((p) => p.sectionKey === sectionKey && p.part === a?.part);
  const paras = parsePassage(pg?.passageHtml ?? null);
  return (
    <div role="dialog" aria-modal="true" onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(30,42,58,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 680, maxHeight: '80vh', overflow: 'auto', background: '#fff', borderRadius: 20, padding: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 22, fontWeight: 600 }}>{pg?.title ?? t('results.show_in_passage', locale)}</div>
          <button type="button" autoFocus onClick={onClose} style={{ height: 36, padding: '0 14px', borderRadius: 10, border: '1.5px solid #E3E8EF', background: 'transparent', fontWeight: 700 }}>{t('chrome.close', locale)}</button>
        </div>
        <div style={{ fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 16, lineHeight: 1.75, color: '#26313F', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {paras.map((p) => {
            const hit = a && p.pid === a.pid && a.end > a.start;
            return (
              <p key={p.pid} ref={(el) => { if (hit && el) el.scrollIntoView({ block: 'center' }); }} style={{ margin: 0 }}>
                {paraLabel(p.pid) && <b style={{ marginRight: 6 }}>{paraLabel(p.pid)}</b>}
                {hit ? <>{p.text.slice(0, a!.start)}<mark style={{ background: '#FFF1C2', borderRadius: 2 }}>{p.text.slice(a!.start, Math.min(a!.end, p.text.length))}</mark>{p.text.slice(Math.min(a!.end, p.text.length))}</> : p.text}
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}
