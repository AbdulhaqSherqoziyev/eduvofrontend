'use client';

import { useParams } from 'next/navigation';
import { AssignmentDetailView } from '@/components/exams-center/detail/assignment-detail-view';

/** /exams/assignments/[id] — one session: live monitor, access codes, edit/delete. */
export default function ExamAssignmentPage() {
  const { id } = useParams<{ id: string }>();
  return <AssignmentDetailView id={id} />;
}
