'use client';
/** Tabs (§2.5) — MockTabs classes; "Hammasi" shows only Umumiy/Hozir/Yozuvlar + a muted hint. */
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { TABS_FOR, TAB_HREF, TAB_LABEL } from './labels';
import { useAnalyticsFilters } from './use-analytics-filters';

export function AnalyticsTabs({ liveNow }: { liveNow: boolean }) {
  const { site, tab, qs } = useAnalyticsFilters();
  const nav = useRef<HTMLElement>(null);
  // phones: bring the active tab into view — horizontally only (no vertical page jump)
  useEffect(() => {
    const n = nav.current;
    const a = n?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!n || !a) return;
    const left = a.offsetLeft - n.offsetLeft;
    if (left < n.scrollLeft) n.scrollLeft = Math.max(0, left - 8);
    else if (left + a.offsetWidth > n.scrollLeft + n.clientWidth) n.scrollLeft = left + a.offsetWidth - n.clientWidth + 8;
  }, [tab, site]);
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <nav ref={nav} className="relative flex min-w-0 gap-2 overflow-x-auto pb-1" aria-label="Analitika bo'limlari">
        {TABS_FOR[site].map((t) => {
          const active = t === tab;
          return (
            <Link key={t} href={`${TAB_HREF[t]}${qs}`} aria-current={active ? 'page' : undefined} scroll={false}
              className={cn('inline-flex h-[40px] flex-shrink-0 items-center gap-1.5 rounded-ctl px-4 text-[13px] font-bold whitespace-nowrap',
                active ? 'bg-background text-primary shadow-nm-inset-sm' : 'bg-background text-muted shadow-nm-sm hover:text-foreground')}>
              {TAB_LABEL[t]}
              {t === 'live' && liveNow ? <><span aria-hidden className="size-1.5 rounded-full bg-success" /><span className="sr-only">faol</span></> : null}
            </Link>
          );
        })}
      </nav>
      {site === 'all' ? <span className="text-[12px] font-medium text-muted">Boshqa bo&apos;limlar uchun bitta saytni tanlang</span> : null}
    </div>
  );
}
