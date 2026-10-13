'use client';
/** Toast (Design System): ink background, auto-hides after ~2.2 s. One at a time. */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const Ctx = createContext<(msg: string) => void>(() => undefined);
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState('');
  const timer = useRef<number>();
  const show = useCallback((m: string) => {
    setMsg(m);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMsg(''), 2200);
  }, []);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return (
    <Ctx.Provider value={show}>
      {children}
      <div aria-live="polite" role="status">{msg && <div className="m-toast">{msg}</div>}</div>
    </Ctx.Provider>
  );
}
