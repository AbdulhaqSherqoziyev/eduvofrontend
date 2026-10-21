'use client';
/**
 * Staff answers table (spec §3.2): Qism·№ | question (1 line, full in title) | "0:24 / 0:30" |
 * AudioClip (240px) | "Matn ▾". No answer → "0:00" + italic "Javob berilmagan". Restarted item →
 * grey chip + a second small "Uzilishgacha" clip (staff only). Transcript opens under the row.
 * <768 px: one card per question. Print: clips hidden, transcripts open.
 */
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { AudioClip } from '@/components/exam/results/speaking/AudioClip';
import type { SpeakingResult, SpeakingResultItem } from '@/lib/exam/speaking-types';
import { mmss } from '@/components/exam/results/speaking/skin';
import { SH } from '../../tokens';
import { ST } from './staff-texts';

function Row({ it, no }: { it: SpeakingResultItem; no: number }) {
  const [open, setOpen] = useState(false);
  const dur = it.durationMs != null ? it.durationMs / 1000 : 0;
  return (
    <div className="border-t border-[#E6EAF0] py-2.5 dark:border-white/10">
      <div className="grid grid-cols-[56px_minmax(0,1fr)_92px_240px_64px] items-center gap-3 max-md:grid-cols-[1fr_auto] max-md:gap-2">
        <span className="text-[12px] font-extrabold text-muted">P{it.part}·{no}</span>
        <span className="truncate text-[13.5px] font-semibold text-foreground max-md:col-span-2 max-md:row-start-2 max-md:whitespace-normal" title={it.question} lang="en">
          {it.question}
          {it.restarted ? <span className="ml-2 rounded-[6px] bg-[#EEF1F5] px-1.5 py-0.5 text-[11px] font-bold text-[#5b6b82]">{ST.restarted_chip}</span> : null}
        </span>
        <span className="text-[12.5px] tabular-nums text-[#5b6b82] max-md:col-start-2 max-md:row-start-1">{mmss(dur)}{it.responseSec ? ` / ${mmss(it.responseSec)}` : ''}</span>
        <div className="min-w-0 max-md:col-span-2">
          {it.noResponse ? <span className="text-[12.5px] italic text-muted">{ST.no_answer}</span>
            : it.recording ? <AudioClip url={it.recording.url} durationMs={it.durationMs} /> : null}
          {it.backupRecording ? (
            <div className="mt-1 flex items-center gap-2"><span className="shrink-0 text-[11px] font-bold text-muted">{ST.before_cut}</span><AudioClip url={it.backupRecording.url} durationMs={null} /></div>
          ) : null}
        </div>
        {it.transcript ? (
          <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="print-hide inline-flex items-center gap-1 text-[13px] font-bold text-primary max-md:col-span-2 max-md:h-11">
            {ST.text_toggle}<ChevronDown className={`size-3.5 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
          </button>
        ) : <span />}
      </div>
      {it.transcript ? (
        <div className={`${open ? '' : 'hidden print:block'} mt-2 whitespace-pre-line rounded-[14px] p-3.5 text-[15px] leading-[1.75] text-foreground ${SH.well}`} lang="en" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
          {it.transcript}
        </div>
      ) : null}
    </div>
  );
}

export function StaffAnswers({ sp }: { sp: SpeakingResult }) {
  if (!sp.items.length) return null;
  const counter: Record<number, number> = {};
  return (
    <div className="flex flex-col">
      <div className="pb-1 text-[10.5px] font-bold tracking-[0.8px] text-[#9aa6b8]">{ST.answers}</div>
      {sp.items.map((it) => { counter[it.part] = (counter[it.part] ?? 0) + 1; return <Row key={it.itemKey} it={it} no={counter[it.part]} />; })}
    </div>
  );
}
