'use client';

import { Skeleton } from '@/components/shared/skeleton';
import { useAcceptedVariants, useConversionTable } from '@/lib/hooks/use-center-exams-v3';
import type { BankTest } from '@/lib/api/center-exams-v3';
import { can } from '@/lib/auth/permissions';
import { examErrorText } from '../exam-errors';
import { SH } from '../tokens';
import { Card, InlineError } from '../ui';

/** Design shows the IELTS Listening table; centre side is read-only ("Admin tahrirlaydi"). */
const TABLE = { examCode: 'IELTS_ACADEMIC', section: 'listening' };

/** "Aylantirish jadvallari" tab (design v3 BANK `bankTables`). */
export function TablesTab({ tests }: { tests: BankTest[] }) {
  const table = useConversionTable(TABLE.examCode, TABLE.section);
  const sample = tests.find((t) => t.examCode === TABLE.examCode && t.status === 'PUBLISHED') ?? tests.find((t) => t.status === 'PUBLISHED');
  const variants = useAcceptedVariants(sample?.id);
  return (
    <div className="grid items-start gap-[22px] xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <Card className="min-w-0 p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[16px] font-extrabold">{table.data?.title ?? "IELTS Listening · to'g'ri javob → band"}</div>
          <span className="text-[12px] font-bold text-muted">Admin tahrirlaydi</span>
        </div>
        {table.isLoading ? <Skeleton className="h-[220px] w-full" /> : null}
        {table.isError ? <InlineError text={examErrorText(table.error, "Jadvalni yuklab bo'lmadi.")} onRetry={() => table.refetch()} /> : null}
        {table.data ? (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {table.data.rows.map((c) => (
              <div key={c.raw} className={`flex items-center justify-between rounded-[14px] px-3.5 py-3 ${SH.tile}`}>
                <span className="text-[13px] font-bold text-[#5b6b82]">{c.raw}</span>
                <span className="text-[16px] font-extrabold text-primary">{c.band}</span>
              </div>
            ))}
          </div>
        ) : null}
        <p className="mt-4 text-[12.5px] font-semibold leading-[1.5] text-muted">
          Masalan, 30/40 to&apos;g&apos;ri javob = 7.0 band. SAT va TOEFL jadvallari taxminiy deb belgilanadi.
        </p>
      </Card>
      <Card className="flex min-w-0 flex-col gap-3 p-6">
        <div className="text-[16px] font-extrabold">Qabul qilinadigan variantlar</div>
        <p className="text-[12.5px] font-semibold leading-[1.5] text-muted">
          Bo&apos;sh joy to&apos;ldirishda har savolga to&apos;g&apos;ri yozilishlar ro&apos;yxati. Katta-kichik harf va ortiqcha bo&apos;shliq hisobga olinmaydi.
        </p>
        {!sample ? <p className="text-[12.5px] font-semibold text-muted">Nashr qilingan test yo&apos;q.</p> : null}
        {sample && !can('exam.manage') ? <p className="text-[12.5px] font-semibold text-muted">Javob kalitlari faqat test banki ruxsati bor xodimga ko&apos;rinadi.</p> : null}
        {variants.isLoading ? <Skeleton className="h-[160px] w-full" /> : null}
        {variants.isError ? <InlineError text={examErrorText(variants.error, "Variantlarni yuklab bo'lmadi.")} onRetry={() => variants.refetch()} /> : null}
        {variants.data?.length === 0 ? <p className="text-[12.5px] font-semibold text-muted">Bu testda variantli savol yo&apos;q.</p> : null}
        {variants.data?.map((v) => (
          <div key={v.q} className={`rounded-[14px] px-3.5 py-3 ${SH.tile}`}>
            <div className="text-[12px] font-extrabold text-muted">{v.q}</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {v.list.map((w) => (
                <span key={w} className={`rounded-[8px] px-[9px] py-1 text-[12.5px] font-bold text-foreground ${SH.chip}`}>{w}</span>
              ))}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
