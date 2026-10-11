'use client';

import Link from 'next/link';
import { KeyRound, Pencil, Trash2 } from 'lucide-react';
import { NmButton } from '@/components/ui/nm-button';
import type { Assignment, CatalogExam } from '@/lib/api/center-exams';
import { can } from '@/lib/auth/permissions';
import { useExamCatalog } from '@/lib/hooks/use-center-exams';
import { phaseOf, PHASE_CHIP } from '../assignment-meta';
import { dateTimeLabel, familyOfCode, kr, sectionTitle } from '../exam-meta';
import { Caps, ToneChip } from '../ui';
import { ExamTile } from '../catalog/exam-card';

interface Props {
  a: Assignment; exam?: CatalogExam;
  onEdit: () => void; onDelete: () => void; onCodes: () => void; onPreview: () => void; previewPending: boolean;
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div className="min-w-0">
      <Caps>{k}</Caps>
      <div className="mt-1 truncate text-[14px] font-extrabold">{v}</div>
    </div>
  );
}

/** Assignment summary + actions (edit / delete / access codes / results / preview). */
export function AssignmentHeader({ a, exam, onEdit, onDelete, onCodes, onPreview, previewPending }: Props) {
  const phase = phaseOf(a);
  const chip = PHASE_CHIP[phase];
  const assign = can('exam.assign');
  const fam = familyOfCode(useExamCatalog().data?.families, a.examCode);
  return (
    <div className="flex flex-col gap-5 rounded-[24px] bg-background p-5 shadow-nm md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3.5">
          <ExamTile family={fam?.family ?? a.examCode.split('_')[0]} abbr={fam?.abbr ?? a.examCode.slice(0, 2)} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[19px] font-extrabold tracking-[-0.3px]">{a.title}</span>
              <ToneChip label={chip.label} fg={chip.fg} bg={chip.bg} />
            </div>
            <div className="mt-1 text-[13px] font-semibold text-muted">
              {exam?.name ?? a.examCode} · {a.testTitle ?? '—'} · {a.mode === 'section' ? sectionTitle(exam, a.sectionKey) : "To'liq"}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <NmButton variant="soft" size="sm" disabled={previewPending} onClick={onPreview}>
            {previewPending ? 'Ochilmoqda…' : "O'quvchi ko'rinishi ↗"}
          </NmButton>
          <Link href={`/exams/results?assignmentId=${a.id}`} className="flex h-[38px] items-center rounded-ctl bg-background px-4 text-[12.5px] font-bold text-primary shadow-nm-sm nm-pressable">
            Natijalar
          </Link>
          {assign ? (
            <>
              <NmButton variant="soft" size="sm" onClick={onCodes}><KeyRound className="mr-1.5 size-4" />Kirish kodlari</NmButton>
              <NmButton variant="soft" size="sm" onClick={onEdit}><Pencil className="mr-1.5 size-4" />Tahrirlash</NmButton>
              <NmButton variant="danger" size="sm" onClick={onDelete}><Trash2 className="mr-1.5 size-4" />O&apos;chirish</NmButton>
            </>
          ) : null}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 rounded-[16px] p-4 shadow-nm-inset md:grid-cols-5">
        <Fact k="GURUH" v={a.groupName ?? 'Alohida o\'quvchilar'} />
        <Fact k="BOSHLANISH" v={dateTimeLabel(a.windowStart)} />
        <Fact k="TUGASH" v={dateTimeLabel(a.windowEnd)} />
        <Fact k="NARX / O'QUVCHI" v={kr(a.priceCredits ?? (a.mode === 'section' ? 1 : fam?.priceCredits))} />
        <Fact k="TAYINLADI" v={a.createdByName ?? '—'} />
      </div>
    </div>
  );
}
