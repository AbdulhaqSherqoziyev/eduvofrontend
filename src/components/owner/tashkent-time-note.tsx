import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/** Muted "Toshkent vaqti" next to a date range (owner analytics §2.4, owner/mock/stats §1.3.1). */
export function TashkentTimeNote({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-[12px] font-medium text-muted', className)}>
      <Clock className="size-[14px]" aria-hidden /> Toshkent vaqti
    </span>
  );
}
