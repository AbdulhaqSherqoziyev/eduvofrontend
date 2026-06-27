'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { NmIconButton } from '@/components/ui/nm-icon-button';
import { NmSegmented } from '@/components/ui/nm-segmented';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const SIZES = [
  { value: '10', label: '10' },
  { value: '15', label: '15' },
  { value: '20', label: '20' },
];

/** Page-size (10/15/20) + prev/next pager shown under every paginated list. */
export function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-2 pt-1">
      <div className="text-[12.5px] font-semibold text-muted">
        Jami {total} tadan {start}–{end}
      </div>
      <div className="flex items-center gap-3">
        <NmSegmented
          className="h-9 w-[150px]"
          size="sm"
          value={String(pageSize)}
          onValueChange={(v) => onPageSizeChange(Number(v))}
          items={SIZES}
        />
        <NmIconButton aria-label="Oldingi" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="size-[16px]" strokeWidth={2.2} />
        </NmIconButton>
        <span className="min-w-[64px] text-center text-[12.5px] font-bold text-foreground">
          {page} / {totalPages}
        </span>
        <NmIconButton aria-label="Keyingi" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          <ChevronRight className="size-[16px]" strokeWidth={2.2} />
        </NmIconButton>
      </div>
    </div>
  );
}
