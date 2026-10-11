'use client';
/** Trend card (§5): section switch → TrendChart; one attempt → "yana bir mock" panel (T36). */
import Link from 'next/link';
import { useState } from 'react';
import { NmCard } from '@/components/ui/nm-card';
import { NmSegmented } from '@/components/ui/nm-segmented';
import { dayShort, scoreText } from '@/lib/exam/hub-format';
import type { ExamFamily, HubSection, ProgressAttempt } from '@/lib/exam/hub-types';
import { ht } from '@/lib/exam/i18n/hub';
import { series, titleOf } from '@/lib/exam/progress-derive';
import { TrendChart } from './trend-chart';

interface Props {
  list: ProgressAttempt[];
  keys: string[];
  sections: HubSection[];
  family: ExamFamily;
  best: string;
}

export function ProgressTrend({ list, keys, sections, family, best }: Props) {
  const [key, setKey] = useState(keys[0] ?? '');
  const cur = keys.includes(key) ? key : keys[0] ?? '';
  const title = titleOf(sections, cur);
  const pts = series(list, cur);

  return (
    <NmCard className="flex min-w-0 flex-col gap-4 rounded-[24px] p-6 max-md:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[17px] font-extrabold text-foreground">{ht('hubx.trend_title')}</h2>
        {keys.length > 1 ? (
          <div className="-mx-1 max-w-full overflow-x-auto px-1 py-1">
            <NmSegmented size="sm" className="min-w-[300px]" value={cur} onValueChange={setKey} items={keys.map((k) => ({ value: k, label: titleOf(sections, k) }))} />
          </div>
        ) : null}
      </div>
      {list.length < 2 || pts.length < 2 ? (
        <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-[16px] p-6 text-center shadow-nm-inset-sm">
          <p className="text-[14px] font-semibold text-[#5b6b82]">{ht('hubx.trend_wait')}</p>
          <p className="text-[13.5px] font-bold text-foreground">{ht('hubx.current_result', { v: best })}</p>
          <Link href="/exams" className="flex h-[42px] items-center rounded-ctl bg-background px-5 text-[13.5px] font-bold text-primary shadow-nm-sm nm-pressable">
            {ht('hubx.back_exams')}
          </Link>
        </div>
      ) : (
        <TrendChart
          family={family}
          section={title}
          data={pts.map((p) => {
            const v = scoreText(family, p.v)!;
            return { v: p.v, text: v, mock: `Mock #${p.n}`, date: dayShort(p.at), tip: ht('hubx.mock_point', { n: p.n, d: dayShort(p.at), s: title, v }) };
          })}
        />
      )}
    </NmCard>
  );
}
