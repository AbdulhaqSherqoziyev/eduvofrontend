import { Inbox } from 'lucide-react';
import { NmCard } from '@/components/ui/nm-card';

interface EmptyStateProps {
  title?: string;
  hint?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

/** Friendly empty state shown when a query returns no rows. */
export function EmptyState({ title = "Ma'lumot yo'q", hint, icon, action }: EmptyStateProps) {
  return (
    <NmCard className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div className="flex size-14 items-center justify-center rounded-[16px] bg-background text-muted shadow-nm-inset-sm">
        {icon ?? <Inbox className="size-6" />}
      </div>
      <div className="text-[15px] font-bold text-foreground">{title}</div>
      {hint ? <div className="max-w-xs text-[13px] font-medium text-muted">{hint}</div> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </NmCard>
  );
}
