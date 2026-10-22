'use client';
/**
 * "Javoblaringiz" (spec §2.2 M13): accordion per part (48px rows, all closed by default — no
 * auto-play), then per question: text (13.5/700, `lang=en`), AudioClip, "Matnni ko'rsatish" and the
 * serif transcript. No answer → italic `results.no_answer`. Deleted / expired audio → a note, the
 * transcript stays. A quote's play opens the part, scrolls to the clip and plays it.
 */
import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { retentionPeriod, type SpeakingResultItem } from '@/lib/exam/speaking-types';
import { AudioClip } from './AudioClip';
import { useSpeaking } from './context';
import { caps, serif } from './skin';

function Item({ it, open: forceOpen }: { it: SpeakingResultItem; open: boolean }) {
  const { skin: s, tx, sp, playing, noAudioNote, mode } = useSpeaking();
  const [show, setShow] = useState(false);
  const row = useRef<HTMLDivElement>(null);
  const nonce = playing?.itemKey === it.itemKey ? playing.nonce : 0;
  useEffect(() => { if (nonce && forceOpen) row.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, [nonce, forceOpen]);
  const gone = it.recordingDeleted || (!it.recording && !!sp.recordingsDeletedAt);
  const goneNote = sp.recordingsDeleteReason === 'retention' ? tx('results.audio_expired', { period: ((p) => tx(p.key, { n: p.n ?? '' }))(retentionPeriod(sp.audioRetentionDays, mode === 'b2c')) }) : tx('results.audio_deleted_note');
  return (
    <div ref={row} className="sp-item" style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 0', borderTop: `1px solid ${s.line}` }}>
      <div className="sp-q" lang="en" dir="ltr" style={{ fontSize: 13.5, fontWeight: 700, color: s.sub, lineHeight: 1.45 }}>{it.question}</div>
      {it.noResponse ? (
        <div style={{ fontSize: 13, fontStyle: 'italic', color: s.muted }}>{tx('results.no_answer')}</div>
      ) : (
        <div className="sp-clip-row" style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            {noAudioNote ? <span style={{ fontSize: 12.5, color: s.muted }}>{noAudioNote}</span>
              : it.recording ? <AudioClip url={it.recording.url} durationMs={it.durationMs} playNonce={nonce} />
                : gone ? <span style={{ fontSize: 12.5, color: s.muted }}>{goneNote}</span> : null}
          </div>
          {it.transcript && (
            <button type="button" className="sp-tbtn" onClick={() => setShow((v) => !v)} aria-expanded={show}
              style={{ border: 'none', background: 'transparent', color: s.accent, fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 0, minHeight: 32 }}>
              {tx(show ? 'results.hide_transcript' : 'results.show_transcript')}
            </button>
          )}
        </div>
      )}
      {show && it.transcript && (
        <div lang="en" dir="ltr" style={{ fontFamily: serif, fontSize: 15, lineHeight: 1.75, color: s.ink, background: s.paper, borderRadius: 12, padding: '14px 16px', whiteSpace: 'pre-line' }}>{it.transcript}</div>
      )}
    </div>
  );
}

export function Recordings({ openParts, setOpenParts }: { openParts: Set<number>; setOpenParts: (f: (p: Set<number>) => Set<number>) => void }) {
  const { skin: s, tx, sp } = useSpeaking();
  const parts = [...new Set(sp.items.map((i) => i.part))].sort();
  if (!sp.items.length) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', paddingBottom: 6 }}>
        <span style={{ ...caps(s), fontSize: 12 }}>{tx('results.your_recordings')}</span>
        <span style={{ fontSize: 12, color: s.muted }}>{tx('results.transcript_note')}</span>
      </div>
      {parts.map((p) => {
        const items = sp.items.filter((i) => i.part === p);
        const open = openParts.has(p);
        return (
          <div key={p} style={{ borderTop: `1px solid ${s.line}` }}>
            <button type="button" aria-expanded={open} onClick={() => setOpenParts((o) => { const n = new Set(o); if (n.has(p)) n.delete(p); else n.add(p); return n; })}
              style={{ width: '100%', height: 48, border: 'none', background: 'transparent', color: s.ink, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: 0, fontSize: 14, fontWeight: 800 }}>
              <span>{tx('speaking.part_n', { n: p })} · {tx('x.content_questions_only', { n: items.length })}</span>
              <ChevronDown size={16} aria-hidden style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 150ms', color: s.muted }} />
            </button>
            {open && <div style={{ paddingBottom: 6 }}>{items.map((it) => <Item key={it.itemKey} it={it} open={open} />)}</div>}
          </div>
        );
      })}
    </div>
  );
}
