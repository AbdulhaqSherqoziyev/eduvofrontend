'use client';

import type { UseFormReturn } from 'react-hook-form';
import { NmInput } from '@/components/ui/nm-input';
import { NmSelect } from '@/components/ui/nm-select';
import { FieldLabel } from '@/components/ui/label';
import { useSubjectOptions } from '@/lib/hooks/use-subjects';
import { useTeacherOptions } from '@/lib/hooks/use-teachers';
import { GROUP_LEVEL_META, type GroupLevel } from '@/lib/types/group';
import type { GroupFormValues } from './group-schema';

const SCHEDULES = ['Du · Cho · Ju', 'Se · Pa · Sha', 'Har kuni'];
const LEVELS = Object.keys(GROUP_LEVEL_META) as GroupLevel[];

/** Form fields for creating a group. */
export function CreateGroupFields({ form }: { form: UseFormReturn<GroupFormValues> }) {
  const subjects = useSubjectOptions();
  const teachers = useTeacherOptions();
  const { register, formState } = form;
  const err = formState.errors;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <FieldLabel>GURUH NOMI</FieldLabel>
        <NmInput placeholder="Masalan: Ingliz tili A1" {...register('name')} />
        {err.name ? <p className="mt-1.5 text-[12px] font-semibold text-danger">{err.name.message}</p> : null}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>FAN</FieldLabel>
          <NmSelect defaultValue="" {...register('subjectId')}>
            <option value="" disabled>Fanni tanlang...</option>
            {subjects.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </NmSelect>
        </div>
        <div>
          <FieldLabel>O&apos;QITUVCHI</FieldLabel>
          <NmSelect defaultValue="" {...register('teacherId')}>
            <option value="" disabled>O&apos;qituvchini tanlang...</option>
            {teachers.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </NmSelect>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <FieldLabel>JADVAL</FieldLabel>
          <NmSelect {...register('schedule')}>
            {SCHEDULES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </NmSelect>
        </div>
        <div>
          <FieldLabel>VAQT</FieldLabel>
          <NmInput defaultValue="18:00" {...register('startTime')} />
        </div>
        <div>
          <FieldLabel>DARAJA</FieldLabel>
          <NmSelect {...register('level')}>
            {LEVELS.map((l) => (
              <option key={l} value={l}>{GROUP_LEVEL_META[l].label}</option>
            ))}
          </NmSelect>
        </div>
      </div>
      <div>
        <FieldLabel>NARX (SO&apos;M)</FieldLabel>
        <NmInput type="number" inputMode="numeric" placeholder="500000" {...register('price')} />
        {err.price ? <p className="mt-1.5 text-[12px] font-semibold text-danger">{err.price.message}</p> : null}
      </div>
    </div>
  );
}
