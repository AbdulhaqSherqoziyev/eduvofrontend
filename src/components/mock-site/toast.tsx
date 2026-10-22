'use client';
/**
 * Toast (Design System): ink background, auto-hides after ~2.2 s. One at a time.
 * Optional inline action (leaderboard §4.6 "Undo"): the toast then stays `ms` (default 5 s).
 */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

export interface ToastOpts { action?: { label: string; onClick: () => void }; ms?: number }
type Show = (msg: string, opts?: ToastOpts) => void;
const Ctx = createContext<Show>(() => undefined);
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState('');
  const [action, setAction] = useState<ToastOpts['action']>();
  const timer = useRef<number>();
  const show = useCallback<Show>((m, opts) => {
    setMsg(m);
    setAction(opts?.action);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => { setMsg(''); setAction(undefined); }, opts?.ms ?? (opts?.action ? 5000 : 2200));
  }, []);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return (
    <Ctx.Provider value={show}>
      {children}
      <div aria-live="polite" role="status">
        {msg && (
          <div className="m-toast" style={action ? { display: 'flex', alignItems: 'center', gap: 16 } : undefined}>
            <span style={action ? { flex: 1 } : undefined}>{msg}</span>
            {action && (
              <button type="button" onClick={() => { window.clearTimeout(timer.current); setMsg(''); setAction(undefined); action.onClick(); }}
                style={{ border: 0, background: 'transparent', color: 'inherit', font: 'inherit', fontWeight: 800, textDecoration: 'underline', cursor: 'pointer', padding: 0, whiteSpace: 'nowrap' }}>
                {action.label}
              </button>
            )}
          </div>
        )}
      </div>
    </Ctx.Provider>
  );
}
