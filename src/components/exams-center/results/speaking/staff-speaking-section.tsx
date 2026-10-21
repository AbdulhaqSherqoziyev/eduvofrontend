'use client';
/**
 * Staff Speaking section (speaking-design.md §3): head (band, AI chip, teacher chip with name/time,
 * time used) + "Ballni o'zgartirish" (only `review.canOverride`; disabled while grading), NEEDS_HUMAN
 * banner, AI detail (passes, flags, "Baholash: AI (audio) · n javob"), the student's view (panel,
 * without "unfair" / delete), answers table, retention line, change history + "AI bahosiga qaytarish".
 */
import { AlertTriangle, Clock, Pencil, UserCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SpeakingResultPanel } from '@/components/exam/results/speaking/SpeakingResultPanel';
import { t } from '@/lib/exam/i18n';
import type { SpeakingResult } from '@/lib/exam/speaking-types';
import { SH } from '../../tokens';
import { Card, SoftButton } from '../../ui';
import { durationText, type StageTime } from '../staff-result';
import { OverrideDialog } from './override-dialog';
import { RevertDialog } from './revert-dialog';
import { StaffAnswers } from './staff-answers';
import { dmhm, dmy, fill, FLAG, ST } from './staff-texts';

const GRADING = ['received', 'transcribing', 'scoring'];

export function SpeakingStaffSection({ id, sp, who, time }: { id: string; sp: SpeakingResult; who: string; time?: StageTime }) {
  const [dlg, setDlg] = useState<'override' | 'revert' | null>(null);
  const [toast, setToast] = useState('');
  useEffect(() => { if (!toast) return; const x = window.setTimeout(() => setToast(''), 3000); return () => window.clearTimeout(x); }, [toast]);
  const rv = sp.review;
  const grading = GRADING.includes(sp.status);
  const canOverride = !!rv?.canOverride;
  const restarted = sp.items.filter((i) => i.restarted).length;
  const flags = [...(rv?.flags ?? []).map((f) => FLAG[f] ?? f), ...(restarted ? [fill(ST.flag_restarted, { n: restarted })] : [])];
  const keep = sp.recordingsDeletedAt
    ? fill(sp.recordingsDeleteReason === 'retention' ? ST.audio_expired : ST.audio_deleted_by_student, { date: dmy(sp.recordingsDeletedAt) })
    : sp.audioKeptUntil ? fill(ST.audio_until, { date: dmy(sp.audioKeptUntil) }) : null;

  return (
    <Card className="print-card flex scroll-mt-4 flex-col gap-4 p-6 max-md:p-4">
      <div id="sec-speaking" />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2.5">
          {sp.teacherReviewed ? (
            <span className="inline-flex items-center gap-1 rounded-[7px] bg-[#E5F5EE] px-2 py-0.5 text-[10.5px] font-extrabold text-[#1F7A55]">
              <UserCheck className="size-3" aria-hidden />{t('results.teacher_checked', 'uz')}{rv?.reviewedBy ? ` · ${rv.reviewedBy.fullName}` : ''}{rv?.reviewedAt ? ` · ${dmhm(rv.reviewedAt)}` : ''}
            </span>
          ) : null}
          {sp.status === 'pending' ? <span className="text-[13px] font-semibold text-muted">{fill(ST.not_taken_until, { date: sp.availableUntil ? dmy(sp.availableUntil) : '—' })}</span> : null}
          {sp.status === 'no_response' || sp.status === 'too_short' ? <span className="text-[13px] font-semibold text-muted">{sp.status === 'no_response' ? ST.no_response : ST.too_short}</span> : null}
          {time?.usedSec != null ? <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-muted"><Clock className="size-3.5" aria-hidden />{durationText(time.usedSec)}</span> : null}
        </div>
        {canOverride || grading ? (
          <SoftButton className="print-hide inline-flex h-9 items-center gap-2 px-3.5 text-[13px] font-bold text-foreground" disabled={grading || !canOverride} title={grading ? ST.override_wait : undefined} onClick={() => setDlg('override')}>
            <Pencil className="size-3.5" aria-hidden />{ST.override_btn}
          </SoftButton>
        ) : null}
      </div>
      {sp.status === 'needs_review' ? (
        <div className="flex flex-wrap items-center gap-3 rounded-[12px] bg-[#FFF1D6] px-4 py-3 text-[13.5px] font-semibold text-[#7A4E00]">
          <AlertTriangle className="size-4 shrink-0" aria-hidden /><span className="min-w-0 flex-1">{ST.needs_human}</span>
          {canOverride ? <SoftButton className="print-hide h-9 px-3.5 text-[13px] font-bold text-primary" onClick={() => setDlg('override')}>{ST.grade_btn}</SoftButton> : null}
        </div>
      ) : null}
      {rv && !grading && sp.status !== 'pending' ? (
        <div className={`flex flex-col gap-1.5 rounded-[14px] p-3.5 text-[13px] text-foreground ${SH.well}`}>
          <div className="text-[10.5px] font-bold tracking-[0.8px] text-[#9aa6b8]">{ST.ai_detail}</div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {rv.passes.map((p, i) => <span key={i} className="tabular-nums">{fill(ST.pass_n, { n: i + 1 })} {p.toFixed(1)}</span>)}
            {flags.length ? <span className="text-muted">{ST.flags}</span> : null}
            {flags.map((f) => <span key={f} className="rounded-[7px] bg-[#FFF1D6] px-2 py-0.5 text-[12px] font-bold text-[#7A4E00]">{f}</span>)}
          </div>
          <div className="text-muted">{fill(ST.grading_line, { n: sp.answeredCount })}</div>
        </div>
      ) : null}
      <SpeakingResultPanel sp={sp} skin="hub" mode="staff" tx={(k, v) => t(k, 'uz', v)} hideRecordings />
      {sp.status !== 'pending' ? <StaffAnswers sp={sp} /> : null}
      {keep ? <div className="flex items-center gap-1.5 text-[12.5px] text-muted"><Clock className="size-3.5" aria-hidden />{keep}</div> : null}
      {rv?.history.length ? (
        <div className="flex flex-col gap-1.5">
          <div className="text-[10.5px] font-bold tracking-[0.8px] text-[#9aa6b8]">{ST.history}</div>
          {rv.history.map((h, i) => (
            <div key={i} className={`rounded-[12px] px-3 py-2 text-[13px] text-foreground ${SH.row}`}>
              <span className="font-bold tabular-nums text-[#5b6b82]">{dmhm(h.at)}</span>{h.by ? ` · ${h.by.fullName}` : ''}: {h.from != null ? h.from.toFixed(1) : '—'} → {h.to != null ? h.to.toFixed(1) : '—'}
              {h.note ? <span className="italic text-[#5b6b82]"> · “{h.note}”</span> : null}
            </div>
          ))}
          {sp.teacherReviewed && canOverride ? <button type="button" className="print-hide self-start text-[13px] font-bold text-[#C23A4C]" onClick={() => setDlg('revert')}>{ST.revert}</button> : null}
        </div>
      ) : null}
      {dlg === 'override' ? <OverrideDialog id={id} sp={sp} who={who} open onClose={() => setDlg(null)} onSaved={() => setToast(ST.override_saved)} /> : null}
      {dlg === 'revert' ? <RevertDialog id={id} aiBand={rv?.aiBand ?? null} open onClose={() => setDlg(null)} onDone={() => undefined} /> : null}
      <div role="status" aria-live="polite">{toast ? <div className="fixed bottom-6 left-1/2 z-[120] -translate-x-1/2 rounded-[12px] bg-[#1E2A3A] px-4 py-2.5 text-[14px] font-bold text-white">{toast}</div> : null}</div>
    </Card>
  );
}
