'use client';
/** Footer "+N more": opens the header language menu (desktop) — the footer is hidden on phones. */
import { OPEN_LANG_EVENT } from './language-menu';

export function FooterMoreLangs({ label }: { label: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_LANG_EVENT))}
      style={{ border: 0, background: 'transparent', padding: 0, cursor: 'pointer', color: 'var(--blue)', fontWeight: 700, font: 'inherit', fontSize: 'inherit' }}>{label}</button>
  );
}
