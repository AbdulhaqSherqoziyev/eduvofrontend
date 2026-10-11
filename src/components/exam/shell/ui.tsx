'use client';
/** Player primitives — every colour is a `--x-*` token (design v2 §E, no hard-coded #fff). */
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import { forwardRef } from 'react';

type Variant = 'accent' | 'dark' | 'line' | 'link';

const base: CSSProperties = { borderRadius: 12, fontWeight: 700, fontSize: 14, padding: '0 18px', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 150ms, opacity 150ms' };
const variants: Record<Variant, CSSProperties> = {
  accent: { background: 'var(--x-accent)', color: '#fff', border: 'none', fontWeight: 800 },
  dark: { background: 'var(--x-dark-bg)', color: 'var(--x-dark-fg)', border: 'none', fontWeight: 800 },
  line: { background: 'transparent', color: 'var(--x-ink)', border: '1.5px solid var(--x-line)' },
  link: { background: 'transparent', color: 'var(--x-link)', border: 'none', padding: 0, height: 'auto' },
};

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant; h?: number; block?: boolean }

export const Btn = forwardRef<HTMLButtonElement, BtnProps>(function Btn({ variant = 'line', h = 40, block, style, disabled, ...rest }, ref) {
  const dis: CSSProperties = disabled ? (variant === 'accent' || variant === 'dark' ? { background: 'var(--x-disabled)', color: '#fff' } : { opacity: 0.45 }) : {};
  return <button ref={ref} type="button" disabled={disabled} style={{ ...base, height: h, ...variants[variant], ...(block ? { width: '100%' } : {}), ...dis, ...style }} {...rest} />;
});

/** Two-language message (T42): chosen language first, the other second, −2px, muted. */
export function Bi({ pair, size = 14, weight = 600, center, color }: { pair: [string, string]; size?: number; weight?: number; center?: boolean; color?: string }) {
  return (
    <span style={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: center ? 'center' : undefined, alignItems: center ? 'center' : undefined }}>
      <span style={{ fontSize: size, fontWeight: weight, color: color ?? 'inherit', lineHeight: 1.45 }}>{pair[0]}</span>
      <span style={{ fontSize: size - 2, fontWeight: 500, color: 'var(--x-muted)', lineHeight: 1.4 }}>{pair[1]}</span>
    </span>
  );
}

export function Card({ children, w, style, pad = 32, radius = 22 }: { children: ReactNode; w?: number; style?: CSSProperties; pad?: number; radius?: number }) {
  return (
    <div style={{ width: w, maxWidth: '100%', background: 'var(--x-panel)', border: '1px solid var(--x-line)', borderRadius: radius, padding: pad, display: 'flex', flexDirection: 'column', gap: 18, ...style }}>
      {children}
    </div>
  );
}

export function Spinner({ size = 16 }: { size?: number }) {
  return <span className="x-spin" aria-hidden style={{ width: size, height: size, borderRadius: '50%', border: '2px solid var(--x-line)', borderTopColor: 'var(--x-accent)', display: 'inline-block' }} />;
}

export function Caps({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1, color: 'var(--x-muted)', ...style }}>{children}</div>;
}

export function Centered({ children }: { children: ReactNode }) {
  return <div style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>{children}</div>;
}
