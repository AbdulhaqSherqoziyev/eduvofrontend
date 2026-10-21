'use client';
/**
 * READY body above the criteria (spec §2.2): teacher's note; band ≤ 5.0 → "{to} ga yetish uchun
 * {n} qadam" card first (at least one strength under it); band > 5.0 → strengths | next steps.
 * Low band keeps the normal size and colour (no red).
 */
import { useSpeaking } from './context';
import { bandText } from './skin';

/** At least one strength (spec): fall back to the top criterion's name + first sentence of its note. */
function strengthsOf(sp: ReturnType<typeof useSpeaking>['sp']): string[] {
  if (sp.strengths.length) return sp.strengths.slice(0, 2);
  const top = [...(sp.criteria ?? [])].sort((a, b) => b.band - a.band)[0];
  if (!top?.note) return [];
  return [`${top.name}: ${top.note.split(/(?<=[.!?])\s/)[0]}`];
}

export function Feedback() {
  const { skin: s, tx, sp } = useSpeaking();
  const band = sp.band ?? 0;
  const strengths = strengthsOf(sp);
  const low = band <= 5;
  const box = (bg: string) => ({ padding: 18, borderRadius: 16, background: bg, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }) as const;
  const list = (items: string[]) => items.map((x, i) => <span key={i} style={{ fontSize: 14, lineHeight: 1.5, color: s.ink }}>{x}</span>);
  const steps = sp.nextSteps.slice(0, Math.min(2, sp.nextSteps.length));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {sp.teacherReviewed && sp.teacherNote && (
        <div style={{ background: s.paper, borderRadius: 14, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: s.ink }}>{tx('results.teacher_comment')}</span>
          <span style={{ fontSize: 14, lineHeight: 1.55, color: s.ink }}>{sp.teacherNote}</span>
          {sp.teacherName && <span style={{ fontSize: 12, color: s.muted }}>{sp.teacherName}</span>}
        </div>
      )}
      {low && steps.length > 0 && (
        <div className={s.stepClass} style={{ ...s.stepCard, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: s.ink }}>{tx('results.speaking_to_next', { to: bandText(band + 1), n: steps.length })}</div>
          {steps.map((x, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ width: 24, height: 24, borderRadius: 8, flexShrink: 0, display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 800, color: s.accent, boxShadow: s.name === 'flat' ? undefined : 'var(--inset, inset 2px 2px 5px rgba(163,177,198,.4))', background: s.name === 'flat' ? '#fff' : undefined }}>{i + 1}</span>
              <span style={{ fontSize: 14, lineHeight: 1.5, color: s.ink }}>{x}</span>
            </div>
          ))}
        </div>
      )}
      <div className="sp-two" style={{ display: 'grid', gridTemplateColumns: low ? '1fr' : 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 14 }}>
        {strengths.length > 0 && <div style={box(s.okBg)}><span style={{ fontSize: 13, fontWeight: 800, color: s.okFg }}>{tx('results.strengths')}</span>{list(strengths)}</div>}
        {!low && sp.nextSteps.length > 0 && <div style={box(s.aiBg)}><span style={{ fontSize: 13, fontWeight: 800, color: s.aiFg }}>{tx('results.next_steps')}</span>{list(sp.nextSteps.slice(0, 3))}</div>}
      </div>
    </div>
  );
}
