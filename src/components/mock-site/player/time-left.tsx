'use client';
/**
 * "Time left" in the signed-out modal (addendum §5.2). The attempt cannot be read without a session,
 * so the deadline comes from this device's copy of the running stage (lib/exam/storage) and the
 * clock from the public `GET /portal/exams/time` (no token needed). Unknown deadline → nothing shown.
 */
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { store } from '@/lib/exam/storage';
import { sx } from '@/lib/mock/sx';

const BASE = process.env.NEXT_PUBLIC_MOCK_API_BASE || '/api';

function fmt(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
}

/** Remaining ms of the running stage on the server clock (null = unknown on this device). */
export function useTimeLeft(attemptId: string): number | null {
  const [deadline] = useState(() => { const d = store.deadline(attemptId); const n = d ? Date.parse(d) : NaN; return Number.isFinite(n) ? n : null; });
  const [offset, setOffset] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (deadline === null) return;
    let off = false;
    const t0 = Date.now();
    fetch(`${BASE}/portal/exams/time`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((b: { serverNow?: string } | null) => {
        const server = b?.serverNow ? Date.parse(b.serverNow) : NaN;
        if (!off && Number.isFinite(server)) setOffset(server - (t0 + Date.now()) / 2);
      })
      .catch(() => undefined); // offline: the device clock is the best we have
    const iv = window.setInterval(() => setNow(Date.now()), 1000);
    return () => { off = true; window.clearInterval(iv); };
  }, [deadline]);
  return deadline === null ? null : deadline - (now + offset);
}

export function TimeLeft({ ms }: { ms: number }) {
  const t = useTranslations('player.session');
  return (
    <div style={sx('box-shadow:var(--inset);border-radius:16px;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px')}>
      <span style={sx('font-size:14px;font-weight:700;color:var(--ink2)')}>{t('timeLeft')}</span>
      <b className="m-num" style={sx('font-size:20px;font-weight:800')}><bdi dir="ltr">{fmt(ms)}</bdi></b>
    </div>
  );
}
