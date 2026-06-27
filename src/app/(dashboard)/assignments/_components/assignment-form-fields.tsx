'use client';

import type { UseFormReturn } from 'react-hook-form';
import { NmInput } from '@/components/ui/nm-input';
import { NmSelect } from '@/components/ui/nm-select';
import { NmTextarea } from '@/components/ui/nm-textarea';
import { FieldLabel } from '@/components/ui/label';
import { useGroupOptions } from '@/lib/hooks/use-groups';
import { FileAttach } from './file-attach';
import type { AssignmentFormValues } from './assignment-schema';

const ERR = 'mt-1.5 text-[12px] font-semibold text-danger';

interface Props {
  form: UseFormReturn<AssignmentFormValues>;
  fileIds: string[];
  onFiles: (ids: string[]) => void;
}

/** Title / group / due date / description / attachments fields. */
export function AssignmentFormFields({ form, fileIds, onFiles }: Props) {
  const groups = useGroupOptions();
  const { register, formState } = form;
  const { errors } = formState;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <FieldLabel>VAZIFA NOMI</FieldLabel>
        <NmInput placeholder="Masalan: 3-mavzu uyga vazifa" {...register('title')} />
        {errors.title ? <p className={ERR}>{errors.title.message}</p> : null}
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <FieldLabel>GURUH</FieldLabel>
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
          {errors.groupId ? <p className={ERR}>{errors.groupId.message}</p> : null}
        </div>
        <div className="flex-1">
          <FieldLabel>MUDDAT</FieldLabel>
          <NmInput type="date" {...register('dueDate')} />
          {errors.dueDate ? <p className={ERR}>{errors.dueDate.message}</p> : null}
        </div>
      </div>
      <div>
        <FieldLabel>IZOH</FieldLabel>
        <NmTextarea placeholder="Vazifa tafsilotlari..." {...register('description')} />
      </div>
      <div>
        <FieldLabel>BIRIKTIRMALAR</FieldLabel>
        <FileAttach value={fileIds} onChange={onFiles} />
      </div>
    </div>
  );
}
