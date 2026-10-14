/**
 * Eduvo Mock brand (README "Header" / "Assets"): 32 px gradient rounded square with a white "e",
 * then the Eduvo·Mock wordmark (Mock in blue). The "e" is the Manrope 800 glyph as an SVG path, so
 * the mark looks the same before fonts load and in every script. Same artwork as public/brand/*.
 */
import Link from 'next/link';

const E_PATH = 'M642 -30Q476 -30 349.5 41.5Q223 113 151.5 238.5Q80 364 80 526Q80 703 150.0 834.0Q220 965 343.0 1037.5Q466 1110 626 1110Q796 1110 915.0 1030.0Q1034 950 1091.0 805.0Q1148 660 1131 464H862V564Q862 729 809.5 801.5Q757 874 638 874Q499 874 433.5 789.5Q368 705 368 540Q368 389 433.5 306.5Q499 224 626 224Q706 224 763.0 259.0Q820 294 850 360L1122 282Q1061 134 929.5 52.0Q798 -30 642 -30ZM284 464V666H1000V464Z';
const E_TRANSFORM = 'matrix(0.008500 0 0 -0.008500 10.8367 20.5900)';

/** The square mark. `size` in px; radius follows the design ratio (10/32). */
export function BrandMark({ size = 32, shadow = true, className = '' }: { size?: number; shadow?: boolean; className?: string }) {
  return (
    <span className={`m-logo__mark ${className}`} style={{ width: size, height: size, borderRadius: Math.round((size * 10) / 32), ...(shadow ? {} : { boxShadow: 'none' }) }} aria-hidden>
      <svg viewBox="0 0 32 32" width={size} height={size} focusable="false"><path fill="#fff" transform={E_TRANSFORM} d={E_PATH} /></svg>
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
