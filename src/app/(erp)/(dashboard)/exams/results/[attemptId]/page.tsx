'use client';

import { useParams } from 'next/navigation';
import { AttemptResultView } from '@/components/exams-center/results/attempt-result-view';

/** /exams/results/[attemptId] — staff full result of one attempt (student or preview). */
export default function ExamAttemptResultPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  return <AttemptResultView id={decodeURIComponent(attemptId)} />;
}
