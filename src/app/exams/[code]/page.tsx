import { DetailView } from '@/components/exams-hub/detail-view';

/** /exams/[code] — exam detail (_hub-design.md §3). */
export default function ExamDetailPage({ params }: { params: { code: string } }) {
  return <DetailView code={decodeURIComponent(params.code)} />;
}
