'use client';

import type { UseFormReturn } from 'react-hook-form';
import { NmInput } from '@/components/ui/nm-input';
import { NmSelect } from '@/components/ui/nm-select';
import { FieldLabel } from '@/components/ui/label';
import { useSubjectOptions } from '@/lib/hooks/use-subjects';
import { useTeacherOptions } from '@/lib/hooks/use-teachers';
import { useRoomOptions } from '@/lib/hooks/use-rooms';
import { GROUP_LEVEL_META, type GroupLevel } from '@/lib/types/group';
import type { GroupFormValues } from './group-schema';

const WEEK_DAYS = ['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha', 'Ya'];
const LEVELS = Object.keys(GROUP_LEVEL_META) as GroupLevel[];

function parseScheduleDays(schedule: string): string[] {
  if (schedule === 'Har kuni') return [...WEEK_DAYS];
  return schedule.split('·').map((d) => d.trim()).filter((d) => WEEK_DAYS.includes(d));
}

function formatScheduleDays(days: string[]): string {
  const ordered = WEEK_DAYS.filter((d) => days.includes(d));
  return ordered.length === 7 ? 'Har kuni' : ordered.join(' · ');
}

/** Form fields for creating a group. */
export function CreateGroupFields({ form }: { form: UseFormReturn<GroupFormValues> }) {
  const subjects = useSubjectOptions();
  const teachers = useTeacherOptions();
  const rooms = useRoomOptions();
  const { register, formState, watch, setValue } = form;
  const err = formState.errors;
  const selectedDays = parseScheduleDays(watch('schedule') ?? '');

  const toggleDay = (day: string) => {
    const next = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day];
    setValue('schedule', formatScheduleDays(next), { shouldValidate: true });
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <FieldLabel>GURUH NOMI</FieldLabel>
        <NmInput placeholder="Masalan: Ingliz tili A1" {...register('name')} />
        {err.name ? <p className="mt-1.5 text-[12px] font-semibold text-danger">{err.name.message}</p> : null}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
      <div>
        <FieldLabel>DARS KUNLARI</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {WEEK_DAYS.map((day) => {
            const active = selectedDays.includes(day);
            return (
              <button
                key={day}
                type="button"
                aria-pressed={active}
                onClick={() => toggleDay(day)}
                className={`h-9 min-w-[42px] rounded-ctl px-2.5 text-[13px] font-semibold transition-colors nm-pressable ${
                  active
                    ? 'bg-grad-primary text-white shadow-nm-primary'
                    : 'bg-background text-muted shadow-nm-sm hover:text-primary'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
        {err.schedule ? <p className="mt-1.5 text-[12px] font-semibold text-danger">{err.schedule.message}</p> : null}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <FieldLabel>XONA</FieldLabel>
          <NmSelect defaultValue="" {...register('roomId')}>
            <option value="">Xonasiz</option>
            {rooms.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </NmSelect>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div>
          <FieldLabel>BOSHLANISHI</FieldLabel>
          <NmInput type="time" defaultValue="18:00" {...register('startTime')} />
        </div>
        <div>
          <FieldLabel>TUGASHI</FieldLabel>
          <NmInput type="time" {...register('endTime')} />
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
