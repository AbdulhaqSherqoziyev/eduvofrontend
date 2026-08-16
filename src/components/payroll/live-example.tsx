'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { AmountField } from '@/components/shared/amount-field';
import { Skeleton } from '@/components/shared/skeleton';
import { NmButton } from '@/components/ui/nm-button';
import { usePayrollPreview } from '@/lib/hooks/use-compensation';
import { formatNumber } from '@/lib/utils/format';
import { monthName } from '@/lib/utils/payroll-labels';
import { cn } from '@/lib/utils/cn';
import type { CombineMode, SubjectType } from '@/lib/types/payroll';
import type { CompDraft } from './compensation-state';
import { ModeCompare } from './mode-compare';
import { hasPreviewInput, previewFormula, useDebouncedRule } from './preview-text';

interface LiveExampleProps {
  subjectType: SubjectType;
  subjectId: string;
  draft: CompDraft;
  withBonus: boolean;
  onSchemeChange: (mode: CombineMode) => void;
}

/**
 * Jonli misol (§B) — blokdagi eng qimmat xatoni yopadigan yagona element.
 *
 * `Oylik va foiz qo'shiladi` ni tushunmay tanlash uch soniya davom etadi,
 * natijasi esa oy oxirida ko'rinadi va orqaga qaytarish xodim bilan
 * gaplashishni bildiradi. Shuning uchun misol doim ko'rinadi va raqamlari
 * SERVERDAN keladi — bu yerda `max()` ham, `× percent` ham yo'q [§H.3/3].
 */
export function LiveExample({ subjectType, subjectId, draft, withBonus, onSchemeChange }: LiveExampleProps) {
  const [assumed, setAssumed] = useState('');
  const [manual, setManual] = useState(false);
  const debounced = useDebouncedRule(draft, withBonus, manual ? assumed : '');
  const ready = hasPreviewInput(draft);

  const query = usePayrollPreview(
    ready
      ? {
          subjectType,
          subjectId,
          rule: debounced.rule,
          ...(manual && Number(assumed) > 0 ? { assumedRevenue: Number(assumed) } : {}),
        }
      : null,
  );
  const preview = query.data;
  const stale = query.isFetching && !!preview;

  return (
    <div className="rounded-ctl bg-background p-[18px] shadow-nm-inset-sm">
      {/* Sarlavha faqat haqiqiy misol bo'lganda: bo'sh formada `TAXMINIY MISOL`
          deyish "ma'lumot yig'ilmagan" degan boshqa holatning matni bo'lardi. */}
      {preview ? (
        <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.7px] text-muted">
          {preview.source === 'ACTUAL'
            ? `Shu qoida o'tgan oyga (${monthName(preview.period)}) qo'llanganda`
            : 'Taxminiy misol'}
          {stale ? <Loader2 className="size-3.5 animate-spin text-muted" /> : null}
        </div>
      ) : null}

      {/* Ma'lumot yo'q bo'lsa ham misol ISHLAYDI: uning vazifasi ma'lumot
          ko'rsatish emas, rejimni tushuntirish (§B.4). */}
      {preview?.source === 'ASSUMED' ? (
        <p className="mb-3 text-[11.5px] font-medium leading-[1.45] text-muted">
          O&apos;tgan oy ma&apos;lumoti hali yig&apos;ilmagan. Rejimni tushunish uchun taxminiy tushum bilan
          ko&apos;rsatildi.
        </p>
      ) : null}

      {!ready ? (
        <p className="text-[12.5px] font-medium text-muted">
          Summa va foizni kiriting — natija shu yerda ko&apos;rinadi.
        </p>
      ) : query.isError ? (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[12.5px] font-semibold text-foreground">Misolni hozir hisoblab bo&apos;lmadi.</span>
          <NmButton type="button" variant="soft" size="sm" onClick={() => query.refetch()}>
            Qayta urinish
          </NmButton>
        </div>
      ) : !preview ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Skeleton className="h-[28px] w-[130px]" />
          <Skeleton className="h-[28px] w-[130px]" />
        </div>
      ) : (
        <div className={cn('flex flex-col gap-3', stale && 'opacity-60')}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.7px] text-muted">Ustozga</div>
              <div className="text-[22px] font-extrabold tracking-[-0.5px] text-foreground">
                {formatNumber(preview.result.staff)} so&apos;m
              </div>
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.7px] text-muted">Markazga qoladi</div>
              {/* Manfiy qoldiq mantiqan yo'q: markaz o'z cho'ntagidan qo'shadi,
                  va jumla aynan shuni aytadi (§B.2). */}
              {preview.result.center < 0 ? (
                <div className="text-[17px] font-extrabold leading-tight text-foreground">
                  Markazga qolmaydi — ustiga {formatNumber(preview.result.center)} so&apos;m qo&apos;shiladi.
                </div>
              ) : (
                <div className="text-[22px] font-extrabold tracking-[-0.5px] text-foreground">
                  {formatNumber(preview.result.center)} so&apos;m
                </div>
              )}
            </div>
          </div>

          <p className="text-[12px] font-medium leading-[1.45] text-muted">{previewFormula(preview)}</p>

          {draft.scheme === 'GUARANTEE' || draft.scheme === 'SUM' ? (
            <ModeCompare
              byMode={preview.byMode}
              revenue={preview.revenue}
              value={draft.scheme}
              onChange={onSchemeChange}
            />
          ) : null}

          {preview.source === 'ACTUAL' ? (
            <p className="text-[11.5px] font-medium text-muted">
              {monthName(preview.period)}da bu guruhlarga {formatNumber(preview.revenue)} so&apos;m tushgan.
            </p>
          ) : null}

          {manual ? (
            <AmountField
              id="assumedRevenue"
              label="Guruhlariga oyiga tushadigan pul:"
              value={assumed}
              onChange={setAssumed}
            >
              <NmButton
                type="button"
                variant="ghost"
                size="sm"
                className="mt-1 px-0 text-primary"
                onClick={() => {
                  setManual(false);
                  setAssumed('');
                }}
              >
                O&apos;tgan oy ma&apos;lumotiga qaytish
              </NmButton>
            </AmountField>
          ) : (
            <NmButton
              type="button"
              variant="ghost"
              size="sm"
              className="self-start px-0 text-primary"
              onClick={() => setManual(true)}
            >
              Boshqa summa bilan ko&apos;rish
            </NmButton>
          )}
        </div>
      )}
    </div>
  );
}
