'use client';

import { useState } from 'react';
import Link from 'next/link';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { EmptyState } from '@/components/shared/empty-state';
import { Skeleton } from '@/components/shared/skeleton';
import { useExamCatalog, useExamPreview, usePublishedTests } from '@/lib/hooks/use-center-exams';
import type { CatalogFamily } from '@/lib/api/center-exams-v3';
import { AssignDialog } from '../assign/assign-dialog';
import { examErrorText } from '../exam-errors';
import { familySoon } from '../exam-meta';
import { Caps, Card, ConsoleHeader, InlineError, MethodBadge, SoonChip } from '../ui';
import { PRESS, SH } from '../tokens';
import { ExamTile } from './exam-card';
import { PriceCard, ScoringCard } from './detail-side';

const COLS = 'grid grid-cols-[1.6fr_0.7fr_1.2fr_1fr_150px] gap-3.5 min-w-[580px]';

/** Imtihon tafsilotlari (design v3 DETAIL). `code` = family ("IELTS") or one of its exam codes. */
export function ExamDetailView({ code }: { code: string }) {
  const catalog = useExamCatalog();
  return (
    <section className="flex flex-col pb-6">
      <ConsoleHeader title="Imtihon tafsilotlari" subtitle="Format, bo'limlar va baholash usuli" />
      <QueryBoundary query={catalog} loading={<Skeleton className="h-[420px] w-full" />}>
        {(data) => {
          const f = data.families?.find((x) => x.family === code.toUpperCase() || x.examCodes.includes(code));
          return f ? <Detail f={f} /> : (
            <EmptyState
              title="Imtihon topilmadi"
              hint="Bu imtihon katalogda yo'q yoki o'chirilgan."
              action={<Link href="/exams/catalog" className="text-[13px] font-bold text-primary">Katalogga qaytish</Link>}
            />
          );
        }}
      </QueryBoundary>
    </section>
  );
}

function Detail({ f }: { f: CatalogFamily }) {
  const tests = usePublishedTests();
  const [assign, setAssign] = useState(false);
  const preview = useExamPreview();
  // Newest published variant of this family is what "boshlash" opens (free staff preview, §2.11).
  const test = (tests.data ?? [])
    .filter((t) => f.examCodes.includes(t.examCode))
    .sort((a, b) => (b.publishedAt ?? '').localeCompare(a.publishedAt ?? ''))[0];
  const soon = familySoon(f);
  const noTest = tests.isSuccess && !test;
  const blocked = soon || !test || preview.isPending;
  const start = (sectionKey?: string) => { if (test && !soon) preview.open(test.id, sectionKey); };

  return (
    <div className="grid items-start gap-[22px] xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,1fr)]">
      <Card className="flex min-w-0 flex-col gap-5 p-5 md:p-[26px]">
        <div className="flex items-center gap-4">
          <ExamTile family={f.family} abbr={f.abbr} large />
          <div className="min-w-0 flex-1">
            <div className="text-[21px] font-extrabold tracking-[-0.4px]">{f.name}</div>
            <div className="mt-1 text-[13px] font-semibold text-muted">{f.ver} · {f.durationLabel}</div>
          </div>
          {soon ? <span className="flex-shrink-0"><SoonChip size={11} /></span> : null}
        </div>
        <p className="max-w-[720px] text-[14px] leading-[1.6] text-[#5b6b82]">{f.desc}</p>
        <div className="overflow-x-auto">
          <Caps className={`${COLS} px-3.5 pb-2.5`}><div>BO&apos;LIM</div><div>VAQT</div><div>TARKIB</div><div>BAHOLASH</div><div /></Caps>
          {f.sections.map((s) => (
            <div key={s.key} className={`${COLS} mb-1.5 items-center rounded-[14px] px-3.5 py-3 text-[13.5px] ${SH.row}`}>
              <div className="font-extrabold">{s.title}</div>
              <div className="font-bold text-[#5b6b82]">{s.durationLabel || (s.durationMin != null ? `${s.durationMin} min` : '—')}</div>
              <div className="font-semibold text-[#5b6b82]">{s.content}</div>
              <div><MethodBadge method={s.method} /></div>
              <button
                type="button"
                disabled={blocked}
                title={soon ? 'Tez kunda' : noTest ? "Nashr qilingan test yo'q" : undefined}
                onClick={() => start(s.sectionKey)}
                className={`h-9 rounded-[13px] bg-background text-[12.5px] font-extrabold text-primary disabled:cursor-not-allowed disabled:opacity-60 ${SH.btn} ${PRESS}`}
              >
                Bo&apos;limni boshlash
              </button>
            </div>
          ))}
        </div>
        {tests.isError ? <InlineError text="Testlarni yuklab bo'lmadi." onRetry={() => tests.refetch()} /> : null}
        {soon ? <p className="text-[12.5px] font-bold text-[#B7790F]">Tez kunda</p> : null}
        {noTest && !soon ? <p className="text-[12.5px] font-semibold text-muted">Bu imtihon uchun hali nashr qilingan test yo&apos;q.</p> : null}
        {preview.error ? <p className="text-[12.5px] font-bold text-danger">{examErrorText(preview.error, "Imtihonni ochib bo'lmadi.")}</p> : null}
      </Card>
      <div className="flex flex-col gap-5">
        <PriceCard price={f.priceCredits} canStart={!blocked} pending={preview.isPending} soon={soon} onStart={() => start()} onAssign={() => setAssign(true)} />
        <ScoringCard estimate={f.estimate} />
      </div>
      {soon ? null : <AssignDialog open={assign} presetFamily={f.family} onOpenChange={setAssign} />}
    </div>
  );
}
