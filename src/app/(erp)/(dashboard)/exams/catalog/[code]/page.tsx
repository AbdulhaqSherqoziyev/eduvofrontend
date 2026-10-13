'use client';

import { useParams } from 'next/navigation';
import { ExamDetailView } from '@/components/exams-center/catalog/exam-detail-view';

/** /exams/catalog/[code] — format, sections, grading; preview and assign. */
export default function ExamDetailPage() {
  const { code } = useParams<{ code: string }>();
  return <ExamDetailView code={decodeURIComponent(code)} />;
}
