'use client';

import { useMemo } from 'react';
import { Boxes } from 'lucide-react';
import { QueryBoundary } from '@/components/shared/query-boundary';
import { EmptyState } from '@/components/shared/empty-state';
import { CardGridSkeleton } from '@/components/shared/skeleton';
import { BUNDLE_ORDER, bundleLabel, type OwnerModule } from '@/lib/api/owner-modules';
import { useOwnerModules } from './use-owner-modules';
import { ModuleCard } from './module-card';

const GRID = 'grid gap-4 md:grid-cols-2 lg:grid-cols-3';

/** Catalogue grouped by bundle; every group ordered by `sortOrder`. */
function groupByBundle(rows: OwnerModule[]) {
  const order = [...BUNDLE_ORDER, ...rows.map((r) => r.bundle)];
  return Array.from(new Set(order))
    .map((bundle) => ({
      bundle,
      items: rows.filter((r) => r.bundle === bundle).sort((a, b) => a.sortOrder - b.sortOrder),
    }))
    .filter((g) => g.items.length > 0);
}

export function ModulesPanel() {
  const query = useOwnerModules();
  const groups = useMemo(() => groupByBundle(query.data ?? []), [query.data]);
  const nameOf = useMemo(() => {
    const map = new Map((query.data ?? []).map((m) => [m.key, m.nameUz]));
    return (key: string) => map.get(key) ?? key;
  }, [query.data]);

  return (
    <QueryBoundary
      query={query}
      loading={<CardGridSkeleton count={6} className={GRID} />}
      isEmpty={(d) => d.length === 0}
      empty={
        <EmptyState
          title="Katalog bo'sh"
          hint="Modullar ro'yxati yuklanmadi — serverni tekshiring."
          icon={<Boxes className="size-6" />}
        />
      }
    >
      {() => (
        <div className="flex flex-col gap-6">
          {groups.map((g) => (
            <div key={g.bundle} className="flex flex-col gap-3">
              <div className="text-[11px] font-bold uppercase tracking-[0.9px] text-muted">
                {bundleLabel(g.bundle)}
              </div>
              <div className={GRID}>
                {g.items.map((m) => (
                  <ModuleCard key={m.key} module={m} nameOf={nameOf} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </QueryBoundary>
  );
}
