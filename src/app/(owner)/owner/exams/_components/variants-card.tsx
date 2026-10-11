'use client';

import Link from 'next/link';
import { keyList } from '@/lib/api/owner-exams';
import { KeyChips } from './key-chips';
import { useBankTest, useBankTests } from './use-owner-exams';

const str = (a: unknown) => keyList(a).map((x) => (typeof x === 'string' ? x : JSON.stringify(x)));

/** v3 "Qabul qilinadigan variantlar": gap questions of the newest test of this exam (edit on the test page). */
export function VariantsCard({ examCode }: { examCode: string }) {
  const tests = useBankTests(examCode);
  const first = tests.data?.[0] ?? null;
  const test = useBankTest(first?.id ?? null);
  const gaps = (test.data?.stages ?? []).flatMap((s) => s.parts.flatMap((p) => p.groups.flatMap((g) => g.questions)))
    .filter((q) => q.check === 'text_normalized' || q.type === 'gap_fill').slice(0, 6);
  return (
    <div className="flex flex-col gap-3 rounded-[24px] bg-background p-6 shadow-nm">
      <div className="text-[16px] font-extrabold">Qabul qilinadigan variantlar</div>
      <div className="text-[12.5px] font-semibold leading-[1.5] text-muted">Bo&apos;sh joy to&apos;ldirishda har savolga to&apos;g&apos;ri yozilishlar ro&apos;yxati. Katta-kichik harf va ortiqcha bo&apos;shliq hisobga olinmaydi.</div>
      {(tests.isLoading || test.isLoading) && <div className="h-[120px] animate-pulse rounded-[14px] shadow-nm-inset-sm" />}
      {!tests.isLoading && !first && <div className="text-[13px] font-semibold text-muted">Bu imtihonda hali test yo&apos;q.</div>}
      {gaps.map((q) => (
        <div key={q.id} className="rounded-[14px] px-3.5 py-3 shadow-nm-inset-sm">
          <div className="text-[12px] font-extrabold text-muted">Q{q.no} · {String((q.content as { prompt?: string }).prompt ?? q.type)}</div>
          <div className="mt-2 flex justify-start"><KeyChips answers={str(q.answerKey)} accepted={q.accepted} /></div>
        </div>
      ))}
      {first && <Link href={`/owner/exams/${first.id}`} className="text-[12.5px] font-bold text-primary">{first.title} — tahrirlash →</Link>}
    </div>
  );
}
