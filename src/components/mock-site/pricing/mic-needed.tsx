'use client';
/** speaking-design.md §4.1 (M16): "Speaking needs a laptop or computer with a microphone" — before any payment. */
import { Mic } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { sx } from '@/lib/mock/sx';

export function MicNeeded({ size = 13, inset }: { size?: number; inset?: boolean }) {
  const t = useTranslations('pricing');
  return (
    <span role="note" style={sx(`display:flex;gap:8px;align-items:flex-start;font-size:${size}px;font-weight:600;color:var(--ink2);line-height:1.45${inset ? ';border-radius:12px;padding:10px 12px;box-shadow:var(--inset)' : ''}`)}>
      <Mic size={14} aria-hidden style={sx('color:var(--mut);flex:none;margin-top:2px')} />{t('micNeeded')}
    </span>
  );
}

/** Pins the mic line + the buy button to the card bottom together (BuyLink's own `margin-top:auto` then has no slack). */
export function BuyFoot({ mic, children }: { mic: boolean; children: React.ReactNode }) {
  if (!mic) return <>{children}</>;
  return <div style={sx('margin-top:auto;display:flex;flex-direction:column;gap:12px')}><MicNeeded />{children}</div>;
}
