'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { statusLabel, type BankTestRow } from '@/lib/api/owner-exams';
import { errText, useBankTests, useRemoveTest, useUnpublishTest } from './use-owner-exams';

const COLS = 'grid grid-cols-[2fr_1.1fr_0.8fr_1fr_auto] items-center gap-3.5';
const family = (code: string) => code.split('_')[0];

function StatusChip({ s }: { s: BankTestRow['status'] }) {
  const pub = s === 'PUBLISHED';
  return <span className="rounded-[8px] px-[9px] py-1 text-[11.5px] font-extrabold" style={{ color: pub ? '#1F9D6B' : '#7A8699', background: pub ? 'rgba(31,157,107,0.12)' : 'rgba(122,134,153,0.12)' }}>{statusLabel(s)}</span>;
}

/** v3 table TEST / IMTIHON / SAVOLLAR / HOLAT + row actions (view, unpublish, delete draft). */
export function TestsTable({ exam }: { exam: string }) {
  const q = useBankTests(exam);
  const remove = useRemoveTest();
  const unpublish = useUnpublishTest();
  const [del, setDel] = useState<BankTestRow | null>(null);
  const [unpub, setUnpub] = useState<BankTestRow | null>(null);

  return (
    <div className="rounded-[24px] bg-background px-[18px] py-4 shadow-nm">
      <div className={`${COLS} px-4 pb-3 pt-2 text-[10.5px] font-bold tracking-[0.8px] text-[#9aa6b8]`}><div>TEST</div><div>IMTIHON</div><div>SAVOLLAR</div><div>HOLAT</div><div className="w-[150px]" /></div>
      {q.isLoading && Array.from({ length: 4 }).map((_, i) => <div key={i} className="mb-1.5 h-[46px] animate-pulse rounded-[14px] shadow-nm-inset-sm" />)}
      {q.isError && (
        <div className="px-4 py-6 text-[13.5px] font-semibold text-muted">
          Testlar ro&apos;yxatini yuklab bo&apos;lmadi. <button type="button" className="font-bold text-primary" onClick={() => void q.refetch()}>Qayta urinish</button>
        </div>
      )}
      {q.data && q.data.length === 0 && <div className="px-4 py-8 text-center text-[13.5px] font-semibold text-muted">Hali test yo&apos;q — o&apos;ng tomondagi Import orqali birinchi testni yuklang.</div>}
      {q.data?.map((t) => (
        <div key={t.id} className={`${COLS} mb-1.5 rounded-[14px] px-4 py-3 text-[13.5px] shadow-nm-inset-sm`}>
          <Link href={`/owner/exams/${t.id}`} className="truncate font-bold text-foreground hover:text-primary">{t.title}</Link>
          <div className="font-semibold text-[#5b6b82]">{family(t.examCode)}</div>
          <div className="font-bold">{t.questionCount}</div>
          <div><StatusChip s={t.status} /></div>
          <div className="flex w-[150px] justify-end gap-3 text-[12.5px] font-bold">
            <Link href={`/owner/exams/${t.id}`} className="text-primary">Ko&apos;rish</Link>
            {t.status === 'PUBLISHED' && <button type="button" className="text-muted hover:text-foreground" onClick={() => setUnpub(t)}>Nashrdan olish</button>}
            {t.status === 'DRAFT' && <button type="button" className="text-muted hover:text-danger" onClick={() => setDel(t)}>O&apos;chirish</button>}
          </div>
        </div>
      ))}
      <ConfirmDialog open={!!del} onOpenChange={(o) => !o && setDel(null)} title="Qoralamani o'chirish"
        message={`"${del?.title ?? ''}" testi va uning savollari o'chiriladi. Bu qoralama hali hech kimga tayinlanmagan.`}
        confirmLabel="O'chirish" pending={remove.isPending} error={remove.error ? errText(remove.error) : undefined}
        onConfirm={() => del && remove.mutate(del.id, { onSuccess: () => setDel(null) })} />
      <ConfirmDialog open={!!unpub} onOpenChange={(o) => !o && setUnpub(null)} title="Nashrdan olish" tone="soft"
        message={`"${unpub?.title ?? ''}" yangi tayinlovlarda ko'rinmaydi. Boshlangan urinishlar va natijalar o'zgarmaydi.`}
        confirmLabel="Nashrdan olish" pending={unpublish.isPending} error={unpublish.error ? errText(unpublish.error) : undefined}
        onConfirm={() => unpub && unpublish.mutate(unpub.id, { onSuccess: () => setUnpub(null) })} />
    </div>
  );
}
