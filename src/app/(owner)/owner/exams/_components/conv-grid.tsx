'use client';

import { useEffect, useState } from 'react';
import { NmButton } from '@/components/ui/nm-button';
import type { TableDetail } from '@/lib/api/owner-exams';
import { errText, useConvTable, usePutTable } from './use-owner-exams';

type Row = TableDetail['rows'][number];
const cell = 'flex items-center justify-between gap-2 rounded-[14px] px-3.5 py-3 shadow-nm-inset-sm';
const inp = 'w-[52px] rounded-[8px] bg-transparent px-1 text-right outline-none focus:shadow-nm-inset-sm';

/** v3 grid: raw range → band, 4 columns, values editable; PUT saves a new version. */
export function ConvGrid({ code }: { code: string }) {
  const q = useConvTable(code);
  const put = usePutTable(code);
  const [rows, setRows] = useState<Row[]>([]);
  const [est, setEst] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => { if (q.data) { setRows([...q.data.rows].sort((a, b) => b.min - a.min)); setEst(q.data.isEstimated); } }, [q.data]);

  if (q.isLoading) return <div className="h-[320px] animate-pulse rounded-[24px] shadow-nm" />;
  if (q.isError || !q.data) return <div className="rounded-[24px] p-6 text-[13.5px] font-semibold text-muted shadow-nm">Jadvalni yuklab bo&apos;lmadi.</div>;
  const dirty = est !== q.data.isEstimated || JSON.stringify(rows) !== JSON.stringify([...q.data.rows].sort((a, b) => b.min - a.min));
  const range = (i: number) => (i === 0 ? `${rows[0].min}+` : rows[i - 1].min - 1 > rows[i].min ? `${rows[i].min}–${rows[i - 1].min - 1}` : String(rows[i].min));
  const set = (i: number, patch: Partial<Row>) => { setSaved(false); setRows((r) => r.map((x, k) => (k === i ? { ...x, ...patch } : x))); };
  const bad = rows.some((r, i) => !Number.isFinite(r.min) || (i > 0 && r.min >= rows[i - 1].min));

  return (
    <div className="rounded-[24px] bg-background p-6 shadow-nm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="text-[16px] font-extrabold">{q.data.examCode ?? ''} {q.data.section ?? q.data.code} · {q.data.input === 'raw' ? <>to&apos;g&apos;ri javob → ball</> : <>{q.data.input} → natija</>}</div>
        <span className="text-[12px] font-bold text-muted">Admin tahrirlaydi</span>
      </div>
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        {rows.map((r, i) => (
          <div key={i} className={cell} title={`Chegara: ${range(i)}`}>
            <label className="text-[13px] font-bold text-[#5b6b82]">
              <span className="sr-only">Minimal to&apos;g&apos;ri javob</span>
              <input className={inp} inputMode="numeric" value={r.min} aria-label={`${i + 1}-qator chegarasi`} onChange={(e) => set(i, { min: Number(e.target.value) })} style={{ textAlign: 'left' }} />
            </label>
            <input className={`${inp} w-[84px] text-[16px] font-extrabold text-primary`} value={r.value} aria-label={`${range(i)} uchun ball`}
              onChange={(e) => set(i, { value: Number.isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value) })} />
          </div>
        ))}
      </div>
      <label className="mt-4 flex items-center gap-2 text-[13px] font-bold">
        <input type="checkbox" checked={est} onChange={(e) => { setSaved(false); setEst(e.target.checked); }} /> Taxminiy jadval (natijada &quot;Taxminiy&quot; yorlig&apos;i)
      </label>
      <div className="mt-2 text-[12.5px] font-semibold leading-[1.5] text-muted">Chap raqam — shu ballni olish uchun kerak bo&apos;lgan eng kam to&apos;g&apos;ri javob. Masalan, 30/40 to&apos;g&apos;ri javob = 7.0 band. SAT va TOEFL jadvallari taxminiy deb belgilanadi.</div>
      {bad && <div className="mt-2 text-[12.5px] font-semibold text-danger">Chegaralar yuqoridan pastga kamayib borishi kerak.</div>}
      {put.error && <div className="mt-2 text-[12.5px] font-semibold text-danger">{errText(put.error)}</div>}
      <div className="mt-4 flex items-center justify-end gap-3">
        {saved && <span className="text-[12.5px] font-bold text-success">Saqlandi · yangi versiya</span>}
        <NmButton size="sm" disabled={!dirty || bad || put.isPending} onClick={() => put.mutate({ rows, isEstimated: est }, { onSuccess: () => setSaved(true) })}>
          {put.isPending ? 'Saqlanmoqda…' : 'Saqlash'}
        </NmButton>
      </div>
    </div>
  );
}
