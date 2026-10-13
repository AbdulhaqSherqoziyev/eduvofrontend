'use client';

import type { UseFormReturn } from 'react-hook-form';
import { NmInput } from '@/components/ui/nm-input';
import { NmSelect } from '@/components/ui/nm-select';
import { FieldLabel } from '@/components/ui/label';
import { useGroupOptions } from '@/lib/hooks/use-groups';
import type { StudentFormValues } from './student-form-schema';

/** Shared name / phone / group fields for the add & edit student dialogs. */
export function StudentFormFields({ form }: { form: UseFormReturn<StudentFormValues> }) {
  const groups = useGroupOptions();
  const { register, formState } = form;
  const { errors } = formState;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <FieldLabel>ISM FAMILIYA</FieldLabel>
        <NmInput placeholder="Masalan: Akmal Yusupov" {...register('fullName')} />
        {errors.fullName ? <p className="mt-1.5 text-[12px] font-semibold text-danger">{errors.fullName.message}</p> : null}
      </div>
      <div>
        <FieldLabel>TELEFON RAQAM</FieldLabel>
        <NmInput placeholder="+998 90 123 45 67" {...register('phone')} />
        {errors.phone ? <p className="mt-1.5 text-[12px] font-semibold text-danger">{errors.phone.message}</p> : null}
      </div>
      <div>
        <FieldLabel>GURUHGA BIRIKTIRISH</FieldLabel>
        <NmSelect defaultValue="" {...register('groupId')}>
          <option value="" disabled>
            Guruhni tanlang...
          </option>
          {groups.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </NmSelect>
      </div>
    </div>
  );
}
