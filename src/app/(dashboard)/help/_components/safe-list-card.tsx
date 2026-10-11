import { Check, OctagonX, ShieldCheck } from 'lucide-react';
import { NmCard } from '@/components/ui/nm-card';
import { cn } from '@/lib/utils/cn';
import { HELP_SAFE_LIST } from '@/lib/help/content';
import type { HelpListItem } from '@/lib/help/types';
import { Rich } from './rich-text';
import { SOFT, TONE_TEXT } from './styles';

/** "Buzib qo'ymaysiz" — what is safe to try, and the short list that is not (§10.2). */
export function SafeListCard({ safe, irreversible }: { safe: HelpListItem[]; irreversible: HelpListItem[] }) {
  if (!safe.length && !irreversible.length) return null;
  return (
    <NmCard className="p-5">
      <h2 className="flex items-center gap-2 text-[16px] font-extrabold text-foreground">
        <ShieldCheck className={cn('size-5 shrink-0', TONE_TEXT.green)} aria-hidden />
        {HELP_SAFE_LIST.title}
      </h2>
      <p className={cn('mt-1 text-[13px] font-semibold', SOFT)}>{HELP_SAFE_LIST.hint}</p>
      <ul className="mt-3 flex flex-col gap-2">
        {safe.map((it, i) => (
          <li key={i} className="flex items-start gap-2 text-[13.5px] font-semibold leading-[1.5] text-foreground">
            <Check className={cn('mt-0.5 size-4 shrink-0', TONE_TEXT.green)} aria-hidden />
            <span className="min-w-0 break-words">
              <Rich text={it.text} />
            </span>
          </li>
        ))}
      </ul>
      {irreversible.length ? (
        <>
          <h3 className="mt-4 flex items-center gap-2 text-[14px] font-extrabold text-foreground">
            <OctagonX className={cn('size-4 shrink-0', TONE_TEXT.red)} aria-hidden />
            {HELP_SAFE_LIST.irreversibleTitle}
          </h3>
          <ul className="mt-2 flex flex-col gap-2">
            {irreversible.map((it, i) => (
              <li key={i} className="flex items-start gap-2 text-[13.5px] font-semibold leading-[1.5] text-foreground">
                <span className={cn('mt-[7px] size-1.5 shrink-0 rounded-full bg-current', TONE_TEXT.red)} aria-hidden />
                <span className="min-w-0 break-words">
                  <Rich text={it.text} />
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </NmCard>
  );
}
