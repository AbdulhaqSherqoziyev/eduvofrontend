'use client';
/** "Kompyuterda oching" (§1 mobile, §3.3, §6): gate text + selectable link + copy button. */
import { Check, Copy, Monitor } from 'lucide-react';
import { useRef } from 'react';
import { NmButton } from '@/components/ui/nm-button';
import { examsLink, useCopyLink } from '@/lib/exam/clipboard';
import { ht } from '@/lib/exam/i18n/hub';
import { cn } from '@/lib/utils/cn';

export function CopyLinkButton({ url, textRef, className }: { url: string; textRef: React.RefObject<HTMLElement>; className?: string }) {
  const { done, copy } = useCopyLink();
  return (
    <NmButton variant="soft" className={cn('w-full', className)} onClick={() => void copy(url, textRef.current)}>
      {done ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
      <span aria-live="polite">{done ? ht('hubx.copied') : ht('hubx.copy_link')}</span>
    </NmButton>
  );
}

/** `narrow` = a laptop window that is too small (gate.body_narrow) rather than a phone. */
export function OpenOnComputer({ code, narrow, inset = true }: { code?: string; narrow?: boolean; inset?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const url = examsLink(code);
  return (
    <div className={cn('flex flex-col gap-3 rounded-[16px] p-4', inset && 'shadow-nm-inset-sm')}>
      <div className="flex items-start gap-2.5">
        <Monitor className="mt-0.5 size-4 shrink-0 text-[#5b6b82]" aria-hidden />
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-[13.5px] font-extrabold text-foreground">{ht('gate.title')}</span>
          <span className="text-[13px] font-medium leading-[1.5] text-[#5b6b82]">
            {ht(narrow ? 'gate.body_narrow' : 'gate.body_mobile')}
          </span>
          <span ref={ref} className="select-all break-all text-[13px] font-extrabold text-foreground">
            {url.replace(/^https?:\/\//, '')}
          </span>
        </div>
      </div>
      <CopyLinkButton url={url} textRef={ref} />
    </div>
  );
}
