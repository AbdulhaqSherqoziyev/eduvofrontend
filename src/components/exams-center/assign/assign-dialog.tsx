'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/shared/skeleton';
import { useExamCatalog } from '@/lib/hooks/use-center-exams';
import { useExamCredits } from '@/lib/hooks/use-center-exams-v3';
import { useGroups } from '@/lib/hooks/use-groups';
import type { CatalogFamily, Family } from '@/lib/api/center-exams-v3';
import type { Group } from '@/lib/types/group';
import { examErrorText, insufficientCredits } from '../exam-errors';
import { FAMILIES, familySoon } from '../exam-meta';
import { SH } from '../tokens';
import { ChipButton, InlineError, PrimaryButton, SoftButton } from '../ui';
import { useAssignForm } from './use-assign-form';

interface Props { open: boolean; onOpenChange: (v: boolean) => void; presetFamily?: Family }

const FIELD = `h-[46px] w-full rounded-[13px] bg-background px-3.5 text-[14px] font-bold text-foreground outline-none ${SH.inset}`;

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-[9px] text-[11px] font-bold tracking-[0.9px] text-muted">{children}</div>;
}

/** "Guruhga mock tayinlash" (design v3 assign modal) — POST /exams/assignments. */
export function AssignDialog({ open, onOpenChange, presetFamily }: Props) {
  const catalog = useExamCatalog();
  const groups = useGroups({ pageSize: 100 });
  const ready = catalog.data && groups.data;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col gap-[18px] p-6 md:p-[30px]" aria-describedby={undefined}>
        <DialogTitle className="text-[21px] font-extrabold tracking-[-0.4px] text-foreground">Guruhga mock tayinlash</DialogTitle>
        {catalog.isError || groups.isError ? (
          <InlineError text="Ma'lumotni yuklab bo'lmadi." onRetry={() => { void catalog.refetch(); void groups.refetch(); }} />
        ) : !ready ? (
          <div className="flex flex-col gap-3"><Skeleton className="h-9 w-full" /><Skeleton className="h-9 w-full" /><Skeleton className="h-[46px] w-full" /></div>
        ) : open ? (
          <AssignForm
            key={presetFamily ?? 'any'}
            families={catalog.data.families ?? []}
            groups={groups.data.items}
            presetFamily={presetFamily}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function AssignForm({ families, groups, presetFamily, onClose }: { families: CatalogFamily[]; groups: Group[]; presetFamily?: Family; onClose: () => void }) {
  const router = useRouter();
  const f = useAssignForm(families, groups, presetFamily);
  const credits = useExamCredits().data?.credits;
  const short = insufficientCredits(f.create.error);
  const overBudget = f.cost != null && credits != null && f.cost > credits;
  return (
    <>
      <div>
        <FieldLabel>IMTIHON</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {FAMILIES.map((k) => {
            const soon = familySoon(families.find((x) => x.family === k) ?? { family: k });
            return (
              <ChipButton key={k} kind="picker" active={f.family === k} disabled={soon} onClick={() => f.setFamily(k)}>
                {k}{soon ? <span className="ml-1.5 text-[11px] font-semibold">· tez kunda</span> : null}
              </ChipButton>
            );
          })}
        </div>
      </div>
      <div>
        <FieldLabel>GURUH</FieldLabel>
        {groups.length ? (
          <div className="flex max-h-[132px] flex-wrap gap-2 overflow-y-auto p-1">
            {groups.map((g) => <ChipButton key={g.id} kind="picker" active={f.groupId === g.id} onClick={() => f.setGroupId(g.id)}>{g.name}</ChipButton>)}
          </div>
        ) : (
          <p className="text-[12.5px] font-semibold text-muted">Guruh yo&apos;q.</p>
        )}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <FieldLabel>SANA</FieldLabel>
          <input type="date" className={FIELD} value={f.win.date} onChange={(e) => f.setWin({ ...f.win, date: e.target.value })} />
        </div>
        <div>
          <FieldLabel>VAQT ORALIG&apos;I</FieldLabel>
          <input className={FIELD} inputMode="numeric" value={f.win.range} onChange={(e) => f.setWin({ ...f.win, range: e.target.value })} />
        </div>
      </div>
      <div className={`flex items-center justify-between gap-3 rounded-[16px] px-4 py-3.5 text-[13.5px] font-semibold text-[#5b6b82] ${SH.well}`}>
        <span>{f.group?.name ?? '—'} · {f.headcount} o&apos;quvchi × {f.price ?? '—'} kredit</span>
        <b className="whitespace-nowrap text-[16px] text-primary">{f.cost != null ? `${f.cost} kredit` : '—'}</b>
      </div>
      {short || overBudget ? (
        <div className="rounded-[14px] bg-[#FFF1D6] px-4 py-3 text-[12.5px] font-semibold leading-[1.5] text-[#7A4E00]">
          Kredit yetarli emas: kerak {short?.requiredCredits ?? f.cost} kredit, balansda {short?.credits ?? credits} kredit.{' '}
          <Link href="/exams/credits" onClick={onClose} className="font-extrabold text-primary underline-offset-2 hover:underline">Kreditlar</Link>
        </div>
      ) : null}
      {f.problem ? <p className="text-[12.5px] font-bold text-danger">{f.problem}</p> : null}
      {f.create.error && !short ? <p className="text-[12.5px] font-bold text-danger">{examErrorText(f.create.error)}</p> : null}
      <div className="flex gap-2.5">
        <SoftButton className="h-12 flex-1 text-[14px] font-bold text-[#5b6b82]" onClick={onClose} disabled={f.create.isPending}>Bekor qilish</SoftButton>
        <PrimaryButton
          className="h-12 flex-[1.4]"
          disabled={f.create.isPending || overBudget}
          onClick={() => f.submit(() => { onClose(); router.push('/exams/assignments'); })}
        >
          {f.create.isPending ? 'Tayinlanmoqda…' : 'Tayinlash'}
        </PrimaryButton>
      </div>
    </>
  );
}
