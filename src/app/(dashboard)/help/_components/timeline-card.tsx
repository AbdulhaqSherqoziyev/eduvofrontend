import { cn } from '@/lib/utils/cn';
import type { HelpTimeline } from '@/lib/help/types';
import { Rich } from './rich-text';
import { LABEL, SOFT } from './styles';

/** "Oy davomida tizim o'zi nima qiladi" — static month timeline (§10.3). */
export function TimelineCard({ timeline }: { timeline: HelpTimeline }) {
  if (!timeline.items.length) return null;
  return (
    <div className="mt-3 rounded-[16px] bg-background p-4 shadow-nm-inset-sm">
      <div className={LABEL}>{timeline.title}</div>
      <p className={cn('mt-1 text-[12.5px] font-semibold', SOFT)}>{timeline.hint}</p>
      <ol className="mt-3 flex flex-col gap-3 border-l-2 border-[rgba(46,107,230,0.25)] pl-4">
        {timeline.items.map((it, i) => (
          <li key={i}>
            <div className="text-[12px] font-extrabold text-primary tabular-nums">{it.label}</div>
            <p className="mt-0.5 break-words text-[13.5px] font-semibold leading-[1.5] text-foreground">
              <Rich text={it.text} />
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}
