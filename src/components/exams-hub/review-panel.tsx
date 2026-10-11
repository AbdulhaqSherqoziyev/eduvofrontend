'use client';
/** Objective section detail (§4): fractions only, "Mashq uchun" block, filters, two-column review. */
import { Target } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { PassageModal } from '@/components/exam/results/PassageModal';
import { NmButton } from '@/components/ui/nm-button';
import { NmCard } from '@/components/ui/nm-card';
import { NmSegmented } from '@/components/ui/nm-segmented';
import { typeLabel, weakTypes } from '@/lib/exam/hub-derive';
import { ht } from '@/lib/exam/i18n/hub';
import type { ResultResp, ResultSection } from '@/lib/exam/types';
import { ReviewRow } from './review-row';

type Filter = 'all' | 'review' | 'blank';
const blank = (v: unknown) => v == null || v === '' || (Array.isArray(v) && !v.length);

export function ReviewPanel({ r, s }: { r: ResultResp; s: ResultSection }) {
  const router = useRouter();
  const params = useSearchParams();
  const type = params.get('type');
  const [filter, setFilter] = useState<Filter>('all');
  const [anchor, setAnchor] = useState<string | null>(null);
  // SAT: `no` restarts in each module (1–27 / 1–22, contract §1b). With `stageKey` (contract v1.4) the row reads
  // "M1·4" / "M2·17" (rowNo); only an old result without it falls back to numbering by position (1–54 / 1–44).
  const sat = r.examCode.startsWith('SAT');
  const rows = r.review.filter((x) => x.sectionKey === s.key).map((x, i) => (sat && !x.stageKey ? { ...x, no: i + 1 } : x));
  const setType = (t: string | null) => {
    const q = new URLSearchParams(params.toString());
    if (t) q.set('type', t);
    else q.delete('type');
    router.replace(`?${q.toString()}`, { scroll: false });
  };

  if (!rows.length) {
    return <NmCard className="p-6 text-[14px] font-medium text-[#5b6b82]">{ht('x.review_later')}</NmCard>;
  }
  const wrong = rows.filter((x) => !x.isCorrect);
  const blanks = rows.filter((x) => blank(x.yours));
  const base = filter === 'review' ? wrong : filter === 'blank' ? blanks : rows;
  const list = type ? base.filter((x) => x.type === type) : base;
  const weak = weakTypes(rows, 3, 3);
  const half = Math.ceil(list.length / 2);
  const passages = r.passages?.length ? setAnchor : undefined;

  return (
    <NmCard className="flex flex-col gap-4 rounded-[24px] p-6 max-md:p-4">
      <div>
        <h2 className="text-[15px] font-extrabold text-foreground">{ht('hubx.review_title')}</h2>
        <div className="mt-0.5 text-[13px] font-semibold text-muted">{ht('hubx.n_of_total', { n: rows.length - wrong.length, total: rows.length })}</div>
      </div>
      {weak.length ? (
        <div className="flex flex-col gap-2 rounded-[16px] p-3.5 shadow-nm-inset-sm">
          <div className="text-[13px] font-extrabold text-foreground">{ht('hubx.practice_title')}</div>
          {weak.map((w) => (
            <div key={w.type} className="flex flex-wrap items-center gap-2 text-[13px] font-semibold text-[#5b6b82]">
              <Target className="size-3.5 shrink-0" aria-hidden />
              <span className="min-w-0 flex-1">{ht(w.correct ? 'hubx.type_line' : 'hubx.type_zero', { type: typeLabel(w.type), n: w.correct, total: w.total })}</span>
              <NmButton variant="ghost" size="sm" className="h-8" onClick={() => setType(type === w.type ? null : w.type)}>{ht('hub.weak_type_review')}</NmButton>
            </div>
          ))}
        </div>
      ) : null}
      <div className="-mx-1 overflow-x-auto px-1 py-1">
        <NmSegmented
          size="sm"
          className="min-w-[420px] md:w-[460px]"
          value={filter}
          onValueChange={(v) => { setFilter(v as Filter); if (v === 'all') setType(null); }}
          items={[
            { value: 'all', label: ht('hubx.f_all') },
            { value: 'review', label: ht('hubx.f_review', { n: wrong.length }) },
            { value: 'blank', label: ht('hubx.f_blank', { n: blanks.length }) },
          ]}
        />
      </div>
      {type ? <div className="text-[12.5px] font-bold text-primary">{typeLabel(type)}</div> : null}
      <div className="grid gap-2.5 md:grid-cols-2">
        <div className="flex flex-col gap-2.5">{list.slice(0, half).map((x) => <ReviewRow key={x.questionId} r={x} onPassage={passages} />)}</div>
        <div className="flex flex-col gap-2.5">{list.slice(half).map((x) => <ReviewRow key={x.questionId} r={x} onPassage={passages} />)}</div>
      </div>
      {anchor ? <PassageModal anchor={anchor} sectionKey={s.key} passages={r.passages} locale="uz" onClose={() => setAnchor(null)} /> : null}
    </NmCard>
  );
}
