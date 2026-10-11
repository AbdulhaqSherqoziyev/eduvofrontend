'use client';

import Link from 'next/link';
import type { CatalogFamily } from '@/lib/api/center-exams-v3';
import { can } from '@/lib/auth/permissions';
import { cn } from '@/lib/utils/cn';
import { familySoon, kr } from '../exam-meta';
import { FAMILY_INK, PRESS, SH } from '../tokens';
import { Card, SoonChip } from '../ui';

const TILE_SM = 'shadow-[inset_-3px_-3px_6px_rgba(255,255,255,0.85),inset_3px_3px_6px_rgba(163,177,198,0.5)] dark:shadow-nm-inset-sm';

/** Abbreviation tile (design: 52px/r16 on cards, 60px/r18 on the detail page). */
export function ExamTile({ family, abbr, large }: { family: string; abbr: string; large?: boolean }) {
  return (
    <div
      className={cn(
        'flex flex-shrink-0 items-center justify-center bg-background font-extrabold',
        large ? `size-[60px] rounded-[18px] text-[18px] ${SH.well}` : `size-[52px] rounded-[16px] text-[16px] ${TILE_SM}`,
      )}
      style={{ color: FAMILY_INK[family] }}
    >
      {abbr}
    </div>
  );
}

const btn = `flex h-[42px] flex-1 items-center justify-center rounded-[13px] bg-background text-[13.5px] ${SH.btn} ${PRESS}`;

/** Catalogue card (design v3 `examCards`) — one per exam family. */
export function ExamCard({ f, onAssign }: { f: CatalogFamily; onAssign: () => void }) {
  const soon = familySoon(f);
  return (
    <Card className="flex flex-col gap-[18px] p-6">
      <div className="flex items-center gap-3.5">
        <ExamTile family={f.family} abbr={f.abbr} />
        <div className="min-w-0 flex-1">
          <div className="text-[17px] font-extrabold tracking-[-0.3px]">{f.name}</div>
          <div className="mt-[3px] text-[12.5px] font-semibold text-muted">{f.ver}</div>
        </div>
        {soon ? <span className="flex-shrink-0"><SoonChip /></span> : null}
      </div>
      <div className="flex flex-wrap gap-[7px]">
        {f.sectionChips.map((s) => (
          <span key={s} className={`rounded-[9px] bg-background px-2.5 py-1.5 text-[12px] font-bold text-[#5b6b82] ${SH.chip}`}>{s}</span>
        ))}
      </div>
      <div className={`grid grid-cols-3 gap-2.5 rounded-[16px] p-3.5 ${SH.well}`}>
        <Cell k="DAVOMIYLIK" v={f.durationLabel || '—'} />
        <Cell k="NARX" v={kr(f.priceCredits)} />
        <Cell k="O'RTACHA" v={f.avg ?? '—'} />
      </div>
      <div className="flex gap-2.5">
        <Link href={`/exams/catalog/${encodeURIComponent(f.family)}`} className={`${btn} font-bold text-foreground`}>Batafsil</Link>
        {can('exam.assign') ? (
          <button
            type="button"
            onClick={onAssign}
            disabled={soon}
            title={soon ? 'Tez kunda' : undefined}
            className={`${btn} font-extrabold text-primary disabled:cursor-not-allowed disabled:opacity-60`}
          >
            Tayinlash
          </button>
        ) : null}
      </div>
    </Card>
  );
}

function Cell({ k, v }: { k: string; v: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] font-bold tracking-[0.7px] text-[#9aa6b8]">{k}</div>
      <div className="mt-1 truncate text-[14px] font-extrabold">{v}</div>
    </div>
  );
}
