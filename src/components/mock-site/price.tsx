'use client';
/** A catalog price (C1) — skeleton while loading (after 300 ms), "—" if the catalog failed. Never a hard-coded price. */
import { useCatalog, findProduct } from '@/lib/mock/catalog';
import { fmtMoney, moneyParts } from '@/lib/mock/format';
import { useDelayedFlag } from '@/lib/mock/hooks/use-delayed';
import type { Currency, OpenExamSlug, ProductKind } from '@/lib/mock/api/types';

interface Props {
  exam: OpenExamSlug;
  kind: ProductKind | 'examFull';
  qty?: number;
  field?: 'price' | 'perMock';
  currency?: Currency;
  /** `79 000 <small>UZS</small>` (landing pricing teaser) */
  splitUnit?: boolean;
  unitStyle?: React.CSSProperties;
  skelWidth?: number;
}

export function Price({ exam, kind, qty = 1, field = 'price', currency = 'UZS', splitUnit, unitStyle, skelWidth = 96 }: Props) {
  const c = useCatalog();
  const slow = useDelayedFlag(c.status === 'loading');
  if (c.status !== 'ready') {
    if (c.status === 'loading' && !slow) return <span style={{ display: 'inline-block', width: skelWidth, height: '0.9em' }} aria-hidden />;
    if (c.status === 'loading') return <span className="m-skel" style={{ display: 'inline-block', width: skelWidth, height: '0.9em', verticalAlign: 'middle' }} aria-label="…" />;
    return <span aria-label="—">—</span>;
  }
  const set = kind === 'examFull'
    ? c.data.exams.find((e) => e.slug === exam)?.fullMockPrice ?? null
    : (field === 'perMock' ? findProduct(c.data, exam, kind, qty)?.perMock : findProduct(c.data, exam, kind, qty)?.price) ?? null;
  if (!set) return <span>—</span>;
  const m = { currency, amountMinor: set[currency] };
  if (splitUnit) {
    const p = moneyParts(m);
    return <bdi dir="ltr">{p.amount}{p.unit && <> <span style={unitStyle}>{p.unit}</span></>}</bdi>;
  }
  return <bdi dir="ltr">{fmtMoney(m)}</bdi>;
}
