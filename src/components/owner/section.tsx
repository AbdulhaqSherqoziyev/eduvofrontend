/** Owner-panel building blocks shared by sections (mock, analytics): card section, key/value grid, muted line. */
import { NmCard } from '@/components/ui/nm-card';
import { cn } from '@/lib/utils/cn';

export function Section({ title, children, action, className }: { title: string; children: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <NmCard className={cn('flex flex-col gap-3 p-5', className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-extrabold text-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </NmCard>
  );
}

/** Two-column key/value grid (label muted, value bold). */
export function KV({ rows }: { rows: Array<[string, React.ReactNode]> }) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
      {rows.map(([k, v]) => (
        <div key={k} className="flex min-w-0 flex-col">
          <dt className="text-[11px] font-bold uppercase tracking-[0.8px] text-muted">{k}</dt>
          <dd className="break-words text-[13.5px] font-semibold text-foreground">{v ?? '—'}</dd>
        </div>
      ))}
    </dl>
  );
}

export const Muted = ({ children }: { children: React.ReactNode }) => <p className="text-[13px] font-medium text-muted">{children}</p>;
