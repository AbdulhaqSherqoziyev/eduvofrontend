'use client';

import { useState } from 'react';
import { NmDialog } from '@/components/ui/nm-dialog';
import { NmButton } from '@/components/ui/nm-button';
import { NmSelect } from '@/components/ui/nm-select';
import { Avatar } from '@/components/ui/avatar';
import { RowsSkeleton } from '@/components/shared/skeleton';
import { Pagination } from '@/components/shared/pagination';
import { useMyPayrollLines } from '@/lib/hooks/use-payroll';
import { formatSom } from '@/lib/utils/format';
import { somOrDash } from '@/lib/utils/payroll-labels';
import { formatDate } from '@/lib/utils/date';
import type { MyPayrollLine } from '@/lib/types/payroll';

interface LinesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  period: string;
  showShare: boolean;
  groupId?: string;
  groups: Array<{ id: string; name: string }>;
  onGroupChange: (groupId: string) => void;
}

/**
 * Tushgan to'lovlar ro'yxati (§C.7) — "har raqam ochiladi" [S1] ning o'zi.
 *
 * `[SV2]` QISMAN TO'LANGAN QATORDA HECH QANDAY QARZ BELGISI YO'Q. Faqat tushgan
 * summa ko'rsatiladi: `qolgani kutilmoqda` / `to'liq emas` / kulrang ulush —
 * hech biri yo'q, va API'da ham bunday maydon yo'q. Sabab oddiy: bu yerda
 * belgi o'quvchining ISMI BILAN YONMA-YON turadi, ya'ni ekran to'g'ridan-to'g'ri
 * "mana bu bola to'lamadi" degan bo'lardi.
 *
 * DIALOGDA HECH QANDAY AMAL YO'Q — eslatma, qo'ng'iroq, o'quvchi kartasiga
 * havola yo'q: ustoz bu yerdan o'quvchiga ta'sir o'tkaza olmasin.
 */
export function LinesDialog({
  open, onOpenChange, title, period, showShare, groupId, groups, onGroupChange,
}: LinesDialogProps) {
  const [page, setPage] = useState(1);
  const query = useMyPayrollLines({ period, groupId, page }, open);
  const data = query.data;

  return (
    <NmDialog open={open} onOpenChange={onOpenChange} title={title}>
      <div className="flex flex-col gap-4">
        {data ? (
          <div className="text-[12.5px] font-semibold text-muted">
            Jami: {somOrDash(data.total)} · {data.count} ta to&apos;lov
          </div>
        ) : null}

        {groups.length > 1 ? (
          <NmSelect
            value={groupId ?? ''}
            onChange={(e) => {
              onGroupChange(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Hammasi</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </NmSelect>
        ) : null}

        <div className="max-h-[46vh] overflow-y-auto">
          {query.isLoading ? (
            <RowsSkeleton rows={6} />
          ) : !data?.items.length ? (
            <p className="py-6 text-center text-[13px] font-medium text-muted">
              Bu davrda to&apos;lov tushmagan.
            </p>
          ) : (
            <div className="flex flex-col gap-1">
              {data.items.map((line, i) => (
                <LineRow key={`${line.studentName}-${line.date}-${i}`} line={line} showShare={showShare} />
              ))}
            </div>
          )}
        </div>

        {data && data.count > 20 ? (
          <Pagination
            page={page}
            pageSize={50}
            total={data.count}
            onPageChange={setPage}
            onPageSizeChange={() => undefined}
          />
        ) : null}

        <NmButton variant="soft" className="sticky bottom-0 w-full" onClick={() => onOpenChange(false)}>
          Yopish
        </NmButton>
      </div>
    </NmDialog>
  );
}

function LineRow({ line, showShare }: { line: MyPayrollLine; showShare: boolean }) {
  return (
    <div className="flex min-h-[56px] items-center gap-3 px-1 py-1.5">
      <Avatar name={line.studentName} size={34} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-bold text-foreground">{line.studentName}</div>
        {/* `18 kun uchun` — oy o'rtasida qo'shilgan o'quvchidan kam tushadi va
            ustoz buni "kam yozilibdi" deb o'qiydi; bitta so'z savolni yopadi. */}
        <div className="truncate text-[11.5px] font-medium text-muted">
          {line.groupName} · {formatDate(line.date)} ·{' '}
          {line.proratedDays ? `${line.proratedDays} kun uchun` : "to'liq oy"}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className="whitespace-nowrap text-[13px] font-extrabold tabular-nums text-foreground">
          {formatSom(line.paidAmount)}
        </div>
        {showShare && line.shareAmount !== undefined ? (
          <div className="text-[11.5px] font-semibold tabular-nums text-muted">
            → {formatSom(line.shareAmount)}
          </div>
        ) : null}
      </div>
    </div>
  );
}
