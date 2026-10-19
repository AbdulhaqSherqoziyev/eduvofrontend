'use client';
/** Small pieces shared by several tabs: KPI footer, section pill, "Hammasini ko'rish" link, live-list rows. */
import Link from 'next/link';
import { Info } from 'lucide-react';
import { NmButton } from '@/components/ui/nm-button';
import type { Metric } from '@/lib/api/owner-analytics.types';
import { DeltaText, type DeltaTone } from './delta-text';
import { fmtInt } from './format';
import { sinceText } from './states';

/** StatCard footer: delta, or "Kuzatuv N-dan" for a partly-tracked period, or the DB failure line. */
export function KpiFooter({ m, tone, today, partialSince, extra }: { m: Metric; tone: DeltaTone; today: boolean; partialSince?: string | null; extra?: React.ReactNode }) {
  let main: React.ReactNode;
  if (m.cur === null && m.curReason === 'db_error') main = <span className="text-[12px] font-medium text-muted">Bazadan olib bo&apos;lmadi</span>;
  else if (partialSince) main = <span className="text-[12px] font-medium text-muted">{sinceText(partialSince)}</span>;
  else main = <DeltaText cur={m.cur} prev={m.prev} tone={tone} today={today} />;
  return (
    <div className="flex flex-col gap-1">
      {main}
      {extra ? <span className="text-[12px] font-medium text-muted">{extra}</span> : null}
    </div>
  );
}

/** Muted inset pill in a section header (period). */
export const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="flex-shrink-0 whitespace-nowrap rounded-ctl bg-background px-3 py-1.5 text-[11px] font-bold tracking-[0.4px] text-muted shadow-nm-inset-sm">{children}</span>
);

/** Ghost sm link button ("Hammasini ko'rish", "Batafsil"). */
export function GhostLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <NmButton asChild variant="ghost" size="sm" className="h-auto flex-shrink-0 whitespace-nowrap px-0 py-1">
      <Link href={href} scroll={false}>{children}</Link>
    </NmButton>
  );
}

const DIRECT_NOTE = 'Telegram ilovasi ichidagi brauzer ko\'pincha manbani yubormaydi. Aniq bilish uchun UTM havola ishlating.';

/** Source name; the "direct" bucket carries the (i) note (§5.2). */
export function SourceName({ k, label }: { k: string; label: string }) {
  if (k !== 'direct') return <span className="font-semibold" title={label}>{label}</span>;
  return (
    <span className="inline-flex items-center gap-1 font-semibold">
      <span className="truncate">{label}</span>
      <span title={DIRECT_NOTE} className="inline-flex flex-shrink-0 cursor-help text-muted">
        <Info className="size-3.5" aria-hidden /><span className="sr-only">{DIRECT_NOTE}</span>
      </span>
    </span>
  );
}

/** Two-column name / count list (Hozir tab). */
export function CountList({ rows }: { rows: Array<{ key: string; name: React.ReactNode; count: number }> }) {
  return (
    <ul className="flex flex-col gap-1">
      {rows.map((r) => (
        <li key={r.key} className="flex items-center justify-between gap-3 rounded-[12px] px-2 py-2 text-[13px] hover:bg-[rgba(46,107,230,0.05)]">
          <span className="min-w-0 truncate font-semibold text-foreground">{r.name}</span>
          <span className="font-bold tabular-nums text-foreground">{fmtInt(r.count)}</span>
        </li>
      ))}
    </ul>
  );
}
