'use client';
/** Note editor (design G4): 260px card, 3-row serif textarea, Save · Delete, autosave on blur. */
import { useEffect, useRef, useState } from 'react';
import { useT } from '@/lib/exam/engine/context';

export function NoteCard({ initial, onSave, onDelete, onClose }: { initial: string; onSave: (v: string) => void; onDelete: () => void; onClose: () => void }) {
  const { t } = useT();
  const [v, setV] = useState(initial);
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  const save = () => { onSave(v.trim()); onClose(); };
  return (
    <div onMouseUp={(e) => e.stopPropagation()}
      style={{ display: 'block', width: 260, margin: '8px 0', background: 'var(--x-panel)', border: '1px solid var(--x-line)', borderRadius: 12, padding: 12, boxShadow: 'var(--x-menu-shadow)', userSelect: 'none' }}>
      <textarea ref={ref} rows={3} value={v} onChange={(e) => setV(e.target.value)} onBlur={() => onSave(v.trim())} placeholder={t('x.note_ph')}
        onKeyDown={(e) => { if (e.key === 'Escape') save(); }}
        style={{ width: '100%', resize: 'none', border: '1px solid var(--x-line)', borderRadius: 8, padding: 8, fontFamily: 'var(--x-serif)', fontSize: 14, background: 'var(--x-field)', color: 'var(--x-ink)', userSelect: 'text' }} />
      <span style={{ display: 'flex', gap: 14, marginTop: 6 }}>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={save} style={{ background: 'none', border: 'none', padding: 0, fontSize: 13, fontWeight: 700, color: 'var(--x-link)' }}>{t('x.note_save')}</button>
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { onDelete(); onClose(); }} style={{ background: 'none', border: 'none', padding: 0, fontSize: 13, fontWeight: 700, color: 'var(--x-sub)' }}>{t('x.note_delete')}</button>
      </span>
    </div>
  );
}
