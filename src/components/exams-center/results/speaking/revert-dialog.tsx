'use client';
/** "AI bahosiga qaytarilsinmi?" (spec §3.3, contract §7a): Cancel has focus · "Qaytarish" (line, red text). */
import { useRef } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useSpeakingRevert } from '@/lib/hooks/use-center-exams';
import { cn } from '@/lib/utils/cn';
import { PRESS, SH } from '../../tokens';
import { fill, ST } from './staff-texts';

export function RevertDialog({ id, aiBand, open, onClose, onDone }: { id: string; aiBand: number | null; open: boolean; onClose: () => void; onDone: () => void }) {
  const m = useSpeakingRevert(id);
  const cancel = useRef<HTMLButtonElement>(null);
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && !m.isPending) onClose(); }}>
      <DialogContent className="w-[440px]" onOpenAutoFocus={(e) => { e.preventDefault(); cancel.current?.focus(); }}>
        <DialogTitle className="text-[18px] font-extrabold text-foreground">{ST.revert_title}</DialogTitle>
        <p className="mt-2 text-[14px] leading-[1.55] text-[#5b6b82]">{fill(ST.revert_body, { band: aiBand != null ? aiBand.toFixed(1) : '—' })}</p>
        {m.isError ? <p role="alert" className="mt-3 rounded-[10px] bg-[#FFF1D6] px-3 py-2 text-[13px] font-semibold text-[#7A4E00]">{ST.override_failed}</p> : null}
        <div className="mt-5 flex justify-end gap-3">
          <button ref={cancel} type="button" onClick={onClose} disabled={m.isPending} className={cn('h-[42px] rounded-[13px] bg-background px-5 text-[13.5px] font-bold text-foreground', SH.btn, PRESS)}>{ST.cancel}</button>
          <button type="button" disabled={m.isPending} onClick={() => m.mutate(undefined, { onSuccess: () => { onDone(); onClose(); } })}
            className="h-[42px] rounded-[13px] border-[1.5px] border-[#D5DCE6] bg-transparent px-5 text-[13.5px] font-bold text-[#C23A4C] disabled:opacity-60">
            {m.isPending ? '…' : ST.revert_btn}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
