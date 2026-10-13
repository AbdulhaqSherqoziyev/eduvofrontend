'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { NmCard } from '@/components/ui/nm-card';
import { NmButton } from '@/components/ui/nm-button';
import { NmInput } from '@/components/ui/nm-input';
import { NmDialog } from '@/components/ui/nm-dialog';
import { FieldLabel } from '@/components/ui/label';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { can } from '@/lib/auth/permissions';
import { tenantApi } from '@/lib/api/tenant';
import { useTenantSettings } from '@/lib/hooks/use-tenant-settings';
import { useExpenseCategories, useSetOpening } from '@/lib/hooks/use-cash';
import { formatNumber } from '@/lib/utils/format';
import { formatDate } from '@/lib/utils/date';
import { isoDay } from '@/lib/utils/tx-display';
import { CategoryManagerDialog } from './category-manager-dialog';

function SettingRow({ children }: { children: React.ReactNode }) {
  return <div className="rounded-[14px] bg-background px-4 py-3 shadow-nm-inset-sm">{children}</div>;
}

/**
 * §H — cash desk settings, for whoever holds `report.finance`.
 *
 * The threshold hint is not decoration: set it too low and every ordinary
 * expense queues for approval, which stalls the cashier and — after [SV2] —
 * leaves their evening count differing every single day.
 */
export function CashSettingsCard() {
  const { data } = useTenantSettings();
  const qc = useQueryClient();
  const [limit, setLimit] = useState('');
  const [managing, setManaging] = useState(false);
  const [editingOpening, setEditingOpening] = useState(false);
  const [confirmOpening, setConfirmOpening] = useState(false);
  const [cash, setCash] = useState('');
  const [card, setCard] = useState('');

  const categories = useExpenseCategories({});
  const setOpening = useSetOpening();
  const save = useMutation({
    mutationFn: (value: number) => tenantApi.updateSettings({ expenseApprovalLimit: value }),
    onSuccess: (fresh) => qc.setQueryData(['tenant-settings'], fresh),
  });

  useEffect(() => {
    if (data) setLimit(String(Math.round(data.expenseApprovalLimit)));
  }, [data]);

  if (!can('report.finance') || !data) return null;

  const openingLine = data.openingAt
    ? `${formatDate(data.openingAt)} dan: naqd ${formatNumber(data.cashOpening)} · karta ${formatNumber(data.cardOpening)}`
    : "Hali belgilanmagan — Kassa ekranidan kiritiladi.";

  return (
    <NmCard className="p-5">
      <div className="mb-1 text-[15px] font-extrabold text-foreground">Kassa sozlamalari</div>
      <p className="mb-4 text-[12.5px] font-medium text-muted">Tasdiq chegarasi, boshlang&apos;ich qoldiq va kategoriyalar.</p>

      <div className="flex flex-col gap-3">
        <SettingRow>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-[13.5px] font-bold text-foreground">Xarajat tasdiq chegarasi</span>
            <div className="flex items-center gap-2">
              <NmInput
                inputMode="numeric"
                className="h-[42px] w-[130px] text-right"
                value={limit ? formatNumber(Number(limit)) : ''}
                onChange={(e) => setLimit(e.target.value.replace(/\D/g, ''))}
                onBlur={() => Number(limit || 0) !== data.expenseApprovalLimit && save.mutate(Number(limit || 0))}
              />
              <span className="text-[12.5px] font-semibold text-muted">so&apos;m</span>
            </div>
          </div>
          <p className="mt-1.5 text-[12px] text-muted">
            Shu summadan yuqori xarajat direktor tasdig&apos;idan keyin kassadan chiqadi. 0 — tasdiq talab
            qilinmaydi.
          </p>
          <p className="mt-1 text-[12px] text-muted">
            Chegara juda past bo&apos;lsa, kassirning har kunlik ishi tasdiq kutib to&apos;xtab qoladi.
          </p>
          {save.isError ? <p className="mt-2 text-[12px] font-semibold text-danger">Saqlashda xatolik</p> : null}
          {save.isSuccess ? <p className="mt-2 text-[12px] font-semibold text-success">Saqlandi ✓</p> : null}
        </SettingRow>

        <SettingRow>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-[13.5px] font-bold text-foreground">Kassa qoldig&apos;i (boshlang&apos;ich)</span>
            <NmButton
              variant="soft"
              size="sm"
              onClick={() => {
                setCash(String(Math.round(data.cashOpening)));
                setCard(String(Math.round(data.cardOpening)));
                setEditingOpening(true);
              }}
            >
              O&apos;zgartirish
            </NmButton>
          </div>
          <p className="mt-1.5 text-[12px] text-muted">{openingLine}</p>
        </SettingRow>

        <SettingRow>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-[13.5px] font-bold text-foreground">Xarajat kategoriyalari</span>
            <NmButton variant="soft" size="sm" onClick={() => setManaging(true)}>
              Boshqarish
            </NmButton>
          </div>
          <p className="mt-1.5 text-[12px] text-muted">{categories.data?.length ?? 0} ta kategoriya</p>
        </SettingRow>
      </div>

      <NmDialog open={editingOpening} onOpenChange={setEditingOpening} title="Boshlang'ich qoldiq">
        <div className="flex flex-col gap-5">
          <div>
            <FieldLabel htmlFor="set-cash">NAQD KASSADA</FieldLabel>
            <NmInput
              id="set-cash"
              inputMode="numeric"
              value={cash ? formatNumber(Number(cash)) : ''}
              onChange={(e) => setCash(e.target.value.replace(/\D/g, ''))}
            />
          </div>
          <div>
            <FieldLabel htmlFor="set-card">KARTA / BANK HISOBIDA</FieldLabel>
            <NmInput
              id="set-card"
              inputMode="numeric"
              value={card ? formatNumber(Number(card)) : ''}
              onChange={(e) => setCard(e.target.value.replace(/\D/g, ''))}
            />
          </div>
          <div className="flex gap-3">
            <NmButton variant="soft" className="flex-1" onClick={() => setEditingOpening(false)}>
              Yopish
            </NmButton>
            <NmButton className="flex-[1.4]" onClick={() => setConfirmOpening(true)}>
              Saqlash
            </NmButton>
          </div>
        </div>
      </NmDialog>

      <ConfirmDialog
        open={confirmOpening}
        onOpenChange={setConfirmOpening}
        title="Boshlang'ich qoldiqni o'zgartirish"
        message="Bu barcha kunlarning kassa hisobini qayta hisoblaydi va yakunlangan kunlarning farqini o'zgartiradi."
        confirmLabel="O'zgartirish"
        pending={setOpening.isPending}
        onConfirm={async () => {
          await setOpening.mutateAsync({
            cashOpening: Number(cash || 0),
            cardOpening: Number(card || 0),
            openingAt: data.openingAt ? isoDay(new Date(data.openingAt)) : isoDay(),
          });
          setConfirmOpening(false);
          setEditingOpening(false);
        }}
      />
      <CategoryManagerDialog open={managing} onOpenChange={setManaging} />
    </NmCard>
  );
}
