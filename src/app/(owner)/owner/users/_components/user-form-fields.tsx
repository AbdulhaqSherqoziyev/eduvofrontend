'use client';

import { CenterSelect } from '@/components/owner/center-select';
import { NmInput } from '@/components/ui/nm-input';
import { FieldLabel } from '@/components/ui/label';
import { cn } from '@/lib/utils/cn';
import { cleanPhone, stripSpaces } from '@/lib/utils/normalize';
import { useTenantRoles } from '@/lib/hooks/use-owner-users';

export interface UserFormState {
  fullName: string;
  phone: string;
  password: string;
  defaultRole: string;
}

interface Props {
  mode: 'add' | 'edit';
  values: UserFormState;
  onChange: (patch: Partial<UserFormState>) => void;
  tenantId: string;
  onTenantChange: (id: string) => void;
  centerName?: string;
  roleIds: string[];
  onToggleRole: (id: string) => void;
}

/** Inputs for the OWNER add/edit-user dialog — center, identity, role chips. */
export function UserFormFields(p: Props) {
  const { data: roles } = useTenantRoles(p.tenantId || undefined);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <FieldLabel>MARKAZ</FieldLabel>
        {p.mode === 'add'
          ? <CenterSelect value={p.tenantId} onChange={p.onTenantChange} includeAll={false} />
          : <div className="rounded-ctl bg-background px-4 py-3 text-[14px] font-bold text-foreground shadow-nm-inset-sm">{p.centerName}</div>}
      </div>
      <div>
        <FieldLabel>ISM FAMILIYA</FieldLabel>
        <NmInput placeholder="Masalan: Dilshod Karimov" value={p.values.fullName}
          onChange={(e) => p.onChange({ fullName: e.target.value })} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel>TELEFON</FieldLabel>
          <NmInput placeholder="+998 90 ..." value={p.values.phone}
            onChange={(e) => p.onChange({ phone: cleanPhone(e.target.value) })} />
        </div>
        <div>
          <FieldLabel>LAVOZIM</FieldLabel>
          <NmInput placeholder="Masalan: Menejer" value={p.values.defaultRole}
            onChange={(e) => p.onChange({ defaultRole: e.target.value })} />
        </div>
      </div>
      <div>
        <FieldLabel>{p.mode === 'add' ? 'PAROL' : 'YANGI PAROL (ixtiyoriy)'}</FieldLabel>
        <NmInput type="text" placeholder="Kamida 6 belgi" value={p.values.password}
          onChange={(e) => p.onChange({ password: stripSpaces(e.target.value) })} />
      </div>
      <div>
        <FieldLabel>ROLLAR</FieldLabel>
        {!p.tenantId ? (
          <p className="text-[12.5px] font-semibold text-[#9aa6b8]">Avval markazni tanlang.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {(roles ?? []).map((r) => (
              <button type="button" key={r.id} onClick={() => p.onToggleRole(r.id)}
                className={cn('rounded-ctl px-3.5 py-2 text-[12.5px] font-bold transition-shadow',
                  p.roleIds.includes(r.id) ? 'bg-primary text-white shadow-nm-sm' : 'bg-background text-muted shadow-nm-inset-sm')}>
                {r.name}
              </button>
            ))}
            {roles && roles.length === 0 ? <span className="text-[12.5px] text-[#9aa6b8]">Rollar yo&apos;q</span> : null}
          </div>
        )}
      </div>
    </div>
  );
}
