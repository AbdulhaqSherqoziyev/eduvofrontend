'use client';
/**
 * B2C parts of the player top bar (Player.dc.html; README §7 "add only the B2C parts"):
 * the Eduvo Mock logo (left) and, on the right, the instruction-language select and Help.
 * Rendered by the shared TopBar through ExamHost, inside the player's ExamContext; styled with the
 * player's own tokens so the three player themes keep working.
 */
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useExam } from '@/lib/exam/engine/context';
import type { Locale } from '@/lib/exam/i18n';
import { RichLine } from '@/components/mock-site/legal/rich-line';
import { useLang } from '@/lib/mock/hooks/use-lang';

const ctl = { height: 36, borderRadius: 9, border: '1.5px solid var(--x-line)', background: 'transparent', color: 'var(--x-ink)', fontSize: 12.5, fontWeight: 700 } as const;

/** Instruction languages the player has copy for. Russian needs a `ru` column in lib/exam/i18n first. */
const INSTR: Array<{ v: Locale; label: string }> = [
  { v: 'en', label: 'Instructions: English' },
  { v: 'uz', label: 'Ko‘rsatmalar: O‘zbekcha' },
];

export function MockPlayerBrand() {
  return (
    <>
      <span dir="ltr" style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 15, flex: 'none' }} aria-label="Eduvo Mock">
        <span aria-hidden style={{ width: 26, height: 26, borderRadius: 8, background: 'linear-gradient(135deg,#5B8DEF,#2E6BE6)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 13 }}>e</span>
        <span aria-hidden>Eduvo<span style={{ color: 'var(--x-accent)', marginInlineStart: 4 }}>Mock</span></span>
      </span>
      <span aria-hidden style={{ width: 1, height: 24, background: 'var(--x-line)', flex: 'none' }} />
    </>
  );
}

export function MockPlayerTools() {
  const t = useTranslations('player.help');
  const { lang } = useLang();
  const { s, setUi } = useExam();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const code = s.attempt?.candidate?.code;
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', close); };
  }, [open]);
  return (
    <>
      <select value={s.ui.locale} onChange={(e) => setUi({ locale: e.target.value as Locale })} title={t('instrLang')} aria-label={t('instrLang')} style={{ ...ctl, padding: '0 8px', cursor: 'pointer' }}>
        {INSTR.map((o) => <option key={o.v} value={o.v}>{o.label}</option>)}
      </select>
      <div ref={ref} style={{ position: 'relative' }}>
        <button type="button" style={{ ...ctl, padding: '0 12px' }} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen((o) => !o)}>{t('button')}</button>
        {open && (
          <div role="dialog" aria-label={t('title')} className="x-pop" style={{ position: 'absolute', right: 0, top: 44, width: 340, background: 'var(--x-panel)', border: '1px solid var(--x-pop-border)', boxShadow: 'var(--x-pop-shadow)', borderRadius: 20, padding: 20, zIndex: 40, display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14, lineHeight: 1.55 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800 }}>
              {t('title')}
              <button type="button" onClick={() => setOpen(false)} style={{ border: 0, background: 'transparent', color: 'var(--x-sub)', fontWeight: 700, cursor: 'pointer' }}>{t('close')}</button>
            </div>
            <div style={{ color: 'var(--x-sub)' }}>{t('nav')}</div>
            <div style={{ color: 'var(--x-sub)' }}><RichLine text={code ? t('tech', { id: code }) : t('techNoId')} lang={lang} /></div>
          </div>
        )}
      </div>
    </>
  );
}
