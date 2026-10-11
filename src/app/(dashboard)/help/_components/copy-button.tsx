'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Copy, Link2 } from 'lucide-react';
import { NmButton } from '@/components/ui/nm-button';
import { cn } from '@/lib/utils/cn';
import { COPIED_MS } from '@/lib/help/constants';
import { FOCUS, TONE_TEXT } from './styles';

export const COPY_FAIL = "Nusxalab bo'lmadi — matnni belgilab, qo'lda nusxalang.";

type CopyState = 'idle' | 'done' | 'error';

/** Clipboard API first, then the legacy execCommand path (HTTP, old WebViews). */
async function writeClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the textarea fallback
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '0';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export function useCopy() {
  const [state, setState] = useState<CopyState>('idle');
  const timer = useRef<number>();
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const copy = useCallback(async (text: string) => {
    // Telegram and SMS apps handle plain spaces better than the NBSPs used for layout.
    const ok = await writeClipboard(text.replace(/ /g, ' '));
    setState(ok ? 'done' : 'error');
    window.clearTimeout(timer.current);
    if (ok) timer.current = window.setTimeout(() => setState('idle'), COPIED_MS);
  }, []);
  return { state, copy };
}

interface CopyButtonProps {
  state: CopyState;
  onCopy: () => void;
  kind: 'text' | 'link';
  className?: string;
}

/** "Nusxalash" / "Havolani nusxalash" with a 2 s success state (§7.7, §7.9). */
export function CopyButton({ state, onCopy, kind, className }: CopyButtonProps) {
  const done = state === 'done';
  const Icon = done ? Check : kind === 'link' ? Link2 : Copy;
  const label = done
    ? kind === 'link' ? 'Havola nusxalandi' : 'Nusxalandi'
    : kind === 'link' ? 'Havolani nusxalash' : 'Nusxalash';
  return (
    <NmButton
      type="button"
      variant={kind === 'link' ? 'ghost' : 'soft'}
      size="sm"
      onClick={onCopy}
      className={cn('h-11 w-full sm:w-auto', FOCUS, done && TONE_TEXT.green, className)}
    >
      <Icon className="size-4" aria-hidden />
      <span aria-live="polite">{label}</span>
    </NmButton>
  );
}

export function CopyError({ state }: { state: CopyState }) {
  if (state !== 'error') return null;
  return (
    <p role="alert" className="text-[12px] font-semibold text-danger">
      {COPY_FAIL}
    </p>
  );
}
