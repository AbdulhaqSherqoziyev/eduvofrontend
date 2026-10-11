'use client';

import { useState, type MutableRefObject } from 'react';
import { NmSelect } from '@/components/ui/nm-select';
import { ImportCard } from './import-card';
import { TestsTable } from './tests-table';
import { useExamConfigs } from './use-owner-exams';

/** Tests tab: table (1.6fr) + import card (1fr), like v3. */
export function TestsTab({ importRef }: { importRef: MutableRefObject<{ pick: () => void } | null> }) {
  const [exam, setExam] = useState('');
  const configs = useExamConfigs();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-[13px] font-bold text-muted">Imtihon</span>
        <NmSelect value={exam} onChange={(e) => setExam(e.target.value)} className="w-[260px]" aria-label="Imtihon filtri">
          <option value="">Barchasi</option>
          {(configs.data ?? []).map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
        </NmSelect>
      </div>
      <div className="grid items-start gap-[22px] xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <TestsTable exam={exam} />
        <ImportCard configs={configs.data ?? []} apiRef={importRef} />
      </div>
    </div>
  );
}
