'use client';
/** Pre-check card frame + status chip (design G6): not_checked (grey) / checking / ready (ok) / attention (warn). */
import { AlertTriangle, Check, CircleDashed } from 'lucide-react';
import type { ReactNode } from 'react';
import { useT } from '@/lib/exam/engine/context';
import { Spinner } from '../../shell/ui';

export type CheckStatus = 'not_checked' | 'checking' | 'ready' | 'attention';

export function StatusChip({ st }: { st: CheckStatus }) {
  const { t } = useT();
  const map = {
    not_checked: { bg: 'var(--x-tile)', fg: 'var(--x-muted)', icon: <CircleDashed size={12} aria-hidden />, key: 'precheck.status_not_checked' },
    checking: { bg: 'var(--x-tile)', fg: 'var(--x-sub)', icon: <Spinner size={11} />, key: 'precheck.status_checking' },
    ready: { bg: 'var(--x-ok-bg)', fg: 'var(--x-ok-fg)', icon: <Check size={12} aria-hidden />, key: 'precheck.status_ready' },
    attention: { bg: 'var(--x-warn-bg)', fg: 'var(--x-warn-fg)', icon: <AlertTriangle size={12} aria-hidden />, key: 'precheck.status_attention' },
  } as const;
  const m = map[st];
  return (
    <span role="status" style={{ height: 26, borderRadius: 13, padding: '0 10px', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, background: m.bg, color: m.fg, whiteSpace: 'nowrap' }}>
      {m.icon}{t(m.key)}
    </span>
  );
}

export function CheckCard({ title, status, children, span }: { title: string; status?: CheckStatus; children: ReactNode; span?: boolean }) {
  return (
    <div style={{ gridColumn: span ? '1 / -1' : undefined, background: 'var(--x-panel)', border: '1px solid var(--x-line)', borderRadius: 18, padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 800 }}>{title}</div>
        {status && <StatusChip st={status} />}
      </div>
      {children}
    </div>
  );
}

export const hint = { fontSize: 13.5, color: 'var(--x-sub)', lineHeight: 1.5 } as const;
