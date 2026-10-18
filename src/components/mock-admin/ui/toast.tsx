'use client';
/**
 * Toasts (Admin Components.dc.html · TOAST): ok ✓ / warn ! / err ✕, title + line, bottom-right above
 * the mobile nav (bottom 84px). ok/warn hide after 4 s (Dashboard); err stays 8 s so it can be read.
 */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

export type ToastTone = 'ok' | 'warn' | 'err';
export interface ToastMsg { tone: ToastTone; title: string; text?: string }

const ICON: Record<ToastTone, string> = { ok: '✓', warn: '!', err: '✕' };
const Ctx = createContext<(t: ToastMsg) => void>(() => undefined);
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<(ToastMsg & { id: number })[]>([]);
  const seq = useRef(0);
  const timers = useRef(new Map<number, number>());
  const show = useCallback((t: ToastMsg) => {
    const id = ++seq.current;
    setItems((xs) => [...xs.slice(-2), { ...t, id }]);
    timers.current.set(id, window.setTimeout(() => {
      setItems((xs) => xs.filter((x) => x.id !== id));
      timers.current.delete(id);
    }, t.tone === 'err' ? 8000 : 4000));
  }, []);
  useEffect(() => {
    const m = timers.current;
    return () => m.forEach((h) => window.clearTimeout(h));
  }, []);
  return (
    <Ctx.Provider value={show}>
      {children}
      <div className="ma-toasts" role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className="ma-toast">
            <span className={`ma-toast-ico t-${t.tone}`} aria-hidden="true">{ICON[t.tone]}</span>
            <div className="ma-toast-text"><b>{t.title}</b>{t.text && <span>{t.text}</span>}</div>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
