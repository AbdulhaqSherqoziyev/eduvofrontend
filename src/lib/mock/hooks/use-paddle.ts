'use client';
/**
 * Paddle overlay state for one page (checkout form, order page). `completed` fires on
 * `checkout.completed` (credits still come only from the webhook — the caller polls O3);
 * `closed` when the learner closes the overlay without completing. A `checkout.payment.failed`
 * while the overlay is open is NOT final: Paddle lets the learner retry inside the overlay.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { postCheckoutEvent } from '@/lib/mock/api/endpoints';
import { closePaddleCheckout, detachPaddle, openPaddleCheckout, type PaddleEvent } from '@/lib/mock/paddle';

/** Paddle's short error code/type (never a message text) */
function errorCode(e: PaddleEvent): string | undefined {
  const pick = (x: unknown) => (x && typeof x === 'object' ? x as Record<string, unknown> : {});
  const err = pick(e.error), dataErr = pick(pick(e.data).error);
  const c = err.code ?? err.type ?? dataErr.code ?? dataErr.type;
  return typeof c === 'string' ? c : undefined;
}

export type PaddleUiState = 'idle' | 'opening' | 'open' | 'error';

export function usePaddle(o: { locale: string; email?: string | null; onCompleted: () => void; onClosed: () => void }) {
  const [state, setState] = useState<PaddleUiState>('idle');
  const live = useRef(o);
  live.current = o;
  const done = useRef(false);
  /** order of the open overlay — its window events go to the admin analytics (contract §10.3) */
  const orderId = useRef<string | null>(null);
  const handler = useRef<(e: PaddleEvent) => void>((e) => {
    const oid = orderId.current;
    if (oid) {
      if (e.name === 'checkout.loaded') postCheckoutEvent(oid, 'paddle_open');
      else if (e.name === 'checkout.closed' && !done.current) postCheckoutEvent(oid, 'paddle_close');
      else if (e.name === 'checkout.error' || e.name === 'checkout.payment.failed') postCheckoutEvent(oid, 'paddle_error', errorCode(e));
    }
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

  const open = useCallback(async (clientToken: string, transactionId: string, forOrder?: string) => {
    done.current = false;
    orderId.current = forOrder ?? null;
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
