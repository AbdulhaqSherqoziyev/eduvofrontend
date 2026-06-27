'use client';

import { NmCard } from '@/components/ui/nm-card';
import { formatSom } from '@/lib/utils/format';
import { useFinanceOverview } from '@/lib/hooks/use-owner-finance';

interface Props { world: 'platform' | 'tenant'; tenantId: string }

function Stat({ label, value, tone = 'text-foreground' }: { label: string; value: string; tone?: string }) {
  return (
    <NmCard className="p-4">
      <div className="text-[11px] font-bold uppercase tracking-[0.6px] text-[#9aa6b8]">{label}</div>
      <div className={`mt-2 text-[19px] font-extrabold ${tone}`}>{value}</div>
    </NmCard>
  );
}

/** Four summary cards; content switches with the active money world. */
export function FinanceOverviewCards({ world, tenantId }: Props) {
  const { data } = useFinanceOverview(tenantId || undefined);

  if (!data) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="h-[78px] rounded-[20px] bg-background shadow-nm-inset-sm" />)}
      </div>
    );
  }

  const cards = world === 'platform'
    ? [
        { label: 'Jami balans', value: formatSom(data.platform.balanceTotal), tone: data.platform.balanceTotal < 0 ? 'text-danger' : 'text-foreground' },
        { label: "To'ldirishlar", value: formatSom(data.platform.topupTotal), tone: 'text-success' },
        { label: "Yig'ilgan to'lov", value: formatSom(data.platform.feeTotal), tone: 'text-primary' },
        { label: 'Operatsiyalar', value: String(data.platform.count) },
      ]
    : [
        { label: 'Kirim', value: formatSom(data.tenant.income), tone: 'text-success' },
        { label: 'Chiqim', value: formatSom(data.tenant.expense), tone: 'text-danger' },
        { label: 'Sof', value: formatSom(data.tenant.net), tone: data.tenant.net < 0 ? 'text-danger' : 'text-foreground' },
        { label: 'Operatsiyalar', value: String(data.tenant.count) },
      ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => <Stat key={c.label} label={c.label} value={c.value} tone={c.tone} />)}
    </div>
  );
}
