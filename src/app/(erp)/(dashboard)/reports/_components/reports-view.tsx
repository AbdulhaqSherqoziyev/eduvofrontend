'use client';

import { useState } from 'react';
import { NmSegmented } from '@/components/ui/nm-segmented';
import { Can } from '@/components/shared/can';
import { EmptyState } from '@/components/shared/empty-state';
import { FinanceReport } from './finance-report';
import { AttendanceReport } from './attendance-report';
import { TeacherReport } from './teacher-report';

const TABS = [
  { value: 'finance', label: 'Moliya' },
  { value: 'attendance', label: 'Davomat' },
  { value: 'teacher', label: 'O’qituvchilar' },
];

/** Owns the report tab state and renders the permission-gated active report. */
export function ReportsView() {
  const [tab, setTab] = useState('finance');

  return (
    <div className="flex flex-col gap-[22px]">
      <NmSegmented items={TABS} value={tab} onValueChange={setTab} className="max-w-[460px]" />

      {tab === 'finance' && (
        <Can permission="report.finance" fallback={<EmptyState title="Ruxsat yo'q" />}>
          <FinanceReport />
        </Can>
      )}
      {tab === 'attendance' && (
        <Can permission="report.attendance" fallback={<EmptyState title="Ruxsat yo'q" />}>
          <AttendanceReport />
        </Can>
      )}
      {tab === 'teacher' && (
        <Can permission="report.teacher" fallback={<EmptyState title="Ruxsat yo'q" />}>
          <TeacherReport />
        </Can>
      )}
    </div>
  );
}
