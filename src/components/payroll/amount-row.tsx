'use client';

import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface AmountRowProps {
  label: string;
  value: string;
  /** Berilsa qator bosiladigan bo'ladi va o'ngida chevron chiqadi (§0.9). */
  onClick?: () => void;
  /** Qator ostidagi tushuntirish (kafolat platosi, direktor izohi). */
  hint?: React.ReactNode;
  /** `Jami` qatori — kattaroq shrift, tepasida qalin chiziq. */
  total?: boolean;
  /** Qoida natijasi qatori — tepasida ingichka chiziq. */
  divider?: boolean;
}

/**
 * Hisob qatori: yorliq + summa (+ chevron).
 *
 * BOSILADIGAN RAQAM — ekranning g'oyasi [S1]: shaffoflik bu blokdagi
 * janjallarning yagona dorisi. Bosilmaydigan raqamda chevron ATAYLAB yo'q —
 * aks holda ustoz bosib ko'radi, hech narsa ochilmaydi va keyingi safar
 * ochiladiganini ham bosmaydi.
 *
 * 360px da yorliq va summa ikki satrda: bitta qatorga sig'maydi, qisqartirilsa
 * ma'no yo'qoladi. Bosiladigan qator ≥56px (§C.9).
 */
export function AmountRow({ label, value, onClick, hint, total, divider }: AmountRowProps) {
  const body = (
    <>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <span className={cn('text-[13px] font-semibold text-muted', total && 'text-foreground')}>{label}</span>
        <span
          className={cn(
            'whitespace-nowrap tabular-nums text-foreground',
            total ? 'text-[17px] font-extrabold' : 'text-[14px] font-extrabold',
          )}
        >
          {value}
        </span>
      </span>
      {onClick ? <ChevronRight className="size-4 shrink-0 text-muted" strokeWidth={2.2} /> : null}
    </>
  );

  return (
    <div
      className={cn(
        divider && 'mt-1 border-t border-[rgba(122,134,153,0.18)] pt-2',
        total && 'mt-1 border-t-2 border-[rgba(122,134,153,0.28)] pt-2.5',
      )}
    >
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          className={cn(
            'flex min-h-[56px] w-full items-center gap-3 rounded-ctl border-0 bg-transparent px-2',
            'text-left font-sans transition-all hover:shadow-nm-inset-sm',
          )}
        >
          {body}
        </button>
      ) : (
        <div className="flex min-h-[44px] items-center gap-3 px-2">{body}</div>
      )}
      {hint ? <div className="px-2 pb-1 text-[11.5px] font-medium leading-[1.45] text-muted">{hint}</div> : null}
    </div>
  );
}
