'use client';
/**
 * "Speaking ballini o'zgartirish" (spec §3.3, contract §7): 4 criterion steppers (0–9, whole),
 * AI value beside each, live new band (IELTS rounding), required note 10–500 chars, reasons when
 * Save is disabled. Not optimistic: spinner, success → close + toast; failure stays in the dialog.
 */
import { Info, Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { CRITERION_KEYS, ieltsBand, type SpeakingCriterionKey, type SpeakingResult } from '@/lib/exam/speaking-types';
import { useSpeakingOverride } from '@/lib/hooks/use-center-exams';
import { cn } from '@/lib/utils/cn';
import { SH } from '../../tokens';
import { PrimaryButton, SoftButton } from '../../ui';
import { fill, ST } from './staff-texts';

const NAME: Record<SpeakingCriterionKey, string> = {
  fluency_coherence: 'Fluency & Coherence', lexical_resource: 'Lexical Resource',
  grammatical_range_accuracy: 'Grammatical Range & Accuracy', pronunciation: 'Pronunciation',
};

export function OverrideDialog({ id, sp, who, open, onClose, onSaved }: { id: string; sp: SpeakingResult; who: string; open: boolean; onClose: () => void; onSaved: () => void }) {
  const ai = Object.fromEntries((sp.review?.aiCriteria ?? []).map((c) => [c.key, c.band])) as Partial<Record<SpeakingCriterionKey, number>>;
  const cur = Object.fromEntries((sp.criteria ?? []).map((c) => [c.key, c.band])) as Partial<Record<SpeakingCriterionKey, number>>;
  const start = Object.fromEntries(CRITERION_KEYS.map((k) => [k, cur[k] ?? ai[k] ?? null])) as Record<SpeakingCriterionKey, number | null>;
  const [v, setV] = useState(start);
  const [note, setNote] = useState('');
  const m = useSpeakingOverride(id);
  const aiBand = sp.review?.aiBand ?? null;
  const filled = CRITERION_KEYS.every((k) => v[k] != null);
  const changed = CRITERION_KEYS.some((k) => v[k] !== start[k]);
  const band = filled ? ieltsBand(CRITERION_KEYS.map((k) => v[k]!)) : null;
  const okNote = note.trim().length >= 10 && note.length <= 500;
  const reason = !filled || !changed ? ST.override_need_change : !okNote ? ST.override_need_comment : null;
  const step = (k: SpeakingCriterionKey, d: number) => setV((o) => ({ ...o, [k]: Math.max(0, Math.min(9, (o[k] ?? (d > 0 ? -1 : 10)) + d)) }));
  const save = () => {
    if (reason || m.isPending) return;
    m.mutate({ criteria: Object.fromEntries(CRITERION_KEYS.map((k) => [k, v[k]!])) as Record<SpeakingCriterionKey, number>, note: note.trim() }, { onSuccess: () => { onSaved(); onClose(); } });
  };
  const sq = cn('flex size-9 items-center justify-center rounded-[11px] bg-background text-foreground disabled:opacity-40', SH.btn);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && !m.isPending) onClose(); }}>
      <DialogContent className="max-md:inset-0 max-md:h-full max-md:max-h-none max-md:w-full max-md:max-w-none max-md:translate-x-0 max-md:translate-y-0 max-md:rounded-none">
        <DialogTitle className="text-[18px] font-extrabold text-foreground">{ST.override_title}</DialogTitle>
        <p className="mt-1 text-[13px] font-medium text-muted">{who} · {aiBand != null ? fill(ST.override_sub_ai, { band: aiBand.toFixed(1) }) : ST.override_sub_none}</p>
        <div className="mt-4 flex flex-col gap-2">
          {CRITERION_KEYS.map((k) => (
            <div key={k} className={cn('grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 rounded-[12px] px-3 py-2', v[k] !== start[k] && 'bg-[#EEF4FF] dark:bg-white/5')}>
              <span className="text-[14px] font-bold text-foreground" lang="en">{NAME[k]}</span>
              <span className="text-[13px] text-muted">AI: {ai[k] ?? '—'}</span>
              <span className="flex items-center gap-2">
                <button type="button" className={sq} aria-label={`${NAME[k]} −`} disabled={v[k] === 0} onClick={() => step(k, -1)}><Minus className="size-4" aria-hidden /></button>
                <span className={cn('w-9 rounded-[10px] py-1.5 text-center text-[15px] font-extrabold tabular-nums', SH.inset)} aria-live="polite">{v[k] ?? ''}</span>
                <button type="button" className={sq} aria-label={`${NAME[k]} +`} disabled={v[k] === 9} onClick={() => step(k, 1)}><Plus className="size-4" aria-hidden /></button>
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 text-[16px] font-extrabold text-foreground">
          {band != null ? fill(ST.override_new_band, { band: band.toFixed(1) }) : null}
          {band != null && aiBand != null && band === aiBand ? <span className="ml-2 text-[13px] font-semibold text-muted">{ST.override_same}</span> : null}
        </div>
        <label className="mt-4 block text-[13px] font-bold text-foreground" htmlFor="sp-ov-note">{ST.override_comment_label}</label>
        <textarea id="sp-ov-note" value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} placeholder={ST.override_comment_ph}
          className={cn('mt-1.5 h-[110px] w-full resize-none rounded-[14px] bg-background p-3 text-[14px] text-foreground outline-none', SH.inset)} />
        <div className="mt-1 text-right text-[12px] tabular-nums text-muted">{note.length} / 500</div>
        <p className="mt-2 flex gap-1.5 text-[12.5px] text-muted"><Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />{ST.override_note}</p>
        {m.isError ? <p role="alert" className="mt-3 rounded-[10px] bg-[#FFF1D6] px-3 py-2 text-[13px] font-semibold text-[#7A4E00]">{ST.override_failed}</p> : null}
        <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
          {reason ? <span className="mr-auto text-[12px] text-muted">{reason}</span> : null}
          <SoftButton className="px-5 font-bold text-foreground" disabled={m.isPending} onClick={onClose}>{ST.cancel}</SoftButton>
          <PrimaryButton disabled={!!reason || m.isPending} onClick={save}>{m.isPending ? '…' : ST.save}</PrimaryButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
