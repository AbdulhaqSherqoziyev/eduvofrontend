/**
 * Page/section state blocks, from the screens:
 *  - error (Dashboard: raised card, "!" tile, retry) and `flat` error (Orders: paper, no tile)
 *  - empty (Orders: paper, "∅" tile; `icon={false}` for Learners/Attempts)
 *  - notFound (Learner Profile: "404", back link)
 *  - forbidden (Settings, Operator: lock tile, "Bosh sahifaga")
 *  - InlineEmpty (Dashboard pending list: "Hammasi tasdiqlangan")
 * Texts are passed in: each screen has its own (spec), so none are invented here.
 */
import Link from 'next/link';
import { Button } from './button';

export function ErrorState({ title, text, onRetry, flat, retrying }: {
  title: string; text?: string; onRetry?: () => void; flat?: boolean; retrying?: boolean;
}) {
  return (
    <div className={`ma-state k-error${flat ? ' is-flat' : ''}`} role="alert">
      {!flat && <div className="ma-state-ico-err" aria-hidden="true">!</div>}
      <div className="ma-state-title">{title}</div>
      {text && <div className="ma-state-text">{text}</div>}
      {onRetry && <Button size={flat ? 40 : 42} onClick={onRetry} loading={retrying}>Qayta urinish</Button>}
    </div>
  );
}

export function EmptyState({ title, text, icon = true }: { title: string; text?: string; icon?: boolean }) {
  return (
    <div className="ma-state k-empty">
      {icon && <div className="ma-state-ico-empty" aria-hidden="true">∅</div>}
      <b className="ma-state-title">{title}</b>
      {text && <span className="ma-state-text">{text}</span>}
    </div>
  );
}

export function NotFoundState({ title, text, backHref, backLabel }: { title: string; text?: string; backHref: string; backLabel: string }) {
  return (
    <div className="ma-state k-notfound">
      <span className="ma-state-code">404</span>
      <b className="ma-state-title">{title}</b>
      {text && <span className="ma-state-text">{text}</span>}
      <Link href={backHref} className="ma-state-link">{backLabel}</Link>
    </div>
  );
}

export function ForbiddenState({ text, title = "Ruxsat yo'q" }: { text: string; title?: string }) {
  return (
    <div className="ma-state k-forbidden">
      <div className="ma-state-ico-lock" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 11h12v10H6zM8 11V7a4 4 0 018 0v4" /></svg>
      </div>
      <b className="ma-state-title">{title}</b>
      <span className="ma-state-text">{text}</span>
      <Link href="/" className="ma-state-link">Bosh sahifaga</Link>
    </div>
  );
}

export function InlineEmpty({ title, text }: { title: string; text?: string }) {
  return (
    <div className="ma-state-inline">
      <b>{title}</b>
      {text && <span>{text}</span>}
    </div>
  );
}
