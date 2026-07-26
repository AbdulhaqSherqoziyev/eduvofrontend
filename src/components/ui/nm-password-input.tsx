'use client';

import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { NmInput } from './nm-input';
import type { InputProps } from './input';

/**
 * Password field with a reveal button.
 *
 * Portal logins are issued by the centre ("o123" + a short password) and typed
 * on a phone keyboard. Without a way to see what was typed, a wrong character
 * is indistinguishable from a wrong password, and the person concludes the
 * account is broken.
 */
export const NmPasswordInput = forwardRef<HTMLInputElement, Omit<InputProps, 'type'>>(({ className, ...props }, ref) => {
  const [shown, setShown] = useState(false);
  return (
    <div className="relative w-full">
      <NmInput ref={ref} type={shown ? 'text' : 'password'} className={`pr-[52px] ${className ?? ''}`} {...props} />
      <button
        type="button"
        onClick={() => setShown((v) => !v)}
        aria-label={shown ? 'Parolni yashirish' : "Parolni ko'rsatish"}
        aria-pressed={shown}
        className="absolute right-1 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-ctl text-muted hover:text-primary"
      >
        {shown ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
      </button>
    </div>
  );
});
NmPasswordInput.displayName = 'NmPasswordInput';
