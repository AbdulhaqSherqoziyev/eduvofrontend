import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Rich } from './rich-text';
import { LABEL } from './styles';

/** "Bilasizmi?" — one per section, at its end (§10.1). */
export function TipCard({ text }: { text: string }) {
  return (
    <div className="mt-3 rounded-[16px] bg-[rgba(46,107,230,0.07)] p-4 dark:bg-[rgba(79,131,240,0.10)]">
      <div className={cn('mb-1.5 flex items-center gap-1.5', LABEL)}>
        <Sparkles className="size-4 text-primary" aria-hidden /> Bilasizmi?
      </div>
      <p className="text-[13.5px] font-semibold leading-[1.55] text-foreground">
        <Rich text={text} />
      </p>
    </div>
  );
}
