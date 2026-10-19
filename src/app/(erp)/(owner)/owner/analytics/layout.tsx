import { Suspense } from 'react';
import { AnalyticsShell } from './_components/analytics-shell';

/** /owner/analytics/* — one layout for the 9 tabs (spec §1.1). Filters live in the URL, hence Suspense. */
export default function OwnerAnalyticsLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AnalyticsShell>{children}</AnalyticsShell>
    </Suspense>
  );
}
