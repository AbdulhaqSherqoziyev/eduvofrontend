'use client';

import { Search, Trash2, Users } from 'lucide-react';
import { NmInput } from '@/components/ui/nm-input';
import { NmSegmented } from '@/components/ui/nm-segmented';
import { NmButton } from '@/components/ui/nm-button';
import { STUDENT_FILTERS } from '@/lib/types/student';

interface ToolbarProps {
  search: string;
  onSearch: (v: string) => void;
  filter: string;
  onFilter: (v: string) => void;
  trashed: boolean;
  onToggleTrash: () => void;
}

/** Search pill + status filter + trash toggle for the students screen. */
export function StudentsToolbar({ search, onSearch, filter, onFilter, trashed, onToggleTrash }: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-5">
      <NmInput
        className="h-12 w-[340px] max-w-full"
        placeholder="Ism yoki guruh bo'yicha qidirish..."
        icon={<Search className="size-[18px]" />}
        value={search}
        onChange={(e) => onSearch(e.target.value)}
      />
      <div className="flex items-center gap-3">
        {!trashed ? (
          <NmSegmented className="h-12 w-[430px] max-w-full" items={STUDENT_FILTERS} value={filter} onValueChange={onFilter} />
        ) : null}
        <NmButton variant="soft" size="md" onClick={onToggleTrash}>
          {trashed ? <Users className="size-[18px]" /> : <Trash2 className="size-[18px]" />}
          {trashed ? 'Faollar' : 'Korzina'}
        </NmButton>
      </div>
    </div>
  );
}
