'use client';

import { useState } from 'react';
import { NmCard } from '@/components/ui/nm-card';
import { NmButton } from '@/components/ui/nm-button';
import { NmDialog } from '@/components/ui/nm-dialog';
import { NmInput } from '@/components/ui/nm-input';
import { FieldLabel } from '@/components/ui/label';
import { Can } from '@/components/shared/can';
import { useSetOpening } from '@/lib/hooks/use-cash';
import { apiErrorMessage } from '@/lib/utils/api-error';
import { isoDay } from '@/lib/utils/tx-display';
import { AmountField } from '@/components/shared/amount-field';

/**
 * §A.3 — the starting figure, asked once.
 *
 * The ledger begins the day the center joined ERS; whatever was in the drawer
 * before that exists nowhere. Until this is answered no balance is shown at
 * all, because a figure counted from an unknown start is simply wrong — and it
 * is NOT stored as an income row, which would inflate the first month's
 * revenue and make the very first profit figure a lie.
 */
export function OpeningBalanceCard() {
  const [open, setOpen] = useState(false);
  const [cash, setCash] = useState('');
  const [card, setCard] = useState('');
  const [at, setAt] = useState(isoDay());
  const [error, setError] = useState('');
  const save = useSetOpening();

  const submit = async () => {
    setError('');
    try {
      await save.mutateAsync({ cashOpening: Number(cash || 0), cardOpening: Number(card || 0), openingAt: at });
      setOpen(false);
    } catch (e) {
      setError(apiErrorMessage(e, "Server javob bermadi. Yozuv saqlanmadi — qayta urinib ko'ring."));
    }
  };

  return (
    <Can permission="transaction.create">
      <NmCard className="p-[22px] ring-1 ring-primary/25">
        <div className="text-[15px] font-extrabold text-foreground">Kassa qoldig&apos;i hali belgilanmagan</div>
        <p className="mt-1.5 max-w-[560px] text-[12.5px] font-medium text-muted">
          Hozir kassada qancha naqd va kartada qancha pul borligini bir marta kiriting — keyingi hisob shu
          raqamdan boshlanadi.
        </p>
        <NmButton className="mt-4" onClick={() => setOpen(true)}>
          Qoldiqni kiritish
        </NmButton>
      </NmCard>

      <NmDialog open={open} onOpenChange={setOpen} title="Boshlang'ich qoldiq">
        <div className="flex flex-col gap-5">
          <AmountField id="opening-cash" label="NAQD KASSADA" value={cash} onChange={setCash} autoFocus />
          <AmountField id="opening-card" label="KARTA / BANK HISOBIDA" value={card} onChange={setCard} />
          <div>
            <FieldLabel htmlFor="opening-at">SANADAN BOSHLAB</FieldLabel>
            <NmInput
              id="opening-at"
              type="date"
              max={isoDay()}
              value={at}
              onChange={(e) => setAt(e.target.value)}
            />
          </div>
          <p className="text-[11.5px] font-medium text-muted">
            Bu raqam kirim ham, foyda ham emas — u shunchaki boshlang&apos;ich nuqta. Hisobotlarga
            qo&apos;shilmaydi.
          </p>
          {error ? <p className="text-[11.5px] font-semibold text-danger">{error}</p> : null}
          <div className="flex gap-3">
            <NmButton variant="soft" className="flex-1" onClick={() => setOpen(false)}>
              Yopish
            </NmButton>
            <NmButton className="flex-[1.4]" disabled={save.isPending} onClick={submit}>
              {save.isPending ? 'Saqlanmoqda…' : 'Saqlash'}
            </NmButton>
          </div>
        </div>
      </NmDialog>
    </Can>
  );
}
