'use client';

import type { UseFormReturn } from 'react-hook-form';
import { NmInput } from '@/components/ui/nm-input';
import { NmSelect } from '@/components/ui/nm-select';
import { FieldLabel } from '@/components/ui/label';
import { useSubjectOptions } from '@/lib/hooks/use-subjects';
import type { TeacherFormValues } from './teacher-schema';

/** Shared name / phone / salary / subject fields for add & edit teacher dialogs. */
export function TeacherFormFields({ form }: { form: UseFormReturn<TeacherFormValues> }) {
  const subjects = useSubjectOptions();
  const { register, formState } = form;
  const { errors } = formState;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <FieldLabel>ISM FAMILIYA</FieldLabel>
        <NmInput placeholder="Masalan: Dilshod Karimov" {...register('fullName')} />
        {errors.fullName ? <p className="mt-1.5 text-[12px] font-semibold text-danger">{errors.fullName.message}</p> : null}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel>TELEFON</FieldLabel>
          <NmInput placeholder="+998 90 ..." {...register('phone')} />
          {errors.phone ? <p className="mt-1.5 text-[12px] font-semibold text-danger">{errors.phone.message}</p> : null}
        </div>
        <div>
          <FieldLabel>OYLIK</FieldLabel>
          <NmInput inputMode="numeric" placeholder="5000000" {...register('salary')} />
          {errors.salary ? <p className="mt-1.5 text-[12px] font-semibold text-danger">{errors.salary.message}</p> : null}
        </div>
      </div>
      <div>
        <FieldLabel>FAN</FieldLabel>
        <NmSelect defaultValue="" {...register('subjectId')}>
          <option value="" disabled>
            Fanni tanlang...
          </option>
          {subjects.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </NmSelect>
      </div>
    </div>
  );
}
