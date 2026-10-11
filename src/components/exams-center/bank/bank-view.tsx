'use client';

import { useRef, useState } from 'react';
import { Layers } from 'lucide-react';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { EmptyState } from '@/components/shared/empty-state';
import { RowsSkeleton } from '@/components/shared/skeleton';
import { useBankTests } from '@/lib/hooks/use-center-exams-v3';
import { can } from '@/lib/auth/permissions';
import { SH } from '../tokens';
import { Card, ChipButton, ChipTrack, ConsoleHeader, PrimaryButton, ToneChip } from '../ui';
import { ImportCard } from './import-card';
import { TablesTab } from './tables-tab';
import { useImportFlow } from './use-import-flow';

const COLS = 'grid grid-cols-[2fr_1.1fr_0.8fr_1fr] gap-3.5 min-w-[520px]';
const STATUS = {
  PUBLISHED: { label: 'Nashr', fg: '#1F9D6B', bg: 'rgba(31,157,107,0.12)' },
  DRAFT: { label: 'Qoralama', fg: '#7A8699', bg: 'rgba(122,134,153,0.12)' },
} as const;

/** Test banki (design v3 BANK): Testlar (table + import) / Aylantirish jadvallari. */
export function BankView() {
  const [tab, setTab] = useState<'tests' | 'tables'>('tests');
  const tests = useBankTests();
  const flow = useImportFlow();
  const input = useRef<HTMLInputElement>(null);
  const openPicker = () => { setTab('tests'); setTimeout(() => input.current?.click(), 0); };
  return (
    <section className="flex flex-col pb-6">
      <ConsoleHeader title="Test banki" subtitle="Testlar, javoblar kaliti, aylantirish jadvallari">
        {can('exam.manage') ? <PrimaryButton onClick={openPicker}>Test import qilish</PrimaryButton> : null}
      </ConsoleHeader>
      <ChipTrack>
        <ChipButton active={tab === 'tests'} onClick={() => setTab('tests')}>Testlar</ChipButton>
        <ChipButton active={tab === 'tables'} onClick={() => setTab('tables')}>Aylantirish jadvallari</ChipButton>
      </ChipTrack>
      {tab === 'tables' ? <TablesTab tests={tests.data ?? []} /> : (
        <div className="grid items-start gap-[22px] xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <QueryBoundary
            query={tests}
            loading={<RowsSkeleton rows={6} />}
            isEmpty={(d) => d.length === 0}
            empty={<Card className="p-6"><EmptyState icon={<Layers className="size-6" />} title="Hali test yo'q" hint="Platforma nashr qilgan va markaz import qilgan testlar shu yerda chiqadi." /></Card>}
          >
            {(items) => (
              <Card className="overflow-x-auto px-[18px] py-4">
                <div className={`${COLS} px-4 pb-3 pt-2 text-[10.5px] font-bold tracking-[0.8px] text-[#9aa6b8]`}>
                  <div>TEST</div><div>IMTIHON</div><div>SAVOLLAR</div><div>HOLAT</div>
                </div>
                {items.map((t) => {
                  const st = STATUS[t.status];
                  return (
                    <div key={t.id} className={`${COLS} mb-1.5 items-center rounded-[14px] px-4 py-3 text-[13.5px] ${SH.row}`}>
                      <div className="truncate font-bold">{t.title}</div>
                      <div className="font-semibold text-[#5b6b82]">{t.family ?? t.examCode}</div>
                      <div className="font-bold">{t.questionsLabel}</div>
                      <div><ToneChip label={st.label} fg={st.fg} bg={st.bg} size={11.5} /></div>
                    </div>
                  );
                })}
              </Card>
            )}
          </QueryBoundary>
          <ImportCard flow={flow} inputRef={input} />
        </div>
      )}
    </section>
  );
}
