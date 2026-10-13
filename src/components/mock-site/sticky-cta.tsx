/**
 * Phone sticky bottom CTA bar (Mobile App.dc.html): one primary (gradient) + optional soft secondary,
 * 54px buttons, radius 16, safe-area padding. Pages add `m-with-cta` to the content to keep it clear.
 */
import type { ReactNode } from 'react';

export interface CtaAction { label: ReactNode; href?: string; onClick?: () => void; disabled?: boolean; busy?: boolean; grow?: boolean }

function Btn({ a, soft }: { a: CtaAction; soft?: boolean }) {
  const cls = `m-cta__btn${soft ? ' m-cta__btn--soft' : ''}${soft && a.grow ? ' m-cta__btn--grow' : ''}`;
  const body = <>{a.busy && <span className="m-spin" aria-hidden />}{a.label}</>;
  if (a.href && !a.disabled) return <a className={cls} href={a.href}>{body}</a>;
  return <button type="button" className={cls} onClick={a.onClick} disabled={a.disabled || a.busy} aria-busy={a.busy || undefined}>{body}</button>;
}

export function StickyCta({ primary, secondary }: { primary?: CtaAction; secondary?: CtaAction }) {
  if (!primary && !secondary) return null;
  return (
    <div className="m-cta m-phone">
      {secondary && <Btn a={secondary} soft />}
      {primary && <Btn a={primary} />}
    </div>
  );
}
