'use client';
/**
 * Non-ready states of the Speaking block (spec §2.3): grading stepper (4 server steps, no fake
 * progress), teacher review, no_response / too_short (no band, no "0"), B2C not graded, not taken yet.
 */
import { Check, Clock, Hourglass, MicOff, UserCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import { useSpeaking } from './context';

const STEPS = ['results.strip_received', 'results.strip_transcribing', 'results.strip_scoring', 'results.strip_ready'] as const;
const IDX: Record<string, number> = { received: 0, transcribing: 1, scoring: 2 };

export function GradingStepper() {
  const { skin: s, tx, sp, mode, gradingNote } = useSpeaking();
  const cur = IDX[sp.status] ?? 0;
  return (
    <div role="status" aria-live="polite" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <ol className="sp-steps" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 18px', margin: 0, padding: 0, listStyle: 'none' }}>
        {STEPS.map((k, i) => {
          const done = i < cur;
          const on = i === cur;
          return (
            <li key={k} aria-current={on ? 'step' : undefined} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: done ? '#1F7A55' : on ? s.ink : s.muted }}>
              {done ? <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#1F7A55', color: '#fff', display: 'grid', placeItems: 'center' }}><Check size={10} aria-hidden /></span>
                : <span style={{ width: 10, height: 10, borderRadius: '50%', background: on ? s.accent : '#DDE3EC' }} aria-hidden />}
              {tx(k)}
            </li>
          );
        })}
      </ol>
      <div style={{ fontSize: 13.5, color: s.sub, lineHeight: 1.55 }}>{gradingNote ?? `${tx('results.grading_speaking')} ${mode === 'staff' || mode === 'preview' ? '' : tx('results.can_leave')}`}</div>
    </div>
  );
}

function Notice({ icon, title, children }: { icon: ReactNode; title: string; children?: ReactNode }) {
  const { skin: s } = useSpeaking();
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <span style={{ flexShrink: 0, marginTop: 1, color: '#7A8699' }}>{icon}</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: s.ink, lineHeight: 1.45 }}>{title}</div>
        {children}
      </div>
    </div>
  );
}

export interface B2cExtras { refundedText?: string | null; notGradedText?: string | null; unfairHref?: string }

export function NoScore({ b2c }: { b2c?: B2cExtras }) {
  const { skin: s, tx, sp, mode } = useSpeaking();
  const line = (t: string) => <div style={{ fontSize: 13.5, color: s.sub, lineHeight: 1.55 }}>{t}</div>;
  const unfair = b2c?.unfairHref ? <a href={b2c.unfairHref} style={{ fontSize: 13.5, fontWeight: 700, color: s.accent }}>{tx('results.unfair')}</a> : null;
  if (sp.status === 'needs_review') return <Notice icon={<UserCheck size={20} aria-hidden />} title={tx('results.human_review')} />;
  if (sp.status === 'not_taken') return <Notice icon={<Clock size={20} aria-hidden />} title={tx('results.speaking_expired')} />;
  if (sp.status === 'not_graded') return <Notice icon={<MicOff size={20} aria-hidden />} title={b2c?.notGradedText ?? ''} />;
  const tooShort = sp.status === 'too_short';
  return (
    <Notice icon={tooShort ? <Hourglass size={20} aria-hidden /> : <MicOff size={20} aria-hidden />} title={tx(tooShort ? 'results.speaking_too_short' : 'results.speaking_no_response')}>
      {mode === 'b2c' ? (
        <>
          {line(tx(tooShort ? 'results.too_short_b2c' : 'results.no_response_b2c'))}
          {unfair}
          {!tooShort && b2c?.refundedText ? line(b2c.refundedText) : null}
        </>
      ) : line(tx('results.speaking_no_response_center'))}
    </Notice>
  );
}

export function NotTaken({ takeHref, phoneNote }: { takeHref?: string | null; phoneNote?: ReactNode }) {
  const { skin: s, tx, sp, mode } = useSpeaking();
  const until = sp.availableUntil ? sp.availableUntil.slice(0, 10) : null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: s.ink }}>{tx('results.speaking_not_taken')}</div>
      {takeHref && <a href={takeHref} className={phoneNote ? 'sp-desk-only' : undefined} style={{ height: 44, padding: '0 20px', borderRadius: 12, background: s.accent, color: '#fff', fontWeight: 800, fontSize: 14, display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>{tx('results.speaking_take_now')}</a>}
      {phoneNote && <div className="sp-phone-only">{phoneNote}</div>}
      {until && <div style={{ fontSize: 12, color: s.muted }}>{tx('results.speaking_deadline', { date: until })}</div>}
      <div style={{ fontSize: 13, color: s.muted }}>{tx('results.no_overall')}</div>
    </div>
  );
}

export function Skeleton() {
  const { skin: s } = useSpeaking();
  return (
    <div aria-busy="true" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 14 }}>
      {[0, 1, 2, 3].map((i) => <div key={i} style={{ height: 120, borderRadius: 16, background: s.paper }} />)}
    </div>
  );
}
