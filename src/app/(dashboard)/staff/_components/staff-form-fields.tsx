'use client';

import type { UseFormReturn } from 'react-hook-form';
import { NmInput } from '@/components/ui/nm-input';
import { FieldLabel } from '@/components/ui/label';
import { useRoles } from '@/lib/hooks/use-roles';
import { cn } from '@/lib/utils/cn';
import type { StaffFormValues } from './staff-schema';

interface Props {
  form: UseFormReturn<StaffFormValues>;
  withPassword?: boolean;
  passwordLabel?: string;
  roleIds: string[];
  onToggleRole: (id: string) => void;
}

/** Shared name / phone / role-picker (+ optional password) for staff dialogs. */
export function StaffFormFields({ form, withPassword, passwordLabel, roleIds, onToggleRole }: Props) {
  const { register, formState: { errors } } = form;
  const { data: roles } = useRoles();
  const err = (m?: string) => (m ? <p className="mt-1.5 text-[12px] font-semibold text-danger">{m}</p> : null);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <FieldLabel>ISM FAMILIYA</FieldLabel>
        <NmInput placeholder="Masalan: Dilshod Karimov" {...register('fullName')} />
        {err(errors.fullName?.message)}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel>TELEFON</FieldLabel>
          <NmInput placeholder="+998 90 ..." {...register('phone')} />
          {err(errors.phone?.message)}
        </div>
        <div>
          <FieldLabel>LAVOZIM</FieldLabel>
          <NmInput placeholder="Masalan: Menejer" {...register('defaultRole')} />
        </div>
      </div>
      {withPassword ? (
        <div>
          <FieldLabel>{passwordLabel ?? 'PAROL'}</FieldLabel>
          <NmInput type="text" placeholder="Kamida 6 belgi" {...register('password')} />
          {err(errors.password?.message)}
        </div>
      ) : null}
      <div>
        <FieldLabel>ROLLAR</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {(roles ?? []).map((r) => {
            const active = roleIds.includes(r.id);
            return (
              <button
                type="button" key={r.id} onClick={() => onToggleRole(r.id)}
                className={cn(
                  'rounded-ctl px-3.5 py-2 text-[12.5px] font-bold transition-shadow',
                  active ? 'bg-primary text-white shadow-nm-sm' : 'bg-background text-muted shadow-nm-inset-sm',
                )}
              >
                {r.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
