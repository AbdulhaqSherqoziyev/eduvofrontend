'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { NmDialog } from '@/components/ui/nm-dialog';
import { NmButton } from '@/components/ui/nm-button';
import { NmSelect } from '@/components/ui/nm-select';
import { FieldLabel } from '@/components/ui/label';
import { NmSkeleton } from '@/components/ui/nm-skeleton';
import { useGroups } from '@/lib/hooks/use-groups';
import { useAddStudentGroup, useUpdateStudent } from '@/lib/hooks/use-students';
import {
  ADD_TO_GROUP, ADDED_MSG, GENERIC_FAIL_MSG, MOVE_TO_GROUP, MOVED_MSG, NO_OTHER_GROUP_MSG, addNote,
  customPriceMoveNote, groupChangeError, moveNote,
} from '@/lib/utils/group-move';
import { formatSom } from '@/lib/utils/format';
import type { StudentProfileGroup } from '@/lib/types/student';

interface GroupChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  /** Groups the student is in now — never offered again. */
  memberGroupIds: string[];
  /** Set = move out of this group (PATCH); absent = add one more group (POST). */
  from?: StudentProfileGroup;
}

/**
 * Profile: add the student to one more group, or move them out of one group
 * into another. The price is never sent — the group price applies, and an own
 * price is set afterwards with "Narxni o'zgartirish".
 */
export function GroupChangeDialog({ open, onOpenChange, studentId, memberGroupIds, from }: GroupChangeDialogProps) {
  const groupsQuery = useGroups({ pageSize: 100 });
  const add = useAddStudentGroup(studentId);
  const move = useUpdateStudent(studentId);
  const [groupId, setGroupId] = useState('');
  const [error, setError] = useState<string>();
  const [done, setDone] = useState<string | null>(null);

  const options = (groupsQuery.data?.items ?? []).filter((g) => !memberGroupIds.includes(g.id));
  const picked = options.find((g) => g.id === groupId);
  const pending = add.isPending || move.isPending;

  const onSubmit = async () => {
    if (!picked) return;
    setError(undefined);
    try {
      if (from) {
        await move.mutateAsync({ groupId: picked.id, fromGroupId: from.id });
        setDone(MOVED_MSG);
      } else {
        await add.mutateAsync(picked.id);
        setDone(ADDED_MSG);
      }
    } catch (err) {
      setError(groupChangeError(err));
    }
  };

  let body: React.ReactNode;
  if (done) {
    body = (
      <div className="flex flex-col gap-5">
        <p className="flex items-center gap-2 text-[14px] font-bold text-success">
          <Check className="size-[18px]" strokeWidth={2.6} /> {done}
        </p>
        <NmButton type="button" onClick={() => onOpenChange(false)}>Yopish</NmButton>
      </div>
    );
  } else if (groupsQuery.isLoading) {
    body = <NmSkeleton className="h-[50px] w-full rounded-ctl" />;
  } else if (groupsQuery.isError) {
    body = (
      <div className="flex flex-col gap-4">
        <p className="text-[13px] font-semibold text-danger">{GENERIC_FAIL_MSG}</p>
        <NmButton type="button" variant="soft" onClick={() => groupsQuery.refetch()}>Qayta urinish</NmButton>
      </div>
    );
  } else if (options.length === 0) {
    body = <p className="text-[13px] font-semibold text-[#5b6b82]">{NO_OTHER_GROUP_MSG}</p>;
  } else {
    body = (
      <div className="flex flex-col gap-4">
        <div>
          <FieldLabel htmlFor="group-change-select">GURUH</FieldLabel>
          <NmSelect id="group-change-select" value={groupId} onChange={(e) => { setGroupId(e.target.value); setError(undefined); }}>
            <option value="" disabled>Guruhni tanlang...</option>
            {options.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </NmSelect>
          {picked ? (
            <p className="mt-2 text-[12px] font-semibold leading-[1.5] text-muted">
              {from ? moveNote(from.name, picked.name) : addNote(picked.name)}
            </p>
          ) : null}
          {picked && from && from.customPrice !== undefined && from.customPrice !== null ? (
            <p className="mt-1.5 text-[12px] font-semibold leading-[1.5] text-[#5b6b82]">
              {customPriceMoveNote(formatSom(from.customPrice))}
            </p>
          ) : null}
        </div>
        {error ? <p role="alert" className="text-[12px] font-semibold text-danger">{error}</p> : null}
        <div className="flex gap-3">
          <NmButton type="button" variant="soft" className="flex-1" disabled={pending} onClick={() => onOpenChange(false)}>
            Bekor qilish
          </NmButton>
          <NmButton type="button" className="flex-[1.4]" disabled={!picked || pending} onClick={onSubmit}>
            {pending ? '...' : from ? "O'tkazish" : "Qo'shish"}
          </NmButton>
        </div>
      </div>
    );
  }

  return (
    <NmDialog open={open} onOpenChange={onOpenChange} title={from ? MOVE_TO_GROUP : ADD_TO_GROUP}>
      {body}
    </NmDialog>
  );
}
