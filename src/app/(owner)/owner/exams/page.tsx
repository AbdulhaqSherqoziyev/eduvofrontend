'use client';

import { useRef, useState } from 'react';
import { NmButton } from '@/components/ui/nm-button';
import { BankTabs, type BankTab } from './_components/bank-tabs';
import { TablesTab } from './_components/tables-tab';
import { TestsTab } from './_components/tests-tab';

/** Platform test bank — v3 "Test banki" (tests + conversion tables). OWNER only. */
export default function OwnerExamsPage() {
  const [tab, setTab] = useState<BankTab>('tests');
  const importRef = useRef<{ pick: () => void } | null>(null);
  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-extrabold tracking-[-0.4px] text-foreground">Test banki</h1>
          <p className="text-[14px] text-muted">Testlar, javoblar kaliti, aylantirish jadvallari</p>
        </div>
        <NmButton onClick={() => { setTab('tests'); setTimeout(() => importRef.current?.pick(), 0); }}>Test import qilish</NmButton>
      </div>
      <BankTabs value={tab} onChange={setTab} />
      {tab === 'tests' ? <TestsTab importRef={importRef} /> : <TablesTab />}
    </section>
  );
}
