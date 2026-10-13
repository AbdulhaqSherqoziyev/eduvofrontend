'use client';
/** Results need a learner session; guests are sent to log in and come back. */
import { useLearner } from '@/lib/mock/hooks/use-learner';
import { ResultsView } from './results-view';

export function ResultsGate({ attemptId }: { attemptId: string }) {
  const learner = useLearner();
  if (!learner) return <main style={{ minHeight: '60vh' }} aria-busy="true" />;
  return <ResultsView attemptId={attemptId} />;
}
