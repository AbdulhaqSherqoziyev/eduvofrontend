'use client';
/**
 * Speaking centre cards: examiner line (spec §1.5), microphone disconnected (§1.6 — not a modal, no
 * dimming, grey icon, "not your fault / time isn't running / what next"), end of section (§1.5).
 */
import { CheckCircle, MicOff, Volume2 } from 'lucide-react';
import { useT } from '@/lib/exam/engine/context';
import type { LostState } from '@/lib/exam/speaking/use-lost';
import { Bi, Btn, Spinner } from '../shell/ui';

const card = (w: number) => ({ width: w, background: 'var(--x-panel)', border: '1px solid var(--x-line)', borderRadius: w === 660 ? 18 : 22, padding: w === 660 ? '28px 32px' : 32, display: 'flex', flexDirection: 'column' as const, gap: 14 });

export function ExaminerLineCard({ caps, text, showText }: { caps: string; text: string; showText: boolean }) {
  const { t } = useT();
  return (
    <div style={{ ...card(660), alignItems: 'center', textAlign: 'center', minHeight: 170 }}>
      <span style={{ alignSelf: 'flex-start', fontSize: 12, fontWeight: 800, letterSpacing: 1, color: 'var(--x-muted)' }}>{caps}</span>
      {showText ? (
        <div className="x-fade-in" lang="en" style={{ fontSize: 17, fontWeight: 600, color: 'var(--x-sub)', lineHeight: 1.5 }}>{text}</div>
      ) : (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 600, color: 'var(--x-muted)', marginTop: 12 }}><Volume2 size={20} color="var(--x-accent)" aria-hidden />{t('speaking.listen')}</span>
      )}
    </div>
  );
}

export function MicLostCard({ st, onReconnect }: { st: LostState; onReconnect: () => void }) {
  const { t, bi } = useT();
  return (
    <div role="alert" style={{ ...card(560), alignItems: 'center', textAlign: 'center', gap: 16 }}>
      <MicOff size={32} color="var(--x-muted)" aria-hidden />
      <Bi pair={bi('speaking.mic_lost_title')} size={22} weight={800} center />
      <Bi pair={bi(st.used ? 'speaking.mic_lost_body_used' : 'speaking.mic_lost_body')} size={15} weight={500} center />
      {st.used && st.partial && <Bi pair={bi('speaking.partial_saved')} size={14} weight={500} center />}
      {st.unstable && <Bi pair={bi('speaking.mic_unstable')} size={14} weight={500} center />}
      {st.err && (
        <div style={{ background: 'var(--x-warn-bg)', borderRadius: 10, padding: '8px 12px', alignSelf: 'stretch' }}>
          <Bi pair={bi(st.err)} size={13} color="var(--x-warn-fg)" />
        </div>
      )}
      {st.offline && <Bi pair={bi('banner.offline')} size={13} color="var(--x-warn-fg)" center />}
      <Btn h={48} variant="accent" disabled={st.busy} onClick={onReconnect} style={{ fontSize: 15, padding: '0 26px' }}>
        {st.busy ? <Spinner /> : t(st.err ? 'chrome.check_again' : 'speaking.mic_lost_cta')}
      </Btn>
    </div>
  );
}

export function DoneCard({ pending, sent, total, offline, stuck, last, busy, failed, onGo }: {
  pending: number; sent: number; total: number; offline: boolean; stuck: boolean; last: boolean; busy: boolean; failed: boolean; onGo: () => void;
}) {
  const { t, bi } = useT();
  // uploads failing on the server side (3+ tries / stage locked) must not trap the learner: explain and let them go on
  const waiting = pending > 0 && !stuck;
  return (
    <div style={{ ...card(520), alignItems: 'center', textAlign: 'center', gap: 14 }} role="status" aria-live="polite">
      {waiting && !offline && <><Spinner size={28} /><Bi pair={bi('speaking.uploading', { n: sent, m: total })} size={16} weight={700} center /></>}
      {pending > 0 && stuck && !offline && <Bi pair={bi('banner.recording_queued')} size={14} weight={500} center />}
      {waiting && offline && (
        <>
          <Bi pair={bi('banner.recording_queued')} size={15} weight={500} center />
          <Bi pair={bi('speaking.dont_close')} size={14} weight={700} center />
        </>
      )}
      {!waiting && (
        <>
          <CheckCircle size={32} color="var(--x-ok-fg)" aria-hidden />
          <Bi pair={bi('speaking.section_done')} size={22} weight={800} center />
          {last && <Bi pair={bi('timeup.last')} size={14} weight={500} center />}
        </>
      )}
      {failed && <Bi pair={bi('errors.server')} size={13} color="var(--x-warn-fg)" center />}
      <Btn h={48} variant="accent" disabled={waiting || busy} onClick={onGo} style={{ fontSize: 15, padding: '0 26px', marginTop: 4 }}>
        {busy ? <Spinner /> : t(last ? 'chrome.view_results' : 'chrome.continue')}
      </Btn>
    </div>
  );
}
