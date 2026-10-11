'use client';

import { Send } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { HelpTeacherBrief } from '@/lib/help/types';
import { CopyButton, CopyError, useCopy } from './copy-button';
import { Rich } from './rich-text';
import { LABEL, SOFT } from './styles';

/** "O'qituvchilarga yuborish uchun" — admin-only ready message (§10.4). */
export function TeacherBriefCard({ brief }: { brief: HelpTeacherBrief }) {
  const c = useCopy();
  return (
    <div className="rounded-[16px] border-l-[3px] border-primary bg-background p-4 shadow-nm-sm">
      <div className={cn('flex items-center gap-1.5', LABEL)}>
        <Send className="size-4" aria-hidden /> {brief.title}
      </div>
      <p className={cn('mt-1 text-[12px] font-medium', SOFT)}>{brief.hint}</p>
      <p
        className={cn(
          'mt-2.5 whitespace-pre-line break-words text-[14px] font-medium leading-[1.6] text-foreground',
          c.state === 'error' && 'select-all',
        )}
      >
        <Rich text={brief.text} placeholders />
      </p>
      <div className="mt-3 flex flex-col items-stretch gap-2 sm:items-end">
        <CopyButton kind="text" state={c.state} onCopy={() => c.copy(brief.text)} />
        <CopyError state={c.state} />
      </div>
    </div>
  );
}
