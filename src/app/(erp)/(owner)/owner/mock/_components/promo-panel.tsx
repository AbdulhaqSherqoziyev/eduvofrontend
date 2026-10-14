'use client';
import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { NmCard } from '@/components/ui/nm-card';
import { NmIconButton } from '@/components/ui/nm-icon-button';
import { NmSwitch } from '@/components/ui/nm-switch';
import { EmptyState } from '@/components/shared/empty-state';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { RowsSkeleton } from '@/components/shared/skeleton';
import { useMockPromos, useTogglePromo } from '@/lib/hooks/use-owner-mock';
import type { MockPromo } from '@/lib/types/owner-mock';
import { fmtDate, mockErrorText } from './format';
import { PromoDialog } from './promo-dialog';
import { TableCard, rowCls } from './ui';

const COLS = 'grid-cols-[minmax(0,1fr)_70px_minmax(0,1.2fr)_110px_minmax(0,1fr)_90px_44px]';

function PromoRow({ p, onEdit }: { p: MockPromo; onEdit: () => void }) {
  const toggle = useTogglePromo();
  const [err, setErr] = useState('');
  const expired = !!p.validTo && new Date(p.validTo) < new Date();
  return (
    <div className={rowCls(COLS)}>
      <span className="flex min-w-0 flex-col"><b className="truncate text-foreground"><bdi dir="ltr">{p.code}</bdi></b>{p.providerDiscountId ? <span className="truncate text-[11.5px] text-muted">Paddle: {p.providerDiscountId}</span> : null}</span>
      <span className="font-bold text-foreground">{p.percentOff}%</span>
      <span className="min-w-0 truncate text-muted" title={p.skus.join(', ')}>{p.skus.length ? p.skus.join(', ') : 'Barcha mahsulotlar'}</span>
      <span className="text-foreground">{p.redemptions}{p.maxRedemptions ? ` / ${p.maxRedemptions}` : ''} <span className="text-muted">· {p.perLearnerLimit}/kishi</span></span>
      <span className="text-muted">{p.validFrom || p.validTo ? `${fmtDate(p.validFrom)} — ${fmtDate(p.validTo)}` : 'Muddatsiz'}{expired ? ' · tugagan' : ''}</span>
      <span className="flex flex-col gap-1">
        <NmSwitch checked={p.isActive} disabled={toggle.isPending} aria-label={p.isActive ? "O'chirish" : 'Yoqish'}
          onCheckedChange={(v) => { setErr(''); toggle.mutate({ id: p.id, isActive: v }, { onError: (e) => setErr(mockErrorText(e)) }); }} />
        {err ? <span role="alert" className="text-[11px] font-semibold text-danger">{err}</span> : null}
      </span>
      <NmIconButton aria-label="Tahrirlash" onClick={onEdit}><Pencil className="size-[15px]" strokeWidth={2} /></NmIconButton>
    </div>
  );
}

/** Promo codes: list, create, edit; switched off with isActive (never deleted — redemptions point at them). */
export function PromoPanel() {
  const query = useMockPromos();
  const [edit, setEdit] = useState<MockPromo | null | 'new'>(null);
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end"><PromoDialog key={edit === 'new' ? 'new' : edit?.id ?? 'none'} promo={edit === 'new' ? undefined : edit ?? undefined} open={edit !== null} onOpenChange={(o) => setEdit(o ? 'new' : null)} /></div>
      <QueryBoundary query={query} loading={<NmCard className="px-4 py-3.5"><RowsSkeleton rows={4} /></NmCard>}
        isEmpty={(d) => d.items.length === 0} empty={<EmptyState title="Promo kod yo'q" hint="Yangi promo kod yarating." />}>
        {(d) => (
          <TableCard cols={COLS} head={['Kod', 'Chegirma', 'Mahsulotlar', 'Ishlatilgan', 'Muddat', 'Faol', '']}>
            {d.items.map((p) => <PromoRow key={p.id} p={p} onEdit={() => setEdit(p)} />)}
          </TableCard>
        )}
      </QueryBoundary>
    </div>
  );
}
