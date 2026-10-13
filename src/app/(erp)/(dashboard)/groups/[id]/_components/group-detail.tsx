'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { NmCard } from '@/components/ui/nm-card';
import { NmSegmented } from '@/components/ui/nm-segmented';
import { AttendanceMarker } from '@/components/attendance/attendance-marker';
import { GroupHeader } from './group-header';
import { RosterTable } from './roster-table';
import { GroupHomework } from './group-homework';
import { RosterPayments } from './roster-payments';

const TABS = [
  { value: 'students', label: "O'quvchilar" },
  { value: 'attendance', label: 'Davomat' },
  { value: 'homework', label: 'Uyga vazifa' },
  { value: 'payments', label: "To'lovlar" },
];

/** Owns the active-tab state and composes the group detail views. */
export function GroupDetail({ id }: { id: string }) {
  const [tab, setTab] = useState('students');

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/groups"
        className="inline-flex w-fit items-center gap-2.5 text-[13px] font-bold text-[#5b6b82]"
      >
        <span className="grid h-[28px] w-[28px] place-items-center rounded-[10px] bg-background shadow-nm-sm">
          <ChevronLeft className="h-4 w-4" />
        </span>
        Guruhlar ro&apos;yxati
      </Link>

      <GroupHeader id={id} />

      <NmSegmented items={TABS} value={tab} onValueChange={setTab} className="max-w-[560px] h-[52px]" />

      <NmCard className="p-[18px_20px]">
        {tab === 'students' && <RosterTable groupId={id} />}
        {tab === 'attendance' && <AttendanceMarker groupId={id} />}
        {tab === 'homework' && <GroupHomework groupId={id} />}
        {tab === 'payments' && <RosterPayments groupId={id} />}
      </NmCard>
    </div>
  );
}
