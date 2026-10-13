'use client';

import { useEffect, useState } from 'react';
import { NmSelect } from '@/components/ui/nm-select';
import { ConvGrid } from './conv-grid';
import { VariantsCard } from './variants-card';
import { useConvTables, useExamConfigs } from './use-owner-exams';

/** "Aylantirish jadvallari": raw → band grid (left, editable) + accepted variants (right), v3 layout. */
export function TablesTab() {
  const configs = useExamConfigs();
  const [exam, setExam] = useState('');
  const tables = useConvTables(exam);
  const [code, setCode] = useState<string | null>(null);
  useEffect(() => {
    if (tables.data?.length && !tables.data.some((t) => t.code === code)) setCode(tables.data[0].code);
  }, [tables.data, code]);
  const examOfTable = tables.data?.find((t) => t.code === code)?.examCode || exam;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-[13px] font-bold text-muted">Imtihon</span>
        <NmSelect value={exam} onChange={(e) => setExam(e.target.value)} className="w-[240px]" aria-label="Imtihon">
          <option value="">Barchasi</option>
          {(configs.data ?? []).map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
        </NmSelect>
        <span className="text-[13px] font-bold text-muted">Jadval</span>
        <NmSelect value={code ?? ''} onChange={(e) => setCode(e.target.value)} className="w-[320px]" aria-label="Jadval" disabled={!tables.data?.length}>
          {(tables.data ?? []).map((t) => <option key={t.code} value={t.code}>{t.examCode ?? '—'} · {t.section ?? t.code}{t.route ? ` · ${t.route}` : ''} · v{t.version}</option>)}
        </NmSelect>
      </div>
      {tables.isError && <div className="text-[13.5px] font-semibold text-muted">Jadvallarni yuklab bo&apos;lmadi. <button type="button" className="font-bold text-primary" onClick={() => void tables.refetch()}>Qayta urinish</button></div>}
      {tables.data && tables.data.length === 0 && <div className="text-[13.5px] font-semibold text-muted">Bu imtihon uchun jadval yo&apos;q.</div>}
      <div className="grid items-start gap-[22px] xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        {code ? <ConvGrid code={code} /> : <div className="h-[320px] animate-pulse rounded-[24px] shadow-nm" />}
        <VariantsCard examCode={examOfTable} />
      </div>
    </div>
  );
}
