import { Suspense } from 'react';
import { ResultView } from '@/components/exams-hub/result-view';

/** /exams/attempts/[id]/result — where the player lands after the last section (_hub-design.md §4). */
export default function ExamResultPage({ params }: { params: { id: string } }) {
  return (
    <Suspense>
      <ResultView id={params.id} />
    </Suspense>
  );
}
