'use client';
/**
 * "Havolani nusxalash" (§6): clipboard → navigator.share → select the link text
 * so the person can copy it by hand. `done` lasts 2 s.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

async function writeClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
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

function selectText(el: HTMLElement | null) {
  if (!el) return;
  const range = document.createRange();
  range.selectNodeContents(el);
  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
}

export function useCopyLink() {
  const [done, setDone] = useState(false);
  const timer = useRef<number>();
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const copy = useCallback(async (url: string, textEl: HTMLElement | null) => {
    if (await writeClipboard(url)) {
      setDone(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setDone(false), 2000);
      return;
    }
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ url });
        return;
      } catch {
        /* cancelled or blocked → select the text */
      }
    }
    selectText(textEl);
  }, []);
  return { done, copy };
}

/** `https://{tenant}.eduvo.uz/exams[/{code}]` — the current origin already carries the tenant. */
export const examsLink = (code?: string) =>
  `${typeof window === 'undefined' ? '' : window.location.origin}/exams${code ? `/${encodeURIComponent(code)}` : ''}`;
