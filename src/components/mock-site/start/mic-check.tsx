'use client';
/**
 * Exam Start — Microphone check row (speaking-design.md §4.3). Only access is checked here
 * (getUserMedia → stream stopped at once); the full voice test runs in the player pre-check.
 * "Take Speaking later" makes the row optional; the choice reaches the player through
 * `markSpeakingLater(attemptId)` once the attempt exists.
 */
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { sx } from '@/lib/mock/sx';

export type MicState = 'todo' | 'asking' | 'ok' | 'denied' | 'none';
export interface MicCheck { state: MicState; later: boolean; panel: boolean; setLater: (v: boolean) => void; act: () => void; go: () => void; done: boolean }

/** Read by the player (lib/exam/speaking/local.ts `speakingLater`): localStorage `eduvo_exam:<attemptId>:speaking_later` = true. */
export function markSpeakingLater(attemptId: string, on: boolean) {
  try {
    const k = `eduvo_exam:${attemptId}:speaking_later`;
    if (on) localStorage.setItem(k, JSON.stringify(true)); else localStorage.removeItem(k);
  } catch { /* storage off: Speaking simply follows Writing */ }
}

export function useMicCheck(): MicCheck {
  const [state, setState] = useState<MicState>('todo');
  const [later, setLater] = useState(false);
  const [panel, setPanel] = useState(false);
  const go = async () => {
    setPanel(false);
    if (!navigator.mediaDevices?.getUserMedia) { setState('none'); return; }
    setState('asking');
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      s.getTracks().forEach((tr) => tr.stop());
      setState('ok');
    } catch (e) {
      setState((e as DOMException)?.name === 'NotFoundError' || (e as DOMException)?.name === 'OverconstrainedError' ? 'none' : 'denied');
    }
  };
  const act = async () => {
    let perm: PermissionState | null = null;
    try { perm = (await navigator.permissions.query({ name: 'microphone' as PermissionName })).state; } catch { perm = null; }
    if (perm === 'granted') { void go(); return; }
    if (perm === 'denied') { setState('denied'); return; }
    setPanel(true); // `prompt` (or no Permissions API): our explanation before the browser asks
  };
  return { state, later, panel, setLater, act: () => void act(), go: () => void go(), done: state === 'ok' || later };
}

/** Browser permission popup sketch (spec §1.1-a picture, neomorphic colours). Text inside is English like the real popup. */
function PermissionSketch() {
  return (
    <svg width="132" height="76" viewBox="0 0 132 76" aria-hidden style={sx('flex:none;border-radius:10px;box-shadow:var(--raise-sm)')}>
      <rect x="8" y="8" width="116" height="12" rx="6" fill="none" stroke="var(--ink2)" strokeWidth="1.2" />
      <rect x="13" y="11" width="5" height="6" rx="1" fill="var(--ink2)" />
      <rect x="22" y="13" width="50" height="2" rx="1" fill="var(--mut)" />
      <rect x="8" y="24" width="78" height="44" rx="6" fill="var(--bg)" stroke="var(--ink2)" strokeWidth="1.2" />
      <text x="14" y="38" fontSize="7" fontWeight="700" fill="var(--ink)">Use your microphone?</text>
      <rect x="14" y="48" width="28" height="13" rx="4" fill="none" stroke="var(--blue)" strokeWidth="2" />
      <text x="20" y="57" fontSize="6.5" fontWeight="800" fill="var(--blue)">Allow</text>
      <rect x="48" y="48" width="28" height="13" rx="4" fill="none" stroke="var(--mut)" strokeWidth="1" />
      <text x="54" y="57" fontSize="6.5" fontWeight="700" fill="var(--mut)">Block</text>
    </svg>
  );
}

const BTN = sx('height:38px;padding:0 14px;border-radius:11px;border:0;background:var(--bg);box-shadow:var(--raise-sm);color:var(--blue);font-weight:700;font-size:13px;cursor:pointer;white-space:nowrap');
const LINK = sx('align-self:flex-start;border:0;background:transparent;padding:0;color:var(--blue);font-weight:700;font-size:12.5px;cursor:pointer');

export function MicCheckRow({ mic, allowLater }: { mic: MicCheck; allowLater: boolean }) {
  const t = useTranslations('start');
  const off = mic.later;
  const note = off ? t('micLaterNote') : mic.state === 'ok' ? t('micOk') : mic.state === 'denied' ? t('micDenied') : mic.state === 'none' ? t('micNone') : t('micTodo');
  const dot = off ? 'var(--mut)' : mic.state === 'ok' ? 'var(--ok)' : 'var(--warn)';
  return (
    <div style={sx('display:flex;flex-direction:column;gap:8px')}>
      <div style={{ ...sx('display:flex;gap:14px;align-items:center;padding:14px 16px;border-radius:16px;box-shadow:var(--inset)'), opacity: off ? 0.7 : 1 }}>
        <span style={{ ...sx('width:10px;height:10px;border-radius:50%;flex:none'), background: dot }} />
        <div style={sx('flex:1;min-width:0;display:flex;flex-direction:column;gap:2px')}>
          <span style={{ ...sx('font-weight:700;font-size:14px'), color: off ? 'var(--mut)' : undefined }}>{t('mic')}</span>
          <span role="status" style={sx('font-size:12px;color:var(--mut);font-weight:600')}>{note}</span>
        </div>
        {!off && mic.state !== 'ok' && !mic.panel && (
          <button type="button" onClick={mic.act} disabled={mic.state === 'asking'} style={BTN}>{mic.state === 'denied' || mic.state === 'none' ? t('netAct') : t('micAct')}</button>
        )}
      </div>
      {mic.panel && !off && (
        <div style={sx('display:flex;gap:14px;align-items:center;flex-wrap:wrap;padding:14px 16px;border-radius:16px;box-shadow:var(--inset)')}>
          <PermissionSketch />
          <div style={sx('flex:1;min-width:160px;display:flex;flex-direction:column;gap:10px')}>
            <span style={sx('font-size:13px;color:var(--ink2);line-height:1.5')}>{t('micWhere')}</span>
            <button type="button" onClick={mic.go} style={{ ...BTN, ...sx('align-self:flex-start') }}>{t('micGo')}</button>
          </div>
        </div>
      )}
      {allowLater && mic.state !== 'ok' && (
        <button type="button" onClick={() => mic.setLater(!mic.later)} style={LINK}>{mic.later ? t('micNow') : t('micLater')}</button>
      )}
    </div>
  );
}
