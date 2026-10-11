'use client';

import { useState } from 'react';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { EmptyState } from '@/components/shared/empty-state';
import { CardGridSkeleton, Skeleton } from '@/components/shared/skeleton';
import { useExamCatalog } from '@/lib/hooks/use-center-exams';
import { can } from '@/lib/auth/permissions';
import type { CatalogKpis } from '@/lib/api/center-exams-v3';
import { AssignDialog } from '../assign/assign-dialog';
import { FAMILIES, formatScore, signed, type Family } from '../exam-meta';
import { ChipButton, ChipTrack, ConsoleHeader, KpiCard, KpiGrid, PrimaryButton } from '../ui';
import { ExamCard } from './exam-card';

/** Katalog (design v3 CATALOG): KPI row, family filter, 5 family cards, disclaimer. */
export function CatalogView() {
  const catalog = useExamCatalog();
  const [filter, setFilter] = useState<'Barchasi' | Family>('Barchasi');
  const [assign, setAssign] = useState<{ open: boolean; family?: Family }>({ open: false });
  return (
    <section className="flex flex-col pb-6">
      <ConsoleHeader title="Mock imtihonlar" subtitle="IELTS, CEFR, SAT, TOEFL va HSK formatidagi kompyuterli mock testlar">
        {can('exam.assign') ? <PrimaryButton onClick={() => setAssign({ open: true })}>+ Guruhga mock tayinlash</PrimaryButton> : null}
      </ConsoleHeader>
      <QueryBoundary
        query={catalog}
        loading={<><Skeleton className="mb-[26px] h-[112px] w-full" /><CardGridSkeleton count={3} className="md:grid-cols-2 xl:grid-cols-3" /></>}
      >
        {(data) => {
          const families = (data.families ?? []).filter((f) => filter === 'Barchasi' || f.family === filter);
          return (
            <>
              <CatalogKpis k={data.kpis} />
              <ChipTrack>
                {(['Barchasi', ...FAMILIES] as const).map((f) => (
                  <ChipButton key={f} active={filter === f} onClick={() => setFilter(f)}>{f}</ChipButton>
                ))}
              </ChipTrack>
              {families.length === 0 ? (
                <EmptyState title="Hozircha imtihon yo'q" hint="Platformada nashr qilingan imtihonlar shu yerda chiqadi." />
              ) : (
                <div className="grid gap-[22px] [grid-template-columns:repeat(auto-fill,minmax(min(330px,100%),1fr))]">
                  {families.map((f) => (
                    <ExamCard key={f.family} f={f} onAssign={() => setAssign({ open: true, family: f.family })} />
                  ))}
                </div>
              )}
              <p className="mt-[22px] text-[12px] font-semibold text-[#9aa6b8]">
                Mock testlar rasmiy imtihon formatiga mos tuzilgan. Rasmiy tashkilotlar bilan bog&apos;liq emas. SAT va TOEFL ballari taxminiy.
              </p>
            </>
          );
        }}
      </QueryBoundary>
      <AssignDialog open={assign.open} presetFamily={assign.family} onOpenChange={(open) => setAssign((s) => ({ ...s, open }))} />
    </section>
  );
}

function CatalogKpis({ k }: { k?: CatalogKpis }) {
  return (
    <KpiGrid className="md:mb-[26px]">
      <KpiCard label="BU OY URINISHLAR" value={k ? String(k.attemptsThisMonth) : '—'} sub={k ? `${signed(k.attemptsDeltaVsLastMonth)} o'tgan oyga` : undefined} />
      <KpiCard label="FAOL MOCKLAR" value={k ? String(k.activeMocks) : '—'} sub={`hozir jonli: ${k?.liveNow ?? '—'}`} />
      <KpiCard label="O'RTACHA IELTS" value={formatScore(k?.avgIelts30d)} sub="oxirgi 30 kun" />
      <KpiCard label="KREDIT" value={k ? String(k.credits) : '—'} sub={`≈ ${k?.fullMocksApprox ?? '—'} to'liq mock`} accent />
    </KpiGrid>
  );
}
