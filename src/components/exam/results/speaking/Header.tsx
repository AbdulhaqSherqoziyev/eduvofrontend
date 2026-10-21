'use client';
/**
 * Speaking block header (spec §2.2): "Speaking" · one band (0.5 step, never a range) · AI chip
 * (always) · "O'qituvchi tekshirdi" chip · audio-only chip; then `speaking_how`, the two fact chips
 * and one disclaimer line (band + AI + not official in one view, M11).
 */
import { UserCheck } from 'lucide-react';
import { useSpeaking } from './context';
import { bandText, chip } from './skin';

export function Header() {
  const { skin: s, tx, sp } = useSpeaking();
  const ready = sp.status === 'ready' && sp.band != null;
  const grading = ['received', 'transcribing', 'scoring'].includes(sp.status);
  const fact = { fontSize: 12, fontWeight: 700, color: s.sub, background: s.paper, borderRadius: 8, padding: '6px 10px' } as const;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div className="sp-head" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
        <span className="sp-head-main" style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: s.name === 'hub' ? 17 : 18, fontWeight: 800, color: s.ink }} lang="en">Speaking</span>
          {ready ? <span style={{ fontSize: 32, fontWeight: 800, letterSpacing: -0.6, color: s.ink, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{sp.label ?? bandText(sp.band!)}</span>
            : grading ? <span style={{ fontSize: 32, fontWeight: 800, color: s.muted, lineHeight: 1 }}>…</span> : null}
          <span style={chip(s.aiBg, s.aiFg)}>{tx('x.ai_badge')}</span>
        </span>
        {sp.teacherReviewed && <span style={chip(s.okBg, s.okFg)}><UserCheck size={12} aria-hidden />{tx('results.teacher_checked')}</span>}
        {sp.audioOnly && <span style={{ ...chip(s.paper, s.sub), marginInlineStart: 'auto' }}>{tx('results.audio_only_mode')}</span>}
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: s.muted, lineHeight: 1.5 }}>{tx('results.speaking_how')}</div>
      {sp.status !== 'pending' && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span style={fact}>{tx('results.answers_recorded', { n: sp.answeredCount })}</span>
          <span style={fact}>{tx('results.transcript')}</span>
        </div>
      )}
      {sp.summary && <div style={{ fontSize: 13.5, color: s.sub, lineHeight: 1.55 }}>{sp.summary}</div>}
      <div style={{ fontSize: 12, color: s.muted }}>{tx('results.disclaimer')}</div>
    </div>
  );
}
