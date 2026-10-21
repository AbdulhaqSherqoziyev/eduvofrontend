'use client';
/** "Details" for the recording privacy line (spec §1.2, M15): who listens · where it goes · how long · deleting. Esc closes, Close has focus. */
import { useEffect } from 'react';
import { useT } from '@/lib/exam/engine/context';
import type { TextKey } from '@/lib/exam/i18n';
import { Btn } from '../../shell/ui';

export function PrivacyModal({ b2c, period, onClose }: { b2c: boolean; period: string; onClose: () => void }) {
  const { t } = useT();
  useEffect(() => {
    const on = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', on);
    return () => document.removeEventListener('keydown', on);
  }, [onClose]);
  const rows: [TextKey, TextKey][] = [
    ['speaking.privacy_who_t', b2c ? 'speaking.privacy_who_b_b2c' : 'speaking.privacy_who_b_center'],
    ['speaking.privacy_where_t', 'speaking.privacy_where_b'],
    ['speaking.privacy_keep_t', 'speaking.privacy_keep_b'],
    ['speaking.privacy_delete_t', 'speaking.privacy_delete_b'],
  ];
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'var(--x-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30, padding: 16 }}>
      <div role="dialog" aria-modal="true" aria-labelledby="sp-privacy-h" className="x-pop" onClick={(e) => e.stopPropagation()}
        style={{ width: 480, maxWidth: '100%', maxHeight: 'calc(100vh - 48px)', overflowY: 'auto', background: 'var(--x-panel)', border: '1px solid var(--x-line)', borderRadius: 20, padding: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div id="sp-privacy-h" style={{ fontSize: 20, fontWeight: 800 }}>{t('speaking.privacy_title')}</div>
        {rows.map(([h, b], i) => (
          <div key={h} style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: i ? 14 : 0, borderTop: i ? '1px solid var(--x-line)' : 'none' }}>
            <div style={{ fontSize: 14, fontWeight: 800 }}>{t(h)}</div>
            <div style={{ fontSize: 14, color: 'var(--x-sub)', lineHeight: 1.55 }}>{t(b, { period })}</div>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: b2c ? 'space-between' : 'flex-end', alignItems: 'center', gap: 12, marginTop: 4 }}>
          {b2c && <a href="/privacy#speaking" target="_blank" rel="noopener" style={{ fontSize: 13, fontWeight: 700, color: 'var(--x-link)' }}>{t('speaking.privacy_policy')}</a>}
          <Btn autoFocus onClick={onClose}>{t('chrome.close')}</Btn>
        </div>
      </div>
    </div>
  );
}
