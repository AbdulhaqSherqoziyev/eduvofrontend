/** Logo: gradient rounded square with "e" + Eduvo·Mock wordmark (README "Header"). */
import { sx } from '@/lib/mock/sx';

export function Logo({ href, label }: { href: string; label: string }) {
  return (
    <a className="m-logo" href={href} aria-label={label}>
      <span className="m-logo__mark" aria-hidden>e</span>
      <span className="m-logo__word" dir="ltr" aria-hidden>Eduvo<b>Mock</b></span>
    </a>
  );
}

/** 30px variant used in the footer (design: radius 9, font 16). */
export function FooterLogo({ href, label }: { href: string; label: string }) {
  return (
    <a className="m-logo" href={href} aria-label={label}>
      <span className="m-logo__mark" style={sx('width:30px;height:30px;border-radius:9px;font-size:16px;box-shadow:none')} aria-hidden>e</span>
      <span className="m-logo__word" dir="ltr" aria-hidden>Eduvo<b>Mock</b></span>
    </a>
  );
}
