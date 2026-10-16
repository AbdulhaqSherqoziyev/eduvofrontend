/**
 * Eduvo Mock brand: the real Eduvo mark — #3D7BF0 rounded square + white rounded diamond, the same
 * geometry as landing/favicon.svg and the ERP's components/layout/brand.tsx — then the Eduvo·Mock
 * wordmark (Mock in blue). Abdulhaq's call (10-16): replaces the design README's gradient "e" tile.
 * Same artwork as public/brand/* (scripts/gen-mock-brand.py).
 */
import Link from 'next/link';

export const BRAND_BLUE = '#3D7BF0';

/** The bare vector mark (64 grid). `bg`/`fg` swap only for the inverted use on a blue surface. */
export function MarkSvg({ size, bg = BRAND_BLUE, fg = '#fff' }: { size: number; bg?: string; fg?: string }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} focusable="false" aria-hidden style={{ display: 'block' }}>
      <rect width="64" height="64" rx="16" fill={bg} />
      <rect x="20" y="20" width="24" height="24" rx="7" transform="rotate(45 32 32)" fill={fg} />
    </svg>
  );
}

/** The square mark. `size` in px; radius follows the brand ratio (16/64). */
export function BrandMark({ size = 32, shadow = true, className = '' }: { size?: number; shadow?: boolean; className?: string }) {
  return (
    <span className={`m-logo__mark ${className}`} style={{ width: size, height: size, borderRadius: size / 4, ...(shadow ? {} : { boxShadow: 'none' }) }} aria-hidden>
      <MarkSvg size={size} />
    </span>
  );
}

export function Wordmark() {
  return <span className="m-logo__word" dir="ltr" aria-hidden>Eduvo<b>Mock</b></span>;
}

export function Logo({ href, label }: { href: string; label: string }) {
  return (
    <Link className="m-logo" href={href} aria-label={label}>
      <BrandMark />
      <Wordmark />
    </Link>
  );
}

/** 30px variant used in the footer (design: radius 9, font 16). */
export function FooterLogo({ href, label }: { href: string; label: string }) {
  return (
    <Link className="m-logo" href={href} aria-label={label}>
      <BrandMark size={30} shadow={false} />
      <Wordmark />
    </Link>
  );
}
