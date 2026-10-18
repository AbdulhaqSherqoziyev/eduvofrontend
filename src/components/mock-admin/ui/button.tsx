/** Buttons (Admin Components.dc.html · TUGMALAR). Heights match the screens: 50 / 44 / 42 / 40 / 38 / 36 / 32. */
import Link from 'next/link';
import { forwardRef } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'danger-solid' | 'text';
export type ButtonSize = 50 | 44 | 42 | 40 | 38 | 36 | 32;

const cls = (variant: ButtonVariant, size: ButtonSize, full?: boolean, extra?: string) =>
  ['ma-btn', `v-${variant}`, size !== 44 && `s-${size}`, full && 'w-full', extra].filter(Boolean).join(' ');

type Common = { variant?: ButtonVariant; size?: ButtonSize; full?: boolean };

export const Button = forwardRef<HTMLButtonElement, Common & React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }>(
  function Button({ variant = 'primary', size = 44, full, loading, className, disabled, type = 'button', children, ...rest }, ref) {
    return (
      <button ref={ref} type={type} className={cls(variant, size, full, className)} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
        {children}
      </button>
    );
  },
);

/** A link that looks like a button (secondary by default). */
export function ButtonLink({ variant = 'secondary', size = 40, full, className, ...rest }: Common & React.ComponentProps<typeof Link>) {
  return <Link className={cls(variant, size, full, className)} {...rest} />;
}

/** Square icon button: raised (✕) or pressed/on (●). Sizes 40 (default), 36 (drawer close), 28. */
export const IconButton = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { on?: boolean; size?: 40 | 36 | 28; label: string }>(
  function IconButton({ on, size = 40, label, className, type = 'button', ...rest }, ref) {
    const c = ['ma-icon-btn', on && 'is-on', size !== 40 && `s-${size}`, className].filter(Boolean).join(' ');
    return <button ref={ref} type={type} className={c} aria-label={label} title={label} aria-pressed={on === undefined ? undefined : on} {...rest} />;
  },
);
