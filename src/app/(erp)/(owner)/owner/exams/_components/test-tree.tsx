'use client';

import { useState } from 'react';
import type { BankPart, BankTest } from '@/lib/api/owner-exams';
import { AudioPlayer } from './audio-player';
import { QuestionRow } from './question-row';

const text = (html: string) => html.replace(/<\/p>/g, '\n\n').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').trim();

function PartBlock({ testId, p }: { testId: string; p: BankPart }) {
  const [passage, setPassage] = useState(false);
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="text-[14px] font-extrabold">{p.title ?? `Qism ${p.part}`}</div>
        {p.passageHtml && <button type="button" className="text-[12px] font-bold text-primary" onClick={() => setPassage((v) => !v)}>{passage ? 'Matnni yopish' : 'Matnni ko\'rish'}</button>}
      </div>
      {p.instructions && <div className="text-[12.5px] text-muted">{p.instructions}</div>}
      {p.audioAssetId && <AudioPlayer assetId={p.audioAssetId} durationMs={p.audioDurationMs} />}
      {passage && p.passageHtml && <div className="whitespace-pre-line rounded-[14px] p-4 font-serif text-[14px] leading-[1.7] shadow-nm-inset-sm">{text(p.passageHtml)}</div>}
      {p.groups.map((g) => (
        <div key={g.id} className="flex flex-col gap-1.5">
          {(g.instructions || g.layout) && <div className="text-[12px] font-semibold text-[#5b6b82]">{g.instructions}{g.layout ? <span className="text-[#9aa6b8]"> · {g.layout}{g.multiGroup ? ' · bir nechta javob' : ''}</span> : null}</div>}
          {g.questions.map((q) => <QuestionRow key={q.id} testId={testId} q={q} />)}
        </div>
      ))}
    </div>
  );
}

/** Test tree: section → part → questions (keys inline-editable). Writing/speaking prompts come from stage meta. */
export function TestTree({ test }: { test: BankTest }) {
  return (
    <div className="flex flex-col gap-4">
      {test.stages.map((s) => {
        const tasks = (s.meta as { tasks?: { key: string; prompt?: string; minWords?: number }[] } | null)?.tasks ?? [];
        return (
          <div key={s.id} className="flex flex-col gap-4 rounded-[24px] bg-background p-6 shadow-nm">
            <div className="text-[16px] font-extrabold capitalize">{s.sectionKey}{s.variantKey ? <span className="ml-2 text-[12px] font-bold text-muted">variant: {s.variantKey}</span> : null}</div>
            {s.parts.map((p) => <PartBlock key={p.id} testId={test.id} p={p} />)}
            {tasks.map((t) => <div key={t.key} className="rounded-[14px] p-3.5 text-[13px] shadow-nm-inset-sm"><b>{t.key}</b>{t.minWords ? ` · kamida ${t.minWords} so'z` : ''} — {t.prompt}</div>)}
            {!s.parts.length && !tasks.length && <div className="text-[12.5px] text-muted">Bu bo&apos;limda ob&apos;ektiv savol yo&apos;q (AI baholanadi).</div>}
          </div>
        );
      })}
    </div>
  );
}
