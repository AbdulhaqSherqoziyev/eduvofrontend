'use client';
/**
 * "Yozuvni o'chirish" (spec §2.2, M15): line button, red only in text + icon (never primary).
 * Enabled only when grading is READY (and the API allows it); otherwise disabled + "wait" note.
 * Confirm: title, ERP / B2C body, Cancel (default focus, Esc) · Delete (white, red border).
 * No optimistic update; failure stays inside the dialog. B2C: mock-site Modal, phone → BottomSheet.
 */
import { Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { BottomSheet } from '@/components/mock-site/bottom-sheet';
import { Modal } from '@/components/mock-site/modal';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Spin } from './AudioClip';
import { useSpeaking } from './context';

function usePhone() {
  const [p, setP] = useState(false);
  useEffect(() => { const m = window.matchMedia('(max-width: 519px)'); setP(m.matches); const f = () => setP(m.matches); m.addEventListener('change', f); return () => m.removeEventListener('change', f); }, []);
  return p;
}

export function DeleteAudio({ onDelete, onDone }: { onDelete: () => Promise<void>; onDone: () => void }) {
  const { skin: s, tx, sp, mode } = useSpeaking();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const cancel = useRef<HTMLButtonElement>(null);
  const phone = usePhone();
  const hasAudio = sp.items.some((i) => i.recording);
  if (!hasAudio) return null;
  const enabled = sp.status === 'ready' && sp.canDeleteRecordings;
  const until = sp.audioKeptUntil ? sp.audioKeptUntil.slice(0, 10) : null;
  const close = () => { if (!busy) { setOpen(false); setFailed(false); } };
  const confirm = async () => {
    setBusy(true); setFailed(false);
    try { await onDelete(); setOpen(false); onDone(); } catch { setFailed(true); } finally { setBusy(false); }
  };

  const body = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontSize: 14, color: s.sub, lineHeight: 1.55 }}>{tx(mode === 'b2c' ? 'results.delete_audio_body' : 'results.delete_audio_body_center')}</div>
      {failed && <div role="alert" style={{ fontSize: 13.5, color: s.sub, background: '#FFF1D6', borderRadius: 10, padding: '8px 12px' }}>{tx('results.delete_failed')}</div>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
        {!(mode === 'b2c' && phone) && <button ref={cancel} data-autofocus type="button" onClick={close} style={{ height: 42, padding: '0 18px', borderRadius: 12, border: '1.5px solid #D5DCE6', background: 'transparent', color: s.ink, fontWeight: 700, fontSize: 14, cursor: 'pointer', flex: phone ? 1 : undefined }}>{tx('chrome.cancel')}</button>}
        <button type="button" onClick={() => void confirm()} disabled={busy} style={{ height: 42, padding: '0 18px', borderRadius: 12, border: `1.5px solid ${s.danger}`, background: '#fff', color: s.danger, fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, flex: phone ? 1 : undefined }}>
          {busy && <Spin color={s.danger} />}{tx('results.delete_audio_confirm')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="sp-del" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', paddingTop: 6 }}>
      <button type="button" disabled={!enabled} onClick={() => setOpen(true)} className="print-hide sp-delbtn"
        style={{ height: 38, padding: '0 14px', borderRadius: 11, border: '1.5px solid #D5DCE6', background: 'transparent', color: s.danger, fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: enabled ? 'pointer' : 'not-allowed', opacity: enabled ? 1 : 0.5 }}>
        <Trash2 size={14} aria-hidden />{tx('results.delete_audio')}
      </button>
      <span style={{ fontSize: 12, color: s.muted }}>{enabled ? (until ? tx('results.audio_kept_until', { date: until }) : '') : tx('results.delete_audio_wait')}</span>
      {mode === 'b2c' ? (
        phone
          ? <BottomSheet open={open} title={tx('results.delete_audio_title')} onClose={close} doneLabel={tx('chrome.cancel')}>{body}</BottomSheet>
          : <Modal open={open} onClose={close} label={tx('results.delete_audio_title')}><div style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>{tx('results.delete_audio_title')}</div>{body}</Modal>
      ) : (
        <Dialog open={open} onOpenChange={(v) => { if (!v) close(); }}>
          <DialogContent className="w-[440px]" onOpenAutoFocus={(e) => { e.preventDefault(); cancel.current?.focus(); }}>
            <DialogTitle className="mb-3 text-[18px] font-extrabold text-foreground">{tx('results.delete_audio_title')}</DialogTitle>
            {body}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
