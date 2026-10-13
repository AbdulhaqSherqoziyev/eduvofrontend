'use client';
/**
 * Paddle overlay state for one page (checkout form, order page). `completed` fires on
 * `checkout.completed` (credits still come only from the webhook — the caller polls O3);
 * `closed` when the learner closes the overlay without completing. A `checkout.payment.failed`
 * while the overlay is open is NOT final: Paddle lets the learner retry inside the overlay.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { closePaddleCheckout, detachPaddle, openPaddleCheckout, type PaddleEvent } from '@/lib/mock/paddle';

export type PaddleUiState = 'idle' | 'opening' | 'open' | 'error';

export function usePaddle(o: { locale: string; email?: string | null; onCompleted: () => void; onClosed: () => void }) {
  const [state, setState] = useState<PaddleUiState>('idle');
  const live = useRef(o);
  live.current = o;
  const done = useRef(false);
  const handler = useRef<(e: PaddleEvent) => void>((e) => {
    if (e.name === 'checkout.completed') {
      done.current = true;
      setState('idle');
      // let Paddle show its own confirmation for a moment, then hand over to the order page
      window.setTimeout(() => { closePaddleCheckout(); live.current.onCompleted(); }, 1200);
    } else if (e.name === 'checkout.closed') {
      setState('idle');
      if (!done.current) live.current.onClosed();
    }
  });
  useEffect(() => { const h = handler.current; return () => detachPaddle(h); }, []);

  const open = useCallback(async (clientToken: string, transactionId: string) => {
    done.current = false;
    setState('opening');
    try {
      await openPaddleCheckout({ clientToken, transactionId, email: live.current.email, locale: live.current.locale, onEvent: handler.current });
      setState('open');
    } catch {
      setState('error');
    }
  }, []);
  return { state, open, reset: () => setState('idle') };
}
