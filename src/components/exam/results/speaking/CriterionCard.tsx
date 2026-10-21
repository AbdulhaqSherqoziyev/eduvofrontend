'use client';
/**
 * One of the 4 criterion cards (spec §2.2): name + whole band, 6px bar (band/9), note,
 * "Keyingi qadam:", 2–3 verbatim quotes (serif, `lang=en`) with "P3" and a 28px play button.
 * Play: `timestampsReliable` + `startMs` → 6 s from that point; otherwise the whole answer from 0
 * (accordion opens, page scrolls). Pronunciation: max 5 neutral word chips (1.5 s play only with
 * reliable timestamps). No red/yellow marks, no "error" labels (M11). No play when audio is gone.
 */
import { Play } from 'lucide-react';
import type { SpeakingCriterion } from '@/lib/exam/speaking-types';
import { absMedia } from '@/lib/exam/api';
import { recOf, useSpeaking } from './context';
import { playSnippet } from './play-bus';
import { caps, serif } from './skin';

const NAMES: Record<string, string> = {
  fluency_coherence: 'Fluency & Coherence', lexical_resource: 'Lexical Resource',
  grammatical_range_accuracy: 'Grammatical Range & Accuracy', pronunciation: 'Pronunciation',
};

export function CriterionCard({ c, hideAiNotes }: { c: SpeakingCriterion; hideAiNotes?: boolean }) {
  const { skin: s, tx, sp, playItem, noAudioNote } = useSpeaking();
  const reliable = sp.timestampsReliable === true;
  const canPlay = (itemKey: string) => !noAudioNote && !!recOf(sp, itemKey);
  const play = (itemKey: string, startMs: number | null, durMs: number) => {
    const rec = recOf(sp, itemKey);
    if (!rec) return;
    if (reliable && startMs != null) playSnippet(absMedia(rec.url), startMs, durMs);
    else playItem(itemKey);
  };
  const words = (c.wordsToPractise ?? []).slice(0, 5);
  const round = { width: 28, height: 28, borderRadius: '50%', border: '1.5px solid #D5DCE6', background: 'transparent', color: s.ink, display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0 } as const;

  return (
    <div className={s.cardClass} style={{ ...s.card, display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: s.ink }} lang="en">{NAMES[c.key] ?? c.name}</span>
        <span style={{ fontSize: 18, fontWeight: 800, color: s.ink, fontVariantNumeric: 'tabular-nums' }}>{Math.round(c.band)}</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: s.track, overflow: 'hidden' }} aria-hidden>
        <div style={{ height: '100%', width: `${Math.min(100, (c.band / 9) * 100)}%`, background: s.accent, borderRadius: 3 }} />
      </div>
      {!hideAiNotes && c.note && <div style={{ fontSize: 13.5, color: s.sub, lineHeight: 1.55 }}>{c.note}</div>}
      {!hideAiNotes && c.nextStep && (
        <div style={{ fontSize: 13.5, color: s.sub, lineHeight: 1.55 }}><b style={{ fontSize: 13, fontWeight: 800, color: s.ink }}>{tx('results.criterion_next')}</b> {c.nextStep}</div>
      )}
      {!hideAiNotes && c.quotes.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={caps(s)}>{tx('results.quotes')}</div>
          {c.quotes.slice(0, 3).map((q, i) => (
            <div key={i} className="sp-quote" style={{ display: 'flex', alignItems: 'center', gap: 10, background: s.paper, borderRadius: 12, padding: '10px 14px' }}>
              <span lang="en" dir="ltr" style={{ flex: 1, minWidth: 0, fontFamily: serif, fontSize: 14, lineHeight: 1.6, color: s.ink }}>“{q.quote}”</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: s.muted }}>P{q.part}</span>
              {canPlay(q.itemKey) && (
                <button type="button" className="print-hide sp-qplay" aria-label={`${tx('results.listen_answer')} · P${q.part}`} onClick={() => play(q.itemKey, q.startMs, 6000)} style={round}>
                  <Play size={12} aria-hidden />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {c.key === 'pronunciation' && words.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={caps(s)}>{tx('results.words_to_practise')}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {words.map((w, i) => {
              const playable = reliable && w.startMs != null && canPlay(w.itemKey);
              const st = { height: 32, borderRadius: 10, background: s.paper, color: s.ink, fontSize: 13, fontWeight: 700, padding: '0 12px', display: 'inline-flex', alignItems: 'center', gap: 6, border: 'none' } as const;
              return playable
                ? <button key={i} type="button" lang="en" onClick={() => play(w.itemKey, w.startMs, 1500)} style={{ ...st, cursor: 'pointer' }}><Play size={11} aria-hidden />{w.word}</button>
                : <span key={i} lang="en" style={st}>{w.word}</span>;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
