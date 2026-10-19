'use client';
/** Tab "Modullar" (spec §11.1, ERP only): full list with share bars + never-opened modules as chips. */
import { RowsSkeleton } from '@/components/shared/skeleton';
import { Section } from '@/components/owner/section';
import type { ModuleRow } from '@/lib/api/owner-analytics.types';
import { useAnalyticsModules } from '@/lib/hooks/use-owner-analytics';
import { fmtAvg, fmtInt } from './format';
import { ErrorsPill } from './pages-tab';
import { BlockError, NoRows, NotTrackingState, fading } from './states';
import { TopTable } from './top-table';
import { useAnalyticsFilters } from './use-analytics-filters';

export function ModulesTab() {
  const f = useAnalyticsFilters();
  const isErp = f.site === 'erp';
  const q = useAnalyticsModules({ from: f.from, to: f.to }, isErp);
  if (!isErp) return null;
  if (q.isLoading) return <Section title="Ko'p ishlatilgan modullar"><RowsSkeleton rows={5} /></Section>;
  if (!q.data) return <BlockError error={q.error} onRetry={() => q.refetch()} />;
  const d = q.data;
  if (!d.trackingSince) return <NotTrackingState site="erp" />;

  return (
    <div className={`flex flex-col gap-4 ${fading(q.isFetching, q.isPlaceholderData)}`}>
      <Section title="Ko'p ishlatilgan modullar">
        {d.rows.length ? (
          <TopTable<ModuleRow> rows={d.rows} rowKey={(r) => r.key} share={(r) => r.share} minW="560"
            cols={[
              { key: 'n', label: 'Modul', render: (r) => <span className="font-semibold">{r.label}</span> },
              { key: 'o', label: 'Ochishlar', num: true, render: (r) => fmtInt(r.opens) },
              { key: 'c', label: 'Markazlar', num: true, render: (r) => fmtInt(r.centers) },
              { key: 'u', label: 'Kunlik foydalanuvchilar', num: true, render: (r) => fmtAvg(r.avgDailyUsers) },
              { key: 'e', label: 'Xatolar', num: true, render: (r) => <ErrorsPill n={r.errors} /> },
            ]} />
        ) : <NoRows period={d.period} />}
      </Section>
      <Section title="Hech kim ochmagan modullar">
        {d.unused.length ? (
          <ul className="flex flex-wrap gap-2">
            {d.unused.map((m) => (
              <li key={m.key} className="rounded-full bg-background px-3 py-1.5 text-[12px] font-semibold text-muted shadow-nm-inset-sm">{m.label}</li>
            ))}
          </ul>
        ) : <p className="text-[13px] font-medium text-muted">Barcha modullar ishlatilgan</p>}
      </Section>
    </div>
  );
}
