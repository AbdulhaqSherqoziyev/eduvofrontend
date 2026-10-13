'use client';
/** errBg banner shown in a price area when C1 /mock/catalog failed (system error → red per README). */
import { useCatalog } from '@/lib/mock/catalog';

export function CatalogError({ text, retry }: { text: string; retry: string }) {
  const c = useCatalog();
  if (c.status !== 'error') return null;
  return (
    <div className="m-banner m-banner--err" role="alert" style={{ alignItems: 'center' }}>
      <span style={{ flex: 1 }}>{text}</span>
      <button type="button" className="m-btn m-btn--soft m-btn--sm" onClick={c.retry}>{retry}</button>
    </div>
  );
}
