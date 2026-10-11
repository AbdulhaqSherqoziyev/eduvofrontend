import { Suspense } from 'react';
import { RowsSkeleton } from '@/components/shared/skeleton';
import { ResultsView } from '@/components/exams-center/results/results-view';

/** /exams/results — scores by assignment / exam (contract §2.9). */
export default function ExamResultsPage() {
  // useSearchParams() needs a Suspense boundary for the static build.
  return (
    <Suspense fallback={<RowsSkeleton rows={6} />}>
      <ResultsView />
    </Suspense>
  );
}
